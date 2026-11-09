/**
 * Case ID: UT-REPO-251  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `空` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-251.md（脚本的唯一依据）
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

describe("UT-REPO-251 · observeUsage · 字符串/路径/枚举输入 × 空", () => {

  it("records nothing for an empty step id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 step 的空类——''（空串）
      store.createOrGet(task("ou-251"), "slinky", 10);
      store.reserveModel("ou-251", "op", "step", 1);

      // 步骤 2：调用 observeUsage("ou-251", "op", "", ...)
      store.observeUsage("ou-251", "op", "", 1, rawUsageSample());

      // 步骤 3：断言逐值对账——空串不匹配任何尝试行，原行状态不变
      const row = store.db.prepare("SELECT state,raw_usage_json FROM model_attempts").get() as any;
      expect(row.state).toBe("Started");
      expect(row.raw_usage_json).toBeNull();
    } finally {
      store.close();
    }
  });

});
