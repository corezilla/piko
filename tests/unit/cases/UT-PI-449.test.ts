/**
 * Case ID: UT-PI-449  ·  STATUS: real
 *
 * 责任：资源操作 L241 `appendFileSync`（pi-runtime.ts）
 * 维度坐标：`execute` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-449.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-449 · execute · 资源获取/释放 × 获取失败路径", () => {
  it("keeps the execution intact when the debug file write fails", async () => {  // keeps the execution intact when the debug file write fails
    // 步骤 1：调试开启但文件路径不可写 ⇒ appendFileSync 失败
    const previous = process.env.PIKO_PROVIDER_DEBUG;
    const previousFile = process.env.PIKO_PROVIDER_DEBUG_FILE;
    process.env.PIKO_PROVIDER_DEBUG = "1";
    process.env.PIKO_PROVIDER_DEBUG_FILE = "/nonexistent-dir-for-piko/debug.jsonl";
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 资源获取失败路径被走过，但执行本身不受影响
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
      if (previous === undefined) delete process.env.PIKO_PROVIDER_DEBUG;
      else process.env.PIKO_PROVIDER_DEBUG = previous;
      if (previousFile === undefined) delete process.env.PIKO_PROVIDER_DEBUG_FILE;
      else process.env.PIKO_PROVIDER_DEBUG_FILE = previousFile;
    }
  });
});
