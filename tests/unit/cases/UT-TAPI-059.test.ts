/**
 * Case ID: UT-TAPI-059  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `非法值` 类（server.ts:41）
 * 维度坐标：`ApiServer.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-059.md（脚本的唯一依据）
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

function makeConfig(): RuntimeConfig {
  return {
    instance_id: "inst-1",
    listen: { host: "127.0.0.1", port: 0 },
    queue: { capacity: 10 },
  } as unknown as RuntimeConfig;
}

async function withServer<T>(
  fn: (ctx: {
    url: string;
    server: ApiServer;
    store: TaskStore;
    config: RuntimeConfig;
    obs: Observability;
  }) => Promise<T>,
  options: { withObs?: boolean } = {},
): Promise<T> {
  const store = new TaskStore(":memory:", 1000);
  const config = makeConfig();
  const auth = new BearerAuth("slinky", TOKEN);
  const obs = new Observability(config, new ManualClock(0, 0));
  const server = await ApiServer.create(config, store, auth, undefined, options.withObs ? obs : undefined);
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

describe("UT-TAPI-059 · ApiServer.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds a config without a listen section (the parameter is not validated)", async () => {
    // 步骤 1：构造没有 listen 段的 config
    const store = new TaskStore(":memory:", 1000);
    try {
      // 步骤 2：调用 ApiServer.create
      const server = await ApiServer.create({ instance_id: "i" } as unknown as RuntimeConfig, store, new BearerAuth("s", TOKEN));

      // 步骤 3：断言创建成功，缺失段在 listen 时才报错
      expect(server).toBeDefined();
      await expect(server.listen()).rejects.toThrow();
    } finally {
      store.close();
    }
  });
});
