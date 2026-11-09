/**
 * Case ID: UT-REPO-061  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `每等价类合法值` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-061.md（脚本的唯一依据）
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

describe("UT-REPO-061 · createOrGet · 纯函数/无副作用 × 每等价类合法值", () => {

  it("accepts one representative of each legal TaskRequest shape", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 task: TaskRequest 的各合法等价类代表值（最小集／带 input_refs／
      // 带 artifact_target／带 discussion），其余参数取合法等价类
      const minimal = task("co-061-a");
      const withInputs = task("co-061-b", { input_refs: [{ source: "scp://host/in.txt" }] });
      const withTarget = task("co-061-c", {
        artifact_target: { method: "scp", target: "host:/out" },
      });
      const withDiscussion = discussionTask("co-061-d", "!room:061", "$evt061");

      // 步骤 2：逐个调用 createOrGet(task, principal, capacity)
      const outcomes = [
        store.createOrGet(minimal, "slinky", 10),
        store.createOrGet(withInputs, "slinky", 10),
        store.createOrGet(withTarget, "slinky", 10),
        store.createOrGet(withDiscussion, "slinky", 10),
      ];

      // 步骤 3：断言逐值对账——每个合法等价类都被受理，且带 discussion 的被开 intake
      expect(outcomes.map((o) => o.kind)).toEqual(["created", "created", "created", "created"]);
      expect(outcomes.map((o) => o.generation)).toEqual([1, 1, 1, 1]);
      expect(outcomes.map((o) => o.state)).toEqual(["Queued", "Queued", "Queued", "Queued"]);
      expect(outcomes.map((o) => o.task_id)).toEqual([
        "co-061-a",
        "co-061-b",
        "co-061-c",
        "co-061-d",
      ]);
      expect(store.getRun("co-061-b").input_staging.state).toBe("pending");
      expect(store.getRun("co-061-d").discussion_intake_state).toBe("Open");
    } finally {
      store.close();
    }
  });

});
