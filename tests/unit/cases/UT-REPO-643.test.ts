/**
 * Case ID: UT-REPO-643  ·  STATUS: real
 *
 * 责任：状态写 L821 → `db`（store.ts）
 * 维度坐标：`purge` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-643.md（脚本的唯一依据）
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

describe("UT-REPO-643 · purge · 持久化/序列化 × round-trip", () => {
  it("deletes the runs row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:821 对 `db` 的写被执行的前置状态——一条真实存在的 run
      accept(store, task("t1"));
      const before = store.db.prepare("SELECT count(*) n FROM runs").get() as any;
      // 步骤 2：调用 purge
            store.purge({ task_id: "t1" });
            const after = store.db.prepare("SELECT count(*) n FROM runs").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(before.n).toBe(1);
            expect(after.n).toBe(0);
            expect(store.db.prepare("SELECT count(*) n FROM run_sessions").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
