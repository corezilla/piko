/**
 * Case ID: UT-REPO-632  ·  STATUS: real
 *
 * 责任：返回站点 L797 值 `JSON.parse(r.result_json)` 逐值断言（store.ts）
 * 维度坐标：`result` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-632.md（脚本的唯一依据）
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

describe("UT-REPO-632 · result · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the parsed result row with every field intact", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:797 的返回站点被到达的输入——一条已发布的结果
      accept(store, task("t-632"));
      const published = result("t-632", { summary: "all done", partial: true, stats: { model_calls: 2, tool_calls: 3, duration_ms: 42, outputs_count: 1, outputs_bytes: 7 } });
      store.finishQueued(published);

      // 步骤 2：调用 result(…)
      const loaded = store.result("t-632");

      // 步骤 3：断言返回值逐值对账——返回的是 result_json 的 JSON.parse 结果，逐字段一致
      expect(loaded).toEqual(JSON.parse(JSON.stringify(published)));
      expect(loaded.summary).toBe("all done");
      expect(loaded.partial).toBe(true);
      expect(loaded.stats).toEqual({ model_calls: 2, tool_calls: 3, duration_ms: 42, outputs_count: 1, outputs_bytes: 7 });
      expect(loaded.published_at).toBe("2026-11-09T00:00:00.000Z");
    } finally {
      store.close();
    }
  });

});
