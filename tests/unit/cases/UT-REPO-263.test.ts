/**
 * Case ID: UT-REPO-263  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-263.md（脚本的唯一依据）
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

describe("UT-REPO-263 · terminalModel · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injection-shaped taskId as a bound parameter and updates nothing", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 taskId——SQL 元字符 + 路径穿越串 + 控制字符
      accept(store, task("t-263"));
      store.reserveModel("t-263", "op", "step", 1);
      const nasty = "'; DROP TABLE runs;--\u0001../../etc";

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel(nasty, "op", "step", 1);

      // 步骤 3：断言——参数化绑定：注入串命中不到任何行，model_attempts 原样保留，runs 表完好
      const row = store.db.prepare("SELECT task_id,step_id,state FROM model_attempts").get() as any;
      expect(row.task_id).toBe("t-263");
      expect(row.state).toBe("Started");
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
