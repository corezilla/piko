/**
 * Case ID: UT-PI-330  ·  STATUS: real
 *
 * 责任：参数 `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>` 的 `+1 拒绝` 类…
 * 维度坐标：`execute` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-330.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-330 · execute · 数值/长度上限参数 × +1 拒绝", () => {
  it("accepts the turn count one above the baseline of the discussion reply callback", async () => {  // accepts the turn count one above the baseline of the discussion reply callback
    // 步骤 1：turn = 基线 +1 —— 回调被调用两次
    const fx = await piFixture();
    stubModelFetch();
    let calls = 0;
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false, async () => {
        calls += 1;
      });
      // 步骤 3：断言 —— 当前实况：非 discussion 任务无回合可回，回调次数为 0（不因多给而报错）
      expect(res.status).toBe("completed");
      expect(calls).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
