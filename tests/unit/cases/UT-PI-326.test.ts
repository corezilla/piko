/**
 * Case ID: UT-PI-326  ·  STATUS: real
 *
 * 责任：参数 `isCancelled: ()=>boolean` 的 `每等价类合法值` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-326.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-326 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the cancellation predicate", async () => {  // accepts the legal equivalent classes of the cancellation predicate
    // 步骤 1：每个等价类一个代表值 —— 恒 false、恒 true、计数到第 N 次才 true
    const predicates = [() => false, () => true, (() => { let n = 0; return () => ++n > 2; })()];

    // 步骤 2：逐个执行
    for (const isCancelled of predicates) {
      const fx = await piFixture();
      stubModelFetch();
      try {
        const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, isCancelled);
        // 步骤 3：断言 —— 谓词只被轮询，不影响正常完成路径的返回结构
        expect(res.status).toBe("completed");
        expect(res.summary).toBe("done");
      } finally {
        vi.unstubAllGlobals();
        await fx.close();
      }
    }
  });
});
