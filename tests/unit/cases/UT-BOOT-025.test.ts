/**
 * Case ID: UT-BOOT-025  ·  STATUS: real
 *
 * 责任：分支 L38 !: !supported.has(c.implementation_ref)（config.ts）
 * 维度坐标：`validateToolRegistry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-025.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateToolRegistry, type ToolRegistry } from "../../../src/config.js";

describe("UT-BOOT-025 · validateToolRegistry · 状态分支 × 合法迁移", () => {
  it("accepts each supported implementation", () => {
    // 步骤 1：构造三个受支持的实现各一条
    for (const ref of ["builtin:matrix-txn", "builtin:workspace-atomic-write", "builtin:external-status"]) {
      const tools: ToolRegistry = {
        profile_version: "0.3",
        recovery_contracts: { c: { kind: "stable_deduplication", implementation_ref: ref } },
        profiles: {},
      };

      // 步骤 2：调用 validateToolRegistry
      // 步骤 3：断言受支持的实现都被接受
      expect(() => validateToolRegistry(tools)).not.toThrow();
    }
  });
});
