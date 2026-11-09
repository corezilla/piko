/**
 * Case ID: UT-REPO-381  ·  STATUS: real
 *
 * 责任：参数 `note: string` 的 `注入字符` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-381.md（脚本的唯一依据）
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

describe("UT-REPO-381 · recordProviderCall · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped note verbatim without executing it", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 note——含 `../` 与绝对路径的穿越串、含 SQL/命令元字符的注入串、超长＋注入组合串；其余参数取合法等价类
      accept(store, task("t1"));
      const traversal = "../../etc/passwd";
      const injection = "note'; DROP TABLE provider_calls;--";
      const combined = traversal + "'; DROP TABLE runs;--".repeat(100);

      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t1", "op1", 200, "rid1", traversal, 1);
      store.recordProviderCall("t1", "op2", 200, "rid2", injection, 2);
      store.recordProviderCall("t1", "op3", 200, "rid3", combined, 3);

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：recordProviderCall 用参数化 INSERT，注入串不被拒绝也不被执行，原样入库
      const rows = store.db.prepare("SELECT operation_id, note FROM provider_calls ORDER BY operation_id").all() as any[];
      expect(rows.map((r) => r.note)).toEqual([traversal, injection, combined]);
      // 表结构完好：provider_calls 与 runs 都还在
      expect((store.db.prepare("SELECT count(*) n FROM provider_calls").get() as any).n).toBe(3);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
