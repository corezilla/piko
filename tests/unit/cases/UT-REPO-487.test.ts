/**
 * Case ID: UT-REPO-487  ·  STATUS: real
 *
 * 责任：参数 `payloadSha: string` 的 `空` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-487.md（脚本的唯一依据）
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

describe("UT-REPO-487 · prepareMatrixSend · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty payloadSha on a fresh transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 payloadSha——''（空串）、null（显式空值）三态中的前两态；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 1, "");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——payloadSha 无校验，空串原样入库（新事务不触发 payload 冲突分支）
            expect(out).toEqual({ state: "Pending" });
            expect(row.payload_sha256).toBe("");
    } finally {
      store.close();
    }
  });

});
