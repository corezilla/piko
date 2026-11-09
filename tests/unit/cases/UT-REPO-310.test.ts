/**
 * Case ID: UT-REPO-310  ·  STATUS: real
 *
 * 责任：返回站点 L480 值 `"Admitted"` 逐值断言（store.ts）
 * 维度坐标：`reserveTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-310.md（脚本的唯一依据）
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

describe("UT-REPO-310 · reserveTool · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the literal string Admitted on the fresh-reserve path", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:480 的返回站点被到达的输入——一条尚无同名 tool_call 的任务
      accept(store, task("t1"));

      // 步骤 2：调用 reserveTool(…)
      const outcome = store.reserveTool("t1", "op", "tc1", "name", "effect", "never");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(outcome).toBe("Admitted");
      expect(typeof outcome).toBe("string");
      // 无未声明副作用：确实落了行，且只落一行
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t1'").get() as any).tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
