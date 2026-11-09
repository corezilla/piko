/**
 * Case ID: UT-REPO-324  ·  STATUS: real
 *
 * 责任：分支 L486 `? unknown :`（ternary；store.ts）
 * 维度坐标：`terminalTool` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-324.md（脚本的唯一依据）
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

describe("UT-REPO-324 · terminalTool · 状态分支 × 合法迁移", () => {
  it("takes the Unknown side of the ternary for truthy and Terminal for falsy", async () => {
    const store = newStore();
    try {
      accept(store, task("t-324"));
      store.reserveTool("t-324", "op", "tc-324", "name", "effect", "safe");

      // 步骤 1：构造使 store.ts:486 的分支（ternary：`unknown ? "Unknown" : "Terminal"`）取真的输入
      // 步骤 2：调用 terminalTool(…) 并断言该侧可观测结果
      store.terminalTool("t-324", "op", "tc-324", true);
      expect((store.db.prepare("SELECT state FROM tool_calls WHERE tool_call_id='tc-324'").get() as any).state).toBe("Unknown");

      // 步骤 3：构造使该分支取假的输入——unknown 为 false（无显式 else：取假即跳过该块）
      // 步骤 4：再次调用 terminalTool(…) 并断言取假侧结果（两侧都被观测到）
      store.terminalTool("t-324", "op", "tc-324", false);
      expect((store.db.prepare("SELECT state FROM tool_calls WHERE tool_call_id='tc-324'").get() as any).state).toBe("Terminal");
      // 两条路径都只改 state，不动 recovery_count
      expect((store.db.prepare("SELECT recovery_count FROM tool_calls WHERE tool_call_id='tc-324'").get() as any).recovery_count).toBe(0);
    } finally {
      store.close();
    }
  });

});
