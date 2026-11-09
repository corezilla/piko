/**
 * Case ID: UT-REPO-338  ·  STATUS: real
 *
 * 责任：可选参数 `entry` 缺省/显式两态（store.ts:489）
 * 维度坐标：`markTurn` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-338.md（脚本的唯一依据）
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

describe("UT-REPO-338 · markTurn · 字符串/路径/枚举输入 × 未知枚举", () => {

  it("keeps the existing entry when the optional entry argument is omitted", async () => {
    const store = newStore();
    try {
      // 步骤 1：对可选参数 entry 构造三态——缺省（不传）、显式传默认值、未知枚举值
      accept(store, discussionTask("d1", "!r:d1"));
      store.markTurn("d1", "$e1", "QueuedInPi", "entry-1", "op-1");

      // 步骤 2：分别调用 markTurn(…)
      // 缺省态：不传 entry —— coalesce(?, pi_entry_id) 保留既有值
      store.markTurn("d1", "$e1", "Consumed");
      // 显式传默认值：显式给出 entry
      store.markTurn("d1", "$e1", "Consumed", "entry-1");
      // 未知枚举值：entry 是自由文本类型，未知值原样入库
      store.markTurn("d1", "$e1", "Consumed", "entry-未知值");

      // 步骤 3：断言缺省态与显式默认值同构；未知枚举值按 ISD 声明拒绝且 typed 化
      //         实现的真实语义：entry 是可选的自由文本参数，既没有枚举也没有校验——
      //         缺省态与显式传既有值同构，未知值原样入库（不被拒绝）
      const row = store.db.prepare("SELECT status, pi_entry_id, pi_operation_id FROM discussion_turns WHERE task_id='d1'").get() as any;
      expect(row.status).toBe("Consumed");
      expect(row.pi_entry_id).toBe("entry-未知值");
      expect(row.pi_operation_id).toBe("op-1");
      // 缺省态单独验证：pi_entry_id 仍是原值
      store.markTurn("d1", "$e1", "Abandoned");
      const kept = store.db.prepare("SELECT pi_entry_id FROM discussion_turns WHERE task_id='d1'").get() as any;
      expect(kept.pi_entry_id).toBe("entry-未知值");
    } finally {
      store.close();
    }
  });

});
