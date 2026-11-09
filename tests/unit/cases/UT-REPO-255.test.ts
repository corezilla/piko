/**
 * Case ID: UT-REPO-255  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `+1 拒绝` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-255.md（脚本的唯一依据）
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

describe("UT-REPO-255 · observeUsage · 数值/长度上限参数 × +1 拒绝", () => {

  it("records nothing for an attempt one above the reserved one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 attempt 的 +1 拒绝类——已预留 attempt=1，调用 attempt=2
      store.createOrGet(task("ou-255"), "slinky", 10);
      store.reserveModel("ou-255", "op", "step", 1);

      // 步骤 2：调用 observeUsage("ou-255", "op", "step", 2, raw)
      store.observeUsage("ou-255", "op", "step", 2, rawUsageSample());

      // 步骤 3：断言逐值对账——UPDATE 不命中任何行，attempt=1 的行状态不变
      const rows = store.db.prepare("SELECT attempt,state,raw_usage_json FROM model_attempts").all() as any[];
      expect(rows).toHaveLength(1);
      expect(rows[0].attempt).toBe(1);
      expect(rows[0].state).toBe("Started");
      expect(rows[0].raw_usage_json).toBeNull();
    } finally {
      store.close();
    }
  });

});
