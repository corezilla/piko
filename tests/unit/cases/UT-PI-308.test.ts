/**
 * Case ID: UT-PI-308  ·  STATUS: real
 *
 * 责任：状态写 L120 → `this.mem0Adapter`（pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-308.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-308 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("writes the mem0 adapter instance into the runtime state", async () => {  // writes the mem0 adapter instance into the runtime state
    // 步骤 1：构造前置状态 —— identity.memory 配了 + key 给了
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ memory: { base_url: "https://mem0.internal" } }) }),
      mem0ApiKey: "mem0-key",
    });
    try {
      // 步骤 2/3：读回权威事实源（对象状态直接读），逐值对账写入语义
      const adapter = fx.state<{ baseUrl: string; apiKey: string }>("mem0Adapter");
      expect(adapter).toBeDefined();
      expect(adapter?.baseUrl).toBe("https://mem0.internal");
      expect(adapter?.apiKey).toBe("mem0-key");
    } finally {
      await fx.close();
    }
  });
});
