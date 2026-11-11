/**
 * Case ID: UT-PI-393  ·  STATUS: real
 *
 * 责任：分支 L269 `if (command!==undefined)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-393.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-393 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the command presence check", async () => {  // takes the true side of the command presence check
    // 步骤 1：bash 工具带 command ⇒ command !== undefined 为真
    const fx = await piFixture({
      registry: piTools({
        "workspace-standard": { bash: { effect: "read_only", replay: "safe", permissions: { executables: ["ls"] } } } as never,
      }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
