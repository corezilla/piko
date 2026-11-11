/**
 * Case ID: UT-PI-243  ·  STATUS: real
 *
 * 责任：分支 L151 `if (response.ok)`（if；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-243.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-243 · search · 状态分支 × 合法迁移", () => {
  it("parses a 2xx response and rejects a non-2xx response", async () => {  // parses a 2xx response and rejects a non-2xx response
    const okBody = JSON.stringify({ results: [{ id: "m1", memory: "fact", score: 0.9, metadata: { type: "t" }, created_at: "2026-01-01" }] });
    const ff = scriptedFetch([
      { status: 200, body: okBody },
      { status: 500, statusText: "Internal Server Error", body: JSON.stringify({ message: "backend down" }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——response.ok，走解析映射
      const hits = await adapter.search("q", "u");
      expect(hits).toEqual([{ id: "m1", memory: "fact", score: 0.9, metadata: { type: "t" }, created_at: "2026-01-01" }]);

      // 步骤 3：取假侧——response.ok 为假，抛 typed 错误
      const err = await adapter.search("q", "u").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).status).toBe(500);
      expect((err as Mem0ApiError).code).toBe("server_error");
      expect((err as Mem0ApiError).message).toBe("backend down");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
