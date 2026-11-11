/**
 * Case ID: UT-PI-389  ·  STATUS: real
 *
 * 责任：分支 L266 `policy.permissions?.executables??[]`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-389.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-389 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to an empty executable allowlist when the tool policy has none", async () => {  // falls back to an empty executable allowlist when the tool policy has none
    // 步骤 1：工具策略没有 permissions ⇒ ?? 回落为空数组（空即不限制）
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { bash: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 回落成功，可执行文件不被限制
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
