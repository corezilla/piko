/**
 * Case ID: UT-PI-328  ·  STATUS: real
 *
 * 责任：参数 `isCancelled: ()=>boolean` 的 `非法值` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-328.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-328 · execute · 纯函数/无副作用 × 非法值", () => {
  it("accepts the illegal-value class of the cancellation predicate without breaking the run", async () => {  // accepts the illegal-value class of the cancellation predicate without breaking the run
    // 步骤 1：非法值 —— 谓词返回非布尔值
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, (() => "yes") as unknown as () => boolean);
      // 步骤 3：断言 —— 当前实况：谓词返回值不被类型校验，
      // 真值字符串等价于「未取消」，执行照常完成
      expect(res.status).toBe("completed");
      expect(res.summary).toBe("done");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
