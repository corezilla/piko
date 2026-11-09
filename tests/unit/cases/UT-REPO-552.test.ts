/**
 * Case ID: UT-REPO-552  ·  STATUS: real
 *
 * 责任：分支 L676 `!rows.length`（!；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-552.md（脚本的唯一依据）
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

describe("UT-REPO-552 · usageSoFar · 状态分支 × 合法迁移", () => {

  it("returns all-null usage when no attempt has recorded usage yet", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:676 的分支（!：`!rows.length`）取真的输入——没有 raw_usage_json
      accept(store, task("t-552"));
      store.reserveModel("t-552", "op", "step", 1);

      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果
      const usage = (store as any).usageSoFar("t-552");

      // 步骤 3：断言取真侧——没有任何用量记录时三项都是 null（不是 0）
      expect(usage).toEqual({ input_tokens: null, output_tokens: null, total_tokens: null });

      // 步骤 4：断言取假侧——写入一条 raw_usage_json 后走累加分支
      store.observeUsage("t-552", "op", "step", 1, rawUsageSample());
      const after = (store as any).usageSoFar("t-552");
      expect(after).toEqual({ input_tokens: 10, output_tokens: 5, total_tokens: 15 });
    } finally {
      store.close();
    }
  });

});
