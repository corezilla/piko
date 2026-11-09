/**
 * Case ID: UT-REPO-614  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:780）
 * 维度坐标：`finishQueued` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-614.md（脚本的唯一依据）
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

describe("UT-REPO-614 · finishQueued · 纯函数/无副作用 × 每等价类合法值", () => {

  it("finalises a queued run for each legal terminal state", async () => {
    const store = newStore();
    try {
      accept(store, task("t-614-completed"));
      accept(store, task("t-614-failed"));
      accept(store, task("t-614-cancelled"));

      // 步骤 1：按 `每等价类合法值` 类构造参数 result——三个合法终态各一个代表值
      // 步骤 2：调用 finishQueued(…)
      store.finishQueued(result("t-614-completed"));
      store.finishQueued(
        result("t-614-failed", {
          state: "Failed",
          failure: { code: "InputFetchFailed", cause_class: "Dependency", message: "nope" },
        }),
      );
      store.finishQueued(result("t-614-cancelled", { state: "Cancelled" }));

      // 步骤 3：断言逐值对账——三条 run 都进了各自的终态，结果行逐值对得上
      expect(store.getRun("t-614-completed").state).toBe("Completed");
      expect(store.getRun("t-614-failed").state).toBe("Failed");
      expect(store.getRun("t-614-cancelled").state).toBe("Cancelled");
      expect(store.result("t-614-completed").state).toBe("Completed");
      expect(store.result("t-614-failed").failure?.code).toBe("InputFetchFailed");
      expect(store.result("t-614-cancelled").state).toBe("Cancelled");
    } finally {
      store.close();
    }
  });

});
