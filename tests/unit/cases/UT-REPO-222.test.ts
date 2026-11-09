/**
 * Case ID: UT-REPO-222  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `注入字符` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-222.md（脚本的唯一依据）
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

describe("UT-REPO-222 · reserveModel · 字符串/路径/枚举输入 × 注入字符", () => {
  it("binds an injected operation id as plain text", async () => {
    const store = newStore();
    try {
      accept(store, task("t-222"));
      const injection = "op'; DROP TABLE model_attempts;--";

      // 步骤 1：按 `注入字符` 类构造参数 op——含 SQL 元字符的注入串；
      //         其余参数取合法等价类
      // 步骤 2：调用 reserveModel(…)
      const reserved = store.reserveModel("t-222", injection, "step", 1);

      // 步骤 3：断言——实现无校验语句，但参数走的是绑定层：注入串被当作普通文本原样落库，
      //         既没有执行也没有破坏任何表
      expect(reserved).toBe(true);
      const row = store.db.prepare("SELECT operation_id FROM model_attempts WHERE task_id='t-222'").get() as any;
      expect(row.operation_id).toBe(injection);
      const tables = store.db
        .prepare("SELECT count(*) n FROM sqlite_master WHERE type='table' AND name='model_attempts'")
        .get() as any;
      expect(tables.n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
