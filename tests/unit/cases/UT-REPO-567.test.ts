/**
 * Case ID: UT-REPO-567  ·  STATUS: real
 *
 * 责任：返回站点 L693 值 `this.db .prepare("SELECT raw_usage_json…` 逐值断言（store.ts）
 * 维度坐标：`rawUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-567.md（脚本的唯一依据）
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

describe("UT-REPO-567 · rawUsage · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the parsed raw usage rows and folds cache tokens into input when cost is present", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:693 的返回站点被到达的输入——两条已观测用量的 model_attempt，一条带 cost
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "s1", 1);
      store.observeUsage("t1", "op", "s1", 1, rawUsageSample());
      store.reserveModel("t1", "op", "s2", 2);
      store.observeUsage("t1", "op", "s2", 2, { input: 5, output: 3, totalTokens: 10, cacheRead: 1, cacheWrite: 1, cost: 0.5 });

      // 步骤 2：调用 rawUsage(…)
      const rows = store.rawUsage("t1");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual({ input: 10, output: 5, totalTokens: 15, cacheRead: 0, cacheWrite: 0 });
      // 带 cost 的那行满足 totalTokens = input+output+cacheRead+cacheWrite 时，cache 折进 input
      expect(rows[1]).toEqual({ input: 7, output: 3, totalTokens: 10, cacheRead: 1, cacheWrite: 1, cost: 0.5 });
      // 无未声明副作用：rawUsage 是只读查询
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(2);
    } finally {
      store.close();
    }
  });

});
