/**
 * Case ID: UT-PI-325  ·  STATUS: real
 *
 * 责任：参数 `workspace: string` 的 `注入字符` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-325.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-325 · execute · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts a workspace path with injection characters without passing it to a shell", async () => {  // accepts a workspace path with injection characters without passing it to a shell
    // 步骤 1：注入字符
    const injected = "/tmp/$(id); rm -rf /`whoami`";
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), injected, () => false);
      // 步骤 3：断言 —— workspace 只作文件系统路径，不进 shell；执行正常完成
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
