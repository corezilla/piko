/**
 * Case ID: UT-PI-302  ·  STATUS: real
 *
 * 责任：分支 L135 `config.identity?.doc_search && !graphragApiKey`（&&；pi-runtime.ts）
 * 维度坐标：`PiRuntime.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-302.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-302 · PiRuntime.constructor · 状态分支 × 合法迁移", () => {
  it("takes the true side of the doc_search and missing-key conjunction", async () => {  // takes the true side of the doc_search and missing-key conjunction
    // 步骤 1a：doc_search 真、!key 真 ⇒ fail-fast
    const both = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
    });
    try {
      expect(both.error).toBeInstanceOf(Error);
      expect((both.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
    } finally {
      await both.close();
    }

    // 步骤 1b：doc_search 假 ⇒ 整个合取为假
    const noDocSearch = await piConstructor();
    try {
      expect(noDocSearch.error).toBeUndefined();
      expect(noDocSearch.state("graphragAdapter")).toBeUndefined();
    } finally {
      await noDocSearch.close();
    }
  });
});
