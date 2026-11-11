/**
 * Case ID: UT-PI-303  ·  STATUS: real
 *
 * 责任：分支 L135 `config.identity?.doc_search`（?.；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-303.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-303 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the optional chaining on identity in the graphrag missing-key branch", async () => {  // takes the true and the false side of the optional chaining on identity in the graphrag missing-key branch
    // 步骤 1a：identity 存在、doc_search 缺 key ⇒ 取真
    const withIdentity = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
    });
    try {
      expect(withIdentity.error).toBeInstanceOf(Error);
      expect((withIdentity.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
    } finally {
      await withIdentity.close();
    }

    // 步骤 1b：identity 不存在 ⇒ 可选链短路
    const withoutIdentity = await piConstructor();
    try {
      expect(withoutIdentity.error).toBeUndefined();
      expect(withoutIdentity.state("graphragAdapter")).toBeUndefined();
    } finally {
      await withoutIdentity.close();
    }
  });
});
