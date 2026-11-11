/**
 * Case ID: UT-PI-375  ·  STATUS: real
 *
 * 责任：分支 L257 `if (path)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-375.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-375 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the path presence check for a tool call without a path", async () => {  // takes the false side of the path presence check for a tool call without a path
    // 步骤 1：bash 工具调用没有 path ⇒ if (path) 为假 ⇒ 跳过路径授权
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { bash: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧跑完，任务没有 read/write 路径授权也不影响
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
