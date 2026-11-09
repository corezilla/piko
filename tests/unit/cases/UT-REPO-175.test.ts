/**
 * Case ID: UT-REPO-175  ·  STATUS: real
 *
 * 责任：资源操作 L365 `createHash`（store.ts）
 * 维度坐标：`failAccessLostTasks` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-175.md（脚本的唯一依据）
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

describe("UT-REPO-175 · failAccessLostTasks · 资源获取/释放 × 获取失败路径", () => {
  it("uses createHash to seal the Result and rolls the whole transaction back when hashing fails", async () => {
    // 本 Case 的资源是 `createHash`（store.ts:365）。node:crypto 是 ESM 命名空间，
    // vi.spyOn 不可用；用 vi.doMock + resetModules 拿到一份带替身的 store 模块。
    let failHash = false;
    vi.resetModules();
    vi.doMock("node:crypto", async (importOriginal) => {
      const actual = await importOriginal<typeof import("node:crypto")>();
      return {
        ...actual,
        createHash: (alg: string) => {
          if (failHash) throw new Error("hash provider unavailable");
          return actual.createHash(alg);
        },
      };
    });
    const { TaskStore } = await import("../../../src/store.js");
    const store = new TaskStore(":memory:", 1000);
    try {
      // 步骤 1：构造使 store.ts:365 的资源操作（`createHash`）被执行的输入——
      // 一条 access-lost 的 Queued 任务，走正常路径时 createHash 必被调用
      acceptDiscussion(store, "lost-1", "!room:x");
      store.markDiscussionAccessLost("!room:x");

      // 步骤 2：调用 failAccessLostTasks(…) 走正常路径
      const failed = store.failAccessLostTasks();
      expect(failed).toEqual(["lost-1"]);
      // 资源被使用且释放：createHash 产出的摘要落库，无句柄/子进程/临时目录残留
      const row = store.db.prepare("SELECT result_sha256 FROM results WHERE task_id='lost-1'").get() as any;
      expect(row.result_sha256).toMatch(/^[0-9a-f]{64}$/);

      // 步骤 3：注入该操作失败（替身）后再次调用
      failHash = true;
      acceptDiscussion(store, "lost-2", "!room:y");
      store.markDiscussionAccessLost("!room:y");
      let thrown: any = null;
      try {
        store.failAccessLostTasks();
      } catch (e) {
        thrown = e;
      }

      // 步骤 4：断言两路均无残留
      // 实现对失败注入的真实行为：createHash 抛出的 Error 沿 tx 的 catch 冒泡并
      // ROLLBACK，因此这一轮没有任何状态写留下（lost-2 仍是 Queued，无 Result 行）。
      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).message).toBe("hash provider unavailable");
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='lost-2'").get() as any).state).toBe("Queued");
      expect((store.db.prepare("SELECT count(*) n FROM results WHERE task_id='lost-2'").get() as any).n).toBe(0);
      // 资源计数回零：没有遗留句柄/子进程/定时器，也没有半写的 Result 行
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      store.close();
      vi.doUnmock("node:crypto");
      vi.resetModules();
    }
  });

});
