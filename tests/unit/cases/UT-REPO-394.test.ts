/**
 * Case ID: UT-REPO-394  ·  STATUS: real
 *
 * 责任：参数 `sender: string` 的 `注入字符` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-394.md（脚本的唯一依据）
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

describe("UT-REPO-394 · recordMatrixEvent · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped sender as a bound parameter", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 sender——SQL 元字符 + 路径穿越串 + 控制字符
      accept(store, task("t-394"));
      const nasty = "'; DROP TABLE matrix_events;--\u0001../../etc";

      // 步骤 2：调用 recordMatrixEvent(…)
      const inserted = store.recordMatrixEvent("!room:394", "$evt-394", nasty);

      // 步骤 3：断言——参数化绑定：注入串被原样当作数据存下，matrix_events 表与 runs 表完好
      expect(inserted).toBe(true);
      const row = store.db.prepare("SELECT sender FROM matrix_events").get() as any;
      expect(row.sender).toBe(nasty);
      expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
