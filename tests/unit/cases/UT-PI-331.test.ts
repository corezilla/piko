/**
 * Case ID: UT-PI-331  ·  STATUS: real
 *
 * 责任：参数 `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>` 的 `−1 通过` 类…
 * 维度坐标：`execute` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-331.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-331 · execute · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative turn count of the discussion reply callback without rejecting it", async () => {  // accepts a negative turn count of the discussion reply callback without rejecting it
    // 步骤 1：turn = -1（回调收到负数序号）
    const fx = await piFixture();
    stubModelFetch();
    const seen: number[] = [];
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false, async (_e, turn) => {
        seen.push(turn);
      });
      // 步骤 3：断言 —— 当前实况：非 discussion 任务下回调不被调用，负数序号不出现
      expect(res.status).toBe("completed");
      expect(seen).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
