/**
 * Case ID: UT-REPO-610  ·  STATUS: real
 *
 * 责任：throw L762 `DiscussionNotClosed`（守卫 `if (result.state === "Completed" && run…`；store.ts）
 * 维度坐标：`finish` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-610.md（脚本的唯一依据）
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

describe("UT-REPO-610 · finish · 错误路径 × 每个 typed 错误码", () => {

  it("raises the typed DiscussionNotClosed error and writes nothing", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-610", "!room:test");
      const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number };

      // 步骤 1：构造触发 store.ts:762 处 throw 的输入——result.state ＝ "Completed" 且
      //         discussion_intake_state 仍是 "Open"（还有 pending turn）
      // 步骤 2：调用 finish(…)
      let err: any = null;
      try {
        store.finish(result("t-610"), grant.lease_epoch);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别，且无部分写入（结果行没写、run 仍在 Running、槽位未释放）
      expect(err?.constructor?.name).toBe("PikoError");
      expect(err?.code).toBe("DiscussionNotClosed");
      expect(err?.status).toBe(409);
      expect(err?.message).toBe("discussion result cannot complete before intake closes");
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 0 });
      expect(store.getRun("t-610").state).toBe("Running");
      expect(store.readSlot().task_id).toBe("t-610");

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——code 原样是 DiscussionNotClosed
      expect(err?.code).not.toBe("InternalError");
    } finally {
      store.close();
    }
  });

});
