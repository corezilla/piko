/**
 * Case ID: UT-PI-321  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-321.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-321 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the task parameter", async () => {  // accepts the boundary values of the task parameter
    // 步骤 1：边界 —— 空 instruction、空路径数组、空 task_id
    const tasks = [
      piTask("task-1", { instruction: "" }),
      piTask("task-1", { permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" }, output_paths: [] }),
      piTask(""),
    ];

    // 步骤 2：逐个执行
    for (const task of tasks) {
      const fx = await piFixture();
      stubModelFetch();
      try {
        const res = await fx.runtime.execute("run-1", 1, task, fx.root, () => false);
        // 步骤 3：断言 —— 边界值不被拒绝
        expect(res.status).toBe("completed");
      } finally {
        vi.unstubAllGlobals();
        await fx.close();
      }
    }
  });
});
