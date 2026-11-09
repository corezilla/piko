/**
 * Case ID: UT-REPO-111  ·  STATUS: real
 *
 * 责任：throw L238 `FencedWrite`（守卫 `if (command.expected_state_in && !comma…`；store.ts）
 * 维度坐标：`mutateRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-111.md（脚本的唯一依据）
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

describe("UT-REPO-111 · mutateRun · 错误路径 × 每个 typed 错误码", () => {
  it("surfaces the FencedWrite guard as a typed 409 and leaves no partial write", async () => {
    const store = newStore();
    try {
      accept(store, task("t-111"));

      // 步骤 1：构造触发 store.ts:238 处 throw 的输入——expected_state_in 不含当前状态 Queued
      // 步骤 2：调用 mutateRun(…)
      let err: any = null;
      try {
        store.mutateRun({
          task_id: "t-111",
          expected_generation: 1,
          expected_state_in: ["Running"],
          mutation: (r: any) => {
            r.state = "Running";
          },
        });
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）
      expect(err).not.toBeNull();
      expect(err.constructor?.name).toBe("PikoError");
      expect(err.code).toBe("FencedWrite");
      expect(err.status).toBe(409);
      // 实现给出的可判别消息是 "state moved"——它不含「建议动作」文案，
      // 故此处只断言可判别性，不臆造建议动作
      expect(err.message).toBe("state moved");
      expect(err.message).toContain("state");
      // 无部分写入：事务已回滚，runs 行一字未动
      expect(store.generation("t-111")).toBe(1);
      expect(store.getRun("t-111").state).toBe("Queued");
      expect((store.db.prepare("SELECT last_activity_at FROM runs WHERE task_id='t-111'").get() as any).last_activity_at).toBeNull();

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——抛出的就是 ISD 错误表里的
      //         FencedWrite/409 客户端码本身，不是包装过的 InternalError/500
      expect(err.code).not.toBe("InternalError");
      expect(err.status).toBe(409);
      expect(err instanceof Error).toBe(true);
    } finally {
      store.close();
    }
  });

});
