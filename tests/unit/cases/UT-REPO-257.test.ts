/**
 * Case ID: UT-REPO-257  ·  STATUS: real
 *
 * 责任：参数 `raw: unknown` 的 `每等价类合法值` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-257.md（脚本的唯一依据）
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

describe("UT-REPO-257 · observeUsage · 纯函数/无副作用 × 每等价类合法值", () => {

  it("stores one representative of each legal raw usage shape", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 raw: unknown 的合法等价类代表值——对象、数组、字符串、数字、布尔、null
      const samples: unknown[] = [
        rawUsageSample(),
        { input: 1, output: 2, totalTokens: 3, cacheRead: 4, cacheWrite: 5 },
        [1, 2, 3],
        "usage",
        42,
        true,
        null,
      ];
      for (const [i] of samples.entries()) {
        store.createOrGet(task(`ou-257-${i}`), "slinky", 10);
        store.reserveModel(`ou-257-${i}`, "op", "step", 1);
      }

      // 步骤 2：逐个调用 observeUsage(...)
      for (const [i, raw] of samples.entries()) {
        store.observeUsage(`ou-257-${i}`, "op", "step", 1, raw);
      }

      // 步骤 3：断言逐值对账——raw 是 unknown，实现只做 JSON.stringify 后原样落库
      for (const [i, raw] of samples.entries()) {
        const row = store.db
          .prepare("SELECT raw_usage_json FROM model_attempts WHERE task_id=?")
          .get(`ou-257-${i}`) as any;
        expect(row.raw_usage_json).toBe(JSON.stringify(raw));
      }
    } finally {
      store.close();
    }
  });

});
