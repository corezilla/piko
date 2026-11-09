/**
 * Case ID: UT-REPO-302  ·  STATUS: real
 *
 * 责任：分支 L470 `if (ex.replay !== "safe")`（if；store.ts）
 * 维度坐标：`reserveTool` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-302.md（脚本的唯一依据）
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

describe("UT-REPO-302 · reserveTool · 状态分支 × 合法迁移", () => {

  it("blocks an unsafe retry but admits a safe one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:470 的分支取真的输入——已有同 id 的 tool_call 且 replay ≠ 'safe'（'never'）
      accept(store, task("t1"));
      expect(store.reserveTool("t1", "op", "tc1", "name", "effect", "never")).toBe("Admitted");

      // 步骤 2：调用 reserveTool(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      const blocked = store.reserveTool("t1", "op", "tc1", "name", "effect", "never");

      // 步骤 3：构造使该分支取假的输入——已有同 id 的 tool_call 且 replay ＝ 'safe'（无显式 else：取假即跳过该块，断言块内副作用不发生）
      expect(store.reserveTool("t1", "op", "tc2", "name", "effect", "safe")).toBe("Admitted");

      // 步骤 4：再次调用 reserveTool(…) 并断言取假侧结果；两侧都必须被观测到
      const admitted = store.reserveTool("t1", "op", "tc2", "name", "effect", "safe");

      expect(blocked).toBe("UnsafeRetryBlocked");
      expect(admitted).toBe("Admitted");
      // 被拒的一侧没有副作用：tc1 的 recovery_count 未动，runs.tool_calls 未累加
      const tc1 = store.db.prepare("SELECT replay, recovery_count FROM tool_calls WHERE tool_call_id='tc1'").get() as any;
      expect(tc1.replay).toBe("never");
      expect(tc1.recovery_count).toBe(0);
      // 取假侧的唯一副作用是 recovery_count+1，且不重复计入 runs.tool_calls
      const tc2 = store.db.prepare("SELECT replay, recovery_count FROM tool_calls WHERE tool_call_id='tc2'").get() as any;
      expect(tc2.replay).toBe("safe");
      expect(tc2.recovery_count).toBe(1);
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t1'").get() as any).tool_calls).toBe(2);
    } finally {
      store.close();
    }
  });

});
