/**
 * Case ID: UT-REPO-379  ·  STATUS: real
 *
 * 责任：参数 `note: string` 的 `空` 类（store.ts:519）
 * 维度坐标：`recordProviderCall` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-379.md（脚本的唯一依据）
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

describe("UT-REPO-379 · recordProviderCall · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty note and stores it verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-379"));

      // 步骤 1：按 `空` 类构造参数 note——''（空串）、undefined（缺省）、null（显式空值）三态；
      //         其余参数取合法等价类
      // 步骤 2：调用 recordProviderCall(…)
      const emptyStr = store.recordProviderCall("t-379", "op-1", 200, "req-1", "", 12);
      const explicitNull = store.recordProviderCall("t-379", "op-2", 200, "req-2", null as never, 12);
      let undefinedErr: any = null;
      try {
        store.recordProviderCall("t-379", "op-3", 200, "req-3", undefined as never, 12);
      } catch (e) {
        undefinedErr = e;
      }

      // 步骤 3：断言——实现无校验语句，也不抛 typed 错误：空串原样落库，null 落成 SQL NULL，
      //         undefined 被 SQLite 绑定层拒绝（抛 TypeError 而不是 PikoError）
      expect(emptyStr).toBeUndefined();
      expect(explicitNull).toBeUndefined();
      expect(undefinedErr).not.toBeNull();
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefinedErr?.constructor?.name).not.toBe("PikoError");
      const rows = store.db.prepare("SELECT operation_id, note FROM provider_calls ORDER BY operation_id").all() as any[];
      expect(rows).toEqual([
        { operation_id: "op-1", note: "" },
        { operation_id: "op-2", note: null },
      ]);
    } finally {
      store.close();
    }
  });

});
