/**
 * Case ID: UT-PI-250  ·  STATUS: real
 *
 * 责任：分支 L174 `? typeof r.score === "number" :`（ternary；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-250.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-250 · search · 状态分支 × 合法迁移", () => {
  it("keeps a numeric score and coerces anything else to zero", async () => {  // keeps a numeric score and coerces anything else to zero
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ id: "m1", score: 0.42 }, { id: "m2", score: "0.5" }, { id: "m3", score: null }] }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——typeof score 是 number
      const hits = await adapter.search("q", "u");
      expect(hits[0]!.score).toBe(0.42);
      // 步骤 3：取假侧——score 是字符串 / null → 一律 0
      expect(hits[1]!.score).toBe(0);
      expect(hits[2]!.score).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
