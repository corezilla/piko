/**
 * Case ID: UT-PI-322  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `非法值` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-322.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-322 · execute · 纯函数/无副作用 × 非法值", () => {
  it("rejects an unknown tool profile with the typed UnknownToolProfile error", async () => {  // rejects an unknown tool profile with the typed UnknownToolProfile error
    // 步骤 1：非法值 —— tool_profile_ref 指向不存在的 profile
    const fx = await piFixture();
    stubModelFetch();
    try {
      const task = piTask("task-1", { permissions: { read_paths: [], write_paths: [], tool_profile_ref: "does-not-exist" } });
      // 步骤 2：调用 execute(…)
      let error: unknown;
      try {
        await fx.runtime.execute("run-1", 1, task, fx.root, () => false);
      } catch (e) {
        error = e;
      }
      // 步骤 3：断言 typed 错误码逐值对账
      expect(error).toBeDefined();
      expect((error as { code?: unknown }).code).toBe("UnknownToolProfile");
      expect((error as { status?: unknown }).status).toBe(422);
      expect((error as Error).message).toBe("unknown tool profile does-not-exist");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
