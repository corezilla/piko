/**
 * Case ID: UT-PI-301  ·  STATUS: real
 *
 * 责任：分支 L138 `{ this.graphragAdapter = undefined; }`（else；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-301.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-301 · PiRuntime.constructor · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of leaving graphrag unconfigured while doc_search is required", async () => {  // rejects the illegal transition of leaving graphrag unconfigured while doc_search is required
    // 步骤 1：非法迁移 —— 配了 identity.doc_search 却没有 key（不许降级成「无 adapter」）
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
    });
    try {
      // 步骤 2/3：断言迁移被拒绝，adapter 保持 undefined
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
      expect(fx.state("graphragAdapter")).toBeUndefined();
    } finally {
      await fx.close();
    }
  });
});
