/**
 * Case ID: UT-REPO-312  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:483）
 * 维度坐标：`terminalTool` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-312.md（脚本的唯一依据）
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

describe("UT-REPO-312 · terminalTool · 字符串/路径/枚举输入 × 超长", () => {
  it("matches no tool call for an over-long task id and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-312"));
      store.reserveTool("t-312", "op", "tc-312", "name", "effect", "safe");
      const longId = "L".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 terminalTool(…)
      const returned = store.terminalTool(longId, "op", "tc-312");

      // 步骤 3：断言——实现无长度校验：超长 id 只是不匹配的 UPDATE 键 → 匹配 0 行、
      //         静默返回 undefined，且没有任何地方持久化了这段超长文本
      expect(returned).toBeUndefined();
      const row = store.db.prepare("SELECT state, recovery_count FROM tool_calls").get() as any;
      expect(row.state).toBe("Reserved");
      expect(row.recovery_count).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
