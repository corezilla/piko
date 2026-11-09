/**
 * Case ID: UT-REPO-483  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-483.md（脚本的唯一依据）
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

describe("UT-REPO-483 · prepareMatrixSend · 字符串/路径/枚举输入 × 注入字符", () => {
  it("rejects an injection-shaped taskId at the foreign key", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 taskId——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      const taskId = "'; DROP TABLE matrix_sends;--";
      // 步骤 2：调用 prepareMatrixSend
            let err: any = null;
            try {
              store.prepareMatrixSend("tx-1", taskId, 1, "sha-1");
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——参数化绑定：注入串只是普通 task_id，外键匹配不到行而拒绝
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toContain("FOREIGN KEY constraint failed");
            expect((store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any).n).toBe(0);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
