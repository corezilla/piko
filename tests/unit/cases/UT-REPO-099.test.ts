/**
 * Case ID: UT-REPO-099  ·  STATUS: real
 *
 * 责任：参数 `command: FencedRunCommand` 的 `每等价类合法值` 类（store.ts:232）
 * 维度坐标：`mutateRun` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-099.md（脚本的唯一依据）
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

describe("UT-REPO-099 · mutateRun · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts every legal equivalence class of the FencedRunCommand command", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `每等价类合法值` 类构造 command——FencedRunCommand 的每个可选等价类各取一个代表值：
      //         ① 最小合法（只给 expected_generation）；② 带 expected_state_in（取值含当前状态）；
      //         ③ 带 expected_lease_epoch（取值＝当前执行位的租约 epoch）。其余参数取合法等价类。
      accept(store, task("t-099c"));
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      accept(store, task("t-099a"));
      accept(store, task("t-099b"));

      type Fenced = Parameters<typeof store.mutateRun>[0];
      const minimal: Fenced = {
        task_id: "t-099a",
        expected_generation: 1,
        mutation: (r: any) => {
          r.state = "Running";
        },
      };
      const withState: Fenced = {
        task_id: "t-099b",
        expected_generation: 1,
        expected_state_in: ["Queued", "Running"],
        mutation: (r: any) => {
          r.state = "Running";
        },
      };
      const withLease: Fenced = {
        task_id: "t-099c",
        expected_generation: 1,
        expected_lease_epoch: grant.lease_epoch,
        mutation: (r: any) => {
          r.state = "Running";
        },
      };

      // 步骤 2：调用 mutateRun(…)（store.ts:232）
      const genMinimal = store.mutateRun(minimal);
      const genState = store.mutateRun(withState);
      const genLease = store.mutateRun(withLease);

      // 步骤 3：断言逐值对账——三个合法等价类都被接受，返回值均为「原 generation + 1」，
      //         且 mutation 的写入落库
      expect(genMinimal).toBe(2);
      expect(genState).toBe(2);
      expect(genLease).toBe(2);
      expect(store.generation("t-099a")).toBe(2);
      expect(store.generation("t-099b")).toBe(2);
      expect(store.generation("t-099c")).toBe(2);
      expect(store.getRun("t-099a").state).toBe("Running");
      expect(store.getRun("t-099b").state).toBe("Running");
      expect(store.getRun("t-099c").state).toBe("Running");
    } finally {
      store.close();
    }
  });

});
