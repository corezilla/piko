/**
 * Case ID: UT-REPO-299  ·  STATUS: real
 *
 * 责任：参数 `contract: string` 的 `注入字符` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-299.md（脚本的唯一依据）
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

describe("UT-REPO-299 · reserveTool · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped recovery contract ref as a bound parameter", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 contract——SQL 元字符 + 路径穿越串 + 控制字符
      accept(store, task("t-299"));
      const nasty = "'; DROP TABLE tool_calls;--\u0001../../etc";

      // 步骤 2：调用 reserveTool(…)
      const outcome = store.reserveTool("t-299", "op", "id", "name", "effect", "never", nasty);

      // 步骤 3：断言——参数化绑定：注入串被原样当作数据存下，tool_calls 表完好
      expect(outcome).toBe("Admitted");
      const row = store.db.prepare("SELECT recovery_contract_ref FROM tool_calls").get() as any;
      expect(row.recovery_contract_ref).toBe(nasty);
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
