/**
 * Case ID: UT-REPO-547  ·  STATUS: real
 *
 * 责任：返回站点 L671 值 `(this.db.prepare("SELECT generation FRO…` 逐值断言（store.ts）
 * 维度坐标：`generation` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-547.md（脚本的唯一依据）
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

describe("UT-REPO-547 · generation · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the generation stored in the run row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理的 run 与一次推进代次的变更
      store.createOrGet(task("gn-547"), "slinky", 10);
      const initial = store.generation("gn-547");
      store.mutateRun({
        task_id: "gn-547",
        expected_generation: 1,
        mutation: (r: any) => {
          r.state = "Running";
        },
      });

      // 步骤 2：调用 generation("gn-547")
      const current = store.generation("gn-547");

      // 步骤 3：断言逐值对账——受理时 generation=1，每次 mutateRun +1
      expect(initial).toBe(1);
      expect(current).toBe(2);
      expect(
        (store.db.prepare("SELECT generation FROM runs WHERE task_id=?").get("gn-547") as any).generation,
      ).toBe(2);
    } finally {
      store.close();
    }
  });

});
