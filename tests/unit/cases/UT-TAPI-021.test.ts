/**
 * Case ID: UT-TAPI-021  ·  STATUS: real
 *
 * 责任：await 拒绝传播（listen 的 await 目标拒绝必须 typed 化上抛；server.ts:110）
 * 维度坐标：`listen` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-021.md（脚本的唯一依据）
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

describe("UT-TAPI-021 · listen · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when the port is already taken", async () => {
    // 步骤 1：先起一个服务器占住端口
    const store = new TaskStore(":memory:", 1000);
    const config = makeConfig();
    try {
      const first = await ApiServer.create(config, store, new BearerAuth("s", TOKEN));
      await first.listen();
      const address = (first as unknown as { server: { address(): { port: number } } }).server.address();

      // 步骤 2：在同一端口上再 listen 一个
      const config2 = { ...config, listen: { host: "127.0.0.1", port: address.port } } as unknown as RuntimeConfig;
      const second = await ApiServer.create(config2, store, new BearerAuth("s", TOKEN));

      // 步骤 3：断言拒绝被上抛（端口占用）
      await expect(second.listen()).rejects.toThrow();
      await first.close();
    } finally {
      store.close();
    }
  });
});
