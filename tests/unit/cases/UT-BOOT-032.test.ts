/**
 * Case ID: UT-BOOT-032  ·  STATUS: real
 *
 * 责任：分支 L45 &&: t.replay === "safe" && t.effect !== "read_only" && !contract（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-032.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-032 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("rejects a safe-replay write tool with no contract bound", () => {
    // 步骤 1：构造 replay=safe、effect 非 read_only、无契约的工具
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: { write: { effect: "workspace_write", replay: "safe", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言被拒绝（安全重放必须绑恢复契约）
    expect(() => validateToolRegistry(tools)).toThrow(/unsafe replay declaration: write/);
  });
});
