/**
 * Case ID: UT-REPO-058  ·  STATUS: real
 *
 * 责任：状态写 L174 → `db`（store.ts）
 * 维度坐标：`tx` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-058.md（脚本的唯一依据）
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

describe("UT-REPO-058 · tx · 持久化/序列化 × round-trip", () => {
  it("commits the transaction", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调里写一行）
    accept(store, task("t-commit"));
    (store as unknown as { tx<T>(fn: () => T): T }).tx(() => {
      store.db.prepare("UPDATE runs SET state='Running' WHERE task_id='t-commit'").run();
    });

    // 步骤 3：断言提交生效——新开一个读连接也看得到
    expect(store.getRun("t-commit").state).toBe("Running");
  } finally {
    store.close();
  }
  });

});
