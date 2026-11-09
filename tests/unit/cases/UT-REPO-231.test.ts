/**
 * Case ID: UT-REPO-231  ·  STATUS: real
 *
 * 责任：状态写 L438 → `db`（store.ts）
 * 维度坐标：`reserveModel` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-231.md（脚本的唯一依据）
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

describe("UT-REPO-231 · reserveModel · 持久化/序列化 × round-trip", () => {

  it("bumps model_calls by exactly one and stamps last_activity_at", async () => {
    const store = newStore();
    try {
      accept(store, task("t-231"));

      // 步骤 1：构造使 store.ts:438 对 `db` 的写被执行的前置状态
      const before = store.db.prepare("SELECT model_calls,last_activity_at FROM runs WHERE task_id='t-231'").get() as any;
      expect(before).toEqual({ model_calls: 0, last_activity_at: null });

      // 步骤 2：调用 reserveModel(…)
      expect(store.reserveModel("t-231", "op-231", "step-231", 1)).toBe(true);

      // 步骤 3：读回权威事实源逐值对账写入语义——计数 +1、时间戳被刷新
      const after = store.db.prepare("SELECT model_calls,last_activity_at FROM runs WHERE task_id='t-231'").get() as any;
      expect(after.model_calls).toBe(1);
      expect(typeof after.last_activity_at).toBe("string");
      expect(new Date(after.last_activity_at).toISOString()).toBe(after.last_activity_at);
      // 幂等：同一 attempt 再预留不重复计数
      expect(store.reserveModel("t-231", "op-231", "step-231", 1)).toBe(true);
      expect(store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t-231'").get()).toEqual({ model_calls: 1 });
    } finally {
      store.close();
    }
  });

});
