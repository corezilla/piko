/**
 * Case ID: UT-PI-159  ·  STATUS: real
 *
 * 责任：分支 L283 `if (errBody.message)`（if；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-159.md（脚本的唯一依据）
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

describe("UT-PI-159 · add · 状态分支 × 合法迁移", () => {
  it("uses the error body message when present and keeps statusText otherwise", async () => {  // uses the error body message when present and keeps statusText otherwise
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(
        ADD_PATH,
        json({ message: "API key is invalid" }, 401, "Unauthorized"),
        json({ detail: "no message field" }, 403, "Forbidden"),
      );
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——errBody.message 非空字符串
      // 步骤 2：调用 add 并断言取真侧结果——块内 errMessage = errBody.message
      const withMessage = await adapter.add(validMessages(), "tester:piko").then(
        () => null,
        (e) => e,
      );
      expect(withMessage).toBeInstanceOf(Mem0ApiError);
      expect(withMessage.status).toBe(401);
      expect(withMessage.code).toBe("auth_invalid");
      expect(withMessage.message).toBe("API key is invalid");

      // 步骤 3：取假侧——errBody.message 为 undefined
      // 步骤 4：再次调用 add 并断言取假侧结果——块被跳过，errMessage 保持 statusText
      const withoutMessage = await adapter.add(validMessages(), "tester:piko").then(
        () => null,
        (e) => e,
      );
      expect(withoutMessage).toBeInstanceOf(Mem0ApiError);
      expect(withoutMessage.status).toBe(403);
      expect(withoutMessage.code).toBe("auth_forbidden");
      expect(withoutMessage.message).toBe("Forbidden");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
