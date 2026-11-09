/**
 * Case ID: UT-REPO-073  ·  STATUS: real
 *
 * 责任：可选参数 `triggerContent` 缺省/显式两态（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-073.md（脚本的唯一依据）
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

describe("UT-REPO-073 · createOrGet · 字符串/路径/枚举输入 × 未知枚举", () => {

  it("treats an absent triggerContent and an explicit default alike", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造可选参数 triggerContent 的三态——缺省（不传）、显式传默认值 ""、
      // "未知枚举值"（实现中 triggerContent 是自由文本，无枚举域，故取一个未知字面量）
      const absent = store.createOrGet(discussionTask("co-073-a"), "slinky", 10);
      const explicitDefault = store.createOrGet(discussionTask("co-073-b"), "slinky", 10, "");
      const unknownValue = store.createOrGet(discussionTask("co-073-c"), "slinky", 10, "unknown-enum-value");

      // 步骤 2：调用 createOrGet(...)
      // 步骤 3：断言逐值对账——缺省与显式 "" 都被 ?? 归一成 ""；未知字面量原样存下
      expect([absent.kind, explicitDefault.kind, unknownValue.kind]).toEqual(["created", "created", "created"]);
      const read = (id: string) =>
        (store.db.prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?").get(id) as any)
          .visible_content;
      expect(read("co-073-a")).toBe("");
      expect(read("co-073-b")).toBe("");
      expect(read("co-073-c")).toBe("unknown-enum-value");
    } finally {
      store.close();
    }
  });

});
