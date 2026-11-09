/**
 * Case ID: UT-REPO-321  ·  STATUS: real
 *
 * 责任：参数 `unknown: inferred` 的 `边界(上/下/零/空/满)` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-321.md（脚本的唯一依据）
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

describe("UT-REPO-321 · terminalTool · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("maps the unknown flag onto the Terminal and Unknown states respectively", async () => {
    const store = newStore();
    try {
      accept(store, task("t-321"));
      store.reserveTool("t-321", "op-321", "id-false", "tool", "effect", "never");
      store.reserveTool("t-321", "op-321", "id-true", "tool", "effect", "never");

      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 unknown——false（下界）与 true（上界）
      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("t-321", "op-321", "id-false", false);
      store.terminalTool("t-321", "op-321", "id-true", true);

      // 步骤 3：断言逐值对账——unknown=false 写 Terminal，unknown=true 写 Unknown
      const rows = store.db.prepare(
        "SELECT tool_call_id,state FROM tool_calls ORDER BY tool_call_id",
      ).all() as any[];
      expect(rows).toEqual([
        { tool_call_id: "id-false", state: "Terminal" },
        { tool_call_id: "id-true", state: "Unknown" },
      ]);
    } finally {
      store.close();
    }
  });

});
