/**
 * Case ID: UT-REPO-457  ·  STATUS: real
 *
 * 责任：状态写 L167 → `db`（store.ts）
 * 维度坐标：`migrate` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-457.md（脚本的唯一依据）
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

describe("UT-REPO-457 · migrate · 持久化/序列化 × round-trip", () => {
  it("stamps PRAGMA user_version = 3", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:167 对 `db` 的写被执行的前置状态——newStore() 造出的全新内存库（构造器已调用过一次 migrate）
      // 步骤 2：调用 migrate
            const migrate = (store as unknown as { migrate(): void }).migrate.bind(store);
            migrate();
            const version = store.db.prepare("PRAGMA user_version").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(version.user_version).toBe(3);
            // 幂等：再次 migrate 不改变版本号
            migrate();
            expect((store.db.prepare("PRAGMA user_version").get() as any).user_version).toBe(3);
    } finally {
      store.close();
    }
  });

});
