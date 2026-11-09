/**
 * Case ID: UT-REPO-459  ·  STATUS: real
 *
 * 责任：分支 L575 `JSON.parse(x.task_json)?.discussion`（?.；store.ts）
 * 维度坐标：`discussionRoomsInUse` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-459.md（脚本的唯一依据）
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

describe("UT-REPO-459 · discussionRoomsInUse · 状态分支 × 合法迁移", () => {
  it("keeps a room whose task json parses to an object and drops one whose task json parses to null", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:575 的分支（?.：`JSON.parse(x.task_json)?.discussion`）取真的输入——
      //         JSON.parse 的结果是非 null/undefined 的值，可选链不短路
      accept(store, discussionTask("t-459-a", "!room:alpha"));
      // 取假侧：JSON.parse 的结果是 null（task_json 存的是字面量 "null"），可选链短路
      accept(store, task("t-459-b"));
      store.db.prepare("UPDATE runs SET discussion_intake_state='Open' WHERE task_id='t-459-b'").run();
      store.db.prepare("UPDATE tasks SET task_json=? WHERE task_id='t-459-b'").run("null");

      // 步骤 2：调用 discussionRoomsInUse(…) 并断言该侧可观测结果
      const rooms = store.discussionRoomsInUse();

      // 步骤 3：构造使该分支取假的输入——取假侧的行确实进了源集合
      const inSource = store.db
        .prepare("SELECT r.task_id,t.task_json FROM runs r JOIN tasks t USING(task_id) WHERE r.discussion_intake_state='Open' AND r.state IN('Queued','Running','Cancelling') AND t.identity_state='Active' ORDER BY r.task_id")
        .all() as any[];
      expect(inSource.length).toBe(2);
      expect(JSON.parse(inSource[1].task_json)).toBeNull();

      // 步骤 4：再次调用 discussionRoomsInUse(…) 并断言取假侧结果；两侧都必须被观测到
      expect(rooms).toEqual(["!room:alpha"]);
      expect(rooms).not.toContain(undefined);
    } finally {
      store.close();
    }
  });

});
