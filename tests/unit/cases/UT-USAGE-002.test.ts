/**
 * Case ID: UT-USAGE-002  ·  STATUS: real
 *
 * 责任：被测符号 `validateUsage`（USAGE）在对象类型 `错误路径` 下的维度格 `每个 typed 错误码`（该 Case 只登记本行 1 格）、`错误保真传播`、`内部错误不上抛为客户端码`；只测该符号该类型
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-002.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { emptyUsage, validateUsage } from "../../../src/semantic.js";
import type { TokenUsage } from "../../../src/types.js";

describe("UT-USAGE-002 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects a usage whose observed attempts exceed its model attempts", () => {
    // 步骤 1：造一个观测到的尝试数多于模型尝试数的用量
    const usage: TokenUsage = { ...emptyUsage(), model_attempts: 1, usage_observed_attempts: 2 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言错误逐值对账——第一个守卫先命中
    expect(() => validateUsage(usage)).toThrow("usage observed attempts exceed model attempts");
  });

});
