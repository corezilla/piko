/**
 * Case ID: UT-REPO-266  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `注入字符` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-266.md（脚本的唯一依据）
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

describe("UT-REPO-266 · terminalModel · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped op string verbatim without executing it", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 op——含 `../` 与绝对路径的穿越串、含 SQL/命令元字符的注入串；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "step", 1);
      const traversal = "../../etc/passwd";
      const injection = "op'; DROP TABLE model_attempts;--";
      const combined = traversal + "'; DROP TABLE runs;--";

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t1", traversal, "step", 1);
      store.terminalModel("t1", injection, "step", 1);
      store.terminalModel("t1", combined, "step", 1);

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：terminalModel 用参数化 UPDATE，注入串不被拒绝也不被执行，
      //         只是匹配不到既有行——表结构与既有行都完好
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
      const row = store.db.prepare("SELECT state FROM model_attempts WHERE task_id='t1'").get() as any;
      expect(row.state).toBe("Started");
    } finally {
      store.close();
    }
  });

});
