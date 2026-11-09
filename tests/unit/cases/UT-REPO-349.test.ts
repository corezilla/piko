/**
 * Case ID: UT-REPO-349  ·  STATUS: real
 *
 * 责任：返回站点 L495 值 `this.db.prepare("SELECT * FROM discussi…` 逐值断言（store.ts）
 * 维度坐标：`pendingTurns` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-349.md（脚本的唯一依据）
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

describe("UT-REPO-349 · pendingTurns · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the pending turns of a task ordered by turn_seq", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条带 discussion 的任务，触发 turn 为 Pending；再补一条已 Consumed 的 turn
      store.createOrGet(discussionTask("pt-349", "!room:349", "$evt349"), "slinky", 10, "first");
      store.db
        .prepare("INSERT INTO discussion_turns VALUES('pt-349','$evt350',2,'Pending','second',NULL,NULL)")
        .run();
      store.db
        .prepare("INSERT INTO discussion_turns VALUES('pt-349','$evt351',3,'Consumed','third',NULL,NULL)")
        .run();

      // 步骤 2：调用 pendingTurns("pt-349")
      const turns = store.pendingTurns("pt-349");

      // 步骤 3：断言逐值对账——只返回 Pending/QueuedInPi 的 turn，且按 turn_seq 升序
      expect(turns).toHaveLength(2);
      expect(turns.map((t: any) => t.turn_seq)).toEqual([1, 2]);
      expect(turns.map((t: any) => t.event_id)).toEqual(["$evt349", "$evt350"]);
      expect(turns.map((t: any) => t.status)).toEqual(["Pending", "Pending"]);
      expect(turns[0].visible_content).toBe("first");
    } finally {
      store.close();
    }
  });

});
