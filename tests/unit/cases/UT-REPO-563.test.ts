/**
 * Case ID: UT-REPO-563  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:692）
 * 维度坐标：`rawUsage` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-563.md（脚本的唯一依据）
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

describe("UT-REPO-563 · rawUsage · 字符串/路径/枚举输入 × 注入字符", () => {

  it("returns an empty list for an injection-shaped task id and keeps the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 taskId——含 `../` 与绝对路径的穿越串、含 SQL/命令元字符的注入串、超长＋注入组合串；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "s1", 1);
      store.observeUsage("t1", "op", "s1", 1, rawUsageSample());
      const traversal = "../../etc/passwd";
      const injection = "t1'; DROP TABLE model_attempts;--";
      const combined = traversal + "'; DROP TABLE runs;--".repeat(100);

      // 步骤 2：调用 rawUsage(…)
      const results = [traversal, injection, combined].map((id) => store.rawUsage(id));

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：rawUsage 是参数化 SELECT，注入串不被拒绝也不被执行，只是匹配不到任何行
      for (const r of results) expect(r).toEqual([]);
      // 表结构完好：model_attempts 与 runs 都还在
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
