/**
 * Case ID: UT-PI-230  ·  STATUS: real
 *
 * 责任：分支 L94 `if (!user_id || user_id.trim() === "")`（if；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-230.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-230 · search · 状态分支 × 合法迁移", () => {
  it("guards on an empty user_id and skips the guard for a valid one", async () => {  // guards on an empty user_id and skips the guard for a valid one
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——user_id 为空 → 抛普通 Error
      const err = await adapter.search("q", "").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err).not.toBeInstanceOf(Mem0ApiError);
      expect((err as Error).message).toBe("user_id required");
      expect(ff.calls.length).toBe(0);

      // 步骤 3：取假侧——user_id 合法 → 守卫块不执行，请求照发
      await adapter.search("q", "u");
      expect(ff.calls.length).toBe(1);
      expect((bodyOf(ff.calls[0]!).filters as Record<string, unknown>).user_id).toBe("u");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
