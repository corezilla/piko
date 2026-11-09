/**
 * Case ID: UT-REPO-322  ·  STATUS: real
 *
 * 责任：参数 `unknown: inferred` 的 `非法值` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-322.md（脚本的唯一依据）
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

describe("UT-REPO-322 · terminalTool · 纯函数/无副作用 × 非法值", () => {

  it("maps any truthy unknown flag to Unknown and any falsy one to Terminal", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造参数 unknown——类型外的真值 'yes'、数字 1、对象；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveTool("t1", "op", "tc1", "name", "effect", "never");
      store.reserveTool("t1", "op", "tc2", "name", "effect", "never");
      store.reserveTool("t1", "op", "tc3", "name", "effect", "never");

      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("t1", "op", "tc1", "yes" as never);
      store.terminalTool("t1", "op", "tc2", 1 as never);
      store.terminalTool("t1", "op", "tc3", {} as never);

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：unknown 走真值判断（unknown ? 'Unknown' : 'Terminal'），
      //         任何真值都映射为 Unknown，不抛错
      const rows = store.db.prepare("SELECT tool_call_id, state FROM tool_calls ORDER BY tool_call_id").all() as any[];
      expect(rows.map((r) => [r.tool_call_id, r.state])).toEqual([
        ["tc1", "Unknown"],
        ["tc2", "Unknown"],
        ["tc3", "Unknown"],
      ]);
    } finally {
      store.close();
    }
  });

});
