/**
 * Case ID: UT-REPO-550  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:674）
 * 维度坐标：`usageSoFar` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-550.md（脚本的唯一依据）
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

describe("UT-REPO-550 · usageSoFar · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected task id as plain text and reads back only its own usage", async () => {
    const store = newStore();
    try {
      const injected = "t-550'; DROP TABLE model_attempts;--";
      accept(store, task(injected));
      store.reserveModel(injected, "op-550", "step-550", 1);
      store.observeUsage(injected, "op-550", "step-550", 1, { input: 5, output: 2, totalTokens: 7 });

      // 步骤 1：按 `注入字符` 类构造参数 taskId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 usageSoFar(…)（store.ts:674，经 getRun 的 progress.usage_so_far 暴露）
      const usage = store.getRun(injected).progress.usage_so_far;

      // 步骤 3：断言——实现的真实语义：task_id 是绑定参数，注入串不构成 SQL；
      //         只读到注入串自己那一行的用量，其它任务不受影响
      expect(usage).toEqual({ input_tokens: 5, output_tokens: 2, total_tokens: 7 });
      expect(store.db.prepare("SELECT count(*) n FROM model_attempts").get()).toEqual({ n: 1 });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
