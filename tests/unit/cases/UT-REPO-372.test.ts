/**
 * Case ID: UT-REPO-372  ·  STATUS: real
 *
 * 责任：参数 `operationId: string` 的 `注入字符` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-372.md（脚本的唯一依据）
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

describe("UT-REPO-372 · recordProviderCall · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injected operation id verbatim without touching the schema", async () => {
    const store = newStore();
    try {
      accept(store, task("t-372"));
      const injected = "op'; DROP TABLE provider_calls;--";

      // 步骤 1：按 `注入字符` 类构造参数 operationId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-372", injected, 500, "req-372", "note", 7);

      // 步骤 3：断言——实现的真实语义：operation_id 是绑定参数，注入串不构成 SQL，
      //         原样落库，provider_calls 表与 runs 表都完好
      const row = store.db.prepare("SELECT operation_id,status FROM provider_calls").get() as any;
      expect(row.operation_id).toBe(injected);
      expect(row.status).toBe(500);
      expect(store.db.prepare("SELECT count(*) n FROM provider_calls").get()).toEqual({ n: 1 });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
