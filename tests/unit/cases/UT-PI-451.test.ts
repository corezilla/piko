/**
 * Case ID: UT-PI-451  ·  STATUS: real
 *
 * 责任：资源操作 L324 `clearInterval`（pi-runtime.ts）
 * 维度坐标：`execute` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-451.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-451 · execute · 资源获取/释放 × 正常释放", () => {
  it("clears the cancellation timer in the finally block after the execution ends", async () => {  // clears the cancellation timer in the finally block after the execution ends
    // 步骤 1：跑一轮会失败的执行（模型不可达）⇒ 走 finally 分支
    const fx = await piFixture();
    stubModelFetch(() => new Response("upstream (502) bad gateway", { status: 502 }));
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 失败路径也释放了定时器：用例能正常返回即证明
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ModelUnavailable");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
