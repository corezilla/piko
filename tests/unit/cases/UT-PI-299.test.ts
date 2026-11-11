/**
 * Case ID: UT-PI-299  ·  STATUS: real
 *
 * 责任：分支 L129 `config.identity?.doc_search`（?.；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-299.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-299 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the optional chaining on identity for doc_search", async () => {  // takes the true and the false side of the optional chaining on identity for doc_search
    // 步骤 1a：identity 存在 ⇒ 可选链取真
    const withIdentity = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
      graphragApiKey: "k",
    });
    try {
      expect(withIdentity.error).toBeUndefined();
      expect(withIdentity.state("graphragAdapter")).toBeDefined();
    } finally {
      await withIdentity.close();
    }

    // 步骤 1b：identity 为 undefined ⇒ 可选链短路
    const withoutIdentity = await piConstructor({ graphragApiKey: "k" });
    try {
      expect(withoutIdentity.error).toBeUndefined();
      expect(withoutIdentity.state("graphragAdapter")).toBeUndefined();
    } finally {
      await withoutIdentity.close();
    }
  });
});
