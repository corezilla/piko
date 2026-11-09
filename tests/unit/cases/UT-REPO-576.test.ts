/**
 * Case ID: UT-REPO-576  ·  STATUS: real
 *
 * 责任：分支 L722 `loop (this.db .prepare("SELECT operation_id,t…`（loop；store.ts）
 * 维度坐标：`knownActions` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-576.md（脚本的唯一依据）
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

describe("UT-REPO-576 · knownActions · 状态分支 × 合法迁移", () => {
  it("iterates the tool_calls rows into ToolCall actions", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:722 的分支（loop：工具调用行）取真的输入——一条工具调用
      accept(store, task("t1"));
      store.reserveTool("t1", "op1", "tc1", "read_file", "read", "safe");
      // 步骤 2：调用 knownActions 并断言该侧可观测结果
            const actions = store.knownActions("t1");
            // 步骤 3：构造使该分支取假的输入——没有任何工具调用
            const none = store.knownActions("t2-none");
      // 步骤 3：断言——取真侧每条工具调用产出一个 ToolCall；取假侧（无行）不产出
            expect(actions.length).toBe(1);
            expect(actions[0].kind).toBe("ToolCall");
            expect(actions[0].description).toBe("read_file op1/tc1");
            expect(none).toEqual([]);
    } finally {
      store.close();
    }
  });

});
