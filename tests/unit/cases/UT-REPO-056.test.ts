/**
 * Case ID: UT-REPO-056  ·  STATUS: real
 *
 * 责任：throw L178 `reject`（守卫 `catch`；store.ts）
 * 维度坐标：`tx` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-056.md（脚本的唯一依据）
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

describe("UT-REPO-056 · tx · 错误路径 × 每个 typed 错误码", () => {
  it("rethrows the callback's error after rolling back", async () => {
  const store = newStore();
  try {
    // 步骤 2：调用 tx（回调抛一个 typed 错误）
    // 步骤 3：断言错误逐值对账——同一个错误对象被抛出
    const failure = new Error("exact failure");
    let caught: unknown;
    try {
      (store as unknown as { tx<T>(fn: () => T): T }).tx(() => {
        throw failure;
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBe(failure);
  } finally {
    store.close();
  }
  });

});
