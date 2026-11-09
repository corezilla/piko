/**
 * Case ID: UT-REPO-401  ·  STATUS: real
 *
 * 责任：返回站点 L526 值 `x.changes === 1` 逐值断言（store.ts）
 * 维度坐标：`recordMatrixEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-401.md（脚本的唯一依据）
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

describe("UT-REPO-401 · recordMatrixEvent · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns true on the first record and false on the redelivery", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:526 的返回站点被到达的输入——同一 room/event 记录两次
      // 步骤 2：调用 recordMatrixEvent(…)
      const first = store.recordMatrixEvent("!r", "$e1", "@a:hs", "tx1");
      const second = store.recordMatrixEvent("!r", "$e1", "@a:hs", "tx1");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(first).toBe(true);
      expect(second).toBe(false);
      // 无未声明副作用：主键去重只留一行
      expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(1);
      expect(store.hasMatrixEvent("!r", "$e1")).toBe(true);
    } finally {
      store.close();
    }
  });

});
