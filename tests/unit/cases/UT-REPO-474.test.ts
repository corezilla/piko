/**
 * Case ID: UT-REPO-474  ·  STATUS: real
 *
 * 责任：参数 `cursor: string` 的 `空` 类（store.ts:599）
 * 维度坐标：`setMatrixCursor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-474.md（脚本的唯一依据）
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

describe("UT-REPO-474 · setMatrixCursor · 字符串/路径/枚举输入 × 空", () => {
  it("stores an empty cursor as an empty string and a null cursor as SQL NULL, rejecting undefined at the binder", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 cursor——''（空串）、null（显式空值）、undefined（缺省）三态
      // 步骤 2：调用 setMatrixCursor(…)
      store.setMatrixCursor("");

      // 步骤 3：断言——实现的真实语义：setMatrixCursor 零校验，
      //         空串原样落库、null 落成 SQL NULL；undefined 被 SQLite 绑定层拒绝，
      //         且该次失败不写入任何值
      expect(store.matrixCursor()).toBe("");
      store.setMatrixCursor(null as never);
      expect(store.matrixCursor()).toBeNull();
      let err: any = null;
      try {
        store.setMatrixCursor(undefined as never);
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(TypeError);
      expect(String(err.message)).toContain("cannot be bound to SQLite parameter");
      // 失败的调用没有留下半写状态
      expect(store.matrixCursor()).toBeNull();
    } finally {
      store.close();
    }
  });

});
