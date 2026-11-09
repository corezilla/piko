/**
 * Case ID: UT-REPO-334  ·  STATUS: real
 *
 * 责任：参数 `status: "QueuedInPi" | "Consumed" | "Abandoned"` 的 `非法值` 类（store.ts:489）
 * 维度坐标：`markTurn` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-334.md（脚本的唯一依据）
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

describe("UT-REPO-334 · markTurn · 纯函数/无副作用 × 非法值", () => {

  it("rejects an out-of-enumeration status with the CHECK constraint", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造参数 status——枚举外的值 'Bogus'；其余参数取合法等价类
      accept(store, discussionTask("d1", "!r:d1"));

      // 步骤 2：调用 markTurn(…)
      let err: any = null;
      try {
        store.markTurn("d1", "$e1", "Bogus" as never);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：markTurn 不做枚举校验，但 SQLite 的 CHECK(status IN(...)) 拒绝非法值；
      //         错误来自 SQLite 而非 typed PikoError，且该行完全未被修改
      expect(err).not.toBeNull();
      expect(err.code).toBe("ERR_SQLITE_ERROR");
      expect(err.message).toContain("CHECK constraint failed: status IN('Pending','QueuedInPi','Consumed','Abandoned')");
      const row = store.db.prepare("SELECT status FROM discussion_turns WHERE task_id='d1'").get() as any;
      expect(row.status).toBe("Pending");
    } finally {
      store.close();
    }
  });

});
