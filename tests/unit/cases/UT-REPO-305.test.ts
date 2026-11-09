/**
 * Case ID: UT-REPO-305  ·  STATUS: real
 *
 * 责任：状态写 L476 → `db`（store.ts）
 * 维度坐标：`reserveTool` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-305.md（脚本的唯一依据）
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

describe("UT-REPO-305 · reserveTool · 持久化/序列化 × round-trip", () => {

  it("writes the Reserved tool call row exactly as the implementation composes it", async () => {
    const store = newStore();
    try {
      accept(store, task("t-305"));

      // 步骤 1：构造使 store.ts:476 对 `db` 的写被执行的前置状态
      expect(store.db.prepare("SELECT count(*) n FROM tool_calls").get()).toEqual({ n: 0 });

      // 步骤 2：调用 reserveTool(…)
      expect(store.reserveTool("t-305", "op-305", "id-305", "read_file", "read", "safe", "contract-305")).toBe("Admitted");

      // 步骤 3：读回权威事实源逐值对账写入语义——列序与实现 INSERT 的一致
      const row = store.db.prepare(
        "SELECT task_id,operation_id,tool_call_id,tool_name,effect,replay,recovery_contract_ref,state,recovery_count FROM tool_calls",
      ).get() as any;
      expect(row).toEqual({
        task_id: "t-305",
        operation_id: "op-305",
        tool_call_id: "id-305",
        tool_name: "read_file",
        effect: "read",
        replay: "safe",
        recovery_contract_ref: "contract-305",
        state: "Reserved",
        recovery_count: 0,
      });
      expect(typeof (store.db.prepare("SELECT updated_at FROM tool_calls").get() as any).updated_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
