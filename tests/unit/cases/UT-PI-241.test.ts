/**
 * Case ID: UT-PI-241  ·  STATUS: real
 *
 * 责任：分支 L119 `translatedFilters.metadata ?? {}`（??；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-241.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-241 · search · 状态分支 × 合法迁移", () => {
  it("creates a fresh metadata object but reuses and mutates an existing one", async () => {  // creates a fresh metadata object but reuses and mutates an existing one
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——filters 里没有 metadata 对象 → ?? 造一个新的 {}
      await adapter.search("q", "u", { filters: { "metadata.type": "skill_experience" } });
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u", metadata: { type: "skill_experience" } });

      // 步骤 3：取假侧——filters 里已有 metadata 对象 → ?? 直接复用它（就地改写调用方的对象）
      const callerFilters = { metadata: { existing: "keep" }, "metadata.type": "skill_experience" };
      await adapter.search("q", "u", { filters: callerFilters });
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u", metadata: { existing: "keep", type: "skill_experience" } });
      expect(callerFilters.metadata).toEqual({ existing: "keep", type: "skill_experience" });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
