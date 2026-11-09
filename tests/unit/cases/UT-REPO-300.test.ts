/**
 * Case ID: UT-REPO-300  ·  STATUS: real
 *
 * 责任：可选参数 `contract` 缺省/显式两态（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-300.md（脚本的唯一依据）
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

describe("UT-REPO-300 · reserveTool · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("treats an omitted and an explicitly-null contract the same way", async () => {
    const store = newStore();
    try {
      accept(store, task("t-300"));

      // 步骤 1：对可选参数 contract 构造三态——缺省（不传）、显式传 null、未知枚举值；
      //         三组输入各用一条独立的 tool call id
      // 步骤 2：分别调用 reserveTool(…)
      const omitted = store.reserveTool("t-300", "op", "tc-omit", "name", "effect", "safe");
      const explicitNull = store.reserveTool("t-300", "op", "tc-null", "name", "effect", "safe", null as never);
      const unknownEnum = store.reserveTool("t-300", "op", "tc-weird", "name", "effect", "safe", "not-a-ref" as never);

      // 步骤 3：断言——实现的真实语义：contract 走 `contract ?? null`，缺省态与显式 null
      //         同构（都落成 SQL NULL）；未知枚举值不被 typed 化拒绝，它只是被当成普通文本存下
      expect(omitted).toBe("Admitted");
      expect(explicitNull).toBe("Admitted");
      expect(unknownEnum).toBe("Admitted");
      const rows = store.db
        .prepare("SELECT tool_call_id, recovery_contract_ref FROM tool_calls ORDER BY tool_call_id")
        .all() as any[];
      expect(rows.map((r) => [r.tool_call_id, r.recovery_contract_ref])).toEqual([
        ["tc-null", null],
        ["tc-omit", null],
        ["tc-weird", "not-a-ref"],
      ]);
    } finally {
      store.close();
    }
  });

});
