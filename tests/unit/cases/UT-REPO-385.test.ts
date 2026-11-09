/**
 * Case ID: UT-REPO-385  ·  STATUS: real
 *
 * 责任：状态写 L520 → `db`（store.ts）
 * 维度坐标：`recordProviderCall` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-385.md（脚本的唯一依据）
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

describe("UT-REPO-385 · recordProviderCall · 持久化/序列化 × round-trip", () => {

  it("persists the provider_calls row so a reopened database sees it", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-385-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:520 对 `db` 的写被执行的前置状态——一条已受理的 run
      accept(store, task("t1"));

      // 步骤 2：调用 recordProviderCall(…)
      store.recordProviderCall("t1", "op", 200, "rid", "note", 12);
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT * FROM provider_calls").get() as any;
        expect(row.task_id).toBe("t1");
        expect(row.operation_id).toBe("op");
        expect(row.status).toBe(200);
        expect(row.request_id).toBe("rid");
        expect(row.note).toBe("note");
        expect(row.latency_ms).toBe(12);
        expect(typeof row.ts).toBe("string");
        expect(row.ts.length).toBeGreaterThan(0);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
