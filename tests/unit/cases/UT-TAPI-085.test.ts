/**
 * Case ID: UT-TAPI-085  ·  STATUS: real
 *
 * 责任：参数 `onCancel` 的 `超长` 类（server.ts:50）
 * 维度坐标：`create` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-085.md（脚本的唯一依据）
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

function makeConfig(capacity = 10): RuntimeConfig {
  return {
    instance_id: "inst-1",
    listen: { host: "127.0.0.1", port: 0 },
    queue: { capacity },
  } as unknown as RuntimeConfig;
}

async function withServer<T>(
  fn: (ctx: {
    url: string;
    server: ApiServer;
    store: TaskStore;
    config: RuntimeConfig;
    obs: Observability;
    onCancel?: (taskId: string, outcome: string) => void;
  }) => Promise<T>,
  options: { onCancel?: (taskId: string, outcome: string) => void; withObs?: boolean; capacity?: number } = {},
): Promise<T> {
  const store = new TaskStore(":memory:", 1000);
  const config = makeConfig(options.capacity ?? 10);
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

describe("UT-TAPI-085 · create · 字符串/路径/枚举输入 × 超长", () => {
  it("invokes a long-named onCancel callback", async () => {
    // 步骤 1：起服务器并注入一个记录调用的 onCancel
    const calls: string[] = [];
    await withServer(async ({ url }) => {
      // 步骤 2：POST 一个任务再取消它
      await fetch(`${url}/tasks`, {
        method: "POST",
        headers: { ...AUTH, "content-type": "application/json" },
        body: JSON.stringify(TASK),
      });
      await fetch(`${url}/tasks/t-1:cancel`, { method: "POST", headers: AUTH });
    }, { onCancel: (taskId) => calls.push(taskId) });

    // 步骤 3：断言回调被调用且带上了 task_id
    expect(calls).toEqual(["t-1"]);
  });
});
