/**
 * Case ID: UT-PI-292  ·  STATUS: real
 *
 * 责任：分支 L124 `{ this.mem0Adapter = undefined; }`（else；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-292.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-292 · PiRuntime.constructor · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of leaving mem0 unconfigured while memory is required", async () => {  // rejects the illegal transition of leaving mem0 unconfigured while memory is required
    // 步骤 1：非法迁移 —— 配了 identity.memory 却没有 key（不许降级成「无 adapter」）
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
    });
    try {
      // 步骤 2/3：断言迁移被拒绝，且 adapter 保持 undefined（没被偷偷降级）
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
      expect(fx.state("mem0Adapter")).toBeUndefined();
    } finally {
      await fx.close();
    }
  });
});
