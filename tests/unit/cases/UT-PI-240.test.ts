/**
 * Case ID: UT-PI-240  ·  STATUS: real
 *
 * 责任：分支 L117 `k.startsWith("metadata.") && k !== "metadata.…`（&&；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-240.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-240 · search · 状态分支 × 合法迁移", () => {
  it("requires both operands of the metadata prefix test before nesting a filter", async () => {  // requires both operands of the metadata prefix test before nesting a filter
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：&& 两个操作数都取真——metadata.type
      await adapter.search("q", "u", { filters: { "metadata.type": "skill_experience" } });
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u", metadata: { type: "skill_experience" } });

      // 步骤 3：&& 第一个操作数取假——键不以 metadata. 开头 → 块不执行，键原样透传
      await adapter.search("q", "u", { filters: { agent_id: "a1" } });
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u", agent_id: "a1" });
      expect(Object.keys(bodyOf(ff.calls[1]!).filters as Record<string, unknown>)).not.toContain("metadata");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
