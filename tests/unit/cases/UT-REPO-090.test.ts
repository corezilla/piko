/**
 * Case ID: UT-REPO-090  ·  STATUS: real
 *
 * 责任：返回站点 L190 值 `{ kind: "existing", task_id: task.task_…` 逐值断言（store.ts）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-090.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-090 · createOrGet · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the existing outcome with the current generation and state", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理的 task
      store.createOrGet(task("co-090"), "slinky", 10);

      // 步骤 2：调用 createOrGet(同 task)
      const outcome = store.createOrGet(task("co-090"), "slinky", 10);

      // 步骤 3：断言逐值对账——existing 站点带 task_id／generation／state，取自当前 run 行
      expect(outcome).toEqual({ kind: "existing", task_id: "co-090", generation: 1, state: "Queued" });
      expect(outcome.generation).toBe(store.getRun("co-090").generation);
      expect(outcome.state).toBe(store.getRun("co-090").state);
    } finally {
      store.close();
    }
  });

});
