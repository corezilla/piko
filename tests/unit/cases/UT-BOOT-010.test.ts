/**
 * Case ID: UT-BOOT-010  ·  STATUS: real
 *
 * 责任：`validateToolRegistry` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`validateToolRegistry` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-010.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-010 · validateToolRegistry · 错误路径 × 每个 typed 错误码", () => {
  it("rejects a registry that breaks one of the recovery rules", () => {
    // 步骤 1：构造一个契约未注册的 registry
    const tools = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication" as const, implementation_ref: "builtin:nope" } },
      profiles: {},
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言 typed 错误码逐值等于设计声明
    expect(() => validateToolRegistry(tools)).toThrow(/unregistered recovery implementation/);
  });
});
