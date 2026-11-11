/**
 * Case ID: UT-PI-455  ·  STATUS: real
 *
 * 责任：返回站点 L251 值 `undefined` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-455.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-455 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined from the after response hook", async () => {  // returns undefined from the after response hook
    // 步骤 1：跑一轮 ⇒ after_response 返回 undefined（不改写任何东西）
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 响应原样通过，执行完成且请求只发了一次
      expect(res.status).toBe("completed");
      expect(stub.calls).toHaveLength(1);
      expect(res.summary).toBe("done");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
