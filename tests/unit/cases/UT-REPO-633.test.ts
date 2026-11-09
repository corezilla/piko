/**
 * Case ID: UT-REPO-633  ·  STATUS: real
 *
 * 责任：参数 `scope: { task_id: string } | "all"` 的 `空` 类（store.ts:804）
 * 维度坐标：`purge` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-633.md（脚本的唯一依据）
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

describe("UT-REPO-633 · purge · 字符串/路径/枚举输入 × 空", () => {
  it("purges nothing for an empty scope string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 scope——''（空串）；其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 purge
            let err: any = null;
            try {
              store.purge("" as any);
            } catch (e) {
              err = e;
            }
            const rows = store.db.prepare("SELECT count(*) n FROM tasks").get() as any;
      // 步骤 3：断言——实现的真实语义：scope 不是 "all" 时走 { task_id: scope.task_id } 分支，
            // 空串没有 task_id 字段 → SQLite 绑定 undefined 抛原生 TypeError（非 typed PikoError）
            expect(err).toBeInstanceOf(TypeError);
            expect(err.message).toContain("SQLite parameter");
            expect(rows.n).toBe(1);
    } finally {
      store.close();
    }
  });

});
