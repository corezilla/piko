/**
 * Case ID: UT-REPO-562  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:692）
 * 维度坐标：`rawUsage` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-562.md（脚本的唯一依据）
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

describe("UT-REPO-562 · rawUsage · 字符串/路径/枚举输入 × 超长", () => {

  it("reads back the raw usage of an over-length task id", async () => {
    const store = newStore();
    try {
      const longId = "t".repeat(8192);
      accept(store, task(longId));
      store.reserveModel(longId, "op-562", "step-562", 1);
      store.observeUsage(longId, "op-562", "step-562", 1, { input: 8, output: 3, totalTokens: 11 });

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×4096 的字符串
      // 步骤 2：调用 rawUsage(…)
      const raw = store.rawUsage(longId);

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 task_id 正常匹配，
      //         rawUsage 逐值返回那条用量记录（没有 cost，不走重写分支）
      expect(raw).toEqual([{ input: 8, output: 3, totalTokens: 11 }]);
      expect(store.rawUsage("no-such-task")).toEqual([]);
    } finally {
      store.close();
    }
  });

});
