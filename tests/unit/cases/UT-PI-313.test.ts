/**
 * Case ID: UT-PI-313  ·  STATUS: real
 *
 * 责任：返回站点 L153 值 `{models,model}` 逐值断言（pi-runtime.ts）
 * 维度坐标：`model` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-313.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piFixture } from "./support/pi-runtime-fix.js";

describe("UT-PI-313 · model · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the model descriptor and the model registry from the model site", async () => {  // returns the model descriptor and the model registry from the model site
    // 步骤 1：最小可用的 runtime 配置
    const fx = await piFixture();
    try {
      // 步骤 2：调用 model(…)
      const { models, model } = fx.runtime.model();

      // 步骤 3：逐值断言 —— 返回站点的结构、字段、顺序
      expect(model).toEqual({
        id: "test-model",
        name: "test-model",
        api: "openai-responses",
        provider: "llmtier",
        baseUrl: "http://llmtier.invalid/v1",
        reasoning: true,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 262144,
        maxTokens: 32768,
      });

      // provider 已注册进 models，且带同一个 model
      expect(models.getModel("llmtier", "test-model")).toBeDefined();
      expect(models.getModel("llmtier", "test-model")?.id).toBe("test-model");

      // 无残留：model() 不写状态、不建资源、不产生 channel 事实
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
