import { randomUUID } from "node:crypto";
import type { AgentResult, RuntimeConfig, TaskRequest, TokenUsage } from "./types.js";
import { PikoError } from "./types.js";
import type { TaskStore } from "./store.js";
import type { PiRuntime } from "./pi-runtime.js";
import type { MatrixRuntime } from "./matrix.js";
import type { Transfer } from "./transfer.js";
import { collectOutputs, resolveWorkspace } from "./workspace.js";
import { isPermanentMatrixError } from "./matrix.js";
import { isProviderUnavailableMessage } from "./pi-runtime.js";

/**
 * M005 `worker` — Run orchestration. Runs in P1 (may block). Uses Pi's native
 * hook surface; no task-level deadline/budget. Data-plane IO is delegated to M010.
 */
export class RunWorker {
  private stopped = false;
  private loopPromise?: Promise<void>;
  private readonly owner = `worker-${randomUUID()}`;
  private readonly boot = randomUUID();
  private lastPurge = 0;

  constructor(
    private config: RuntimeConfig,
    private store: TaskStore,
    private pi: PiRuntime,
    private matrix: MatrixRuntime,
    private transfer: Transfer,
  ) {}

  start() {
    this.loopPromise = this.loop();
  }

  private async loop() {
    // MECH-RECOVERY: adopt an orphaned Run first, then schedule.
    let recovery = this.store.recoverOrphaned(this.owner, this.boot);
    while (!this.stopped) {
      if (Date.now() - this.lastPurge > 3_600_000) {
        this.store.purgeExpired();
        this.lastPurge = Date.now();
      }
      // P-INPUT staging lane: runs BEFORE the slot is acquired, serial (concurrency=1),
      // and never holds a lease. Slow scp therefore cannot occupy the execution slot.
      const needsStaging = this.store.nextNeedingStaging();
      if (needsStaging) {
        await this.stageInputs(needsStaging);
        continue;
      }
      const claim = recovery ?? this.store.tryClaimSlot(this.owner, this.boot);
      recovery = null;
      if (!claim || claim === "slot_busy") {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      await this.run(claim.task_id, claim.lease_epoch);
    }
  }

  /** P-INPUT: fetch declared inputs into staging; failure is an execution-precondition failure. */
  private async stageInputs(taskId: string) {
    const task = this.store.getTask(taskId);
    const refs = task.input_refs ?? [];
    this.store.setInputStaging(taskId, { state: "in_progress", fetched: [], failed: [] });
    // Abort an in-flight scp if the task is cancelled while still Queued.
    const controller = new AbortController();
    const poll = setInterval(() => {
      if (this.store.cancelRequested(taskId)) controller.abort();
    }, 250);
    try {
      if (this.store.cancelRequested(taskId)) {
        this.transfer.clearStaging(taskId);
        this.store.cancel(taskId);
        return;
      }
      let staging: Awaited<ReturnType<Transfer["fetchInputs"]>>;
      try {
        staging = refs.length
          ? await this.transfer.fetchInputs(taskId, refs, controller.signal)
          : { state: "none" as const, fetched: [], failed: [] };
      } catch (error) {
        // TransferNeverThrows: containment — a transfer error is a precondition failure.
        this.transfer.clearStaging(taskId);
        this.publishPreconditionFailure(taskId, {
          code: "InputFetchFailed",
          cause_class: "Dependency",
          message: error instanceof Error ? error.message : String(error),
        });
        return;
      }
      if (controller.signal.aborted || this.store.cancelRequested(taskId)) {
        this.transfer.clearStaging(taskId);
        this.store.cancel(taskId);
        return;
      }
      if (staging.state === "failed") {
        // Zero-call Failed: never claims a slot.
        this.transfer.clearStaging(taskId);
        this.publishPreconditionFailure(taskId, {
          code: "InputFetchFailed",
          cause_class: "Dependency",
          message: `input fetch failed: ${staging.failed.map((f) => f.source).join(", ")}`,
        });
        return;
      }
      this.store.setInputStaging(taskId, staging.state === "none" ? { state: "none", fetched: [], failed: [] } : staging);
    } finally {
      clearInterval(poll);
    }
  }

  /** Publish a terminal Result for a Queued Run without ever taking the slot. */
  private publishPreconditionFailure(taskId: string, failure: { code: any; cause_class: any; message: string }) {
    const view = this.store.getRun(taskId);
    const result: AgentResult = {
      task_id: taskId,
      generation: this.store.generation(taskId),
      state: "Failed",
      partial: false,
      summary: failure.message,
      outputs: [],
      stats: { model_calls: 0, tool_calls: 0, duration_ms: 0, outputs_count: 0, outputs_bytes: 0 },
      known_actions: [],
      usage: aggregateUsage([], 0),
      failure,
      published_at: new Date().toISOString(),
    };
    this.store.finishQueued(result);
  }

  private async run(taskId: string, epoch: number) {
    const task = this.store.getTask(taskId);
    let timer: NodeJS.Timeout | undefined;
    const accessLost = () => this.store.discussionAccessLost(taskId);
    const accessLostFailure = { code: "DiscussionAccessLost" as const, cause_class: "Authorization" as const, message: "Piko lost access to the discussion room." };
    try {
      const workspace = await resolveWorkspace(task.workspace_ref, this.config.workspace.roots);
      timer = setInterval(() => this.store.renewSlot(taskId, epoch), 1000);
      // P-INPUT runs before the slot is granted (see worker.loop / tryClaimSlot gating);
      // at this point inputs are already `ready` (or there are none).
      if (accessLost()) throw Object.assign(new Error(accessLostFailure.message), { pikoCode: "DiscussionAccessLost", cause: "Authorization" });

      const outcome = await this.pi.execute(
        taskId,
        epoch,
        task,
        workspace,
        () => this.store.cancelRequested(taskId) || accessLost(),
        task.discussion
          ? async (event, turn, body) => {
              await sendDiscussionReplyWithRetry(this.matrix, taskId, task.discussion!.room_id, event, turn, body);
            }
          : undefined,
      );

      const attempts = this.store.getRun(taskId).progress.model_calls;
      const usage = aggregateUsage(this.store.rawUsage(taskId), attempts);
      const outputs = await collectOutputs(task, workspace);
      const publishedAt = new Date().toISOString();
      const lost = accessLost();

      // P-ARTIFACT: deliver outputs to the artifact target (does NOT change terminal state).
      if (task.artifact_target) {
        this.store.setArtifactDelivery(taskId, { state: "in_progress", delivered: [], failed: [] });
        const delivery = await this.transfer.deliverArtifacts(taskId, task.output_paths, task.artifact_target, undefined, workspace);
        this.store.setArtifactDelivery(taskId, delivery);
      }

      const state = outcome.status === "completed" ? "Completed" : lost ? "Failed" : outcome.status === "cancelled" ? "Cancelled" : "Failed";
      let failure = state === "Completed" ? null : lost ? accessLostFailure : outcome.failure ?? { code: "InternalError" as const, cause_class: "Internal" as const, message: outcome.summary };
      if (state === "Failed" && failure && failure.code === "ModelResponseInvalid" && isProviderUnavailableMessage(failure.message)) {
        failure = { code: "ModelUnavailable", cause_class: "Dependency", message: failure.message };
      }
      const stats = buildStats(this.store.getRun(taskId), outputs, null);
      // Two-step publish: step 1 Result, step 2 terminal + release slot.
      const result: AgentResult = {
        task_id: taskId,
        generation: this.store.generation(taskId),
        state,
        partial: state !== "Completed" && outputs.length > 0,
        summary: outcome.summary,
        outputs,
        stats,
        known_actions: this.store.knownActions(taskId),
        usage,
        failure,
        published_at: publishedAt,
      };
      this.store.publishResult(result, epoch);
      this.store.finish(result, epoch);
    } catch (error) {
      const e = error as any;
      const publishedAt = new Date().toISOString();
      const cancelled = this.store.cancelRequested(taskId);
      let code: string = "InternalError";
      let cause_class: string = "Internal";
      if (cancelled) {
        code = "CancelledByRequest";
        cause_class = "Cancellation";
      } else if (accessLost()) {
        code = "DiscussionAccessLost";
        cause_class = "Authorization";
      } else if (error instanceof PikoError) {
        code = error.code;
        cause_class = "Internal";
      } else if (typeof e.pikoCode === "string") {
        code = e.pikoCode;
        cause_class = typeof e.cause === "string" ? e.cause : "Internal";
      } else if (isProviderUnavailableMessage(String(e.message ?? ""))) {
        code = "ModelUnavailable";
        cause_class = "Dependency";
      }
      let outputs: AgentResult["outputs"] = [];
      try {
        outputs = await collectOutputs(task, await resolveWorkspace(task.workspace_ref, this.config.workspace.roots));
      } catch {
        /* preserve primary failure */
      }
      const attempts = this.store.getRun(taskId).progress.model_calls;
      try {
        const result: AgentResult = {
          task_id: taskId,
          generation: this.store.generation(taskId),
          state: cancelled ? "Cancelled" : "Failed",
          partial: outputs.length > 0,
          summary: e.message ?? String(e),
          outputs,
          stats: buildStats(this.store.getRun(taskId), outputs, null),
          known_actions: this.store.knownActions(taskId),
          usage: aggregateUsage(this.store.rawUsage(taskId), attempts),
          failure: { code: code as any, cause_class: cause_class as any, message: e.message ?? String(e) },
          published_at: publishedAt,
        };
        this.store.publishResult(result, epoch);
        this.store.finish(result, epoch);
      } catch (finalize) {
        console.error("run finalization failed", taskId, finalize);
      }
    } finally {
      if (timer) clearInterval(timer);
    }
  }

  async close() {
    this.stopped = true;
    await this.loopPromise;
  }
}

function buildStats(view: ReturnType<TaskStore["getRun"]>, outputs: AgentResult["outputs"], _startedAt: string | null): AgentResult["stats"] {
  return {
    model_calls: view.progress.model_calls,
    tool_calls: view.progress.tool_calls,
    duration_ms: view.started_at && view.finished_at ? Math.max(0, Date.parse(view.finished_at) - Date.parse(view.started_at)) : 0,
    outputs_count: outputs.length,
    outputs_bytes: outputs.reduce((n, o) => n + o.size_bytes, 0),
  };
}

const fields = ["input_tokens", "output_tokens", "total_tokens", "cache_read_tokens", "cache_write_tokens", "reasoning_tokens"] as const;
export function aggregateUsage(rows: any[], attempts: number): TokenUsage {
  if (attempts === 0) {
    return { source: "PiModelResponses", quality: "Complete", input_tokens: 0, output_tokens: 0, total_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0, model_attempts: 0, usage_observed_attempts: 0, missing_fields: [] };
  }
  const map: any = { input_tokens: "input", output_tokens: "output", total_tokens: "totalTokens", cache_read_tokens: "cacheRead", cache_write_tokens: "cacheWrite", reasoning_tokens: "reasoning" };
  const sums: any = {};
  const missing: string[] = [];
  for (const field of fields) {
    const key = map[field];
    if (rows.length !== attempts || rows.some((r) => typeof r[key] !== "number")) {
      sums[field] = null;
      missing.push(field);
    } else sums[field] = rows.reduce((n, r) => n + r[key], 0);
  }
  const observed = rows.length;
  const quality = missing.length === fields.length ? "Unknown" : missing.length === 0 && observed === attempts ? "Complete" : "Partial";
  if (quality === "Unknown") for (const f of fields) { sums[f] = null; if (!missing.includes(f)) missing.push(f); }
  return { source: "PiModelResponses", quality, ...sums, model_attempts: attempts, usage_observed_attempts: observed, missing_fields: missing };
}

const DISCUSSION_RETRY_DELAYS_MS = [200, 1000, 5000];
async function sendDiscussionReplyWithRetry(matrix: MatrixRuntime, taskId: string, roomId: string, eventId: string, turn: number, body: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= DISCUSSION_RETRY_DELAYS_MS.length; attempt++) {
    try {
      await matrix.sendDiscussionReply(taskId, roomId, eventId, turn, body);
      return;
    } catch (error) {
      lastError = error;
      if (isPermanentMatrixError(error)) break;
      if (error instanceof Error) {
        const name = error.name;
        const msg = String(error.message ?? "");
        const transient = name === "ConnectionError" || /ConnectionError|fetch failed|ECONNREFUSED|ETIMEDOUT|socket hang up|aborted/i.test(msg);
        if (!transient) break;
      }
      if (attempt < DISCUSSION_RETRY_DELAYS_MS.length) await new Promise((r) => setTimeout(r, DISCUSSION_RETRY_DELAYS_MS[attempt]));
    }
  }
  throw lastError;
}
