/**
 * Case ID: UT-REPO-368  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-368.md（脚本的唯一依据）
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

describe("UT-REPO-368 · recordProviderCall · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-length task id verbatim on a known task", async () => {
    const store = newStore();
    try {
      const longId = "t".repeat(8192);
      accept(store, task(longId));

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×4096 的字符串
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall(longId, "op-368", 200, "req-368", "note", 12);

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 task_id 原样落库，
      //         provider_calls 行完整
      const row = store.db.prepare(
        "SELECT length(task_id) len,operation_id,status,request_id,note,latency_ms FROM provider_calls",
      ).get() as any;
      expect(row.len).toBe(8192);
      expect(row.operation_id).toBe("op-368");
      expect(row.status).toBe(200);
      expect(row.request_id).toBe("req-368");
      expect(row.note).toBe("note");
      expect(row.latency_ms).toBe(12);
    } finally {
      store.close();
    }
  });

});
