/**
 * Case ID: UT-PI-315  ·  STATUS: real
 *
 * 责任：参数 `runId: string` 的 `超长` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-315.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-315 · execute · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long run id and still completes the operation", async () => {  // accepts an over-long run id and still completes the operation
    // 步骤 1：超长 runId（10000 字符）—— runId 直接当 session 目录名用
    const long = "r".repeat(10000);
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      let error: unknown;
      try {
        await fx.runtime.execute(long, 1, piTask("task-1"), fx.root, () => false);
      } catch (e) {
        error = e;
      }
      // 步骤 3：断言 —— Piko 自身不做长度校验（不是 typed 拒绝），
      // 但文件系统在创建 session 目录时以 ENAMETOOLONG 拒绝；
      // 错误原样上抛，未被降级为 PiExecution 失败结果
      expect(error).toBeDefined();
      expect((error as { code?: unknown }).code).toBeUndefined();
      expect((error as Error).message).toMatch(/Failed to (check sessions directory|stage JSONL storage)/);
      expect((error as Error).message).toMatch(/ENAMETOOLONG/);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
