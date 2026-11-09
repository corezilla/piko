/**
 * Case ID: UT-REPO-336  ·  STATUS: real
 *
 * 责任：参数 `entry: string` 的 `超长` 类（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-336.md（脚本的唯一依据）
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

describe("UT-REPO-336 · markTurn · 字符串/路径/枚举输入 × 超长", () => {
  it("stores an over-long entry id verbatim", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-336", "!room:336");
      const longEntry = "E".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 entry——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 markTurn(…)
      const returned = store.markTurn("t-336", "$e1", "Consumed", longEntry);

      // 步骤 3：断言——实现无长度校验：超长 entry 不被拒绝，原样落库，长度逐值对账
      expect(returned).toBeUndefined();
      const row = store.db.prepare("SELECT length(pi_entry_id) le, status FROM discussion_turns").get() as any;
      expect(row.le).toBe(8192);
      expect(row.status).toBe("Consumed");
      expect((store.db.prepare("SELECT count(*) n FROM discussion_turns").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
