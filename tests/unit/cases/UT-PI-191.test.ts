/**
 * Case ID: UT-PI-191  ·  STATUS: real
 *
 * 责任：分支 L312 `a.created_at ?? ""`（??；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-191.md（脚本的唯一依据）
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

describe("UT-PI-191 · pollForExtractedMemory · 状态分支 × 合法迁移", () => {
  it("treats a missing created_at on the other side of the sort as an empty string", async () => {  // treats a missing created_at on the other side of the sort as an empty string
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    // 步骤 1：构造让排序比较函数的 a 侧拿到缺失 created_at 的命中
    //（V8 的 sort 对两元素数组以 (arr[1], arr[0]) 调用比较函数，a 即 arr[1]）
    const search = vi.spyOn(adapter, "search").mockResolvedValue([
      { id: "B", memory: "", score: 1, metadata: {}, created_at: "2026-01-01T00:00:00Z" },
      { id: "A", memory: "", score: 1, metadata: {}, created_at: undefined as unknown as string },
    ]);
    try {
      // 步骤 2：调用 pollForExtractedMemory
      const result = await adapter.pollForExtractedMemory("tester:piko", "q");

      // 步骤 3：断言——a.created_at ?? "" 走了右侧兜底：缺失时间被当成空串，
      // 于是有时间的命中排在前面，落定值是它的 id
      expect(result).toBe("B");
      expect(search).toHaveBeenCalledTimes(1);
    } finally {
      search.mockRestore();
    }
  });
});
