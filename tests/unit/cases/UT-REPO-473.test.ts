/**
 * Case ID: UT-REPO-473  ·  STATUS: real
 *
 * 责任：返回站点 L597 值 `(this.db.prepare("SELECT sync_cursor FR…` 逐值断言（store.ts）
 * 维度坐标：`matrixCursor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-473.md（脚本的唯一依据）
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

describe("UT-REPO-473 · matrixCursor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the stored sync cursor verbatim and null before any cursor is set", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:597 的返回站点被到达的输入——matrix_state 的 singleton 行
      //         由 migrate() 建好，sync_cursor 初值为 SQL NULL
      expect((store.db.prepare("SELECT sync_cursor FROM matrix_state WHERE singleton=1").get() as any).sync_cursor).toBeNull();

      // 步骤 2：调用 matrixCursor(…)
      const initial = store.matrixCursor();

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(initial).toBeNull();
      store.setMatrixCursor("s-1");
      expect(store.matrixCursor()).toBe("s-1");
      store.setMatrixCursor("s-2");
      expect(store.matrixCursor()).toBe("s-2");
      // 无未声明副作用：只读查询，matrix_state 仍然只有 singleton 一行
      expect((store.db.prepare("SELECT count(*) n FROM matrix_state").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
