/**
 * Case ID: UT-PI-444  ·  STATUS: real
 *
 * 责任：throw L160 `UnknownToolProfile`（守卫 `if (!profile)`；pi-runtime.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-444.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-444 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("throws the typed UnknownToolProfile error with its code and status", async () => {  // throws the typed UnknownToolProfile error with its code and status
    // 步骤 1：tool_profile_ref 指向不存在的 profile
    const fx = await piFixture();
    stubModelFetch();
    try {
      const task = piTask("task-1", { permissions: { read_paths: [], write_paths: [], tool_profile_ref: "ghost" } });
      // 步骤 2：调用 execute(…)
      let error: unknown;
      try {
        await fx.runtime.execute("task-1", 1, task, fx.root, () => false);
      } catch (e) {
        error = e;
      }
      // 步骤 3：断言 —— typed 错误码逐值对账，且错误保真上抛（不降级为失败结果）
      expect(error).toBeDefined();
      expect((error as { code?: unknown }).code).toBe("UnknownToolProfile");
      expect((error as { status?: unknown }).status).toBe(422);
      expect((error as Error).message).toBe("unknown tool profile ghost");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
