/**
 * Case ID: UT-REPO-309  ·  STATUS: real
 *
 * 责任：返回站点 L474 值 `"Admitted"` 逐值断言（store.ts）
 * 维度坐标：`reserveTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-309.md（脚本的唯一依据）
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

describe("UT-REPO-309 · reserveTool · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the literal Admitted from the existing-row branch of a safe replay", async () => {
    const store = newStore();
    try {
      accept(store, task("t-309"));
      store.reserveTool("t-309", "op-309", "id-309", "tool", "effect", "safe");

      // 步骤 1：构造使 store.ts:474 的返回站点被到达的输入——已有行且 replay='safe'
      // 步骤 2：调用 reserveTool(…)
      const returned = store.reserveTool("t-309", "op-309", "id-309", "tool", "effect", "safe");

      // 步骤 3：断言返回值逐值对账——该站点返回字符串 "Admitted"（不是对象），
      //         且副作用只有 recovery_count +1，没有新行、没有 tool_calls 计数增长
      expect(returned).toBe("Admitted");
      expect(typeof returned).toBe("string");
      expect(store.db.prepare("SELECT count(*) n FROM tool_calls").get()).toEqual({ n: 1 });
      expect(store.db.prepare("SELECT recovery_count FROM tool_calls").get()).toEqual({ recovery_count: 1 });
      expect(store.getRun("t-309").progress.tool_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
