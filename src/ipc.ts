import type { AgentResult, ArtifactDelivery, InputStaging } from "./types.js";
import type { TaskStore } from "./store.js";

/**
 * P0 ↔ P1 data channel (key decision 7).
 *
 * P1 (execution) never writes the Task Store. It reports FACTS over IPC; P0
 * (control) validates `(task_id, generation, lease_epoch)` and commits them in
 * a single transaction. P0 also sends COMMANDS (dispatch / abort / shutdown).
 *
 * Transport is `child_process` IPC when P1 is a fork (production) and an
 * in-process loopback when P0 and P1 are the same process (tests). The message
 * shapes are identical either way.
 */

export type Fact =
  | { kind: "heartbeat"; at: number }
  | { kind: "ready"; boot_id: string; host: string }
  | { kind: "staging"; task_id: string; staging: InputStaging }
  | { kind: "delivery"; task_id: string; delivery: ArtifactDelivery }
  | { kind: "turn"; task_id: string; event_id: string; status: "QueuedInPi" | "Consumed" | "Abandoned"; entry?: string; operation?: string }
  | { kind: "reserveModel"; task_id: string; operation: string; step: string; attempt: number }
  | { kind: "observeUsage"; task_id: string; operation: string; step: string; attempt: number; raw: unknown }
  | { kind: "terminalModel"; task_id: string; operation: string; step: string; attempt: number; unknown: boolean }
  | { kind: "reserveTool"; task_id: string; operation: string; tool_call_id: string; name: string; effect: string; replay: string; contract?: string }
  | { kind: "terminalTool"; task_id: string; operation: string; tool_call_id: string; unknown: boolean }
  | { kind: "providerCall"; task_id: string; operation: string; status: number | null; request_id: string | null; note: string; latency_ms: number | null }
  | { kind: "closeIntake"; task_id: string; lease_epoch: number }
  | { kind: "publishResult"; result: AgentResult; lease_epoch: number }
  | { kind: "finish"; result: AgentResult; lease_epoch: number }
  | { kind: "preconditionFailure"; result: AgentResult }
  | { kind: "claim"; owner: string; boot: string }
  | { kind: "stagingClaim" };

export type Command =
  | { kind: "dispatch" } // "you may run" (P1 owns the loop; reserved)
  | { kind: "abort"; task_id: string }
  | { kind: "shutdown" };

export interface FactOutcome {
  ok: boolean;
  /** e.g. reserveModel: true=admitted; reserveTool: "Admitted"|"UnsafeRetryBlocked" */
  value?: unknown;
  error?: string;
}

/** P0 side: applies facts to the authoritative store. */
export class FactHandler {
  constructor(private readonly store: TaskStore) {}
  apply(fact: Fact): FactOutcome {
    try {
      switch (fact.kind) {
        case "staging":
          this.store.setInputStaging(fact.task_id, fact.staging);
          return { ok: true };
        case "delivery":
          this.store.setArtifactDelivery(fact.task_id, fact.delivery);
          return { ok: true };
        case "turn":
          this.store.markTurn(fact.task_id, fact.event_id, fact.status, fact.entry, fact.operation);
          return { ok: true };
        case "reserveModel":
          return { ok: true, value: this.store.reserveModel(fact.task_id, fact.operation, fact.step, fact.attempt) };
        case "observeUsage":
          this.store.observeUsage(fact.task_id, fact.operation, fact.step, fact.attempt, fact.raw);
          return { ok: true };
        case "terminalModel":
          this.store.terminalModel(fact.task_id, fact.operation, fact.step, fact.attempt, fact.unknown);
          return { ok: true };
        case "reserveTool":
          return { ok: true, value: this.store.reserveTool(fact.task_id, fact.operation, fact.tool_call_id, fact.name, fact.effect, fact.replay, fact.contract) };
        case "terminalTool":
          this.store.terminalTool(fact.task_id, fact.operation, fact.tool_call_id, fact.unknown);
          return { ok: true };
        case "providerCall":
          this.store.recordProviderCall(fact.task_id, fact.operation, fact.status, fact.request_id, fact.note, fact.latency_ms);
          return { ok: true };
        case "closeIntake":
          return { ok: true, value: this.store.tryCloseIntake(fact.task_id, fact.lease_epoch) };
        case "publishResult":
          this.store.publishResult(fact.result, fact.lease_epoch);
          return { ok: true };
        case "finish":
          this.store.finish(fact.result, fact.lease_epoch);
          return { ok: true };
        case "preconditionFailure":
          this.store.finishQueued(fact.result);
          return { ok: true };
        case "stagingClaim": {
          const task_id = this.store.nextNeedingStaging();
          return { ok: true, value: task_id ? { task_id } : null };
        }
        case "claim": {
          const grant = this.store.tryClaimSlot(fact.owner, fact.boot);
          if (grant === "slot_busy") return { ok: true, value: null };
          return { ok: true, value: grant };
        }
        default:
          return { ok: false, error: `unknown fact ${(fact as any).kind}` };
      }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

/** P1 side: reports facts to P0 and awaits the committed outcome. */
export interface Channel {
  report(fact: Fact): Promise<FactOutcome>;
}

/** In-process channel (P0 and P1 co-located, e.g. unit tests). */
export class LocalChannel implements Channel {
  constructor(private readonly handler: FactHandler) {}
  async report(fact: Fact): Promise<FactOutcome> {
    return this.handler.apply(fact);
  }
}

/**
 * P1-side channel over `process.send`. Each request carries a correlation id;
 * P0 replies with the same id. Falls back to a failed outcome on transport error
 * so a fact that could not be committed is never silently treated as applied.
 */
export class ProcessChannel implements Channel {
  private seq = 0;
  private readonly pending = new Map<number, (o: FactOutcome) => void>();
  constructor(private readonly send: (msg: unknown) => void, onCommand?: (cmd: Command) => void) {
    process.on("message", (msg: any) => {
      if (msg?.ipc === "outcome" && typeof msg.id === "number") {
        const resolve = this.pending.get(msg.id);
        if (resolve) {
          this.pending.delete(msg.id);
          resolve(msg.outcome as FactOutcome);
        }
        return;
      }
      if (msg?.ipc === "command" && onCommand) onCommand(msg.command as Command);
    });
  }
  report(fact: Fact): Promise<FactOutcome> {
    const id = ++this.seq;
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.send({ ipc: "fact", id, fact });
    });
  }
}

/** P0-side wiring of a child process to the fact handler + command sender. */
export function attachChildToHandler(child: { on: Function; send?: Function }, handler: FactHandler, onCommand?: (cmd: Command) => void) {
  const send = (cmd: Command) => child.send?.({ ipc: "command", command: cmd });
  child.on("message", (msg: any) => {
    if (msg?.ipc === "fact") {
      const outcome = handler.apply(msg.fact as Fact);
      child.send?.({ ipc: "outcome", id: msg.id, outcome });
      return;
    }
    onCommand?.(msg);
  });
  return { send };
}
