/**
 * Case ID: UT-REPO-114  ·  STATUS: real
 *
 * 责任：返回站点 L233 值 `this.tx(() => { const r = this.db.prepa…` 逐值断言（store.ts）
 * 维度坐标：`mutateRun` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-114.md（脚本的唯一依据）
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

describe("UT-REPO-114 · mutateRun · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the incremented generation and applies the mutation", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:233 的返回站点被到达的输入——合法 task 与合法 generation
      accept(store, task("t-114"));

      // 步骤 2：调用 mutateRun(…)
      const generation = store.mutateRun({
        task_id: "t-114",
        expected_generation: 1,
        mutation: (r: any) => {
          r.state = "Running";
        },
      });

      // 步骤 3：断言返回值逐值对账——返回值就是新的 generation，且无未声明副作用
      expect(generation).toBe(2);
      expect(typeof generation).toBe("number");
      expect(store.generation("t-114")).toBe(2);
      const row = store.db.prepare("SELECT state,cancel_requested FROM runs WHERE task_id='t-114'").get() as any;
      expect(row.state).toBe("Running");
      expect(row.cancel_requested).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
