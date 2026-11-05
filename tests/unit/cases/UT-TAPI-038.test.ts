/**
 * Case ID: UT-TAPI-038  ·  STATUS: real
 *
 * 责任：参数 `error` 的 `非法值` 类（server.ts:139）
 * 维度坐标：`mapError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-038.md（脚本的唯一依据）
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

/** 起一个真服务器并给出 base URL。 */
async function withServer<T>(
  fn: (ctx: {
    url: string;
    server: ApiServer;
    store: TaskStore;
    config: RuntimeConfig;
    obs: Observability;
  }) => Promise<T>,
  options: { onCancel?: (taskId: string, outcome: string) => void; withObs?: boolean } = {},
): Promise<T> {
  const store = new TaskStore(":memory:", 1000);
  const config = {
    instance_id: "inst-1",
    listen: { host: "127.0.0.1", port: 0 },
    queue: { capacity: 10 },
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

describe("UT-TAPI-038 · mapError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("never leaks an internal fence code to the client", async () => {
    // 步骤 1：起服务器
    await withServer(async ({ url }) => {
      // 步骤 2：POST 一个必填字段缺失的任务 → schema 校验失败
      const res = await fetch(`${url}/tasks`, {
        method: "POST",
        headers: { ...AUTH, "content-type": "application/json" },
        body: JSON.stringify({ task_id: "t-2" }),
      });

      // 步骤 3：断言错误码在公开目录内（不是 FencedWrite/LeaseLost 这类内部围栏）
      const body = await res.json();
      expect(["InvalidRequest", "Unauthorized", "ScopeDenied", "NotFound", "Gone", "TaskConflict",
        "TaskNotTerminal", "InvalidDiscussionContext", "QueueFull", "ResultUnavailable",
        "DependencyUnavailable"]).toContain(body.error.code);
      expect(body.error.code).not.toBe("FencedWrite");
      expect(body.error.code).not.toBe("LeaseLost");
    });
  });
});
