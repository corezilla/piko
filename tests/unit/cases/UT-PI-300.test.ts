/**
 * Case ID: UT-PI-300  ·  STATUS: real
 *
 * 责任：分支 L135 `if (config.identity?.doc_search && !graphragA…`（if；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-300.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-300 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the missing-graphrag-key branch", async () => {  // takes the true side of the missing-graphrag-key branch
    // 步骤 1：取真侧 —— identity.doc_search 配了、graphragApiKey 缺失
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
    });
    try {
      // 步骤 2/3：断言取真侧被走到
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
    } finally {
      await fx.close();
    }
  });
});
