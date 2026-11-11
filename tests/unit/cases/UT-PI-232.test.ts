/**
 * Case ID: UT-PI-232  ·  STATUS: real
 *
 * 责任：分支 L94 `!user_id`（!；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-232.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-232 · search · 状态分支 × 合法迁移", () => {
  it("rejects falsy user_ids and lets a non-empty one through", async () => {  // rejects falsy user_ids and lets a non-empty one through
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：!user_id 取真——空串 / null / undefined
      for (const bad of ["", null, undefined]) {
        const err = await adapter.search("q", bad as unknown as string).catch((e: unknown) => e);
        expect((err as Error).message).toBe("user_id required");
      }
      expect(ff.calls.length).toBe(0);

      // 步骤 3：!user_id 取假——user_id 是非空字符串，守卫块不执行
      await adapter.search("q", "u");
      expect(ff.calls.length).toBe(1);
      expect((bodyOf(ff.calls[0]!).filters as Record<string, unknown>).user_id).toBe("u");

      // !user_id 对纯空白串为假，但 || 的右操作数仍然命中 → 依然被拒
      const ws = await adapter.search("q", "   ").catch((e: unknown) => e);
      expect((ws as Error).message).toBe("user_id required");
      expect(ff.calls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
