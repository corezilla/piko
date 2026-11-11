/**
 * Case ID: UT-PI-190  ·  STATUS: real
 *
 * 责任：分支 L312 `b.created_at ?? ""`（??；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-190.md（脚本的唯一依据）
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

describe("UT-PI-190 · pollForExtractedMemory · 状态分支 × 合法迁移", () => {
  it("treats a missing created_at as an empty string when sorting", async () => {  // treats a missing created_at as an empty string when sorting
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    // 步骤 1：构造让排序比较函数的 b 侧拿到缺失 created_at 的命中
    //（V8 的 sort 对两元素数组以 (arr[1], arr[0]) 调用比较函数，b 即 arr[0]）
    const search = vi.spyOn(adapter, "search").mockResolvedValue([
      { id: "A", memory: "", score: 1, metadata: {}, created_at: undefined as unknown as string },
      { id: "B", memory: "", score: 1, metadata: {}, created_at: "2026-01-01T00:00:00Z" },
    ]);
    try {
      // 步骤 2：调用 pollForExtractedMemory
      const result = await adapter.pollForExtractedMemory("tester:piko", "q");

      // 步骤 3：断言——b.created_at ?? "" 走了右侧兜底：没有 TypeError，
      // 缺失时间的命中被当成空串排到后面，落定值是另一条命中的 id
      expect(result).toBe("B");
      expect(search).toHaveBeenCalledTimes(1);
    } finally {
      search.mockRestore();
    }
  });
});
