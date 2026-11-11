/**
 * Case ID: UT-PI-312  ·  STATUS: real
 *
 * 责任：状态写 L143 → `this.repo`（pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-312.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";
import { join } from "node:path";

describe("UT-PI-312 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("writes the session repository into the runtime state with the configured session root", async () => {  // writes the session repository into the runtime state with the configured session root
    // 步骤 1：构造前置状态 —— 合法 config（session_root 由 fixture 指向临时目录）
    const fx = await piConstructor();
    try {
      // 步骤 2/3：读回权威事实源 —— repo 被构造出来，且带上了 session_root
      const repo = fx.state<{ sessionsRootInput?: string }>("repo");
      expect(repo).toBeDefined();
      expect(repo!.sessionsRootInput).toBe(fx.config.pi.session_root);
      expect(repo!.sessionsRootInput).toBe(join(fx.root, "sessions"));
    } finally {
      await fx.close();
    }
  });
});
