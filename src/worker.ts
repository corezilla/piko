import { randomUUID } from "node:crypto";
import type { AgentResult, RuntimeConfig, TaskRequest, TokenUsage } from "./types.js";
import { PikoError } from "./types.js";
import type { TaskStore, TaskStoreReader } from "./store.js";
import type { Channel, Fact } from "./ipc.js";
import type { PiRuntime } from "./pi-runtime.js";
import type { MatrixRuntime } from "./matrix.js";
import type { Transfer } from "./transfer.js";
import { collectOutputs, resolveWorkspace } from "./workspace.js";
import { isPermanentMatrixError } from "./matrix.js";
import { isProviderUnavailableMessage } from "./pi-runtime.js";

/**
 * M005 `worker` — Run orchestration. Runs in P1 (may block).
 *
 * Reads authoritative facts directly (WAL-safe read-only view); applies EVERY
 * write through the P0 data channel so P0 remains the single Task Store writer
 * (key decision 7). No task-level deadline/budget.
 */
export class RunWorker {
  private stopped = false;
  private loopPromise?: Promise<void>;
  private readonly owner = `worker-${randomUUID()}`;
  private readonly boot = randomUUID();

  constructor(
    private config: RuntimeConfig,
    private store: TaskStoreReader,
    private pi: PiRuntime,
    private matrix: MatrixRuntime,
    private transfer: Transfer,
    private channel: Channel,
  ) {}

  /** Report a fact to P0; a fact that could not be committed must not be treated as applied. */
  private async report(fact: Fact): Promise<unknown> {
    const outcome = await this.channel.report(fact);
    if (!outcome.ok) throw new PikoError("InternalError", 500, `fact ${fact.kind} rejected: ${outcome.error}`);
    return outcome.value;
  }

  start() {
    this.loopPromise = this.loop();
  }

  private async loop() {
    // MECH-RECOVERY: P0 already reclaimed any orphaned Run on boot; P1 polls P0's
    // authoritative queue/inputs view through the read handle.
    while (!this.stopped) {
      const claim = await this.claimNext();
      if (!claim) {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      if (claim.kind === "staging") await this.stageInputs(claim.task_id);
      else await this.run(claim.task_id, claim.lease_epoch);
    }
  }

  /**
   * Ask P0 for the next unit of work. P0 (single writer) decides: a Queued Run
   * needing input staging, or the oldest ready Queued Run winning the slot.
   * Until the channel exposes an explicit `claim` command, P1 performs the same
   * decision against the read-only view and P0 validates on commit (fencing).
   */
  private async claimNext(): Promise<{ kind: "staging"; task_id: string } | { kind: "run"; task_id: string; lease_epoch: number } | null> {
    // P0 is the decider: ask it for the next staging unit, else for the slot.
    const staging = (await this.channel.report({ kind: "stagingClaim" })).value as { task_id: string } | null;
    if (staging) return { kind: "staging", task_id: staging.task_id };
    const grant = (await this.channel.report({ kind: "claim", owner: this.owner, boot: this.boot })).value as { task_id: string; lease_epoch: number } | null;
    if (!grant) return null;
    return { kind: "run", task_id: grant.task_id, lease_epoch: grant.lease_epoch };
  }

  private async stageInputs(taskId: string) {
    const task = this.store.getTask(taskId);
    const refs = task.input_refs ?? [];
    await this.report({ kind: "staging", task_id: taskId, staging: { state: "in_progress", fetched: [], failed: [] } });
    const controller = new AbortController();
    const poll = setInterval(() => {
      if (this.store.cancelRequested(taskId)) controller.abort();
    }, 250);
    try {
      let staging: Awaited<ReturnType<Transfer["fetchInputs"]>>;
      try {
        staging = refs.length
          ? await this.transfer.fetchInputs(taskId, refs, controller.signal)
          : { state: "none" as const, fetched: [], failed: [] };
      } catch (error) {
        this.transfer.clearStaging(taskId);
        await this.reportPreconditionFailure(taskId, {
          code: "InputFetchFailed",
          cause_class: "Dependency",
          message: error instanceof Error ? error.message : String(error),
        });
        return;
      }
      if (staging.state === "failed") {
        this.transfer.clearStaging(taskId);
        await this.reportPreconditionFailure(taskId, {
          code: "InputFetchFailed",
          cause_class: "Dependency",
          message: `input fetch failed: ${staging.failed.map((f) => f.source).join(", ")}`,
        });
        return;
      }
      await this.report({ kind: "staging", task_id: taskId, staging: staging.state === "none" ? { state: "none", fetched: [], failed: [] } : staging });
    } finally {
      clearInterval(poll);
    }
  }

  private async reportPreconditionFailure(taskId: string, failure: { code: any; cause_class: any; message: string }) {
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
    await this.report({ kind: "preconditionFailure", result });
  }

  private async run(taskId: string, epoch: number) {
    const task = this.store.getTask(taskId);
    let timer: NodeJS.Timeout | undefined;
    const accessLost = () => this.store.discussionAccessLost(taskId);
    const accessLostFailure = { code: "DiscussionAccessLost" as const, cause_class: "Authorization" as const, message: "Piko lost access to the discussion room." };
    try {
      const workspace = await resolveWorkspace(task.workspace_ref, this.config.workspace.roots);
      timer = setInterval(() => void this.report({ kind: "heartbeat", at: Date.now() }).catch(() => {}), 1000);
      if (accessLost()) throw Object.assign(new Error(accessLostFailure.message), { pikoCode: "DiscussionAccessLost", cause: "Authorization" });

      const outcome = await this.pi.execute(taskId, epoch, task, workspace, () => this.store.cancelRequested(taskId) || accessLost(), task.discussion
        ? async (event, turn, body) => {
            await sendDiscussionReplyWithRetry(this.matrix, taskId, task.discussion!.room_id, event, turn, body);
          }
        : undefined);

      const attempts = this.store.getRun(taskId).progress.model_calls;
      const usage = aggregateUsage(this.store.rawUsage(taskId), attempts);
      const outputs = await collectOutputs(task, workspace);
      const publishedAt = new Date().toISOString();
      const lost = accessLost();

      if (task.artifact_target) {
        await this.report({ kind: "delivery", task_id: taskId, delivery: { state: "in_progress", delivered: [], failed: [] } });
        const delivery = await this.transfer.deliverArtifacts(taskId, task.output_paths, task.artifact_target, undefined, workspace);
        await this.report({ kind: "delivery", task_id: taskId, delivery });
      }

      const state = outcome.status === "completed" ? "Completed" : lost ? "Failed" : outcome.status === "cancelled" ? "Cancelled" : "Failed";
      let failure = state === "Completed" ? null : lost ? accessLostFailure : outcome.failure ?? { code: "InternalError" as const, cause_class: "Internal" as const, message: outcome.summary };
      if (state === "Failed" && failure && failure.code === "ModelResponseInvalid" && isProviderUnavailableMessage(failure.message)) {
        failure = { code: "ModelUnavailable", cause_class: "Dependency", message: failure.message };
      }
      const result: AgentResult = {
        task_id: taskId,
        generation: this.store.generation(taskId),
        state,
        partial: state !== "Completed" && outputs.length > 0,
        summary: outcome.summary,
        outputs,
        stats: buildStats(this.store.getRun(taskId), outputs),
        known_actions: this.store.knownActions(taskId),
        usage,
        failure,
        published_at: publishedAt,
      };
      await this.report({ kind: "publishResult", result, lease_epoch: epoch });
      await this.report({ kind: "finish", result, lease_epoch: epoch });
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
          stats: buildStats(this.store.getRun(taskId), outputs),
          known_actions: this.store.knownActions(taskId),
          usage: aggregateUsage(this.store.rawUsage(taskId), attempts),
          failure: { code: code as any, cause_class: cause_class as any, message: e.message ?? String(e) },
          published_at: publishedAt,
        };
        await this.report({ kind: "publishResult", result, lease_epoch: epoch });
        await this.report({ kind: "finish", result, lease_epoch: epoch });
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

function buildStats(view: ReturnType<TaskStore["getRun"]>, outputs: AgentResult["outputs"]): AgentResult["stats"] {
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
        const transient = error.name === "ConnectionError" || /ConnectionError|fetch failed|ECONNREFUSED|ETIMEDOUT|socket hang up|aborted/i.test(String(error.message ?? ""));
        if (!transient) break;
      }
      if (attempt < DISCUSSION_RETRY_DELAYS_MS.length) await new Promise((r) => setTimeout(r, DISCUSSION_RETRY_DELAYS_MS[attempt]));
    }
  }
  throw lastError;
}
