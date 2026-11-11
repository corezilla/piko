/**
 * Case ID: UT-PI-298  ·  STATUS: real
 *
 * 责任：分支 L129 `config.identity?.doc_search && graphragApiKey`（&&；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-298.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-298 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the doc_search and key conjunction and the false side of the key operand", async () => {  // takes the true side of the doc_search and key conjunction and the false side of the key operand
    // 步骤 1a：doc_search 真 且 key 真 ⇒ adapter 构造
    const both = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
      graphragApiKey: "k",
    });
    try {
      expect(both.error).toBeUndefined();
      expect(both.state("graphragAdapter")).toBeDefined();
    } finally {
      await both.close();
    }

    // 步骤 1b：doc_search 真 但 key 假 ⇒ fail-fast
    const noKey = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
    });
    try {
      expect(noKey.error).toBeInstanceOf(Error);
      expect((noKey.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
    } finally {
      await noKey.close();
    }
  });
});
