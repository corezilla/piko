/**
 * Case ID: UT-BOOT-024  ·  STATUS: real
 *
 * 责任：分支 L37 loop: loop (Object.values(tools.recovery_contracts))（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-024.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-024 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("checks every recovery contract, not only the first", () => {
    // 步骤 1：构造两个契约，第二个用未知实现
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {
        ok: { kind: "stable_deduplication", implementation_ref: "builtin:external-status" },
        bad: { kind: "stable_deduplication", implementation_ref: "builtin:nope" },
      },
      profiles: {},
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言循环走到第二个契约才发现问题
    expect(() => validateToolRegistry(tools)).toThrow(/builtin:nope/);
  });
});
