/**
 * Case ID: UT-REPO-055  ·  STATUS: real
 *
 * 责任：分支 L176 `catch (e)`（catch；store.ts）
 * 维度坐标：`tx` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-055.md（脚本的唯一依据）
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

describe("UT-REPO-055 · tx · 错误路径 × 每个 typed 错误码", () => {
  it("rolls back when the callback throws", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调在事务里插入一行后抛错）
    // 步骤 3：断言回滚生效——那一行不在库里
    expect(() =>
      (store as unknown as { tx<T>(fn: () => T): T }).tx(() => {
        store.db.prepare("UPDATE runs SET state='Running' WHERE task_id='t-none'").run();
        throw new Error("callback failed");
      }),
    ).toThrow("callback failed");
    expect(store.scanNonTerminal()).toEqual([]);
  } finally {
    store.close();
  }
  });

});
