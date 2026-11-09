/**
 * Case ID: UT-REPO-295  ·  STATUS: real
 *
 * 责任：参数 `replay: string` 的 `超长` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-295.md（脚本的唯一依据）
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
import { PikoError } from "../../../src/types.js";

describe("UT-REPO-295 · reserveTool · 字符串/路径/枚举输入 × 超长", () => {

  it("rejects an over-long replay value that is not one of the two allowed tokens", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 replay——长度 2×4096＝8192；其余参数取合法等价类
      accept(store, task("t-295"));
      const longReplay = "r".repeat(8192);

      // 步骤 2：调用 reserveTool(…)
      let err: any = null;
      try {
        store.reserveTool("t-295", "op", "id", "name", "effect", longReplay);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——实现的真实语义：replay 受表级 CHECK(replay IN('never','safe')) 约束，
      // 超长且非枚举值直接被 CHECK 拒绝（原生 SQLite 错误，非 PikoError），事务回滚不留行
      expect(err).toBeInstanceOf(Error);
      expect(String((err as Error).message)).toContain("CHECK constraint failed");
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT tool_calls FROM runs WHERE task_id='t-295'").get() as any).tool_calls).toBe(0);
    } finally {
      store.close();
    }
  });

});
