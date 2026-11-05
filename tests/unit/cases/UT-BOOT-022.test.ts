/**
 * Case ID: UT-BOOT-022  ·  STATUS: real
 *
 * 责任：参数 `tools: ToolRegistry` 的 `边界(上/下/零/空/满)` 类（config.ts:26）
 * 维度坐标：`validateToolRegistry` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-022.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-022 · validateToolRegistry · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts an empty registry (no contracts, no profiles)", () => {
    // 步骤 1：构造空 registry
    const tools: ToolRegistry = { profile_version: "0.3", recovery_contracts: {}, profiles: {} };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错（两个循环都空转）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });

  it("accepts a profile with no tools", () => {
    // 步骤 1：构造一个空 tools 的 profile
    const tools: ToolRegistry = { profile_version: "0.3", recovery_contracts: {}, profiles: { p: { tools: {} } } };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
