/**
 * Case ID: UT-PI-252  ·  STATUS: real
 *
 * 责任：分支 L186 `if (errBody.message)`（if；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-252.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-252 · search · 状态分支 × 合法迁移", () => {
  it("prefers the body message over the status text on api errors", async () => {  // prefers the body message over the status text on api errors
    const ff = scriptedFetch([
      { status: 429, statusText: "Too Many Requests", body: JSON.stringify({ message: "quota exceeded" }) },
      { status: 404, statusText: "Not Found", body: JSON.stringify({ error: "Not found." }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——errBody.message 为真，错误消息取响应体
      const err = await adapter.search("q", "u").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).status).toBe(429);
      expect((err as Mem0ApiError).code).toBe("rate_limited");
      expect((err as Mem0ApiError).message).toBe("quota exceeded");

      // 步骤 3：取假侧——errBody.message 为假（键不存在），回落到 statusText
      const err2 = await adapter.search("q", "u").catch((e: unknown) => e);
      expect(err2).toBeInstanceOf(Mem0ApiError);
      expect((err2 as Mem0ApiError).status).toBe(404);
      expect((err2 as Mem0ApiError).code).toBe("not_found");
      expect((err2 as Mem0ApiError).message).toBe("Not Found");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
