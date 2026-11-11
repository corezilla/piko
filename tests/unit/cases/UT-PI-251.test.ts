/**
 * Case ID: UT-PI-251  ·  STATUS: real
 *
 * 责任：分支 L176 `r.created_at ?? ""`（??；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-251.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-251 · search · 状态分支 × 合法迁移", () => {
  it("keeps a result created_at and defaults to an empty string otherwise", async () => {  // keeps a result created_at and defaults to an empty string otherwise
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ created_at: "2026-01-02T03:04:05Z" }, {}] }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——created_at 存在
      const hits = await adapter.search("q", "u");
      expect(hits[0]!.created_at).toBe("2026-01-02T03:04:05Z");
      // 步骤 3：取假侧——created_at 缺省 → 兜到空串
      expect(hits[1]!.created_at).toBe("");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
