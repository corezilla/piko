/**
 * Case ID: UT-REPO-393  ·  STATUS: real
 *
 * 责任：参数 `sender: string` 的 `超长` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-393.md（脚本的唯一依据）
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

describe("UT-REPO-393 · recordMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-long sender verbatim without rejecting it", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造参数 sender——长度 2×上限 = 8192（源码无比较常量，取文档默认上限 4096）；其余参数取合法等价类
      const longSender = "s".repeat(8192);

      // 步骤 2：调用 recordMatrixEvent(…)
      const recorded = store.recordMatrixEvent("!r", "$e1", longSender, "tx1");

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：recordMatrixEvent 对 sender 不做长度校验，超长串原样入库（未被拒绝）
      expect(recorded).toBe(true);
      const row = store.db.prepare("SELECT length(sender) l, sender FROM matrix_events").get() as any;
      expect(row.l).toBe(8192);
      expect(row.sender).toBe(longSender);
    } finally {
      store.close();
    }
  });

});
