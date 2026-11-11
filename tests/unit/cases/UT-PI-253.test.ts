/**
 * Case ID: UT-PI-253  ·  STATUS: real
 *
 * 责任：分支 L187 `catch ()`（catch；mem0-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-253.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-253 · search · 错误路径 × 每个 typed 错误码", () => {
  it("swallows an unparseable error body and keeps the status text", async () => {  // swallows an unparseable error body and keeps the status text
    const ff = scriptedFetch([
      { status: 503, statusText: "Service Unavailable", body: "<html>not json</html>" },
      { status: 502, statusText: "Bad Gateway", body: JSON.stringify({ detail: "x" }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——response.json() 解析失败，catch 吞掉 → 仍是 typed 错误而非 SyntaxError
      const err = await adapter.search("q", "u").catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).status).toBe(503);
      expect((err as Mem0ApiError).code).toBe("server_error");
      expect((err as Mem0ApiError).message).toBe("Service Unavailable");

      // 步骤 3：取假侧——JSON 解析成功（没有 message），同样回落 statusText
      const err2 = await adapter.search("q", "u").catch((e: unknown) => e);
      expect(err2).toBeInstanceOf(Mem0ApiError);
      expect((err2 as Mem0ApiError).status).toBe(502);
      expect((err2 as Mem0ApiError).message).toBe("Bad Gateway");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
