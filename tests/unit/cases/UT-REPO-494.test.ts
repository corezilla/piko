/**
 * Case ID: UT-REPO-494  ·  STATUS: real
 *
 * 责任：返回站点 L607 值 `old` 逐值断言（store.ts）
 * 维度坐标：`prepareMatrixSend` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-494.md（脚本的唯一依据）
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

describe("UT-REPO-494 · prepareMatrixSend · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the existing transaction row unchanged", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:607 的返回站点被到达的输入——先建一次事务
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 3, "sha-1");
      // 步骤 2：调用 prepareMatrixSend（同样的 payload）
            const out = store.prepareMatrixSend("tx-1", "t1", 3, "sha-1");
      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
            expect(out).toEqual({
              txn_id: "tx-1",
              task_id: "t1",
              turn_seq: 3,
              payload_sha256: "sha-1",
              event_id: null,
              state: "Pending",
            });
            expect(Object.keys(out as any)).toEqual([
              "txn_id",
              "task_id",
              "turn_seq",
              "payload_sha256",
              "event_id",
              "state",
            ]);
    } finally {
      store.close();
    }
  });

});
