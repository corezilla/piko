/**
 * Case ID: UT-REPO-560  ·  STATUS: real
 *
 * 责任：返回站点 L690 值 `{ input_tokens: i + ci + co, output_tok…` 逐值断言（store.ts）
 * 维度坐标：`usageSoFar` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-560.md（脚本的唯一依据）
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

describe("UT-REPO-560 · usageSoFar · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns input+cacheRead+cacheWrite, output and total_tokens", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:690 的返回站点被到达的输入——一条带缓存 token 的用量记录
      accept(store, task("t-560"));
      store.reserveModel("t-560", "op", "step", 1);
      store.observeUsage("t-560", "op", "step", 1, rawUsageSample({ input: 10, output: 5, totalTokens: 15, cacheRead: 2, cacheWrite: 3 }));

      // 步骤 2：调用 usageSoFar(…)
      const usage = (store as any).usageSoFar("t-560");

      // 步骤 3：断言返回值逐值对账——input_tokens 把 cacheRead/cacheWrite 计入，total_tokens 取 totalTokens 原值
      expect(usage).toEqual({ input_tokens: 15, output_tokens: 5, total_tokens: 15 });
      expect(Object.keys(usage)).toEqual(["input_tokens", "output_tokens", "total_tokens"]);
    } finally {
      store.close();
    }
  });

});
