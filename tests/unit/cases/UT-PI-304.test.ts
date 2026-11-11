/**
 * Case ID: UT-PI-304  ·  STATUS: real
 *
 * 责任：分支 L135 `!graphragApiKey`（!；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-304.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-304 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the graphrag key", async () => {  // takes the true and the false side of the negation on the graphrag key
    // 步骤 1a：!key 为真（key 缺失）⇒ fail-fast
    const noKey = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
    });
    try {
      expect(noKey.error).toBeInstanceOf(Error);
      expect((noKey.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
    } finally {
      await noKey.close();
    }

    // 步骤 1b：!key 为假（key 给了）⇒ adapter 正常构造
    const withKey = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
      graphragApiKey: "k",
    });
    try {
      expect(withKey.error).toBeUndefined();
      expect(withKey.state("graphragAdapter")).toBeDefined();
    } finally {
      await withKey.close();
    }
  });
});
