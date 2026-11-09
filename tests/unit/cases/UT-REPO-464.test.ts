/**
 * Case ID: UT-REPO-464  ·  STATUS: real
 *
 * 责任：返回站点 L577 值 `undefined` 逐值断言（store.ts）
 * 维度坐标：`discussionRoomsInUse` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-464.md（脚本的唯一依据）
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

describe("UT-REPO-464 · discussionRoomsInUse · 纯函数/无副作用 × 每等价类合法值", () => {

  it("filters out the undefined room a task without a discussion carries", async () => {
    const store = newStore();
    try {
      accept(store, task("plain-464"));
      // 让这条没有 discussion 的任务进入 discussionRoomsInUse 的候选集
      store.db.prepare("UPDATE runs SET discussion_intake_state='Open' WHERE task_id='plain-464'").run();
      acceptDiscussion(store, "disc-464", "!room:disc");

      // 步骤 1：构造使 store.ts:577 的返回站点被到达的输入——task_json 可解析但没有 discussion
      // 步骤 2：调用 discussionRoomsInUse(…)
      const rooms = store.discussionRoomsInUse();

      // 步骤 3：断言返回值逐值对账——map 回调返回 undefined 的那一项被最后的过滤器剔除，
      //         返回值里没有 undefined、没有 null、只有真实房间号
      expect(rooms).toEqual(["!room:disc"]);
      expect(rooms.every((r) => typeof r === "string" && r.length > 0)).toBe(true);
    } finally {
      store.close();
    }
  });

});
