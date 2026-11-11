/**
 * Case ID: UT-PI-359  ·  STATUS: real
 *
 * 责任：分支 L241 `catch ()`（catch；pi-runtime.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-359.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-359 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("swallows a debug write failure without breaking the execution", async () => {  // swallows a debug write failure without breaking the execution
    // 步骤 1：调试开启，但调试文件路径不可写（指向一个不存在的目录）⇒ appendFileSync 抛错
    const previous = process.env.PIKO_PROVIDER_DEBUG;
    const previousFile = process.env.PIKO_PROVIDER_DEBUG_FILE;
    process.env.PIKO_PROVIDER_DEBUG = "1";
    process.env.PIKO_PROVIDER_DEBUG_FILE = "/nonexistent-dir-for-piko/debug.jsonl";
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 调试写失败被 catch 吞掉，不影响执行（当前实况）
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
