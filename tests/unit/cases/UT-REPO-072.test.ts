/**
 * Case ID: UT-REPO-072  ·  STATUS: real
 *
 * 责任：参数 `triggerContent: string` 的 `注入字符` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-072.md（脚本的唯一依据）
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

describe("UT-REPO-072 · createOrGet · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped triggerContent verbatim without SQL injection", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 triggerContent 的注入字符类——穿越串、控制字符与 SQL 元字符、超长＋注入组合串
      const traversal = "../../../room";
      const injection = "'; DROP TABLE discussion_turns;--";
      const combined = "c".repeat(4096) + "'; UPDATE runs SET state='Failed';--";

      // 步骤 2：调用 createOrGet(..., triggerContent=...)
      store.createOrGet(discussionTask("co-072-a"), "slinky", 10, traversal);
      store.createOrGet(discussionTask("co-072-b"), "slinky", 10, injection);
      store.createOrGet(discussionTask("co-072-c"), "slinky", 10, combined);

      // 步骤 3：断言逐值对账——内容作为字面文本存下，注入未生效（表仍存在、状态未变）
      const a = store.db.prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?").get("co-072-a") as any;
      const b = store.db.prepare("SELECT visible_content FROM discussion_turns WHERE task_id=?").get("co-072-b") as any;
      expect(a.visible_content).toBe(traversal);
      expect(b.visible_content).toBe(injection);
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='discussion_turns'").get()).toBeTruthy();
      expect(store.db.prepare("SELECT state FROM runs WHERE task_id='co-072-b'").get()).toEqual({ state: "Queued" });
    } finally {
      store.close();
    }
  });

});
