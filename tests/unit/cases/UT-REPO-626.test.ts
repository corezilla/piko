/**
 * Case ID: UT-REPO-626  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:795）
 * 维度坐标：`result` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-626.md（脚本的唯一依据）
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

describe("UT-REPO-626 · result · 字符串/路径/枚举输入 × 超长", () => {

  it("raises NotFound for an over-length unknown task id", async () => {
    const store = newStore();
    try {
      const longId = "t".repeat(8192);
      accept(store, task(longId));
      store.finishQueued(result(longId));

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×4096 的字符串
      // 步骤 2：调用 result(…)
      const found = store.result(longId);

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 task_id 正常匹配并返回结果；
      //         同样长的未知 id 走 getRun 的 NotFound 分支
      expect(found.task_id).toBe(longId);
      expect(found.state).toBe("Completed");
      let err: any = null;
      try {
        store.result("z".repeat(8192));
      } catch (e) {
        err = e;
      }
      expect(err?.constructor?.name).toBe("PikoError");
      expect(err?.code).toBe("NotFound");
      expect(err?.status).toBe(404);
    } finally {
      store.close();
    }
  });

});
