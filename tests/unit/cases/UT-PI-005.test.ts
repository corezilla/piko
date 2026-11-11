/**
 * Case ID: UT-PI-005  ·  STATUS: real
 *
 * 责任：`model` × `字符串/路径/枚举输入` × `空`（波次一粗粒度登记；pi-runtime.ts:150）
 * 维度坐标：`model` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-005.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piFixture } from "./support/pi-runtime-fix.js";

describe("UT-PI-005 · model · 字符串/路径/枚举输入 × 空", () => {
  it("builds the model descriptor from the config with no arguments and leaves no residue", async () => {
    // 步骤 1：按 `空` 格构造输入——model() 无参，用最小可用的 runtime 配置
    const fx = await piFixture();
    try {
      // 步骤 2：调用 model(…)
      const { models, model } = fx.runtime.model();

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
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

      // 无残留：model() 不写状态、不建资源、不留持久化副作用
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
