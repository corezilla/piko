/**
 * Case ID: UT-REPO-307  ·  STATUS: real
 *
 * 责任：返回站点 L465 值 `this.tx(() => { const ex = this.db .pre…` 逐值断言（store.ts）
 * 维度坐标：`reserveTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-307.md（脚本的唯一依据）
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

describe("UT-REPO-307 · reserveTool · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns Admitted for a new call and UnsafeRetryBlocked for an unsafe repeat", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:465 的返回站点被到达的输入——合法等价类参数
      accept(store, task("t-307"));

      // 步骤 2：调用 reserveTool(…)
      const first = store.reserveTool("t-307", "op", "id", "name", "effect", "never");
      const repeat = store.reserveTool("t-307", "op", "id", "name", "effect", "never");
      const safeRepeat = store.reserveTool("t-307", "op2", "id2", "name", "effect", "safe");
      const safeAgain = store.reserveTool("t-307", "op2", "id2", "name", "effect", "safe");

      // 步骤 3：断言返回值逐值对账——四个等价类的返回值逐一比对
      expect(first).toBe("Admitted");
      expect(repeat).toBe("UnsafeRetryBlocked");
      expect(safeRepeat).toBe("Admitted");
      expect(safeAgain).toBe("Admitted");
      expect((store.db.prepare("SELECT recovery_count FROM tool_calls WHERE tool_call_id='id2'").get() as any).recovery_count).toBe(1);
    } finally {
      store.close();
    }
  });

});
