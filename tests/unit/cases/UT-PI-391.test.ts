/**
 * Case ID: UT-PI-391  ·  STATUS: real
 *
 * 责任：分支 L267 `if (execAllowlist.length>0)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-391.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-391 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the non-empty executable allowlist check", async () => {  // takes the true side of the non-empty executable allowlist check
    // 步骤 1：工具策略给了非空 executables ⇒ 进入允许列表校验
    const fx = await piFixture({
      registry: piTools({
        "workspace-standard": { bash: { effect: "read_only", replay: "safe", permissions: { executables: ["ls"] } } } as never,
      }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完（模型本轮未请求执行）
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
