/**
 * Case ID: UT-PI-277  ·  STATUS: real
 *
 * 责任：可选参数 `mem0ApiKey` 缺省/显式两态（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-277.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-277 · PiRuntime.constructor · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("treats an omitted mem0 key and an explicit one as the two distinct states", async () => {  // treats an omitted mem0 key and an explicit one as the two distinct states
    // 步骤 1a：缺省（undefined）—— 配了 memory 却没给 key ⇒ fail-fast
    const omitted = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
    });
    try {
      expect(omitted.error).toBeInstanceOf(Error);
      expect((omitted.error as Error).message).toBe("mem0ApiKey required when identity.memory configured");
    } finally {
      await omitted.close();
    }

    // 步骤 1b：显式给了 key ⇒ adapter 被构造
    const explicit = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "explicit-key",
    });
    try {
      expect(explicit.error).toBeUndefined();
      expect(explicit.state("mem0Adapter")).toBeDefined();
    } finally {
      await explicit.close();
    }
  });
});
