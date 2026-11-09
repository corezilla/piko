/**
 * Case ID: UT-REPO-092  ·  STATUS: real
 *
 * 责任：返回站点 L221 值 `{ kind: "created", task_id: task.task_i…` 逐值断言（store.ts）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-092.md（脚本的唯一依据）
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

describe("UT-REPO-092 · createOrGet · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the created outcome with generation 1 and state Queued", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条全新的合法 task
      // 步骤 2：调用 createOrGet(...)
      const outcome = store.createOrGet(task("co-092"), "slinky", 10);

      // 步骤 3：断言逐值对账——created 站点固定 generation=1、state="Queued"
      expect(outcome).toEqual({ kind: "created", task_id: "co-092", generation: 1, state: "Queued" });
      expect(store.getRun("co-092").generation).toBe(1);
      expect(store.getRun("co-092").state).toBe("Queued");
    } finally {
      store.close();
    }
  });

});
