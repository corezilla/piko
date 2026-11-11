/**
 * Case ID: UT-PI-223  ·  STATUS: real
 *
 * 责任：参数 `user_id: string` 的 `空` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-223.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-223 · search · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty user_id with a plain Error before any request", async () => {  // rejects an empty user_id with a plain Error before any request
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：user_id 三态——空串 / undefined / null
      for (const bad of ["", undefined, null]) {
        const err = await adapter.search("q", bad as unknown as string).catch((e: unknown) => e);
        // 步骤 3：抛的是普通 Error（不是 typed 的 Mem0ApiError），消息逐值对账
        expect(err).toBeInstanceOf(Error);
        expect(err).not.toBeInstanceOf(Mem0ApiError);
        expect((err as Error).name).toBe("Error");
        expect((err as Error).message).toBe("user_id required");
      }
      // 守卫在前：一次请求都没发出去
      expect(ff.calls.length).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
