/**
 * Case ID: UT-PI-287  ·  STATUS: real
 *
 * 责任：分支 L121 `if (config.identity?.memory && !mem0Api…`（else；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-287.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-287 · PiRuntime.constructor · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of configuring memory without a key", async () => {  // rejects the illegal transition of configuring memory without a key
    // 步骤 1：非法迁移 —— 配了 identity.memory 却没给 mem0ApiKey
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
    });
    try {
      // 步骤 2/3：断言迁移被拒绝 —— 错误 typed 化（Error + 可判别消息），且无部分写入
      expect(fx.error).toBeInstanceOf(Error);
      expect((fx.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
      // 无部分写入：runtime 根本没被构造出来
      expect(fx.runtime).toBeUndefined();
      // 无残留：构造失败不发任何事实
      expect(fx.facts).toEqual([]);
    } finally {
      await fx.close();
    }
  });
});
