/**
 * Case ID: UT-REPO-391  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `注入字符` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-391.md（脚本的唯一依据）
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

describe("UT-REPO-391 · recordMatrixEvent · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores an injection-shaped event id verbatim and leaves the table intact", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造参数 event——穿越串 + SQL/命令元字符 + 控制字符
      const injected = "$evt/../../etc/passwd'; DROP TABLE matrix_events; --\u0007\u0001\r\n\t";

      // 步骤 2：调用 recordMatrixEvent(…)
      const inserted = store.recordMatrixEvent("!room:inj", injected, "@alice", "$txn-inj");

      // 步骤 3：断言——实现的真实语义：参数是绑定参数，注入串不执行、也不被拒绝，
      //         原样落库并返回 true；表结构与其它行不受影响
      expect(inserted).toBe(true);
      const row = store.db.prepare("SELECT room_id,event_id,sender FROM matrix_events").get() as any;
      expect(row.event_id).toBe(injected);
      expect(row.room_id).toBe("!room:inj");
      expect(row.sender).toBe("@alice");
      expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(1);
      expect(store.hasMatrixEvent("!room:inj", injected)).toBe(true);
      // 注入串没有执行：矩阵事件表仍在，且只有这一行
      const tables = (store.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='matrix_events'").all() as any[]);
      expect(tables).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
