/**
 * Case ID: UT-REPO-624  ·  STATUS: real
 *
 * 责任：返回站点 L784 值 `（无值 return：提前退出）` 逐值断言（store.ts）
 * 维度坐标：`finishQueued` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-624.md（脚本的唯一依据）
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

describe("UT-REPO-624 · finishQueued · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns early on an already-terminal run without touching the stored result", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:784 的返回站点被到达的输入——run 已是终态
      accept(store, task("t-624"));
      store.cancel("t-624");
      expect(store.getRun("t-624").state).toBe("Cancelled");
      const before = store.db.prepare("SELECT result_json FROM results WHERE task_id='t-624'").get() as any;

      // 步骤 2：调用 finishQueued(…)
      const returned = store.finishQueued(result("t-624", { generation: 9, summary: "second result" }));

      // 步骤 3：断言返回值逐值对账——该返回站点是无值 return（提前退出），
      // 返回 undefined；已存结果原封不动，run 状态与 finished_at 不变
      expect(returned).toBeUndefined();
      const after = store.db.prepare("SELECT result_json FROM results WHERE task_id='t-624'").get() as any;
      expect(after.result_json).toBe(before.result_json);
      expect(JSON.parse(after.result_json).summary).toBe("Cancelled before execution started.");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
      expect(store.getRun("t-624").state).toBe("Cancelled");
    } finally {
      store.close();
    }
  });

});
