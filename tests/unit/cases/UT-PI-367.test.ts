/**
 * Case ID: UT-PI-367  ·  STATUS: real
 *
 * 责任：分支 L249 `ev.runId??runId`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-367.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-367 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to the run id as the operation when the response carries no run id", async () => {  // falls back to the run id as the operation when the response carries no run id
    // 步骤 1：响应事件不带 runId ⇒ ev.runId ?? runId 落到 runId
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— providerCall 的 operation 是本次 operation id
      // （ev.runId ?? runId 这条回落链上，runId 由 Pi 的 drive 填成 operation id）
      expect(res.status).toBe("completed");
      const call = fx.facts.find((f) => f.kind === "providerCall");
      expect(call).toBeDefined();
      expect((call as { operation: string }).operation).toBe("run-1:initial");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
