/**
 * Case ID: UT-PI-320  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `每等价类合法值` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-320.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-320 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the legal equivalent classes of the task parameter and completes each of them", async () => {  // accepts the legal equivalent classes of the task parameter and completes each of them
    // 步骤 1：每个等价类一个代表值
    const tasks = [
      piTask("task-1"),
      piTask("task-2", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
      piTask("task-3", { std_templates: { scheme: "tests.unit-test-scheme" } }),
    ];

    // 步骤 2：逐个执行
    for (const task of tasks) {
      const fx = await piFixture();
      stubModelFetch();
      try {
        const res = await fx.runtime.execute(`run-${task.task_id}`, 1, task, fx.root, () => false);
        // 步骤 3：断言 —— 每个等价类都被接受并跑完
        expect(res.status).toBe("completed");
        expect(res.summary).toBe("done");
      } finally {
        vi.unstubAllGlobals();
        await fx.close();
      }
    }
  });
});
