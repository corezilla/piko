/**
 * Case ID: UT-BOOT-042  ·  STATUS: real
 *
 * 责任：分支 L50 ?.: contract?.implementation_ref（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-042.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-042 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("names the unavailable implementation in the error message", () => {
    // 步骤 1：构造 write 绑 matrix-txn（既不是 workspace-atomic-write，也不是本地可用的实现）
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:matrix-txn" } },
      profiles: { p: { tools: { write: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言错误消息逐值指出该实现
    expect(() => validateToolRegistry(tools)).toThrow(/recovery implementation builtin:matrix-txn is not available/);
  });
});
