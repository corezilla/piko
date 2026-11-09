/**
 * Case ID: UT-REPO-235  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `空` 类（store.ts:44）
 * 维度坐标：`TaskStore.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-235.md（脚本的唯一依据）
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

describe("UT-REPO-235 · TaskStore.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty path (an in-memory database)", async () => {
      // 步骤 1：按 `空` 类构造 path——''（空串）；其余参数取合法等价类（busyMs）
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore("")
        store = new TaskStore("", 1000);

        // 步骤 3：断言——实现的真实语义：path='' 不是 ":memory:"，于是走 mkdirSync(dirname(''))；
        // 但 SQLite 把空文件名当临时库，库照样建好且 migrate 完成
        expect(store.db).toBeTruthy();
        const tables = (store.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any).map((x: any) => x.name);
        expect(tables).toContain("tasks");
        expect(tables).toContain("runs");
        expect(tables).toContain("execution_slot");
      } finally {
        if (store) store.close();
      }
  });

});
