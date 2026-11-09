/**
 * Case ID: UT-REPO-071  ·  STATUS: real
 *
 * 责任：参数 `triggerContent: string` 的 `超长` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-071.md（脚本的唯一依据）
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

describe("UT-REPO-071 · createOrGet · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-long triggerContent verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 triggerContent 的超长类——长度 2×4096＝8192
      const long = "t".repeat(8192);

      // 步骤 2：调用 createOrGet(..., triggerContent=long)
      const outcome = store.createOrGet(discussionTask("co-071"), "slinky", 10, long);

      // 步骤 3：断言逐值对账——实现对 triggerContent 无长度上限，原样落库
      expect(outcome.kind).toBe("created");
      const row = store.db
        .prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?")
        .get("co-071") as any;
      expect(row.visible_content).toBe(long);
      expect(row.visible_content.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
