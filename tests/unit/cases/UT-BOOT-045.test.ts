/**
 * Case ID: UT-BOOT-045  ·  STATUS: real
 *
 * 责任：throw L44 `unbound recovery contract`（守卫见 config.ts:44）
 * 维度坐标：`validateToolRegistry` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-045.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-045 · validateToolRegistry · 错误路径 × 每个 typed 错误码", () => {
  it("throws with the declared error code", () => {
    // 步骤 1：构造触发该守卫的 registry
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: { read: { effect: "read_only", replay: "never", recovery_contract_ref: "missing", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言 typed 错误码逐值等于设计声明
    expect(() => validateToolRegistry(tools)).toThrow(/unbound recovery contract/);
  });
});
