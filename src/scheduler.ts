import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import type { TaskStore } from "./store.js";
import type { RuntimeConfig } from "./types.js";

/** M004 `scheduler` — single slot acquisition, renewal and fencing. Runs in P0. */
export class Scheduler {
  readonly bootId = randomUUID();
  private timer: NodeJS.Timeout | null = null;
  constructor(
    private readonly store: TaskStore,
    private readonly config: RuntimeConfig,
  ) {}

  acquire(owner: string): { task_id: string; lease_epoch: number } | { task_id: string; lease_epoch: number } | null {
    const granted = this.store.tryClaimSlot(owner, this.bootId);
    return granted === "slot_busy" ? null : granted;
  }

  /** Reclaim an orphaned Run left Running by a previous (crashed) process. */
  recover(owner: string) {
    return this.store.recoverOrphaned(owner, this.bootId);
  }

  renew(taskId: string, epoch: number): boolean {
    return this.store.renewSlot(taskId, epoch);
  }

  release(taskId: string, epoch: number): boolean {
    return this.store.releaseSlot(taskId, epoch);
  }

  read() {
    return this.store.readSlot();
  }

  identity() {
    return { owner_id: `${this.config.instance_id}:${hostname()}`, boot_id: this.bootId };
  }

  close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
