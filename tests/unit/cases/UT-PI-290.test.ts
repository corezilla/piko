/**
 * Case ID: UT-PI-290  ·  STATUS: real
 *
 * 责任：分支 L119 `config.identity.memory.base_url ?? "https://a…`（??；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-290.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-290 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("falls back to the default mem0 base url when the configured one is absent", async () => {  // falls back to the default mem0 base url when the configured one is absent
    // 步骤 1a：base_url 缺省 ⇒ 用默认 https://api.mem0.ai
    const fallback = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "k",
    });
    try {
      expect(fallback.error).toBeUndefined();
      expect(fallback.state<{ baseUrl: string }>("mem0Adapter").baseUrl).toBe("https://api.mem0.ai");
    } finally {
      await fallback.close();
    }

    // 步骤 1b：base_url 显式给出 ⇒ 用它
    const explicit = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY", base_url: "https://mem0.internal" } } }),
      mem0ApiKey: "k",
    });
    try {
      expect(explicit.error).toBeUndefined();
      expect(explicit.state<{ baseUrl: string }>("mem0Adapter").baseUrl).toBe("https://mem0.internal");
    } finally {
      await explicit.close();
    }
  });
});
