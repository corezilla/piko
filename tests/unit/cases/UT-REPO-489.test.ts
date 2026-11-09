/**
 * Case ID: UT-REPO-489  ·  STATUS: real
 *
 * 责任：参数 `payloadSha: string` 的 `注入字符` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-489.md（脚本的唯一依据）
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

describe("UT-REPO-489 · prepareMatrixSend · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores an injection-shaped payloadSha verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 payloadSha——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      const sha = "'; DROP TABLE matrix_sends;--";
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 1, sha);
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——参数化绑定：注入串只作为 payload_sha256 字面量
            expect(out).toEqual({ state: "Pending" });
            expect(row.payload_sha256).toBe(sha);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
