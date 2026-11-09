/**
 * Case ID: UT-REPO-569  ·  STATUS: real
 *
 * 责任：返回站点 L708 值 `value` 逐值断言（store.ts）
 * 维度坐标：`rawUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-569.md（脚本的唯一依据）
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

describe("UT-REPO-569 · rawUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the raw usage value verbatim when the cost guard does not hold", async () => {
    const store = newStore();
    try {
      accept(store, task("t-569"));

      // 步骤 1：构造使 store.ts:708 的返回站点被到达的输入——观测值不带 cost，
      //         且 totalTokens 与各分项不自洽 ⇒ `&&` 守卫不成立 ⇒ 走 `return value`
      const raw = { input: 10, output: 5, totalTokens: 99, cacheRead: 2, cacheWrite: 3 };
      store.reserveModel("t-569", "op-1", "s-1", 1);
      store.observeUsage("t-569", "op-1", "s-1", 1, raw);

      // 步骤 2：调用 rawUsage(…)
      const usages = store.rawUsage("t-569");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(usages).toHaveLength(1);
      expect(usages[0]).toEqual(raw);
      expect(Object.keys(usages[0]).sort()).toEqual(["cacheRead", "cacheWrite", "input", "output", "totalTokens"]);
      // 原值逐字段对账：input 未被折叠
      expect(usages[0].input).toBe(10);
      expect(usages[0].cacheRead).toBe(2);
      expect(usages[0].cacheWrite).toBe(3);
      // 无未声明副作用：只读查询
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
