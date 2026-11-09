/**
 * Case ID: UT-REPO-102  ·  STATUS: real
 *
 * 责任：分支 L235 `!r`（!；store.ts）
 * 维度坐标：`mutateRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-102.md（脚本的唯一依据）
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

describe("UT-REPO-102 · mutateRun · 状态分支 × 合法迁移", () => {

  it("throws NotFound for an unknown task and mutates a known one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:235 的分支（!：`!r`）取真的输入——task_id 对应不存在的 run
      accept(store, task("known-102"));

      // 步骤 2：调用 mutateRun(…)，断言该侧可观测结果
      let notFound: any = null;
      try {
        store.mutateRun({ task_id: "missing-102", expected_generation: 1, mutation: () => {} });
      } catch (e) {
        notFound = e;
      }

      // 步骤 3：断言取真侧——未知 task 抛 typed NotFound，且无任何状态写
      expect(notFound).toBeInstanceOf(PikoError);
      expect((notFound as any).code).toBe("NotFound");
      expect((notFound as any).status).toBe(404);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
      expect(store.generation("known-102")).toBe(1);

      // 步骤 4：断言取假侧——存在的 run 跳过该块，mutation 生效且 generation 自增
      const generation = store.mutateRun({
        task_id: "known-102",
        expected_generation: 1,
        mutation: (r: any) => {
          r.state = "Running";
        },
      });
      expect(generation).toBe(2);
      expect(store.getRun("known-102").state).toBe("Running");
      expect(store.generation("known-102")).toBe(2);
    } finally {
      store.close();
    }
  });

});
