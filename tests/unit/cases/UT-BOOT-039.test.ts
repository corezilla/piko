/**
 * Case ID: UT-BOOT-039  ·  STATUS: real
 *
 * 责任：分支 L49 if: if (contract?.implementation_ref !== "builtin:workspace-atomic-write" && …（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-039.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-039 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("requires a recovery implementation for a safe-replay local tool", () => {
    // 步骤 1：构造 write 绑 external-status（不是 workspace-atomic-write）、effect 非 read_only、replay=safe
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:external-status" } },
      profiles: { p: { tools: { write: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言被拒绝并指出该实现不适用于本地工具
    expect(() => validateToolRegistry(tools)).toThrow(/not available for local tool write/);
  });
});
