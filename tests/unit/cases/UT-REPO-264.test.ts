/**
 * Case ID: UT-REPO-264  ·  STATUS: real
 *
 * 责任：参数 `op: string` 的 `空` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-264.md（脚本的唯一依据）
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

describe("UT-REPO-264 · terminalModel · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty operation id as a plain-text key that matches no attempt", async () => {
    const store = newStore();
    try {
      accept(store, task("t-264"));
      store.reserveModel("t-264", "op", "step", 1);

      // 步骤 1：按 `空` 类构造参数 op——''（空串）、undefined（缺省）、null（显式空值）三态；
      //         其余参数取合法等价类
      // 步骤 2：调用 terminalModel(…)
      const emptyStr = store.terminalModel("t-264", "", "step", 1);
      const explicitNull = store.terminalModel("t-264", null as never, "step", 1);
      let undefinedErr: any = null;
      try {
        store.terminalModel("t-264", undefined as never, "step", 1);
      } catch (e) {
        undefinedErr = e;
      }

      // 步骤 3：断言——实现无校验语句，也不抛 typed 错误：空串与 null 只是不匹配的 UPDATE 键
      //         （匹配 0 行、静默返回 undefined）；undefined 被 SQLite 绑定层拒绝，抛 TypeError
      //         而不是 PikoError
      expect(emptyStr).toBeUndefined();
      expect(explicitNull).toBeUndefined();
      expect(undefinedErr).not.toBeNull();
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefinedErr?.constructor?.name).not.toBe("PikoError");
      // 无状态写残留：原行的状态与 record_version 未变
      const row = store.db.prepare("SELECT state, record_version FROM model_attempts").get() as any;
      expect(row.state).toBe("Started");
      expect(row.record_version).toBe(1);
    } finally {
      store.close();
    }
  });

});
