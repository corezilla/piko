/**
 * Case ID: UT-PI-160  ·  STATUS: real
 *
 * 责任：分支 L284 `catch ()`（catch；mem0-client.ts）
 * 维度坐标：`add` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-160.md（脚本的唯一依据）
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

describe("UT-PI-160 · add · 错误路径 × 每个 typed 错误码", () => {
  it("swallows a malformed error body and parses a well-formed one", async () => {  // swallows a malformed error body and parses a well-formed one
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(
        ADD_PATH,
        text("<html>500 Internal Server Error</html>", 500, "Internal Server Error"),
        json({ message: "backend exploded" }, 503, "Service Unavailable"),
      );
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——错误响应体不是 JSON，response.json() 抛
      // 步骤 2：调用 add 并断言取真侧结果——catch 吞掉解析错，errMessage 保持 statusText
      const malformed = await adapter.add(validMessages(), "tester:piko").then(
        () => null,
        (e) => e,
      );
      expect(malformed).toBeInstanceOf(Mem0ApiError);
      expect(malformed.status).toBe(500);
      expect(malformed.code).toBe("server_error");
      expect(malformed.message).toBe("Internal Server Error");

      // 步骤 3：取假侧——错误响应体是合法 JSON，解析成功
      // 步骤 4：再次调用 add 并断言取假侧结果——catch 被跳过，errMessage 来自 message
      const wellFormed = await adapter.add(validMessages(), "tester:piko").then(
        () => null,
        (e) => e,
      );
      expect(wellFormed).toBeInstanceOf(Mem0ApiError);
      expect(wellFormed.status).toBe(503);
      expect(wellFormed.code).toBe("server_error");
      expect(wellFormed.message).toBe("backend exploded");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
