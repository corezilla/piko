/**
 * Case ID: UT-PI-256  ·  STATUS: real
 *
 * 责任：throw L190 `reject`（守卫 `unconditional`；mem0-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-256.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-256 · search · 错误路径 × 每个 typed 错误码", () => {
  it("throws a typed error for every non-2xx status with the mapped code", async () => {  // throws a typed error for every non-2xx status with the mapped code
    const ff = scriptedFetch([
      { status: 401, statusText: "Unauthorized", body: JSON.stringify({ message: "API key invalid" }) },
      { status: 429, statusText: "Too Many Requests", body: JSON.stringify({ message: "quota exceeded" }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：触发 L190 的无条件 throw——任何非 2xx 都命中
      const err = await adapter.search("q", "u").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).status).toBe(401);
      expect((err as Mem0ApiError).code).toBe("auth_invalid");
      expect((err as Mem0ApiError).message).toBe("API key invalid");
      expect((err as Mem0ApiError).cause).toBeUndefined();

      const err2 = await adapter.search("q", "u").catch((e: unknown) => e);
      expect((err2 as Mem0ApiError).status).toBe(429);
      expect((err2 as Mem0ApiError).code).toBe("rate_limited");
      expect((err2 as Mem0ApiError).message).toBe("quota exceeded");
      expect(ff.calls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
