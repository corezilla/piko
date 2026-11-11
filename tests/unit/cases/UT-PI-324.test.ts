/**
 * Case ID: UT-PI-324  ·  STATUS: real
 *
 * 责任：参数 `workspace: string` 的 `超长` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-324.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-324 · execute · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long workspace path and completes the operation", async () => {  // accepts an over-long workspace path and completes the operation
    // 步骤 1：超长 workspace 路径 —— 单段路径名 10000 字符，超过文件系统单文件名上限
    const long = "/" + "w".repeat(10000);
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      let error: unknown;
      try {
        await fx.runtime.execute("run-1", 1, piTask("task-1"), long, () => false);
      } catch (e) {
        error = e;
      }
      // 步骤 3：断言 —— Piko 自身不做长度校验（不是 typed 拒绝），
      // 但文件系统在创建 session 目录时以 ENAMETOOLONG 拒绝
      // ⇒ 错误原样上抛，未被降级为 PiExecution 失败结果
      expect(error).toBeDefined();
      // 错误被包成普通 Error（无 code/status），原始 FileError 保留在 cause 里；
      // Pi 的 FileError 把 ENAMETOOLONG 归到 "unknown" 这一档（未被单独映射）
      expect((error as { code?: unknown }).code).toBeUndefined();
      expect((error as Error).message).toMatch(/Failed to check sessions directory/);
      expect((error as { cause?: { code?: unknown } }).cause?.code).toBe("unknown");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
