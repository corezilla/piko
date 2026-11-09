/**
 * Case ID: UT-REPO-488  ·  STATUS: real
 *
 * 责任：参数 `payloadSha: string` 的 `超长` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-488.md（脚本的唯一依据）
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

describe("UT-REPO-488 · prepareMatrixSend · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long payloadSha", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 payloadSha——长度 2×上限 = 8192；其余参数取合法等价类
      accept(store, task("t1"));
      const longSha = "a".repeat(8192);
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 1, longSha);
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——payloadSha 不做长度校验，超长串原样入库
            expect(out).toEqual({ state: "Pending" });
            expect(row.payload_sha256).toBe(longSha);
            expect(row.payload_sha256.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
