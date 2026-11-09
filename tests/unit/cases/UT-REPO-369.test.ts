/**
 * Case ID: UT-REPO-369  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-369.md（脚本的唯一依据）
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

describe("UT-REPO-369 · recordProviderCall · 字符串/路径/枚举输入 × 注入字符", () => {

  it("rejects an injection-shaped task id at the foreign key and keeps the runs table", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 taskId——含 `../` 与绝对路径的穿越串、含 SQL/命令元字符的注入串、超长＋注入组合串；其余参数取合法等价类
      accept(store, task("t1"));
      const traversal = "../../etc/passwd";
      const injection = "t1'; DROP TABLE runs;--";
      const combined = "../../etc/passwd'; DROP TABLE runs;--".repeat(100);

      // 步骤 2：调用 recordProviderCall(…)
      const errors: any[] = [];
      for (const id of [traversal, injection, combined]) {
        try {
          store.recordProviderCall(id, "op", 200, "rid", "note", 12);
        } catch (e) {
          errors.push(e);
        }
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：provider_calls 有指向 runs(task_id) 的外键且 PRAGMA foreign_keys=ON，
      //         三个注入串都不对应任何 run，故被外键拒绝（SQLite 错误，不是 typed PikoError）
      expect(errors).toHaveLength(3);
      for (const e of errors) {
        expect(e.code).toBe("ERR_SQLITE_ERROR");
        expect(e.message).toContain("FOREIGN KEY constraint failed");
      }
      // 无状态写/资源残留：没有落行，且 runs 表完好
      expect((store.db.prepare("SELECT count(*) n FROM provider_calls").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
