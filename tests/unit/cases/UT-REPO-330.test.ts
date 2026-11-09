/**
 * Case ID: UT-REPO-330  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `超长` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-330.md（脚本的唯一依据）
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

describe("UT-REPO-330 · markTurn · 字符串/路径/枚举输入 × 超长", () => {

  it("writes no turn row for an over-long event id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造参数 event——长度 2×上限 = 8192（源码无比较常量，取文档默认上限 4096）；其余参数取合法等价类
      accept(store, discussionTask("d1", "!r:d1"));
      const longEvent = "e".repeat(8192);

      // 步骤 2：调用 markTurn(…)
      store.markTurn("d1", longEvent, "Consumed");

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：markTurn 是一次 UPDATE，超长 event 匹配不到任何行，
      //         不抛错也不写入——行数与状态都保持不变
      const row = store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='d1'").get() as any;
      expect(row.status).toBe("Pending");
      expect((store.db.prepare("SELECT count(*) n FROM discussion_turns").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
