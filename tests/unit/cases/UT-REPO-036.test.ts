/**
 * Case ID: UT-REPO-036  ·  STATUS: real
 *
 * 责任：被测符号 `recordProviderCall`（REPO）在对象类型 `持久化/序列化` 下的维度格 `round-trip`（该 Case 只登记本行 1 格）、`截断/损坏`、`版本不符`；只测该符号该类型
 * 维度坐标：`recordProviderCall` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-036.md（脚本的唯一依据）
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

describe("UT-REPO-036 · recordProviderCall · 持久化/序列化 × round-trip", () => {
  it("persists a provider call", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    // 步骤 2：调用 recordProviderCall
    store.recordProviderCall("t-1", "op-1", 200, "req-1", "ok", 42);

    // 步骤 3：断言落库——那一行在库里
    const rows = store.db.prepare("SELECT status,request_id,note,latency_ms FROM provider_calls WHERE task_id='t-1'").all() as any[];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: 200, request_id: "req-1", note: "ok", latency_ms: 42 });
  } finally {
    store.close();
  }
  });

});
