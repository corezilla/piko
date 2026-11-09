/**
 * Case ID: UT-REPO-320  ·  STATUS: real
 *
 * 责任：参数 `unknown: inferred` 的 `每等价类合法值` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-320.md（脚本的唯一依据）
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

describe("UT-REPO-320 · terminalTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("maps every legal value of the unknown flag to the matching tool-call state", async () => {
    const store = newStore();
    try {
      accept(store, task("t-320"));
      store.reserveTool("t-320", "op", "tc-320", "name", "effect", "safe");

      // 步骤 1：按 `每等价类合法值` 类构造参数 unknown——它的声明类型是可选 boolean，
      //         合法等价类只有 false 与 true 两个代表值
      // 步骤 2：调用 terminalTool(…)
      const asTerminal = store.terminalTool("t-320", "op", "tc-320", false);
      const asUnknown = store.terminalTool("t-320", "op", "tc-320", true);

      // 步骤 3：断言——被接受时返回值/状态与设计声明一致，逐值对账
      expect(asTerminal).toBeUndefined();
      expect(asUnknown).toBeUndefined();
      const row = store.db.prepare("SELECT state FROM tool_calls WHERE tool_call_id='tc-320'").get() as any;
      expect(row.state).toBe("Unknown");
    } finally {
      store.close();
    }
  });

});
