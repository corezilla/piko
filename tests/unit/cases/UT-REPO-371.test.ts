/**
 * Case ID: UT-REPO-371  ·  STATUS: real
 *
 * 责任：参数 `operationId: string` 的 `超长` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-371.md（脚本的唯一依据）
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

describe("UT-REPO-371 · recordProviderCall · 字符串/路径/枚举输入 × 超长", () => {
  it("stores an over-long operation id verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-371"));
      const longOp = "O".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 operationId——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-371", longOp, 200, "req-1", "note", 12);

      // 步骤 3：断言——实现无长度校验：超长 operationId 不被拒绝，原样落库，长度逐值对账
      const row = store.db.prepare("SELECT length(operation_id) lo, status, latency_ms FROM provider_calls").get() as any;
      expect(row.lo).toBe(8192);
      expect(row.status).toBe(200);
      expect(row.latency_ms).toBe(12);
      expect((store.db.prepare("SELECT count(*) n FROM provider_calls").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
