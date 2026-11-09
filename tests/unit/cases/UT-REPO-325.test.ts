/**
 * Case ID: UT-REPO-325  ·  STATUS: real
 *
 * 责任：状态写 L484 → `db`（store.ts）
 * 维度坐标：`terminalTool` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-325.md（脚本的唯一依据）
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

describe("UT-REPO-325 · terminalTool · 持久化/序列化 × round-trip", () => {

  it("writes the terminal state and the refreshed timestamp onto the matched tool call", async () => {
    const store = newStore();
    try {
      accept(store, task("t-325"));
      store.reserveTool("t-325", "op-325", "id-325", "tool", "effect", "never");
      store.db.prepare("UPDATE tool_calls SET updated_at='2000-01-01T00:00:00.000Z'").run();

      // 步骤 1：构造使 store.ts:484 对 `db` 的写被执行的前置状态
      expect(
        (store.db.prepare("SELECT state,updated_at FROM tool_calls").get() as any),
      ).toEqual({ state: "Reserved", updated_at: "2000-01-01T00:00:00.000Z" });

      // 步骤 2：调用 terminalTool(…)
      store.terminalTool("t-325", "op-325", "id-325");

      // 步骤 3：读回权威事实源逐值对账写入语义——state 变 Terminal、updated_at 被刷新，
      //         其余列原样保留
      const row = store.db.prepare(
        "SELECT state,updated_at,tool_name,effect,replay,recovery_count FROM tool_calls",
      ).get() as any;
      expect(row.state).toBe("Terminal");
      expect(row.updated_at).not.toBe("2000-01-01T00:00:00.000Z");
      expect(new Date(row.updated_at).toISOString()).toBe(row.updated_at);
      expect(row.tool_name).toBe("tool");
      expect(row.effect).toBe("effect");
      expect(row.replay).toBe("never");
      expect(row.recovery_count).toBe(0);
    } finally {
      store.close();
    }
  });

});
