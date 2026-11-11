/**
 * Case ID: UT-PI-288  ·  STATUS: real
 *
 * 责任：分支 L118 `config.identity?.memory && mem0ApiKey`（&&；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-288.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-288 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the memory and key conjunction and the false side of the key operand", async () => {  // takes the true side of the memory and key conjunction and the false side of the key operand
    // 步骤 1a：memory 为真 且 key 为真 ⇒ adapter 构造
    const both = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
      mem0ApiKey: "k",
    });
    try {
      expect(both.error).toBeUndefined();
      expect(both.state("mem0Adapter")).toBeDefined();
    } finally {
      await both.close();
    }

    // 步骤 1b：memory 为真 但 key 为假 ⇒ fail-fast（key 操作数取假）
    const noKey = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: {} }) }),
    });
    try {
      expect(noKey.error).toBeInstanceOf(Error);
      expect((noKey.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
    } finally {
      await noKey.close();
    }
  });
});
