/**
 * Case ID: UT-BOOT-021  ·  STATUS: real
 *
 * 责任：参数 `tools: ToolRegistry` 的 `每等价类合法值` 类（config.ts:26）
 * 维度坐标：`validateToolRegistry` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-021.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-021 · validateToolRegistry · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a registry whose tools and contracts line up", () => {
    // 步骤 1：构造合法 registry（write/edit 绑 workspace-atomic-write，read 为 read_only）
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:workspace-atomic-write" } },
      profiles: { p: { tools: {
        write: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} },
        edit: { effect: "workspace_write", replay: "safe", recovery_contract_ref: "c", permissions: {} },
        read: { effect: "read_only", replay: "never", permissions: {} },
      } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错（合法等价类被接受）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
