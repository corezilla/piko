/**
 * Case ID: UT-REPO-260  ·  STATUS: real
 *
 * 责任：状态写 L443 → `db`（store.ts）
 * 维度坐标：`observeUsage` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-260.md（脚本的唯一依据）
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

describe("UT-REPO-260 · observeUsage · 持久化/序列化 × round-trip", () => {

  it("round-trips the raw usage through the model_attempts row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已 reserve 的尝试与一份合法用量
      store.createOrGet(task("ou-260"), "slinky", 10);
      store.reserveModel("ou-260", "op", "step", 1);
      const raw = rawUsageSample({ input: 10, output: 5, totalTokens: 15, cacheRead: 2, cacheWrite: 3 });

      // 步骤 2：调用 observeUsage("ou-260", "op", "step", 1, raw)
      store.observeUsage("ou-260", "op", "step", 1, raw);

      // 步骤 3：断言逐值对账——列内容是 raw 的 JSON；state 转 UsageObserved、
      // record_version 由 1 推进到 2；updated_at 被刷新
      const row = store.db
        .prepare("SELECT state,raw_usage_json,record_version,updated_at FROM model_attempts")
        .get() as any;
      expect(row.state).toBe("UsageObserved");
      expect(JSON.parse(row.raw_usage_json)).toEqual(raw);
      expect(row.record_version).toBe(2);
      expect(typeof row.updated_at).toBe("string");
      expect(store.rawUsage("ou-260")).toEqual([raw]);
    } finally {
      store.close();
    }
  });

});
