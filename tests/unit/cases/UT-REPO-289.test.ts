/**
 * Case ID: UT-REPO-289  ·  STATUS: real
 *
 * 责任：参数 `name: string` 的 `超长` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-289.md（脚本的唯一依据）
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

describe("UT-REPO-289 · reserveTool · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-length tool name verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-289"));
      const longName = "n".repeat(8192);

      // 步骤 1：按 `超长` 类构造参数 name——长度 2×4096 的字符串
      // 步骤 2：调用 reserveTool(…)
      const admitted = store.reserveTool("t-289", "op-289", "id-289", longName, "effect", "never");

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 tool_name 原样落库并被 Admitted
      expect(admitted).toBe("Admitted");
      const row = store.db.prepare("SELECT length(tool_name) len,tool_name FROM tool_calls").get() as any;
      expect(row.len).toBe(8192);
      expect(row.tool_name).toBe(longName);
    } finally {
      store.close();
    }
  });

});
