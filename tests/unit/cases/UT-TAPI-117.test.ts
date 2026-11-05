/**
 * Case ID: UT-TAPI-117  ·  STATUS: real
 *
 * 责任：分支 L92 if : if (req.method === "GET" && get)（server.ts）
 * 维度坐标：`route` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-117.md（脚本的唯一依据）
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

describe("UT-TAPI-117 · route · 状态分支 × 合法迁移", () => {
  it("serves the task view route", async () => {
    // 步骤 1：起服务器并建任务
    await withServer(async ({ url }) => {
      await fetch(`${url}/tasks`, {
        method: "POST",
        headers: { ...AUTH, "content-type": "application/json" },
        body: JSON.stringify(TASK),
      });

      // 步骤 2：GET /tasks/t-1
      const res = await fetch(`${url}/tasks/t-1`, { headers: AUTH });

      // 步骤 3：断言返回的是 run 视图（含 task_id）
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.task_id).toBe("t-1");
    });
  });
});
