/**
 * Case ID: UT-REPO-476  ·  STATUS: real
 *
 * 责任：参数 `cursor: string` 的 `注入字符` 类（store.ts:599）
 * 维度坐标：`setMatrixCursor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-476.md（脚本的唯一依据）
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

describe("UT-REPO-476 · setMatrixCursor · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injected cursor verbatim and leaves the schema intact", async () => {
    const store = newStore();
    try {
      const injected = "c'; DROP TABLE runs;--";

      // 步骤 1：按 `注入字符` 类构造参数 cursor——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 setMatrixCursor(…)
      store.setMatrixCursor(injected);

      // 步骤 3：断言——实现的真实语义：cursor 是绑定参数，注入串不构成 SQL，
      //         原样落库，runs 表完好
      expect(store.matrixCursor()).toBe(injected);
      expect(store.db.prepare("SELECT sync_cursor FROM matrix_state").get()).toEqual({ sync_cursor: injected });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
