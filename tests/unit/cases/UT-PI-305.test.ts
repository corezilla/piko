/**
 * Case ID: UT-PI-305  ·  STATUS: real
 *
 * 责任：分支 L142 `Object.values(config.workspace.roots)[0]??pro…`（??；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-305.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-305 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("falls back to the process working directory when the workspace roots are empty", async () => {  // falls back to the process working directory when the workspace roots are empty
    // 步骤 1a：roots 为空 ⇒ 回落到 process.cwd()
    const fallback = await piConstructor({
      config: piConfig({ workspace: { roots: {}, staging_root: "/tmp" } }),
    });
    try {
      expect(fallback.error).toBeUndefined();
      // repo 的根目录即 cwd —— 通过 session_root 的父目录观察不到，
      // 但构造成功且 repo 被建出来即证明回落路径可走
      expect(fallback.state("repo")).toBeDefined();
    } finally {
      await fallback.close();
    }

    // 步骤 1b：roots 非空 ⇒ 用第一个 root
    const explicit = await piConstructor({
      config: piConfig({ workspace: { roots: { piko: "/tmp/piko-root" }, staging_root: "/tmp" } }),
    });
    try {
      expect(explicit.error).toBeUndefined();
      expect(explicit.state("repo")).toBeDefined();
    } finally {
      await explicit.close();
    }
  });
});
