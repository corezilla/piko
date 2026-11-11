/**
 * Case ID: UT-PI-231  ·  STATUS: real
 *
 * 责任：分支 L94 `!user_id || user_id.trim() === ""`（||；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-231.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-231 · search · 状态分支 × 合法迁移", () => {
  it("throws on either side of the user_id or-expression", async () => {  // throws on either side of the user_id or-expression
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：|| 左操作数取真——user_id 为空串
      const left = await adapter.search("q", "").catch((e: unknown) => e);
      expect((left as Error).message).toBe("user_id required");

      // || 右操作数取真——user_id 非空但 trim 后为空
      const right = await adapter.search("q", "   ").catch((e: unknown) => e);
      expect((right as Error).message).toBe("user_id required");
      expect(ff.calls.length).toBe(0);

      // 步骤 3：两个操作数都取假——守卫块不执行
      await adapter.search("q", "u");
      expect(ff.calls.length).toBe(1);
      expect((bodyOf(ff.calls[0]!).filters as Record<string, unknown>).user_id).toBe("u");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
