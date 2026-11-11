/**
 * Case ID: UT-PI-291  ·  STATUS: real
 *
 * 责任：分支 L121 `if (config.identity?.memory && !mem0ApiKey)`（if；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-291.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-291 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the missing-key branch when memory is configured without a key", async () => {  // takes the true side of the missing-key branch when memory is configured without a key
    // 步骤 1：取真侧 —— identity.memory 配了、mem0ApiKey 缺失
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
    });
    try {
      // 步骤 2/3：断言取真侧被走到 —— 构造期即报错
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
    } finally {
      await fx.close();
    }
  });
});
