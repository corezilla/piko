/**
 * Case ID: UT-PI-296  ·  STATUS: real
 *
 * 责任：分支 L129 `if (config.identity?.doc_search && graphragAp…`（if；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-296.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-296 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the doc_search branch when it is configured with a key", async () => {  // takes the true side of the doc_search branch when it is configured with a key
    // 步骤 1：取真侧 —— identity.doc_search 配了 + graphragApiKey 给了
    const truthy = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
      graphragApiKey: "graphrag-key",
    });
    try {
      // 步骤 2：断言取真侧被走到
      expect(truthy.error).toBeUndefined();
      expect(truthy.state("graphragAdapter")).toBeDefined();
    } finally {
      await truthy.close();
    }

    // 步骤 3：取假侧 —— 配了 doc_search 但没给 key ⇒ fail-fast
    const falsy = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
    });
    try {
      // 步骤 4：断言取假侧被走到
      expect(falsy.error).toBeInstanceOf(Error);
      expect((falsy.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
      expect(falsy.state("graphragAdapter")).toBeUndefined();
    } finally {
      await falsy.close();
    }
  });
});
