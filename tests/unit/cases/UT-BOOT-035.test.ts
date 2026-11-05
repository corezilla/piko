/**
 * Case ID: UT-BOOT-035  ·  STATUS: real
 *
 * 责任：分支 L46 &&: contract?.implementation_ref === "builtin:workspace-atomic-write" && …（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-035.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-035 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("rejects a workspace-atomic-write contract on a tool it does not implement", () => {
    // 步骤 1：构造 bash 绑 workspace-atomic-write
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:workspace-atomic-write" } },
      profiles: { p: { tools: { bash: { effect: "process", replay: "safe", recovery_contract_ref: "c", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言被拒绝并指出该契约不适用
    expect(() => validateToolRegistry(tools)).toThrow(/workspace atomic recovery is not applicable to tool bash/);
  });
});
