/**
 * Case ID: UT-REPO-296  ·  STATUS: real
 *
 * 责任：参数 `replay: string` 的 `注入字符` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-296.md（脚本的唯一依据）
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

describe("UT-REPO-296 · reserveTool · 字符串/路径/枚举输入 × 注入字符", () => {
  it("rejects an injected replay value through the table CHECK constraint", async () => {
    const store = newStore();
    try {
      accept(store, task("t-296"));
      const injection = "ne'ver; DROP TABLE tool_calls;--";

      // 步骤 1：按 `注入字符` 类构造参数 replay——含 SQL 元字符的注入串；
      //         其余参数取合法等价类
      // 步骤 2：调用 reserveTool(…)
      let err: any = null;
      try {
        store.reserveTool("t-296", "op", "tc-296", "name", "effect", injection);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：replay 那一列有 CHECK(replay IN('never','safe'))，
      //         所以注入串被约束拒绝；抛的是 SQLite 原始错误，不是 PikoError；
      //         且没有半行残留（事务已回滚）
      expect(err).not.toBeNull();
      expect(err?.code).toBe("ERR_SQLITE_ERROR");
      expect(err?.constructor?.name).not.toBe("PikoError");
      expect(err?.message).toContain("CHECK constraint failed");
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t-296'").get() as any).tool_calls).toBe(0);
      const tables = store.db
        .prepare("SELECT count(*) n FROM sqlite_master WHERE type='table' AND name='tool_calls'")
        .get() as any;
      expect(tables.n).toBe(1);
    } finally {
      store.close();
    }
  });

});
