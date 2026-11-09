/**
 * Case ID: UT-REPO-380  ·  STATUS: real
 *
 * 责任：参数 `note: string` 的 `超长` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-380.md（脚本的唯一依据）
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

describe("UT-REPO-380 · recordProviderCall · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-length note verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-380"));
      const longNote = "n".repeat(8192);

      // 步骤 1：按 `超长` 类构造参数 note——长度 2×4096 的字符串
      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t-380", "op-380", 200, "req-380", longNote, 3);

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 note 原样落库
      const row = store.db.prepare("SELECT length(note) len,note FROM provider_calls").get() as any;
      expect(row.len).toBe(8192);
      expect(row.note).toBe(longNote);
    } finally {
      store.close();
    }
  });

});
