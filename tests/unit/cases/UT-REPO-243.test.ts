/**
 * Case ID: UT-REPO-243  ·  STATUS: real
 *
 * 责任：状态写 L47 → `db`（store.ts）
 * 维度坐标：`TaskStore.constructor` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-243.md（脚本的唯一依据）
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

describe("UT-REPO-243 · TaskStore.constructor · 持久化/序列化 × round-trip", () => {
  it("applies the documented PRAGMAs and schema on construction", async () => {
      // 步骤 1：构造使 store.ts:47 对 `db` 的写被执行的前置状态——path 取合法等价类
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore(":memory:", 1000)
        store = new TaskStore(":memory:", 1000);

        // 步骤 3：读回权威事实源逐值对账写入语义
        expect((store.db.prepare("PRAGMA foreign_keys").get() as any).foreign_keys).toBe(1);
        expect((store.db.prepare("PRAGMA synchronous").get() as any).synchronous).toBe(2);
        expect((store.db.prepare("PRAGMA busy_timeout").get() as any).timeout).toBe(1000);
        const tables = (store.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any).map((x: any) => x.name);
        expect(tables).toEqual(
          expect.arrayContaining([
            "instance_meta",
            "tasks",
            "runs",
            "run_sessions",
            "execution_slot",
            "results",
            "model_attempts",
            "tool_calls",
            "matrix_state",
            "matrix_events",
            "discussion_turns",
            "matrix_sends",
            "audit_events",
          ]),
        );
      } finally {
        if (store) store.close();
      }
  });

});
