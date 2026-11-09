/**
 * Case ID: UT-REPO-532  ·  STATUS: real
 *
 * 责任：状态写 L661 → `db`（store.ts）
 * 维度坐标：`cancel` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-532.md（脚本的唯一依据）
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

describe("UT-REPO-532 · cancel · 持久化/序列化 × round-trip", () => {

  it("persists the Cancelling state written by cancel", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-532-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:661 对 `db` 的写被执行的前置状态——一条已被槽持有的 Running run（非 Queued，走 StopRequested 分支）
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
      expect(grant.task_id).toBe("t1");

      // 步骤 2：调用 cancel(…)
      expect(store.cancel("t1").outcome).toBe("StopRequested");
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT state, cancel_requested, discussion_intake_state FROM runs WHERE task_id='t1'").get() as any;
        expect(row.state).toBe("Cancelling");
        expect(row.cancel_requested).toBe(1);
        // Disabled 的讨论摄入状态在这条 CASE 里保持 Disabled（CASE 只在 Open 时才转 Closing）
        expect(row.discussion_intake_state).toBe("Disabled");
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
