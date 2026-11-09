/**
 * Case ID: UT-REPO-630  ·  STATUS: real
 *
 * 责任：throw L799 `TaskNotTerminal`（守卫 `if (!isTerminal(state))`；store.ts）
 * 维度坐标：`result` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-630.md（脚本的唯一依据）
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

describe("UT-REPO-630 · result · 错误路径 × 每个 typed 错误码", () => {

  it("raises the typed TaskNotTerminal error for a run that is still going", async () => {
    const store = newStore();
    try {
      accept(store, task("t-630"));

      // 步骤 1：构造触发 store.ts:799 处 throw 的输入——`isTerminal(state)` 为假（run 仍在 Queued）
      // 步骤 2：调用 result(…)
      let err: any = null;
      try {
        store.result("t-630");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别，且无部分写入（结果行没写、run 状态没变）
      expect(err?.constructor?.name).toBe("PikoError");
      expect(err?.code).toBe("TaskNotTerminal");
      expect(err?.status).toBe(409);
      expect(err?.message).toBe("task is not terminal");
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 0 });
      expect(store.getRun("t-630").state).toBe("Queued");

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——code 原样是 TaskNotTerminal
      expect(err?.code).not.toBe("InternalError");
    } finally {
      store.close();
    }
  });

});
