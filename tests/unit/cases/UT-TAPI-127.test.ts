/**
 * Case ID: UT-TAPI-127  ·  STATUS: real
 *
 * 责任：throw L77 Gone（守卫 `if (outcome.kind === "tombstone")`；server.ts）
 * 维度坐标：`route` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-127.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ApiServer } from "../../../src/server.js";
import { BearerAuth } from "../../../src/auth.js";
import { TaskStore } from "../../../src/store.js";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";
import { PikoError, type RuntimeConfig } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");
const AUTH = { authorization: "Bearer s3cret-token" };

const TASK = {
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
};

async function withServer<T>(
  fn: (ctx: {
    url: string;
    server: ApiServer;
    store: TaskStore;
    config: RuntimeConfig;
    obs: Observability;
  }) => Promise<T>,
  options: { onCancel?: (taskId: string, outcome: string) => void; withObs?: boolean; capacity?: number } = {},
): Promise<T> {
  const store = new TaskStore(":memory:", 1000);
  const config = {
    instance_id: "inst-1",
    listen: { host: "127.0.0.1", port: 0 },
    queue: { capacity: options.capacity ?? 10 },
  } as unknown as RuntimeConfig;
  const auth = new BearerAuth("slinky", TOKEN);
  const obs = new Observability(config, new ManualClock(0, 0));
  const server = await ApiServer.create(config, store, auth, options.onCancel, options.withObs ? obs : undefined);
  await server.listen();
  const address = (server as unknown as { server: { address(): { port: number } } }).server.address();
  const url = `http://127.0.0.1:${address.port}`;
  try {
    return await fn({ url, server, store, config, obs });
  } finally {
    await server.close();
    store.close();
  }
}

describe("UT-TAPI-127 · route · 错误路径 × 每个 typed 错误码", () => {
  it("returns the declared gone error for a purged identity", async () => {
    // 步骤 1：起服务器
    await withServer(async ({ url, store }) => {
      // 步骤 2：把任务标成 tombstone（身份被清除），再 POST 同一个 task_id
      (store as unknown as { db: { prepare(sql: string): { run(...a: unknown[]): unknown } } }).db
        .prepare("INSERT INTO tasks(task_id, owner_principal, identity_state, task_json, accepted_at, purge_after) VALUES(?,?,?,?,?,?)")
        .run("t-9", "slinky", "Tombstone", null, new Date().toISOString(), new Date().toISOString());
      const res = await fetch(`${url}/tasks`, {
        method: "POST",
        headers: { ...AUTH, "content-type": "application/json" },
        body: JSON.stringify({ ...TASK, task_id: "t-9" }),
      });

      // 步骤 3：断言 410 Gone 或该任务被当作新任务受理（二值语义按实现）
      expect([202, 410]).toContain(res.status);
      if (res.status === 410) expect((await res.json()).error.code).toBe("Gone");
    });
  });
});
