/**
 * Case ID: UT-REPO-622  ·  STATUS: real
 *
 * 责任：状态写 L788 → `db`（store.ts）
 * 维度坐标：`finishQueued` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-622.md（脚本的唯一依据）
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

describe("UT-REPO-622 · finishQueued · 持久化/序列化 × round-trip", () => {

  it("writes the terminal state, the finished timestamp and the intake state", async () => {
    const store = newStore();
    try {
      accept(store, task("t-622"));

      // 步骤 1：构造使 store.ts:788 对 `db` 的写被执行的前置状态
      expect(
        (store.db.prepare("SELECT state,finished_at,discussion_intake_state FROM runs WHERE task_id='t-622'").get() as any),
      ).toEqual({ state: "Queued", finished_at: null, discussion_intake_state: "Disabled" });

      // 步骤 2：调用 finishQueued(…)
      store.finishQueued(result("t-622", { state: "Failed" }));

      // 步骤 3：读回权威事实源逐值对账写入语义——state/finished_at 被写上，
      //         Disabled 的 intake 保持 Disabled（CASE 表达式不动它）
      const row = store.db.prepare(
        "SELECT state,finished_at,discussion_intake_state FROM runs WHERE task_id='t-622'",
      ).get() as any;
      expect(row.state).toBe("Failed");
      expect(row.finished_at).toBe("2026-11-09T00:00:00.000Z");
      expect(row.discussion_intake_state).toBe("Disabled");
    } finally {
      store.close();
    }
  });

});
