/**
 * Case ID: UT-REPO-161  ·  STATUS: real
 *
 * 责任：状态写 L323 → `db`（store.ts）
 * 维度坐标：`tryClaimSlot` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-161.md（脚本的唯一依据）
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

describe("UT-REPO-161 · tryClaimSlot · 持久化/序列化 × round-trip", () => {
  it("inserts the run_sessions row for the claimed task", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:323 对 `db` 的写被执行的前置状态——有一条 Queued 的 run
      accept(store, task("t1"));
      // 步骤 2：调用 tryClaimSlot
            store.tryClaimSlot("owner-1", "boot-1");
            const row = store.db.prepare("SELECT * FROM run_sessions WHERE task_id='t1'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(row).toBeTruthy();
            expect(row.task_id).toBe("t1");
            expect(row.pi_session_id).toBe("t1");
            expect(row.lane_name).toBe("main");
            expect(row.active_operation_id).toBeNull();
            expect(row.last_operation_id).toBeNull();
            expect(row.observed_tip_id).toBeNull();
            expect(row.lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
