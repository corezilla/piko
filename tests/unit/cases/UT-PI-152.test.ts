/**
 * Case ID: UT-PI-152  ·  STATUS: real
 *
 * 责任：分支 L249 `catch (err)`（catch；mem0-client.ts）
 * 维度坐标：`add` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-152.md（脚本的唯一依据）
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

describe("UT-PI-152 · add · 错误路径 × 每个 typed 错误码", () => {
  it("turns a rejected fetch into a Mem0ApiError and skips the catch otherwise", async () => {  // turns a rejected fetch into a Mem0ApiError and skips the catch otherwise
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const boom = new TypeError("fetch is not a function");
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, reject(boom), json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——fetch reject，catch (err) 命中
      // 步骤 2：调用 add 并断言取真侧结果——网络层错误被 typed 化，cause 保真
      const netErr = await adapter.add(validMessages(), "tester:piko").then(() => null, (e) => e);
      expect(netErr).toBeInstanceOf(Mem0ApiError);
      expect(netErr.status).toBe(0);
      expect(netErr.code).toBe("network");
      expect(netErr.message).toBe("add failed: TypeError: fetch is not a function");
      expect(netErr.cause).toBe(boom);

      // 步骤 3：取假侧——fetch 正常 resolve，catch 块被跳过
      // 步骤 4：再次调用 add 并断言取假侧结果——走 2xx 成功路径
      const ok = await adapter.add(validMessages(), "tester:piko");
      expect(ok).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
