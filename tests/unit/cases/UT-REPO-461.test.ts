/**
 * Case ID: UT-REPO-461  ·  STATUS: real
 *
 * 责任：分支 L580 `typeof room === "string" && room.length > 0`（&&；store.ts）
 * 维度坐标：`discussionRoomsInUse` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-461.md（脚本的唯一依据）
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

describe("UT-REPO-461 · discussionRoomsInUse · 状态分支 × 合法迁移", () => {

  it("keeps only non-empty room ids of in-use discussion runs", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:580 的分支取真的输入——room_id 是非空字符串
      accept(store, discussionTask("d1", "!room:a"));

      // 步骤 2：调用 discussionRoomsInUse(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      const kept = store.discussionRoomsInUse();
      expect(kept).toEqual(["!room:a"]);

      // 步骤 3：构造使该分支取假的输入——room_id 为空串或不是字符串（无显式 else：取假即跳过该块，断言块内副作用不发生）
      accept(store, discussionTask("d2", ""));
      accept(store, discussionTask("d3", 123 as never));

      // 步骤 4：再次调用 discussionRoomsInUse(…) 并断言取假侧结果；两侧都必须被观测到
      const filtered = store.discussionRoomsInUse();
      expect(filtered).toEqual(["!room:a"]);
      // 取假侧无副作用：两条被滤掉的 run 仍原样存在
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(3);
    } finally {
      store.close();
    }
  });

});
