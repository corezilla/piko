/**
 * Case ID: UT-PI-264  ·  STATUS: real
 *
 * 责任：参数 `registry: ToolRegistry` 的 `非法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-264.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-264 · PiRuntime.constructor · 纯函数/无副作用 × 非法值", () => {
  it("accepts the illegal-value class of the registry parameter without throwing at construction time", async () => {  // accepts the illegal-value class of the registry parameter without throwing at construction time
    // 步骤 1：非法值 —— profile 名与实际 profile 不符的引用、profiles 缺字段
    const registry = piTools({}, { profiles: { "workspace-standard": { tools: {} } } } as never);

    // 步骤 2：构造
    const fx = await piConstructor({ registry });
    try {
      // 步骤 3：断言当前实况 —— 构造器不校验 registry（那是 loadConfig / validateToolRegistry 的职责）
      expect(fx.error).toBeUndefined();
      expect(fx.runtime).toBeDefined();
    } finally {
      await fx.close();
    }
  });
});
