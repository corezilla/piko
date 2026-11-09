/**
 * Case ID: UT-REPO-462  ·  STATUS: real
 *
 * 责任：返回站点 L568 值 `(this.db .prepare( "SELECT t.task_json …` 逐值断言（store.ts）
 * 维度坐标：`discussionRoomsInUse` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-462.md（脚本的唯一依据）
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

describe("UT-REPO-462 · discussionRoomsInUse · 纯函数/无副作用 × 每等价类合法值", () => {

  it("lists only the rooms of open, non-terminal, actively-identified discussion tasks", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:568 的返回站点被到达的输入——三种等价类的任务
      acceptDiscussion(store, "d-open", "!room:open");
      acceptDiscussion(store, "d-closed", "!room:closed");
      accept(store, task("plain"));

      // 步骤 2：调用 discussionRoomsInUse(…)
      const rooms = store.discussionRoomsInUse();

      // 步骤 3：断言返回值逐值对账——intake=Open 且非终态的讨论任务都贡献房间
      expect(rooms.sort()).toEqual(["!room:closed", "!room:open"]);
      expect(Array.isArray(rooms)).toBe(true);

      // 非讨论任务不贡献房间；intake 已 Closed 的任务不再占用房间
      store.db.prepare("UPDATE runs SET discussion_intake_state='Closed' WHERE task_id='d-closed'").run();
      expect(store.discussionRoomsInUse()).toEqual(["!room:open"]);
      store.cancel("d-open");
      expect(store.discussionRoomsInUse()).toEqual([]);
    } finally {
      store.close();
    }
  });

});
