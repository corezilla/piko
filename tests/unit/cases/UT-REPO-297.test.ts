/**
 * Case ID: UT-REPO-297  ·  STATUS: real
 *
 * 责任：参数 `contract: string` 的 `空` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-297.md（脚本的唯一依据）
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

describe("UT-REPO-297 · reserveTool · 字符串/路径/枚举输入 × 空", () => {

  it("normalises a missing contract to SQL NULL and keeps an empty one as an empty string", async () => {
    const store = newStore();
    try {
      accept(store, task("t-297"));

      // 步骤 1：按 `空` 类构造参数 contract——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 reserveTool(…)
      store.reserveTool("t-297", "op-297", "id-none", "tool", "effect", "never");
      store.reserveTool("t-297", "op-297", "id-undef", "tool", "effect", "never", undefined as unknown as string);
      store.reserveTool("t-297", "op-297", "id-empty", "tool", "effect", "never", "");

      // 步骤 3：断言——实现的真实语义：`contract ?? null` 只把 null/undefined 变成 SQL NULL；
      //         空串是合法的非空值，原样落库
      const rows = store.db.prepare(
        "SELECT tool_call_id,recovery_contract_ref,typeof(recovery_contract_ref) t FROM tool_calls ORDER BY tool_call_id",
      ).all() as any[];
      expect(rows).toEqual([
        { tool_call_id: "id-empty", recovery_contract_ref: "", t: "text" },
        { tool_call_id: "id-none", recovery_contract_ref: null, t: "null" },
        { tool_call_id: "id-undef", recovery_contract_ref: null, t: "null" },
      ]);
    } finally {
      store.close();
    }
  });

});
