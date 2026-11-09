/**
 * Case ID: UT-REPO-460  ·  STATUS: real
 *
 * 责任：分支 L576 `catch ()`（catch；store.ts）
 * 维度坐标：`discussionRoomsInUse` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-460.md（脚本的唯一依据）
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

describe("UT-REPO-460 · discussionRoomsInUse · 错误路径 × 每个 typed 错误码", () => {

  it("drops a room whose task json cannot be parsed instead of failing the scan", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "good-460", "!room:good");
      acceptDiscussion(store, "broken-460", "!room:broken");
      // 让 broken 那一行的 task_json 变成非法 JSON，触发 store.ts:576 的 catch
      store.db.prepare("UPDATE tasks SET task_json='{not-json' WHERE task_id='broken-460'").run();

      // 步骤 1：构造使 store.ts:576 的分支（catch）取真的输入
      // 步骤 2：调用 discussionRoomsInUse(…) 并断言该侧可观测结果
      const rooms = store.discussionRoomsInUse();

      // 步骤 3：构造使该分支取假的输入——所有 task_json 都可解析
      // 步骤 4：再次调用 discussionRoomsInUse(…) 并断言取假侧结果（两侧都被观测到）
      store.db.prepare("UPDATE tasks SET task_json=? WHERE task_id='broken-460'").run(
        JSON.stringify({ task_id: "broken-460", discussion: { room_id: "!room:repaired", trigger_event_id: "$e" } }),
      );
      const repaired = store.discussionRoomsInUse();

      // 断言：catch 侧把坏行折成 undefined 再被过滤掉；取假侧正常返回两个房间
      expect(rooms).toEqual(["!room:good"]);
      expect(repaired.sort()).toEqual(["!room:good", "!room:repaired"]);
    } finally {
      store.close();
    }
  });

});
