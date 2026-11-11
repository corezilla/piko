/**
 * Case ID: UT-PI-270  ·  STATUS: real
 *
 * 责任：参数 `channel: Channel` 的 `非法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-270.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-270 · PiRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("accepts the illegal-value class of the channel parameter without throwing at construction time", async () => {  // accepts the illegal-value class of the channel parameter without throwing at construction time
    // 步骤 1：非法值 —— report 恒抛错的 channel
    const hostile = {
      async report(): Promise<never> {
        throw new Error("channel must not be called during construction");
      },
    };
    const { PiRuntime } = await import("../../../src/pi-runtime.js");
    const { TaskStore } = await import("../../../src/store.js");
    const { piConfig, piTools } = await import("./support/pi-runtime-fix.js");
    const store = new TaskStore(":memory:", 1000);

    // 步骤 2：构造 —— 若构造器调用 channel，这里会抛错
    let error: unknown;
    let runtime: unknown;
    try {
      runtime = new PiRuntime(
        piConfig(),
        piTools(),
        store,
        hostile as never,
        "test-llm-key",
      );
    } catch (e) {
      error = e;
    }
    try {
      // 步骤 3：断言当前实况 —— 构造器不发事实，故敌意 channel 不被触发
      expect(error).toBeUndefined();
      expect(runtime).toBeDefined();
    } finally {
      await (runtime as { close(): Promise<void> }).close();
      store.close();
    }
  });
});
