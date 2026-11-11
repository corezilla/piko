/**
 * Case ID: UT-PI-311  ·  STATUS: real
 *
 * 责任：状态写 L139 → `this.graphragAdapter`（pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-311.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor } from "./support/pi-runtime-fix.js";

describe("UT-PI-311 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("writes undefined to the graphrag adapter state when doc_search is not configured", async () => {  // writes undefined to the graphrag adapter state when doc_search is not configured
    // 步骤 1：前置状态 —— identity 完全没有配 doc_search
    const fx = await piConstructor();
    try {
      // 步骤 2/3：读回权威事实源 —— 该状态写落在 else 侧，值为 undefined
      expect(fx.state("graphragAdapter")).toBeUndefined();
    } finally {
      await fx.close();
    }
  });
});
