/**
 * Case ID: UT-REPO-390  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `超长` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-390.md（脚本的唯一依据）
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

describe("UT-REPO-390 · recordMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {

  it("accepts an over-long event id without a length cap", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 event——长度 2×4096＝8192；其余参数取合法等价类
      accept(store, task("t-390"));
      const longEvent = "$".repeat(8192);

      // 步骤 2：调用 recordMatrixEvent(…)
      const inserted = store.recordMatrixEvent("!room:390", longEvent, "sender-1");

      // 步骤 3：断言——实现的真实语义：recordMatrixEvent 对 event 无长度上限，超长串原样落库
      expect(inserted).toBe(true);
      const row = store.db.prepare("SELECT event_id FROM matrix_events").get() as any;
      expect(row.event_id).toBe(longEvent);
      expect(row.event_id.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
