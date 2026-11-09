/**
 * Case ID: UT-REPO-530  ·  STATUS: real
 *
 * 责任：状态写 L655 → `db`（store.ts）
 * 维度坐标：`cancel` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-530.md（脚本的唯一依据）
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

describe("UT-REPO-530 · cancel · 持久化/序列化 × round-trip", () => {
  it("abandons the pending discussion turns of a queued task when it is cancelled", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:655 对 `db` 的写被执行的前置状态——
      //         一条带讨论的 Queued 任务，其触发轮次处于 Pending
      acceptDiscussion(store, "t-530", "!room:530");
      const before = store.pendingTurns("t-530") as any[];
      expect(before).toHaveLength(1);
      expect(before[0].status).toBe("Pending");

      // 步骤 2：调用 cancel(…)——写已发生（权威事实源里能看到新值）
      const outcome = store.cancel("t-530");

      // 步骤 3：读回权威事实源逐值对账写入语义
      expect(outcome.outcome).toBe("CancelledBeforeStart");
      const after = store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='t-530'").all() as any[];
      expect(after).toEqual([{ status: "Abandoned" }]);
      // 只改 Pending/QueuedInPi，已终结的轮次不受影响
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-530'").get() as any).state).toBe("Cancelled");
    } finally {
      store.close();
    }
  });

});
