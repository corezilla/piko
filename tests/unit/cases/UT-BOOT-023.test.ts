/**
 * Case ID: UT-BOOT-023  ·  STATUS: real
 *
 * 责任：参数 `tools: ToolRegistry` 的 `非法值` 类（config.ts:26）
 * 维度坐标：`validateToolRegistry` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-023.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-023 · validateToolRegistry · 纯函数/无副作用 × 每等价类合法值", () => {
  it("rejects a registry whose contract implementation is unknown", () => {
    // 步骤 1：构造含未知 implementation_ref 的 registry
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: "builtin:not-a-thing" } },
      profiles: {},
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言被拒绝且错误消息指出实现
    expect(() => validateToolRegistry(tools)).toThrow(/unregistered recovery implementation/);
  });

  it("rejects a registry whose tool name is unknown", () => {
    // 步骤 1：构造含未知工具名的 registry
    const tools: ToolRegistry = {
      profile_version: "0.3",
      recovery_contracts: {},
      profiles: { p: { tools: { invented: { effect: "read_only", replay: "never", permissions: {} } } } },
    };

    // 步骤 2：调用 validateToolRegistry
    // 步骤 3：断言被拒绝且错误消息指出工具名
    expect(() => validateToolRegistry(tools)).toThrow(/unregistered tool implementation: invented/);
  });
});
