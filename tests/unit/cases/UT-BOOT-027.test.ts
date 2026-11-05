/**
 * Case ID: UT-BOOT-027  ·  STATUS: real
 *
 * 责任：分支 L41 loop: loop (Object.entries(p.tools))（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-027.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-027 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("checks every tool in a profile, not only the first", () => {
    // 步骤 1：构造一个 profile，第二个工具名未知
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: {
        read: { effect: "read_only", replay: "never", permissions: {} },
        invented: { effect: "read_only", replay: "never", permissions: {} },
      } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言循环走到第二个工具才发现问题
    expect(() => validateToolRegistry(tools)).toThrow(/invented/);
  });
});
