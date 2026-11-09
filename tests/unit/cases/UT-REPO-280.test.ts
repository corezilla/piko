/**
 * Case ID: UT-REPO-280  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-280.md（脚本的唯一依据）
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

describe("UT-REPO-280 · reserveTool · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an over-long task id verbatim instead of rejecting it", async () => {
    const store = newStore();
    try {
      const longId = "L".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      accept(store, task(longId));

      // 步骤 2：调用 reserveTool(…)
      const admitted = store.reserveTool(longId, "op", "tc-280", "name", "effect", "safe");

      // 步骤 3：断言——实现无长度校验：不抛 typed 错误，超长 id 原样落库；
      //         若该 id 并不存在，外键约束报的是 SQLite 原始错误而非 PikoError
      expect(admitted).toBe("Admitted");
      const row = store.db.prepare("SELECT length(task_id) lt, tool_call_id, state FROM tool_calls").get() as any;
      expect(row.lt).toBe(8192);
      expect(row.tool_call_id).toBe("tc-280");
      expect(row.state).toBe("Reserved");
      let fkErr: any = null;
      try {
        store.reserveTool("Z".repeat(8192), "op", "tc-280x", "name", "effect", "safe");
      } catch (e) {
        fkErr = e;
      }
      expect(fkErr).not.toBeNull();
      expect(fkErr?.code).toBe("ERR_SQLITE_ERROR");
      expect(fkErr?.constructor?.name).not.toBe("PikoError");
    } finally {
      store.close();
    }
  });

});
