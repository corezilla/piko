/**
 * Case ID: UT-REPO-386  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-386.md（脚本的唯一依据）
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

describe("UT-REPO-386 · recordMatrixEvent · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty room id and stores it verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 room——''（空串）；其余参数取合法等价类
      accept(store, task("t-386"));

      // 步骤 2：调用 recordMatrixEvent(…)
      const inserted = store.recordMatrixEvent("", "$evt-386", "sender-1");

      // 步骤 3：断言——实现的真实语义：recordMatrixEvent 对 room 无校验，空串原样落库并返回 true
      expect(inserted).toBe(true);
      const row = store.db.prepare("SELECT room_id,event_id FROM matrix_events").get() as any;
      expect(row.room_id).toBe("");
      expect(row.event_id).toBe("$evt-386");
    } finally {
      store.close();
    }
  });

});
