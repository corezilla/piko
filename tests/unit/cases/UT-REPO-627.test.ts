/**
 * Case ID: UT-REPO-627  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:795）
 * 维度坐标：`result` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-627.md（脚本的唯一依据）
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

describe("UT-REPO-627 · result · 字符串/路径/枚举输入 × 注入字符", () => {

  it("returns no result for an injection-shaped task id and keeps the tables", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 taskId——含 `../` 与绝对路径的穿越串、含 SQL/命令元字符的注入串、超长＋注入组合串；其余参数取合法等价类
      accept(store, task("t1"));
      const traversal = "../../etc/passwd";
      const injection = "t1'; DROP TABLE results;--";
      const combined = traversal + "'; DROP TABLE runs;--".repeat(100);

      // 步骤 2：调用 result(…)
      const errors: any[] = [];
      for (const id of [traversal, injection, combined]) {
        try {
          store.result(id);
        } catch (e) {
          errors.push(e);
        }
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：result 先查 results（查不到），再经 getRun 走 NotFound 分支——
      //         注入串不被拒绝也不被执行，只是查不到任何任务
      expect(errors).toHaveLength(3);
      for (const e of errors) {
        expect(e.code).toBe("NotFound");
        expect(e.status).toBe(404);
        expect(e.message).toBe("task not found");
      }
      // 无状态写/资源残留：results 与 runs 表都完好
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
