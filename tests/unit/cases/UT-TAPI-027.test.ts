/**
 * Case ID: UT-TAPI-027  ·  STATUS: real
 *
 * 责任：参数 `max: number` 的 `恰好通过` 类（server.ts:13）
 * 维度坐标：`body` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-027.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ApiServer } from "../../../src/server.js";
import { BearerAuth } from "../../../src/auth.js";
import { TaskStore } from "../../../src/store.js";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";
import type { RuntimeConfig } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

function makeConfig(): RuntimeConfig {
  return {
    instance_id: "inst-1",
    listen: { host: "127.0.0.1", port: 0 },
    queue: { capacity: 10 },
  } as unknown as RuntimeConfig;
}

/** 起一个真服务器并给出 base URL。 */
async function withServer<T>(
  fn: (ctx: {
    url: string;
    server: ApiServer;
    store: TaskStore;
    config: RuntimeConfig;
    obs: Observability;
    onCancel?: (taskId: string, outcome: string) => void;
  }) => Promise<T>,
  options: { onCancel?: (taskId: string, outcome: string) => void; withObs?: boolean } = {},
): Promise<T> {
  const store = new TaskStore(":memory:", 1000);
  const config = makeConfig();
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

const AUTH = { authorization: "Bearer s3cret-token" };

const TASK = {
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
};

describe("UT-TAPI-027 · body · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts a body under the 2 MiB limit", async () => {
    // 步骤 1：起服务器
    await withServer(async ({ url }) => {
      // 步骤 2：POST 一个 ~1 KiB 的合法任务
      const res = await fetch(`${url}/tasks`, {
        method: "POST",
        headers: { ...AUTH, "content-type": "application/json" },
        body: JSON.stringify({ ...TASK, instruction: "x".repeat(1024) }),
      });

      // 步骤 3：断言未被体积上限拒绝
      expect(res.status).toBe(202);
    });
  });
});
