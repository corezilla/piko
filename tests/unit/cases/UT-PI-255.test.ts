/**
 * Case ID: UT-PI-255  ·  STATUS: real
 *
 * 责任：throw L147 `reject`（守卫 `catch`；mem0-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-255.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { rejectingFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-255 · search · 错误路径 × 每个 typed 错误码", () => {
  it("throws a typed network error carrying the original cause", async () => {  // throws a typed network error carrying the original cause
    const boom = new TypeError("fetch failed");
    const ff = rejectingFetch(boom);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：触发 L147 的 throw——fetch reject
      const err = await adapter.search("q", "u").catch((e: unknown) => e);
      // 步骤 3：typed 错误逐值对账——status=0、code=network、消息含原始错误、cause 保真
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).status).toBe(0);
      expect((err as Mem0ApiError).code).toBe("network");
      expect((err as Mem0ApiError).message).toBe("search failed: TypeError: fetch failed");
      expect((err as Mem0ApiError).message).toContain("search failed");
      expect((err as Mem0ApiError).cause).toBe(boom);
      // 请求确实发起过一次（错误发生在传输层，不在守卫）
      expect(ff.calls.length).toBe(1);
      expect(ff.calls[0]!.url).toBe("https://mem0.test/v3/memories/search/");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
