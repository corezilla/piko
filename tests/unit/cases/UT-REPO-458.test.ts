/**
 * Case ID: UT-REPO-458  ·  STATUS: real
 *
 * 责任：分支 L575 `JSON.parse(x.task_json)?.discussion?.room_id`（?.；store.ts）
 * 维度坐标：`discussionRoomsInUse` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-458.md（脚本的唯一依据）
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

describe("UT-REPO-458 · discussionRoomsInUse · 状态分支 × 合法迁移", () => {
  it("keeps a room whose discussion block carries a room_id and drops one whose discussion block is absent", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:575 的分支（?.：`...?.discussion?.room_id`）取真的输入——
      //         discussion 是有效对象，room_id 有值
      accept(store, discussionTask("t-458-a", "!room:alpha"));
      // 取假侧：discussion 缺失（`?.` 短路取 undefined）
      accept(store, task("t-458-b"));
      store.db.prepare("UPDATE runs SET discussion_intake_state='Open' WHERE task_id='t-458-b'").run();
      store.db.prepare("UPDATE tasks SET task_json=? WHERE task_id='t-458-b'").run(JSON.stringify({ task_id: "t-458-b" }));

      // 步骤 2：调用 discussionRoomsInUse(…) 并断言该侧可观测结果
      const rooms = store.discussionRoomsInUse();

      // 步骤 3：构造使该分支取假的输入——同一时刻取假侧的行确实在源集合里（只是被 `?.` 过滤掉）
      const inSource = store.db
        .prepare("SELECT r.task_id FROM runs r JOIN tasks t USING(task_id) WHERE r.discussion_intake_state='Open' AND r.state IN('Queued','Running','Cancelling') AND t.identity_state='Active' ORDER BY r.task_id")
        .all() as any[];
      expect(inSource.map((x: any) => x.task_id)).toEqual(["t-458-a", "t-458-b"]);

      // 步骤 4：再次调用 discussionRoomsInUse(…) 并断言取假侧结果；两侧都必须被观测到
      expect(rooms).toEqual(["!room:alpha"]);
      expect(rooms).not.toContain(undefined);
      expect(rooms.every((r: string) => typeof r === "string" && r.length > 0)).toBe(true);
    } finally {
      store.close();
    }
  });

});
