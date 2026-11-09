/**
 * Case ID: UT-REPO-068  ·  STATUS: real
 *
 * 责任：参数 `capacity: number` 的 `+1 拒绝` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-068.md（脚本的唯一依据）
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

describe("UT-REPO-068 · createOrGet · 数值/长度上限参数 × +1 拒绝", () => {

  it("refuses with queue_full when capacity is one below the queue depth", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 capacity 的 +1 拒绝类——队列深度 q ＝ capacity（守卫 q >= capacity 命中）
      store.createOrGet(task("co-068-q1"), "slinky", 10);
      store.createOrGet(task("co-068-q2"), "slinky", 10);

      // 步骤 2：调用 createOrGet(..., capacity=2)
      const outcome = store.createOrGet(task("co-068-q3"), "slinky", 2);

      // 步骤 3：断言被拒绝——实现用判别结果 {kind:"queue_full"} 表达拒绝而非抛异常，
      // 且拒绝路径不写任何行
      expect(outcome).toEqual({ kind: "queue_full" });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 2 });
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 2 });
    } finally {
      store.close();
    }
  });

});
