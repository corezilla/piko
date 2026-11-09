/**
 * Case ID: UT-USAGE-001  ·  STATUS: real
 *
 * 责任：被测符号 `emptyUsage`（USAGE）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`emptyUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-001.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { emptyUsage, validateUsage } from "../../../src/semantic.js";
import type { TokenUsage } from "../../../src/types.js";

describe("UT-USAGE-001 · emptyUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the zeroed complete usage", () => {
    // 步骤 2：调用 emptyUsage
    const usage = emptyUsage();

    // 步骤 3：断言返回值逐值对账——六个字段都是 0，质量是 Complete，
    //         观测到的尝试数与模型尝试数都是 0，缺失字段为空
    expect(usage).toEqual({
      source: "PiModelResponses",
      quality: "Complete",
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      reasoning_tokens: 0,
      model_attempts: 0,
      usage_observed_attempts: 0,
      missing_fields: [],
    });
  });

});
