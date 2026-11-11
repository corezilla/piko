/**
 * Case ID: UT-PI-289  ·  STATUS: real
 *
 * 责任：分支 L118 `config.identity?.memory`（?.；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-289.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-289 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the optional chaining on identity for memory", async () => {  // takes the true and the false side of the optional chaining on identity for memory
    // 步骤 1a：identity 存在 ⇒ 可选链取真
    const withIdentity = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "k",
    });
    try {
      expect(withIdentity.error).toBeUndefined();
      expect(withIdentity.state("mem0Adapter")).toBeDefined();
    } finally {
      await withIdentity.close();
    }

    // 步骤 1b：identity 为 undefined ⇒ 可选链短路，adapter 不构造
    const withoutIdentity = await piConstructor({ mem0ApiKey: "k" });
    try {
      expect(withoutIdentity.error).toBeUndefined();
      expect(withoutIdentity.state("mem0Adapter")).toBeUndefined();
    } finally {
      await withoutIdentity.close();
    }
  });
});
