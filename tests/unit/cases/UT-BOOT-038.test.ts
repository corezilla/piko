/**
 * Case ID: UT-BOOT-038  ·  STATUS: real
 *
 * 责任：分支 L46 !: !["write", "edit"].includes(name)（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-038.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-038 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("rejects workspace-atomic-write on a tool outside the write/edit pair", () => {
    // 步骤 1：构造 remote_bash 绑 workspace-atomic-write 且 effect=workspace_write
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:workspace-atomic-write" } },
      profiles: { p: { tools: { remote_bash: { effect: "workspace_write", replay: "never", recovery_contract_ref: "c", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言被拒绝（工具名不在 write/edit 内）
    expect(() => validateToolRegistry(tools)).toThrow(/not applicable to tool remote_bash/);
  });
});
