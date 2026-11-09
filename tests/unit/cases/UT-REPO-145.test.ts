/**
 * Case ID: UT-REPO-145  ·  STATUS: real
 *
 * 责任：状态写 L296 → `db`（store.ts）
 * 维度坐标：`setArtifactDelivery` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-145.md（脚本的唯一依据）
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

describe("UT-REPO-145 · setArtifactDelivery · 持久化/序列化 × round-trip", () => {

  it("round-trips the delivery through the artifact_delivery_json column", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理的 task 与一份合法的 delivery
      store.createOrGet(task("sad-145"), "slinky", 10);
      const delivery = {
        state: "partial" as const,
        delivered: [{ path: "/out/a", sha256: "aa", size_bytes: 3 }],
        failed: [{ path: "/out/b", error: "boom" }],
      };

      // 步骤 2：调用 setArtifactDelivery("sad-145", delivery)
      store.setArtifactDelivery("sad-145", delivery);

      // 步骤 3：断言逐值对账——列内容与入参 JSON 相同，getRun 读回同值
      const row = store.db
        .prepare("SELECT artifact_delivery_json FROM runs WHERE task_id=?")
        .get("sad-145") as any;
      expect(JSON.parse(row.artifact_delivery_json)).toEqual(delivery);
      expect(store.getRun("sad-145").artifact_delivery).toEqual(delivery);
    } finally {
      store.close();
    }
  });

});
