/**
 * Case ID: UT-REPO-585  ·  STATUS: real
 *
 * 责任：状态写 L741 → `db`（store.ts）
 * 维度坐标：`insertResult` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-585.md（脚本的唯一依据）
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

describe("UT-REPO-585 · insertResult · 持久化/序列化 × round-trip", () => {
  it("writes the result row with its json, sha256 digest and published_at", async () => {
    const store = newStore();
    try {
      accept(store, task("t-585"));

      // 步骤 1：构造使 store.ts:741 对 `db` 的写被执行的前置状态——
      //         一个 generation=1、published_at 固定的合法 AgentResult
      const published = result("t-585");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);

      // 步骤 2：调用 insertResult(…)——写已发生（权威事实源里能看到新值）
      (store as any).insertResult(published);

      // 步骤 3：读回权威事实源逐值对账写入语义
      const row = store.db.prepare("SELECT task_id,generation,result_json,result_sha256,published_at FROM results WHERE task_id='t-585'").get() as any;
      expect(row.task_id).toBe("t-585");
      expect(row.generation).toBe(1);
      expect(row.published_at).toBe("2026-11-09T00:00:00.000Z");
      // result_json 是该 Result 的原样序列化
      expect(JSON.parse(row.result_json)).toEqual(JSON.parse(JSON.stringify(published)));
      expect(JSON.parse(row.result_json).state).toBe("Completed");
      // result_sha256 是 result_json 的 sha256 摘要
      expect(row.result_sha256).toMatch(/^[0-9a-f]{64}$/);
      const { createHash } = await import("node:crypto");
      expect(row.result_sha256).toBe(createHash("sha256").update(row.result_json).digest("hex"));
    } finally {
      store.close();
    }
  });

});
