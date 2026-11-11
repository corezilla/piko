/**
 * Case ID: UT-PI-295  ·  STATUS: real
 *
 * 责任：分支 L121 `!mem0ApiKey`（!；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-295.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-295 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the mem0 key", async () => {  // takes the true and the false side of the negation on the mem0 key
    // 步骤 1a：!key 为真（key 缺失）⇒ fail-fast
    const noKey = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
    });
    try {
      expect(noKey.error).toBeInstanceOf(Error);
      expect((noKey.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
    } finally {
      await noKey.close();
    }

    // 步骤 1b：!key 为假（key 给了）⇒ adapter 正常构造
    const withKey = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
      mem0ApiKey: "k",
    });
    try {
      expect(withKey.error).toBeUndefined();
      expect(withKey.state("mem0Adapter")).toBeDefined();
    } finally {
      await withKey.close();
    }
  });
});
