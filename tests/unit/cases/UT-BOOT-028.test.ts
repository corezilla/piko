/**
 * Case ID: UT-BOOT-028  ·  STATUS: real
 *
 * 责任：分支 L42 !: !knownTools.has(name)（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-028.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-028 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("accepts every registered tool name", () => {
    // 步骤 1：构造含全部已注册工具名的 registry（全部 read_only，不绑契约）
    const names = ["read", "write", "edit", "bash", "mem0_lookup", "mem0_record", "graphrag_search", "remote_bash"];
    const entries = Object.fromEntries(
      names.map((n) => [n, { effect: "read_only", replay: "never" as const, permissions: {} }]),
    );
    const tools: ToolRegistry = { profile_version: "0.3", recovery_contracts: {}, profiles: { p: { tools: entries } } };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言全部已注册名都被接受
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
