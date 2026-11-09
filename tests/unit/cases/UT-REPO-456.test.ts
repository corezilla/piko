/**
 * Case ID: UT-REPO-456  ·  STATUS: real
 *
 * 责任：状态写 L57 → `db`（store.ts）
 * 维度坐标：`migrate` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-456.md（脚本的唯一依据）
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

describe("UT-REPO-456 · migrate · 持久化/序列化 × round-trip", () => {
  it("creates every schema table (idempotent on re-run)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:57 对 `db` 的写被执行的前置状态——newStore() 造出的全新内存库（构造器已调用过一次 migrate）
      // 步骤 2：调用 migrate（重复调用一次以验证幂等）
            const migrate = (store as unknown as { migrate(): void }).migrate.bind(store);
            migrate();
            migrate();
            const tables = (store.db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as any).map(
              (x: any) => x.name,
            );
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(tables).toEqual(
              expect.arrayContaining([
                "instance_meta",
                "tasks",
                "runs",
                "run_sessions",
                "execution_slot",
                "results",
                "model_attempts",
                "tool_calls",
                "matrix_state",
                "matrix_events",
                "discussion_turns",
                "matrix_sends",
                "audit_events",
                "discussion_access_loss",
                "provider_calls",
              ]),
            );
            // execution_slot 与 matrix_state 各有且仅有一行种子数据
            expect((store.db.prepare("SELECT count(*) n FROM execution_slot").get() as any).n).toBe(1);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_state").get() as any).n).toBe(1);
            expect((store.db.prepare("SELECT lease_epoch FROM execution_slot WHERE slot_id=1").get() as any).lease_epoch).toBe(0);
    } finally {
      store.close();
    }
  });

});
