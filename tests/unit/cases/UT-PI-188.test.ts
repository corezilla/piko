/**
 * Case ID: UT-PI-188  ·  STATUS: real
 *
 * 责任：分支 L306 `query || " "`（||；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-188.md（脚本的唯一依据）
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

describe("UT-PI-188 · pollForExtractedMemory · 状态分支 × 合法迁移", () => {
  it("uses a truthy query as is and replaces an empty one with a space", async () => {  // uses a truthy query as is and replaces an empty one with a space
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——query 是非空串，query || " " 取左侧
      // 步骤 2：调用 pollForExtractedMemory 并断言取真侧结果
      const truthy = await adapter.pollForExtractedMemory("tester:piko", "needle");
      expect(truthy).toBe("mem-1");
      expect(stub.searchCalls[0]!.body.query).toBe("needle");

      // 步骤 3：取假侧——query 是空串，query || " " 取右侧
      // 步骤 4：再次调用并断言取假侧结果
      const falsy = await adapter.pollForExtractedMemory("tester:piko", "");
      expect(falsy).toBe("mem-1");
      expect(stub.searchCalls[1]!.body.query).toBe(" ");
      expect(stub.searchCalls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
