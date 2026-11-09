/**
 * Case ID: UT-REPO-059  ·  STATUS: real
 *
 * 责任：状态写 L177 → `db`（store.ts）
 * 维度坐标：`tx` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-059.md（脚本的唯一依据）
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

describe("UT-REPO-059 · tx · 持久化/序列化 × round-trip", () => {
  it("rolls the transaction back", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调写一行后抛错）
    // 步骤 3：断言回滚生效——那一行不在库里
    accept(store, task("t-rollback2"));
    expect(() =>
      (store as unknown as { tx<T>(fn: () => T): T }).tx(() => {
        store.db.prepare("UPDATE runs SET state='Running' WHERE task_id='t-rollback2'").run();
        throw new Error("rollback");
      }),
    ).toThrow("rollback");
    expect(store.getRun("t-rollback2").state).toBe("Queued");
  } finally {
    store.close();
  }
  });

});
