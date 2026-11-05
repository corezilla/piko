/**
 * Case ID: UT-BOOT-041  ·  STATUS: real
 *
 * 责任：分支 L49 ?.: contract?.implementation_ref（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-041.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-041 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("skips the local-tool rule when there is no contract", () => {
    // 步骤 1：构造无契约、replay=safe、effect=read_only 的工具
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: { read: { effect: "read_only", replay: "safe", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言不抛错（可选链取 undefined）
    expect(() => validateToolRegistry(tools)).not.toThrow();
  });
});
