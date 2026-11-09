/**
 * Case ID: UT-REPO-067  ·  STATUS: real
 *
 * 责任：参数 `capacity: number` 的 `恰好通过` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-067.md（脚本的唯一依据）
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

describe("UT-REPO-067 · createOrGet · 数值/长度上限参数 × 恰好通过", () => {

  it("admits a task when the queue is exactly one below capacity", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 capacity 的恰好通过类——队列深度 q ＝ capacity−1（守卫是 q >= capacity 拒绝）
      store.createOrGet(task("co-067-q1"), "slinky", 10);

      // 步骤 2：调用 createOrGet(..., capacity=2)
      const outcome = store.createOrGet(task("co-067-q2"), "slinky", 2);

      // 步骤 3：断言逐值对账——q=1 < capacity=2，恰好通过
      expect(outcome).toEqual({ kind: "created", task_id: "co-067-q2", generation: 1, state: "Queued" });
      expect(store.db.prepare("SELECT count(*) n FROM runs WHERE state='Queued'").get()).toEqual({ n: 2 });
    } finally {
      store.close();
    }
  });

});
