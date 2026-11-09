/**
 * Case ID: UT-REPO-611  ·  STATUS: real
 *
 * 责任：状态写 L765 → `db`（store.ts）
 * 维度坐标：`finish` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-611.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-611 · finish · 持久化/序列化 × round-trip", () => {

  it("persists the Abandoned write of the pending discussion turns", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-611-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:765 对 `db` 的写被执行的前置状态——非 Completed 结果 + 一条 Pending 的 discussion turn
      accept(store, discussionTask("d1", "!r:d1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect((store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='d1'").get() as any).status).toBe("Pending");

      // 步骤 2：调用 finish(…)
      store.finish(result("d1", { state: "Failed" }), grant.lease_epoch);
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const turn = reopened.db.prepare("SELECT status FROM discussion_turns WHERE task_id='d1'").get() as any;
        expect(turn.status).toBe("Abandoned");
        const run = reopened.db.prepare("SELECT state, discussion_intake_state FROM runs WHERE task_id='d1'").get() as any;
        expect(run.state).toBe("Failed");
        expect(run.discussion_intake_state).toBe("Closed");
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
