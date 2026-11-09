/**
 * Case ID: UT-REPO-361  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:516）
 * 维度坐标：`discussionAccessLost` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-361.md（脚本的唯一依据）
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

describe("UT-REPO-361 · discussionAccessLost · 字符串/路径/枚举输入 × 空", () => {
  it("treats an empty task id as a plain-text key that matches no loss record", async () => {
    const store = newStore();
    try {
      acceptDiscussion(store, "t-361", "!room:361");

      // 步骤 1：按 `空` 类构造参数 taskId——''（空串）、undefined（缺省）、null（显式空值）三态；
      //         其余参数取合法等价类
      // 步骤 2：调用 discussionAccessLost(…)
      const emptyStr = store.discussionAccessLost("");
      const explicitNull = store.discussionAccessLost(null as never);
      let undefinedErr: any = null;
      try {
        store.discussionAccessLost(undefined as never);
      } catch (e) {
        undefinedErr = e;
      }

      // 步骤 3：断言——实现无校验语句，也不抛 typed 错误：空串与 null 只是不匹配的查询键
      //         （返回 false）；undefined 被 SQLite 绑定层拒绝，抛的是 TypeError 而不是 PikoError
      expect(emptyStr).toBe(false);
      expect(explicitNull).toBe(false);
      expect(undefinedErr).not.toBeNull();
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefinedErr?.constructor?.name).not.toBe("PikoError");
      // 无状态写残留
      expect((store.db.prepare("SELECT count(*) n FROM discussion_access_loss").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
