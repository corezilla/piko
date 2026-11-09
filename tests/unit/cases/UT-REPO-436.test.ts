/**
 * Case ID: UT-REPO-436  ·  STATUS: real
 *
 * 责任：返回站点 L545 值 `!!this.db.prepare("SELECT 1 FROM matrix…` 逐值断言（store.ts）
 * 维度坐标：`hasMatrixEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-436.md（脚本的唯一依据）
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

describe("UT-REPO-436 · hasMatrixEvent · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the boolean produced by the event lookup", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已登记的事件与一个未登记的 key
      store.recordMatrixEvent("!room:436", "$evt436", "sender");

      // 步骤 2：调用 hasMatrixEvent(...) 两次
      const present = store.hasMatrixEvent("!room:436", "$evt436");
      const absent = store.hasMatrixEvent("!room:436", "$missing");

      // 步骤 3：断言逐值对账——返回值是严格的布尔值，不是真值对象
      expect(present).toBe(true);
      expect(absent).toBe(false);
      expect(typeof present).toBe("boolean");
      expect(typeof absent).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
