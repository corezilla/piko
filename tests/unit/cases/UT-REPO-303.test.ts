/**
 * Case ID: UT-REPO-303  ·  STATUS: real
 *
 * 责任：分支 L478 `contract ?? null`（??；store.ts）
 * 维度坐标：`reserveTool` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-303.md（脚本的唯一依据）
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

describe("UT-REPO-303 · reserveTool · 状态分支 × 合法迁移", () => {

  it("writes SQL NULL when contract is omitted and the value when it is given", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:478 的分支（??：`contract ?? null`）取真的输入——contract 缺省
      accept(store, task("t-303"));

      // 步骤 2：调用 reserveTool(…) 并断言该侧可观测结果
      store.reserveTool("t-303", "op", "id-without-contract", "name", "effect", "never");

      // 步骤 3：断言取真侧——缺省契约写成 SQL NULL
      const withoutContract = store.db.prepare("SELECT recovery_contract_ref FROM tool_calls WHERE tool_call_id='id-without-contract'").get() as any;
      expect(withoutContract.recovery_contract_ref).toBeNull();

      // 步骤 4：断言取假侧——显式契约原样写入
      store.reserveTool("t-303", "op", "id-with-contract", "name", "effect", "never", "contract-ref-1");
      const withContract = store.db.prepare("SELECT recovery_contract_ref FROM tool_calls WHERE tool_call_id='id-with-contract'").get() as any;
      expect(withContract.recovery_contract_ref).toBe("contract-ref-1");
    } finally {
      store.close();
    }
  });

});
