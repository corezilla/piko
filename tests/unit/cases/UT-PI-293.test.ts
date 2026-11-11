/**
 * Case ID: UT-PI-293  ·  STATUS: real
 *
 * 责任：分支 L121 `config.identity?.memory && !mem0ApiKey`（&&；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-293.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-293 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the memory and missing-key conjunction", async () => {  // takes the true side of the memory and missing-key conjunction
    // 步骤 1a：memory 真、!key 真 ⇒ fail-fast
    const both = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
    });
    try {
      expect(both.error).toBeInstanceOf(Error);
      expect((both.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
    } finally {
      await both.close();
    }

    // 步骤 1b：memory 假 ⇒ 整个合取为假，不进 fail-fast 分支
    const noMemory = await piConstructor();
    try {
      expect(noMemory.error).toBeUndefined();
      expect(noMemory.state("mem0Adapter")).toBeUndefined();
    } finally {
      await noMemory.close();
    }
  });
});
