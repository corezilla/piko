/**
 * Case ID: UT-REPO-084  ·  STATUS: real
 *
 * 责任：状态写 L198 → `db`（store.ts）
 * 维度坐标：`createOrGet` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-084.md（脚本的唯一依据）
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

describe("UT-REPO-084 · createOrGet · 持久化/序列化 × round-trip", () => {

  it("persists the tasks row written at the acceptance site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条合法的 task 与 principal
      const definition = task("co-084", { instruction: "write the report" });

      // 步骤 2：调用 createOrGet(...)
      store.createOrGet(definition, "slinky", 10);

      // 步骤 3：断言逐值对账——tasks 行落库且字段与入参一致，purge_after 落在 7 天后
      const row = store.db.prepare("SELECT * FROM tasks WHERE task_id=?").get("co-084") as any;
      expect(row.task_id).toBe("co-084");
      expect(row.owner_principal).toBe("slinky");
      expect(row.identity_state).toBe("Active");
      expect(JSON.parse(row.task_json)).toEqual(JSON.parse(JSON.stringify(definition)));
      expect(typeof row.accepted_at).toBe("string");
      expect(Date.parse(row.purge_after)).toBeGreaterThan(Date.now());
      expect(Date.parse(row.purge_after)).toBeLessThanOrEqual(Date.now() + 7 * 864e5 + 1000);
    } finally {
      store.close();
    }
  });

});
