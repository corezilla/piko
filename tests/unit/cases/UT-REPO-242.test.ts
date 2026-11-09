/**
 * Case ID: UT-REPO-242  ·  STATUS: real
 *
 * 责任：状态写 L46 → `this.db`（store.ts）
 * 维度坐标：`TaskStore.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-242.md（脚本的唯一依据）
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

describe("UT-REPO-242 · TaskStore.constructor · 状态分支 × 合法迁移", () => {
  it("assigns the opened DatabaseSync to this.db", async () => {
      // 步骤 1：构造使 store.ts:46 对 `this.db` 的写被执行的前置状态——path 取合法等价类
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore(":memory:", 1000)
        store = new TaskStore(":memory:", 1000);

        // 步骤 3：断言——对象状态直接读：this.db 是一条可用的 SQLite 连接
        expect(store.db).toBeTruthy();
        expect(typeof store.db.exec).toBe("function");
        expect(typeof store.db.prepare).toBe("function");
        const dblist = store.db.prepare("PRAGMA database_list").get() as any;
        expect(dblist.name).toBe("main");
      } finally {
        if (store) store.close();
      }
  });

});
