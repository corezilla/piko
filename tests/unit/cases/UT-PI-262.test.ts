/**
 * Case ID: UT-PI-262  ·  STATUS: real
 *
 * 责任：参数 `registry: ToolRegistry` 的 `每等价类合法值` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-262.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-262 · PiRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the registry parameter", async () => {  // accepts the legal equivalent classes of the registry parameter
    // 步骤 1：每个等价类一个代表值 —— 空 profile、多个 profile
    const registries = [
      piTools({}),
      piTools({ "workspace-standard": {} }),
      piTools({ "workspace-standard": {}, "readonly": {} }),
    ];

    // 步骤 2：逐个构造
    for (const registry of registries) {
      const fx = await piConstructor({ registry });
      try {
        // 步骤 3：断言被接受 —— 构造器不校验 profile 存在性（那是 execute 的职责）
        expect(fx.error).toBeUndefined();
        expect(fx.runtime).toBeDefined();
      } finally {
        await fx.close();
      }
    }
  });
});
