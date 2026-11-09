/**
 * Case ID: UT-REPO-392  ·  STATUS: real
 *
 * 责任：参数 `sender: string` 的 `空` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-392.md（脚本的唯一依据）
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

describe("UT-REPO-392 · recordMatrixEvent · 字符串/路径/枚举输入 × 空", () => {

  it("silently ignores a null sender and accepts an empty one", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 sender——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 recordMatrixEvent(…)
      let undefinedErr: any = null;
      try {
        store.recordMatrixEvent("room-392", "$e-1", undefined as unknown as string);
      } catch (e) {
        undefinedErr = e;
      }
      const nullSender = store.recordMatrixEvent("room-392", "$e-2", null as unknown as string);
      const empty = store.recordMatrixEvent("room-392", "$e-3", "");

      // 步骤 3：断言——实现的真实语义：undefined 被绑定层拒绝（TypeError）；
      //         null 撞 matrix_events.sender 的 NOT NULL 约束，但 INSERT OR IGNORE
      //         把这次违反变成"忽略"，所以既不抛错也不落行，返回 false；
      //         空串是合法的非空 sender，原样落库并返回 true
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.message).toMatch(/cannot be bound to SQLite parameter/);
      expect(nullSender).toBe(false);
      expect(empty).toBe(true);
      const rows = store.db.prepare("SELECT event_id,sender FROM matrix_events").all() as any[];
      expect(rows).toEqual([{ event_id: "$e-3", sender: "" }]);
    } finally {
      store.close();
    }
  });

});
