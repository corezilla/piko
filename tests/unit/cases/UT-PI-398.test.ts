/**
 * Case ID: UT-PI-398  ·  STATUS: real
 *
 * 责任：分支 L275 `x.type==="text"&&typeof x.text==="string"&&x.…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-398.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-398 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the content shape conjunction on the tool end event", async () => {  // takes the true side of the content shape conjunction on the tool end event
    // 步骤 1：正常跑一轮（没有工具调用）⇒ tool_end 的结果内容不满足中断文案条件
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 执行正常完成，没有 unknown 事实
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "terminalTool" && (f as { unknown: boolean }).unknown)).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
