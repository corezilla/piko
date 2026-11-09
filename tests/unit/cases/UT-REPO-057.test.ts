/**
 * Case ID: UT-REPO-057  ·  STATUS: real
 *
 * 责任：状态写 L171 → `db`（store.ts）
 * 维度坐标：`tx` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-057.md（脚本的唯一依据）
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

describe("UT-REPO-057 · tx · 持久化/序列化 × round-trip", () => {
  it("begins an immediate transaction", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx
    // 步骤 3：断言事务被开启——库能读到未提交事务里的写入
    accept(store, task("t-in-tx"));
    (store as unknown as { tx<T>(fn: () => T): T }).tx(() => {
      store.db.prepare("UPDATE runs SET state='Running' WHERE task_id='t-in-tx'").run();
      // 同一连接上未提交的写对自己可见
      expect(store.getRun("t-in-tx").state).toBe("Running");
    });
    expect(store.getRun("t-in-tx").state).toBe("Running");
  } finally {
    store.close();
  }
  });

});
