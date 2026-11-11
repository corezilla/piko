/**
 * Case ID: UT-PI-163  ·  STATUS: real
 *
 * 责任：throw L250 `reject`（守卫 `catch`；mem0-client.ts）
 * 维度坐标：`add` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-163.md（脚本的唯一依据）
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

describe("UT-PI-163 · add · 错误路径 × 每个 typed 错误码", () => {
  it("wraps a network failure into Mem0ApiError zero network", async () => {  // wraps a network failure into Mem0ApiError zero network
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const boom = new Error("getaddrinfo ENOTFOUND mem0.test");
    const stub = new Mem0FetchStub().on(ADD_PATH, reject(boom));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：构造触发 throw 的输入——fetch 直接 reject
      // 步骤 2：调用 add 并断言——错误被抛出；语义码是 network（ISD §5：网络错误 → network，status=0）
      const err = await adapter.add(validMessages(), "tester:piko").then(() => null, (e) => e);
      expect(err).toBeInstanceOf(Mem0ApiError);
      expect(err.name).toBe("Mem0ApiError");
      expect(err.status).toBe(0);
      expect(err.code).toBe("network");

      // 步骤 3：断言消息可判别（带 add failed 前缀与底层错误全文），且无部分写入
      expect(err.message).toBe("add failed: Error: getaddrinfo ENOTFOUND mem0.test");
      expect(err.message).toContain("add failed");
      expect(stub.addCalls.length).toBe(1);
      expect(stub.searchCalls.length).toBe(0);

      // 步骤 4：断言保真传播——cause 就是底层那个错，且轮询从未被触发
      expect(err.cause).toBe(boom);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
