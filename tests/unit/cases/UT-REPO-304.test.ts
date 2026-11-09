/**
 * Case ID: UT-REPO-304  ·  STATUS: real
 *
 * 责任：状态写 L471 → `db`（store.ts）
 * 维度坐标：`reserveTool` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-304.md（脚本的唯一依据）
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

describe("UT-REPO-304 · reserveTool · 持久化/序列化 × round-trip", () => {
  it("persists the recovery_count increment so a reopened database sees it", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-304-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:471 对 `db` 的写被执行的前置状态——一条 replay='safe'
      //         的已预留 tool call（重放同一 id 时走 recovery_count+1 那条 UPDATE）
      accept(store, task("t-304"));
      expect(store.reserveTool("t-304", "op", "tc-304", "name", "effect", "safe")).toBe("Admitted");
      const before = store.db.prepare("SELECT recovery_count FROM tool_calls WHERE tool_call_id='tc-304'").get() as any;
      expect(before.recovery_count).toBe(0);

      // 步骤 2：调用 reserveTool(…)（同一 task/op/id 重放）
      expect(store.reserveTool("t-304", "op", "tc-304", "name", "effect", "safe")).toBe("Admitted");
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        const row = reopened.db.prepare("SELECT * FROM tool_calls WHERE tool_call_id='tc-304'").get() as any;
        expect(row.recovery_count).toBe(1);
        expect(row.state).toBe("Reserved");
        expect(row.replay).toBe("safe");
        expect(row.recovery_contract_ref).toBeNull();
        expect(typeof row.updated_at).toBe("string");
        // 计数不因重放而重复增加
        expect((reopened.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
        expect((reopened.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t-304'").get() as any).tool_calls).toBe(1);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
