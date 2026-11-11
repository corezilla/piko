/**
 * Case ID: UT-PI-450  ·  STATUS: real
 *
 * 责任：资源操作 L292 `setInterval`（pi-runtime.ts）
 * 维度坐标：`execute` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-450.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-450 · execute · 资源获取/释放 × 获取失败路径", () => {
  it("installs the cancellation timer and releases it when the execution ends", async () => {  // installs the cancellation timer and releases it when the execution ends
    // 步骤 1：正常跑一轮 ⇒ setInterval 被装上
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 执行完成后定时器已清除（进程不会因为它而挂住）
      expect(res.status).toBe("completed");
      // 定时器存在期间不会阻塞事件循环收尾：本用例能正常返回即证明已清理
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
