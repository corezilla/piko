/**
 * Case ID: UT-PI-286  ·  STATUS: real
 *
 * 责任：分支 L118 `if (config.identity?.memory && mem0ApiKey)`（if；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-286.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-286 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the memory branch when identity memory is configured with a key", async () => {  // takes the true side of the memory branch when identity memory is configured with a key
    // 步骤 1：取真侧 —— identity.memory 配了 + mem0ApiKey 给了
    const truthy = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "mem0-key",
    });
    try {
      // 步骤 2：断言取真侧被走到 —— mem0Adapter 被构造出来
      expect(truthy.error).toBeUndefined();
      expect(truthy.state("mem0Adapter")).toBeDefined();
    } finally {
      await truthy.close();
    }

    // 步骤 3：取假侧 —— 配了 memory 但没给 key ⇒ fail-fast
    const falsy = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
    });
    try {
      // 步骤 4：断言取假侧被走到 —— 构造抛错
      expect(falsy.error).toBeInstanceOf(Error);
      expect((falsy.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
      expect(falsy.state("mem0Adapter")).toBeUndefined();
    } finally {
      await falsy.close();
    }
  });
});
