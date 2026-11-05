/**
 * Case ID: UT-BOOT-031  ·  STATUS: real
 *
 * 责任：分支 L44 !: !contract（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-031.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-031 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("accepts a tool whose recovery_contract_ref resolves", () => {
    // 步骤 1：构造引用了真实契约的工具
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:external-status" } },
      profiles: { p: { tools: { read: { effect: "read_only", replay: "never", recovery_contract_ref: "c", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
