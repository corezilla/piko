/**
 * Case ID: UT-REPO-642  ·  STATUS: real
 *
 * 责任：状态写 L819 → `db`（store.ts）
 * 维度坐标：`purge` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-642.md（脚本的唯一依据）
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

describe("UT-REPO-642 · purge · 持久化/序列化 × round-trip", () => {
  it("deletes the child rows keyed by task_id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:819 对 `db` 的写被执行的前置状态——一条带子记录的任务
      accept(store, task("t1"));
      store.reserveModel("t1", "op1", "step1", 1);
      store.reserveTool("t1", "op1", "tc1", "read_file", "read", "safe");
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      const before = store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any;
      // 步骤 2：调用 purge
            store.purge({ task_id: "t1" });
            const after = store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any;
            const sends = store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any;
            const tools = store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(before.n).toBe(1);
            expect(after.n).toBe(0);
            expect(sends.n).toBe(0);
            expect(tools.n).toBe(0);
    } finally {
      store.close();
    }
  });

});
