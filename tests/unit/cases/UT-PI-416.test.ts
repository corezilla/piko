/**
 * Case ID: UT-PI-416  ·  STATUS: real
 *
 * 责任：分支 L289 `if (prior)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-416.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-416 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the prior result check when the initial operation already completed", async () => {  // takes the true side of the prior result check when the initial operation already completed
    // 步骤 1：同一 task id 连跑两次 ⇒ 第二次 prior 有结果
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      const first = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      expect(first.status).toBe("completed");
      const callsAfterFirst = stub.calls.length;

      // 步骤 2：再次执行
      const second = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：复用既有结果，不重新发模型请求
      expect(second.status).toBe("completed");
      expect(stub.calls.length).toBe(callsAfterFirst);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
