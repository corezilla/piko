/**
 * Case ID: UT-REPO-308  ·  STATUS: real
 *
 * 责任：返回站点 L470 值 `"UnsafeRetryBlocked"` 逐值断言（store.ts）
 * 维度坐标：`reserveTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-308.md（脚本的唯一依据）
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

describe("UT-REPO-308 · reserveTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns UnsafeRetryBlocked when the recorded replay policy is not safe", async () => {
    const store = newStore();
    try {
      accept(store, task("t-308"));

      // 步骤 1：构造使 store.ts:470 的返回站点被到达的输入——先以 replay='never'
      //         预留同一条 tool call，再以同一 (task, op, id) 重放
      expect(store.reserveTool("t-308", "op", "tc-308", "name", "effect", "never")).toBe("Admitted");

      // 步骤 2：调用 reserveTool(…)
      const blocked = store.reserveTool("t-308", "op", "tc-308", "name", "effect", "safe");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(blocked).toBe("UnsafeRetryBlocked");
      expect(typeof blocked).toBe("string");
      // 阻塞路径不写任何东西：recovery_count 与行数都不变
      const row = store.db.prepare("SELECT recovery_count, state FROM tool_calls WHERE tool_call_id='tc-308'").get() as any;
      expect(row.recovery_count).toBe(0);
      expect(row.state).toBe("Reserved");
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t-308'").get() as any).tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
