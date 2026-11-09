/**
 * Case ID: UT-REPO-581  ·  STATUS: real
 *
 * 责任：返回站点 L734 值 `actions` 逐值断言（store.ts）
 * 维度坐标：`knownActions` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-581.md（脚本的唯一依据）
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

describe("UT-REPO-581 · knownActions · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the aggregated actions array", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:734 的返回站点被到达的输入——三类记录各一条
      accept(store, task("t1"));
      store.reserveModel("t1", "op1", "step1", 1);
      store.reserveTool("t1", "op1", "tc1", "read_file", "read", "safe");
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 knownActions
            const actions = store.knownActions("t1");
      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
            expect(Array.isArray(actions)).toBe(true);
            expect(actions.length).toBe(3);
            expect(actions.map((a) => a.kind)).toEqual(["ModelCall", "ToolCall", "MatrixSend"]);
            for (const a of actions) {
              expect(Object.keys(a).sort()).toEqual(["description", "kind", "status"]);
              expect(["Completed", "InProgress", "Unknown"]).toContain(a.status);
            }
            // 纯读：无状态写
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
