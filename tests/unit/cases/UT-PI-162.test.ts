/**
 * Case ID: UT-PI-162  ·  STATUS: real
 *
 * 责任：throw L215 `messages must be non-empty`（守卫 `if (!Array.isArray(messages) || message…`；mem…
 * 维度坐标：`add` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-162.md（脚本的唯一依据）
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

describe("UT-PI-162 · add · 错误路径 × 每个 typed 错误码", () => {
  it("throws a plain messages must be non-empty error without touching the network", async () => {  // throws a plain messages must be non-empty error without touching the network
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub();
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：构造触发 throw 的输入——messages 是空数组
      // 步骤 2：调用 add 并断言——错误被抛出，message 逐值等于 messages must be non-empty
      const err = await adapter.add([], "tester:piko").then(() => null, (e) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("messages must be non-empty");
      expect(err.name).toBe("Error");

      // 步骤 3：断言无部分写入——fetch 一次都没被调
      expect(stub.calls.length).toBe(0);

      // 步骤 4：断言内部错误不上抛为客户端码
      expect(err).not.toBeInstanceOf(Mem0ApiError);
      expect((err as Mem0ApiError).status).toBeUndefined();
      expect((err as Mem0ApiError).code).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
