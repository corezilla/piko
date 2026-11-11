/**
 * Case ID: UT-PI-239  ·  STATUS: real
 *
 * 责任：分支 L117 `if (k.startsWith("metadata.") && k !== "metad…`（if；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-239.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-239 · search · 状态分支 × 合法迁移", () => {
  it("nests a metadata filter but leaves the metadata.tags key to the categories branch", async () => {  // nests a metadata filter but leaves the metadata.tags key to the categories branch
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——键是 metadata.type（既以 metadata. 开头又不是 metadata.tags）
      await adapter.search("q", "u", { filters: { "metadata.type": "skill_experience" } });
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u", metadata: { type: "skill_experience" } });

      // 步骤 3：取假侧——键是 metadata.tags，被前一个分支消费掉，不进嵌套
      await adapter.search("q", "u", { filters: { "metadata.tags": "alpha" } });
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u", categories: { contains: "alpha" } });
      expect(Object.keys(bodyOf(ff.calls[1]!).filters as Record<string, unknown>)).not.toContain("metadata");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
