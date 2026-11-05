/**
 * Case ID: UT-BOOT-040  ·  STATUS: real
 *
 * 责任：分支 L49 &&: contract?.implementation_ref !== "builtin:workspace-atomic-write" && …（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-040.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-040 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("accepts a safe-replay tool bound to the workspace implementation", () => {
    // 步骤 1：构造 write 绑 workspace-atomic-write（该实现恰适用）
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:workspace-atomic-write" } },
      profiles: { p: { tools: { write: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错（第一项为假，整条守卫跳过）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
