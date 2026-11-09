/**
 * Case ID: UT-REPO-253  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `注入字符` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-253.md（脚本的唯一依据）
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

describe("UT-REPO-253 · observeUsage · 字符串/路径/枚举输入 × 注入字符", () => {

  it("records nothing for an injection-shaped step id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 step 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(task("ou-253"), "slinky", 10);
      store.reserveModel("ou-253", "op", "step", 1);

      // 步骤 2：调用 observeUsage("ou-253", "op", traversal, ...) 与 observeUsage("ou-253", "op", injection, ...)
      store.observeUsage("ou-253", "op", "../../etc/passwd", 1, rawUsageSample());
      store.observeUsage("ou-253", "op", "'; UPDATE model_attempts SET state='Terminal';--", 1, rawUsageSample());

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且原行未变
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='model_attempts'").get()).toBeTruthy();
      const row = store.db.prepare("SELECT state,raw_usage_json FROM model_attempts").get() as any;
      expect(row.state).toBe("Started");
      expect(row.raw_usage_json).toBeNull();
    } finally {
      store.close();
    }
  });

});
