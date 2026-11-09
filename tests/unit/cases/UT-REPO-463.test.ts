/**
 * Case ID: UT-REPO-463  ·  STATUS: real
 *
 * 责任：返回站点 L575 值 `JSON.parse(x.task_json)?.discussion?.ro…` 逐值断言（store.ts）
 * 维度坐标：`discussionRoomsInUse` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-463.md（脚本的唯一依据）
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

describe("UT-REPO-463 · discussionRoomsInUse · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the room ids as an ordered array of strings, duplicates included and blank rooms excluded", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:575 的返回站点被到达的输入——三条 intake=Open 的活跃讨论任务，
      //         房间串分别不同 / 不同 / 重复；另加一条房间串为空的任务
      accept(store, discussionTask("t-463-a", "!room:one"));
      accept(store, discussionTask("t-463-b", "!room:two"));
      accept(store, discussionTask("t-463-c", "!room:one"));
      accept(store, discussionTask("t-463-d", ""));

      // 步骤 2：调用 discussionRoomsInUse(…)
      const rooms = store.discussionRoomsInUse();

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms).toEqual(["!room:one", "!room:two", "!room:one"]);
      expect(rooms.every((r: unknown) => typeof r === "string")).toBe(true);
      // 空房间串被末尾的 length>0 过滤掉
      expect(rooms).not.toContain("");
      // 无未声明副作用：只读查询，没有写任何行
      expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(4);
    } finally {
      store.close();
    }
  });

});
