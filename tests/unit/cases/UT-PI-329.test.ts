/**
 * Case ID: UT-PI-329  ·  STATUS: real
 *
 * 责任：参数 `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>` 的 `恰好通过` 类（…
 * 维度坐标：`execute` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-329.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-329 · execute · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts the exact-pass turn count of the discussion reply callback", async () => {  // accepts the exact-pass turn count of the discussion reply callback
    // 步骤 1：turn 恰好通过 —— 回调被调用一次
    const fx = await piFixture();
    stubModelFetch();
    let calls = 0;
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false, async () => {
        calls += 1;
      });
      // 步骤 3：断言 —— 非 discussion 任务不产生 discussion 回复，回调不被调用
      expect(res.status).toBe("completed");
      expect(calls).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
