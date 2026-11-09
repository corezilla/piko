/**
 * Case ID: UT-REPO-387  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `超长` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-387.md（脚本的唯一依据）
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

describe("UT-REPO-387 · recordMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {
  it("stores an over-long room id verbatim without rejecting it", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造参数 room——源码里没有长度比较常量，取上限 4096 的 2 倍
      const longRoom = "!room:" + "r".repeat(8192);

      // 步骤 2：调用 recordMatrixEvent(…)
      const inserted = store.recordMatrixEvent(longRoom, "$evt-long", "@alice", "$txn-long");

      // 步骤 3：断言——实现的真实语义：store.ts:524 没有长度校验，
      //         超长串原样落库并返回 true（不抛 typed 错误）
      expect(inserted).toBe(true);
      const row = store.db.prepare("SELECT room_id,event_id FROM matrix_events WHERE event_id='$evt-long'").get() as any;
      expect(row.room_id).toBe(longRoom);
      expect(row.room_id.length).toBe(8192 + 6);
      expect(store.hasMatrixEvent(longRoom, "$evt-long")).toBe(true);
    } finally {
      store.close();
    }
  });

});
