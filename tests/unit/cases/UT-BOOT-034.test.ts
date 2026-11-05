/**
 * Case ID: UT-BOOT-034  ·  STATUS: real
 *
 * 责任：分支 L46 if: if (contract?.implementation_ref === "builtin:workspace-atomic-write" && …（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-034.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-034 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("applies the workspace-atomic-write rule to write and edit only", () => {
    // 步骤 1：构造 write 与 edit 各绑 workspace-atomic-write 且 effect=workspace_write
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:workspace-atomic-write" } },
      profiles: { p: { tools: {
        write: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} },
        edit: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} },
      } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言两个工具都被接受（该契约恰适用）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
