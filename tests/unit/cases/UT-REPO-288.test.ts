/**
 * Case ID: UT-REPO-288  ·  STATUS: real
 *
 * 责任：参数 `name: string` 的 `空` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-288.md（脚本的唯一依据）
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

describe("UT-REPO-288 · reserveTool · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty tool name and stores it verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-288"));

      // 步骤 1：按 `空` 类构造参数 name——''（空串）、undefined（缺省）、null（显式空值）三态；
      //         其余参数取合法等价类
      // 步骤 2：调用 reserveTool(…)
      const emptyStr = store.reserveTool("t-288", "op", "tc-empty", "", "effect", "safe");
      let nullErr: any = null;
      try {
        store.reserveTool("t-288", "op", "tc-null", null as never, "effect", "safe");
      } catch (e) {
        nullErr = e;
      }
      let undefinedErr: any = null;
      try {
        store.reserveTool("t-288", "op", "tc-undef", undefined as never, "effect", "safe");
      } catch (e) {
        undefinedErr = e;
      }

      // 步骤 3：断言——实现无校验语句，也不抛 typed 错误：空串原样落库（空串不是 NULL，
      //         NOT NULL 约束放行）；null 与 undefined 分别被 NOT NULL 约束和 SQLite
      //         绑定层挡下，抛的都是原始错误而不是 PikoError
      expect(emptyStr).toBe("Admitted");
      expect(nullErr).not.toBeNull();
      expect(nullErr?.code).toBe("ERR_SQLITE_ERROR");
      expect(nullErr?.constructor?.name).not.toBe("PikoError");
      expect(undefinedErr).not.toBeNull();
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefinedErr?.constructor?.name).not.toBe("PikoError");
      const rows = store.db
        .prepare("SELECT tool_call_id, tool_name FROM tool_calls ORDER BY tool_call_id")
        .all() as any[];
      expect(rows.map((r) => [r.tool_call_id, r.tool_name])).toEqual([["tc-empty", ""]]);
      // 失败的两次调用没有留下计数残留
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t-288'").get() as any).tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
