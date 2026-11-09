/**
 * Case ID: UT-REPO-323  ·  STATUS: real
 *
 * 责任：可选参数 `unknown` 缺省/显式两态（store.ts:483）
 * 维度坐标：`terminalTool` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-323.md（脚本的唯一依据）
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

describe("UT-REPO-323 · terminalTool · 纯函数/无副作用 × 未知枚举", () => {

  it("treats an omitted unknown and an explicit false alike", async () => {
    const store = newStore();
    try {
      // 步骤 1：对可选参数 unknown 构造三态——缺省（不传）、显式传默认值、未知枚举值
      accept(store, task("t-323"));
      store.reserveTool("t-323", "op", "id-a", "name", "effect", "never");
      store.reserveTool("t-323", "op", "id-b", "name", "effect", "never");
      store.reserveTool("t-323", "op", "id-c", "name", "effect", "never");

      // 步骤 2：分别调用 terminalTool(…)
      store.terminalTool("t-323", "op", "id-a");
      store.terminalTool("t-323", "op", "id-b", false);
      store.terminalTool("t-323", "op", "id-c", "not-a-boolean" as any);

      // 步骤 3：断言——实现的真实语义：unknown 只做真值判断而非枚举校验，
      // 缺省与显式 false 同构（都落 Terminal）；未知枚举值是真值 → 落 Unknown
      const rows = store.db.prepare("SELECT tool_call_id,state FROM tool_calls ORDER BY tool_call_id").all() as any[];
      expect(rows[0].state).toBe("Terminal");
      expect(rows[1].state).toBe("Terminal");
      expect(rows[2].state).toBe("Unknown");
    } finally {
      store.close();
    }
  });

});
