/**
 * Case ID: UT-REPO-293  ·  STATUS: real
 *
 * 责任：参数 `effect: string` 的 `注入字符` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-293.md（脚本的唯一依据）
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

describe("UT-REPO-293 · reserveTool · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected effect as plain text and keeps the row intact", async () => {
    const store = newStore();
    try {
      accept(store, task("t-293"));
      const injected = "eff'; DROP TABLE tool_calls;--";

      // 步骤 1：按 `注入字符` 类构造参数 effect——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 reserveTool(…)
      const admitted = store.reserveTool("t-293", "op-293", "id-293", "tool", injected, "never");

      // 步骤 3：断言——实现的真实语义：effect 是绑定参数，注入串不构成 SQL，
      //         原样落库，tool_calls 表与计数都完好
      expect(admitted).toBe("Admitted");
      const row = store.db.prepare("SELECT effect,state FROM tool_calls").get() as any;
      expect(row.effect).toBe(injected);
      expect(row.state).toBe("Reserved");
      expect(store.db.prepare("SELECT count(*) n FROM tool_calls").get()).toEqual({ n: 1 });
      expect(store.getRun("t-293").progress.tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
