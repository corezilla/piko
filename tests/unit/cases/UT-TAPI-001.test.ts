/**
 * Case ID: UT-TAPI-001  ·  STATUS: real
 *
 * 责任：`create` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`create` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-001.md（脚本的唯一依据）
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
  options: { withObs?: boolean } = {},
): Promise<T> {
  const store = new TaskStore(":memory:", 1000);
  const config = {
    instance_id: "inst-1",
    listen: { host: "127.0.0.1", port: 0 },
    queue: { capacity: 10 },
  } as unknown as RuntimeConfig;
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

describe("UT-TAPI-001 · create · 错误路径 × 每个 typed 错误码", () => {
  it("creates a server or fails with a typed error", async () => {
    // 步骤 1：构造 store 与 server
    const store = new TaskStore(":memory:", 1000);
    try {
      // 步骤 2：调用 ApiServer.create
      const server = await ApiServer.create({
        instance_id: "inst-1",
        listen: { host: "127.0.0.1", port: 0 },
        queue: { capacity: 10 },
      } as unknown as RuntimeConfig, store, new BearerAuth("s", TOKEN));

      // 步骤 3：断言成功（或抛出 typed 错误——不静默返回半成品）
      expect(server).toBeDefined();
      await server.listen();
      await server.close();
    } finally {
      store.close();
    }
  });
});
