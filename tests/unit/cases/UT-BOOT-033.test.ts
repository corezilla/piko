/**
 * Case ID: UT-BOOT-033  ·  STATUS: real
 *
 * 责任：分支 L45 !: !contract（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-033.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-033 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("accepts a safe-replay read_only tool with no contract", () => {
    // 步骤 1：构造 replay=safe、effect=read_only、无契约的工具
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: { read: { effect: "read_only", replay: "safe", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错（read_only 免绑契约）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
