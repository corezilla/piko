/**
 * Case ID: UT-PI-012  ·  STATUS: real
 *
 * 责任：`add` × `持久化/序列化` × `版本不符`（波次一粗粒度登记；mem0-client.ts:203）
 * 维度坐标：`add` × `持久化/序列化` × `版本不符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-012.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import {
  ADD_PATH,
  MEM0_BASE,
  MEM0_KEY,
  Mem0FetchStub,
  SEARCH_PATH,
  drainPoll,
  hit,
  json,
  reject,
  text,
  validMessages,
} from "./support/a2-mem0-fix.js";

describe("UT-PI-012 · add · 持久化/序列化 × 版本不符", () => {
  it("sweeps every add branch and both error paths", async () => {  // sweeps every add branch and both error paths
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const boom = new Error("boom");
    const stub = new Mem0FetchStub()
      .on(
        ADD_PATH,
        reject(boom),
        json({ message: "quota exceeded" }, 429, "Too Many Requests"),
        json({ event_id: "evt-1", status: "PENDING" }),
        json({ status: "DONE" }),
      )
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 4a：user_id 守卫（L210）——先于任何 HTTP 请求被拒
      const emptyUser = await adapter.add(validMessages(), "").then(() => null, (e) => e);
      expect(emptyUser).toBeInstanceOf(Error);
      expect(emptyUser).not.toBeInstanceOf(Mem0ApiError);
      expect(emptyUser.message).toBe("user_id required");
      expect(stub.calls.length).toBe(0);

      // 步骤 4b：messages 守卫（L215）——同样先于任何 HTTP 请求被拒
      const emptyMessages = await adapter.add([], "tester:piko").then(() => null, (e) => e);
      expect(emptyMessages).toBeInstanceOf(Error);
      expect(emptyMessages).not.toBeInstanceOf(Mem0ApiError);
      expect(emptyMessages.message).toBe("messages must be non-empty");
      expect(stub.calls.length).toBe(0);

      // 步骤 4c：网络层 reject（L250）→ Mem0ApiError(0, "network")
      const netErr = await adapter.add(validMessages(), "tester:piko").then(() => null, (e) => e);
      expect(netErr).toBeInstanceOf(Mem0ApiError);
      expect(netErr.name).toBe("Mem0ApiError");
      expect(netErr.status).toBe(0);
      expect(netErr.code).toBe("network");
      expect(netErr.message).toBe("add failed: Error: boom");
      expect(netErr.cause).toBe(boom);

      // 步骤 4d：HTTP 非 2xx（L287）→ Mem0ApiError(status, code, message)
      const httpErr = await adapter.add(validMessages(), "tester:piko").then(() => null, (e) => e);
      expect(httpErr).toBeInstanceOf(Mem0ApiError);
      expect(httpErr.status).toBe(429);
      expect(httpErr.code).toBe("rate_limited");
      expect(httpErr.message).toBe("quota exceeded");

      // 步骤 3：2xx 且带 event_id（L273）→ 轮询抽出的 memory id
      const withEvent = await adapter.add(
        [{ role: "user", content: "the fact" }],
        "tester:piko",
        { tags: ["skill"] },
      );
      expect(withEvent).toEqual({ ids: ["mem-1"] });
      const addCall = stub.addCalls[2]!;
      expect(addCall.url).toBe(`${MEM0_BASE}${ADD_PATH}`);
      expect(addCall.method).toBe("POST");
      expect(addCall.headers.Authorization).toBe(`Token ${MEM0_KEY}`);
      expect(addCall.headers["Content-Type"]).toBe("application/json");
      expect(addCall.body).toEqual({
        messages: [{ role: "user", content: "the fact" }],
        user_id: "tester:piko",
        infer: true,
        categories: ["skill"],
      });

      // 步骤 3：2xx 但无 event_id（L275）→ ids 为空，且不触发轮询
      const withoutEvent = await adapter.add(validMessages("x"), "tester:piko");
      expect(withoutEvent).toEqual({ ids: [] });

      // 步骤 5：无残留——只发出 4 次 add + 1 次轮询 search
      expect(stub.addCalls.length).toBe(4);
      expect(stub.searchCalls.length).toBe(1);
      expect(stub.calls.every((c) => c.url.startsWith(MEM0_BASE))).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
