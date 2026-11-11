/**
 * Case ID: UT-PI-254  ·  STATUS: real
 *
 * 责任：throw L95 `user_id required`（守卫 `if (!user_id || user_id.trim() === "")`；mem0-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-254.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-254 · search · 错误路径 × 每个 typed 错误码", () => {
  it("throws the exact user_id required message without sending anything", async () => {  // throws the exact user_id required message without sending anything
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：触发 L95 的 throw——空串与纯空白串两条路径
      for (const bad of ["", "   "]) {
        const err = await adapter.search("q", bad).catch((e: unknown) => e);
        // 步骤 3：消息可判别（指明缺什么）；不是 typed 的 Mem0ApiError
        expect(err).toBeInstanceOf(Error);
        expect(err).not.toBeInstanceOf(Mem0ApiError);
        expect((err as Error).message).toBe("user_id required");
      }
      // 无部分写入：一次请求都没发，替身零调用
      expect(ff.calls.length).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
