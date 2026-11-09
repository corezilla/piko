/**
 * Case ID: UT-REPO-531  ·  STATUS: real
 *
 * 责任：状态写 L656 → `db`（store.ts）
 * 维度坐标：`cancel` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-531.md（脚本的唯一依据）
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

describe("UT-REPO-531 · cancel · 持久化/序列化 × round-trip", () => {

  it("writes the Cancelled terminal state, the cancel flag and the finished timestamp", async () => {
    const store = newStore();
    try {
      accept(store, task("t-531"));

      // 步骤 1：构造使 store.ts:656 对 `db` 的写被执行的前置状态
      expect(
        (store.db.prepare("SELECT state,cancel_requested,finished_at FROM runs WHERE task_id='t-531'").get() as any),
      ).toEqual({ state: "Queued", cancel_requested: 0, finished_at: null });

      // 步骤 2：调用 cancel(…)
      const outcome = store.cancel("t-531");

      // 步骤 3：读回权威事实源逐值对账写入语义——state/cancel_requested/finished_at 全被写上，
      //         并在同事务里落了一条 Cancelled 结果
      const row = store.db.prepare(
        "SELECT state,cancel_requested,finished_at,discussion_intake_state FROM runs WHERE task_id='t-531'",
      ).get() as any;
      expect(row.state).toBe("Cancelled");
      expect(row.cancel_requested).toBe(1);
      expect(row.finished_at).toBe(outcome.requested_at);
      expect(row.discussion_intake_state).toBe("Disabled");
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 1 });
      expect(store.result("t-531").state).toBe("Cancelled");
    } finally {
      store.close();
    }
  });

});
