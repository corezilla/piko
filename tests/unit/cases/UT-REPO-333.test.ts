/**
 * Case ID: UT-REPO-333  ·  STATUS: real
 *
 * 责任：参数 `status: "QueuedInPi" | "Consumed" | "Abandoned"` 的 `边界(上/下/零/空/满)` 类（store.ts:489）
 * 维度坐标：`markTurn` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-333.md（脚本的唯一依据）
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

describe("UT-REPO-333 · markTurn · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("advances the turn to each of the three legal statuses", async () => {
    const store = newStore();
    try {
      accept(store, task("t-333a"));
      accept(store, task("t-333b"));
      accept(store, task("t-333c"));
      store.db.prepare("INSERT INTO discussion_turns VALUES('t-333a','$e1',1,'Pending','v',NULL,NULL)").run();
      store.db.prepare("INSERT INTO discussion_turns VALUES('t-333b','$e1',1,'Pending','v',NULL,NULL)").run();
      store.db.prepare("INSERT INTO discussion_turns VALUES('t-333c','$e1',1,'Pending','v',NULL,NULL)").run();

      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 status——三个合法枚举值各一个代表值
      // 步骤 2：调用 markTurn(…)
      store.markTurn("t-333a", "$e1", "QueuedInPi");
      store.markTurn("t-333b", "$e1", "Consumed");
      store.markTurn("t-333c", "$e1", "Abandoned");

      // 步骤 3：断言逐值对账——三个枚举值都被落库，Pending 之后的推进合法
      const rows = store.db.prepare(
        "SELECT task_id,status FROM discussion_turns ORDER BY task_id",
      ).all() as any[];
      expect(rows).toEqual([
        { task_id: "t-333a", status: "QueuedInPi" },
        { task_id: "t-333b", status: "Consumed" },
        { task_id: "t-333c", status: "Abandoned" },
      ]);
      // 越界的枚举值被表 CHECK 拒绝
      let err: any = null;
      try {
        store.markTurn("t-333a", "$e1", "Bogus" as never);
      } catch (e) {
        err = e;
      }
      expect(err?.message).toMatch(/CHECK constraint failed: status/);
    } finally {
      store.close();
    }
  });

});
