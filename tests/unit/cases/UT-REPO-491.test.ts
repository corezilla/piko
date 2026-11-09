/**
 * Case ID: UT-REPO-491  ·  STATUS: real
 *
 * 责任：throw L606 `TaskConflict`（守卫 `if (old.payload_sha256 !== payloadSha)`；store.ts）
 * 维度坐标：`prepareMatrixSend` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-491.md（脚本的唯一依据）
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

describe("UT-REPO-491 · prepareMatrixSend · 错误路径 × 每个 typed 错误码", () => {
  it("throws a typed TaskConflict when the payload of a known transaction changed", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:606 处 throw 的输入——令 old.payload_sha256 ≠ payloadSha；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用被测符号（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.prepareMatrixSend("tx-1", "t1", 1, "sha-2");
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——typed 错误逐值对账，且无状态写/资源残留
            expect(err).not.toBeNull();
      expect(err.code).toBe("TaskConflict");
            expect(err.status).toBe(409);
            // 消息可判别
            expect(err.message).toBe("Matrix transaction payload changed");
            // 无部分写入：旧行保持原样
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
            expect(row.payload_sha256).toBe("sha-1");
            expect(row.state).toBe("Pending");
            expect((store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
