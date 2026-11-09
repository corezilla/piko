/**
 * Case ID: UT-REPO-388  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `注入字符` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-388.md（脚本的唯一依据）
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

describe("UT-REPO-388 · recordMatrixEvent · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injected room id verbatim and still dedups on it", async () => {
    const store = newStore();
    try {
      const room = "!r'; DROP TABLE matrix_events;--";

      // 步骤 1：按 `注入字符` 类构造参数 room——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 recordMatrixEvent(…)
      const first = store.recordMatrixEvent(room, "$e-388", "@alice:localhost", "txn-388");
      const second = store.recordMatrixEvent(room, "$e-388", "@alice:localhost", "txn-388");

      // 步骤 3：断言——实现的真实语义：room 是绑定参数，注入串不构成 SQL，
      //         原样落库；同一 (room,event) 第二次被 INSERT OR IGNORE 吞掉，返回 false
      expect(first).toBe(true);
      expect(second).toBe(false);
      const rows = store.db.prepare("SELECT room_id,event_id,sender,txn_id FROM matrix_events").all() as any[];
      expect(rows).toEqual([
        { room_id: room, event_id: "$e-388", sender: "@alice:localhost", txn_id: "txn-388" },
      ]);
      expect(store.hasMatrixEvent(room, "$e-388")).toBe(true);
    } finally {
      store.close();
    }
  });

});
