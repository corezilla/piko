/**
 * Case ID: UT-BOOT-029  ·  STATUS: real
 *
 * 责任：分支 L43 ternary: ? t.recovery_contract_ref :（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-029.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-029 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("treats a tool without a recovery_contract_ref as unbound (contract undefined)", () => {
    // 步骤 1：构造一个不绑契约、replay=never 的工具
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: { read: { effect: "read_only", replay: "never", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错（契约为 undefined 走右侧）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
