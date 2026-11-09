/**
 * Case ID: UT-REPO-291  ·  STATUS: real
 *
 * 责任：参数 `effect: string` 的 `空` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-291.md（脚本的唯一依据）
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

describe("UT-REPO-291 · reserveTool · 字符串/路径/枚举输入 × 空", () => {

  it("accepts an empty effect string and stores it verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 effect——''（空串）；其余参数取合法等价类
      accept(store, task("t-291"));

      // 步骤 2：调用 reserveTool(…)
      const outcome = store.reserveTool("t-291", "op", "id", "name", "", "never");

      // 步骤 3：断言——实现的真实语义：reserveTool 对 effect 无校验，空串原样落库（非 NULL）
      expect(outcome).toBe("Admitted");
      const row = store.db.prepare("SELECT effect FROM tool_calls").get() as any;
      expect(row.effect).toBe("");
      expect(row.effect).not.toBeNull();
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t-291'").get() as any).tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
