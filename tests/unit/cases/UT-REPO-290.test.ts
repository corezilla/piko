/**
 * Case ID: UT-REPO-290  ·  STATUS: real
 *
 * 责任：参数 `name: string` 的 `注入字符` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-290.md（脚本的唯一依据）
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

describe("UT-REPO-290 · reserveTool · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped tool name verbatim without executing it", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 name——含 `../` 与绝对路径的穿越串、含 SQL/命令元字符的注入串、超长＋注入组合串；其余参数取合法等价类
      accept(store, task("t1"));
      const traversal = "../../etc/passwd";
      const injection = "tool'; DROP TABLE tool_calls;--";
      const combined = traversal + "'; DROP TABLE runs;--".repeat(100);

      // 步骤 2：调用 reserveTool(…)
      store.reserveTool("t1", "op", "tc1", traversal, "effect", "never");
      store.reserveTool("t1", "op", "tc2", injection, "effect", "never");
      store.reserveTool("t1", "op", "tc3", combined, "effect", "never");

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：reserveTool 用参数化 INSERT，注入串不被拒绝也不被执行，原样入库
      const rows = store.db.prepare("SELECT tool_call_id, tool_name FROM tool_calls ORDER BY tool_call_id").all() as any[];
      expect(rows.map((r) => r.tool_name)).toEqual([traversal, injection, combined]);
      // 表结构完好：tool_calls 与 runs 都还在
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(3);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
