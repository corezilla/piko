/**
 * Case ID: UT-PI-242  ·  STATUS: real
 *
 * 责任：分支 L146 `catch (err)`（catch；mem0-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-242.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { rejectingFetch, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-242 · search · 错误路径 × 每个 typed 错误码", () => {
  it("wraps a fetch rejection into a typed network error", async () => {  // wraps a fetch rejection into a typed network error
    const boom = new TypeError("boom");
    const bad = rejectingFetch(boom);
    vi.stubGlobal("fetch", bad.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——fetch reject
      const err = await adapter.search("q", "u").catch((e: unknown) => e);
      // 步骤 3：typed 错误的 status / code / message / cause 逐值对账
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).name).toBe("Mem0ApiError");
      expect((err as Mem0ApiError).status).toBe(0);
      expect((err as Mem0ApiError).code).toBe("network");
      expect((err as Mem0ApiError).message).toBe("search failed: TypeError: boom");
      expect((err as Mem0ApiError).cause).toBe(boom);
      expect(bad.calls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }

    const ok = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ok.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 4：取假侧——fetch 正常返回，catch 不执行
      await expect(adapter.search("q", "u")).resolves.toEqual([]);
      expect(ok.calls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
