/**
 * Case ID: UT-TAPI-002  ·  STATUS: real
 *
 * 责任：`listen` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`listen` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-002.md（脚本的唯一依据）
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

describe("UT-TAPI-002 · listen · 资源获取/释放 × 获取失败路径", () => {
  it("does not leave a bound port behind when listen fails", async () => {
    // 步骤 1：起一个服务器占住端口
    const store = new TaskStore(":memory:", 1000);
    try {
      const first = await ApiServer.create({
        instance_id: "i",
        listen: { host: "127.0.0.1", port: 0 },
        queue: { capacity: 10 },
      } as unknown as RuntimeConfig, store, new BearerAuth("s", TOKEN));
      await first.listen();
      const address = (first as unknown as { server: { address(): { port: number } } }).server.address();

      // 步骤 2：在同一端口上再 listen 一个
      const second = await ApiServer.create({
        instance_id: "i",
        listen: { host: "127.0.0.1", port: address.port },
        queue: { capacity: 10 },
      } as unknown as RuntimeConfig, store, new BearerAuth("s", TOKEN));

      // 步骤 3：断言失败，且第一个服务器的端口仍可用（没有把资源抢走）
      await expect(second.listen()).rejects.toThrow();
      const still = await fetch(`http://127.0.0.1:${address.port}/tasks/missing`, {
        headers: { authorization: "Bearer s3cret-token" },
      });
      expect(still.status).toBe(404);
      await first.close();
    } finally {
      store.close();
    }
  });
});
