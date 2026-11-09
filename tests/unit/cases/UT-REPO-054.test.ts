/**
 * Case ID: UT-REPO-054  ·  STATUS: real
 *
 * 责任：参数 `fn: () => T` 的 `非法值` 类（store.ts:170）
 * 维度坐标：`tx` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-054.md（脚本的唯一依据）
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

describe("UT-REPO-054 · tx · 纯函数/无副作用 × 非法值", () => {
  it("propagates an error thrown by the callback", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调抛错）
    // 步骤 3：断言错误被上抛——事务回滚后原样抛出
    expect(() =>
      (store as unknown as { tx<T>(fn: () => T): T }).tx(() => {
        throw new Error("callback failed");
      }),
    ).toThrow("callback failed");
  } finally {
    store.close();
  }
  });

});
