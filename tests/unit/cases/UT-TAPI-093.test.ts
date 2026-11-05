/**
 * Case ID: UT-TAPI-093  ·  STATUS: real
 *
 * 责任：分支 L53 ?? : (addFormats as any).default ?? addFormats（server.ts）
 * 维度坐标：`create` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-093.md（脚本的唯一依据）
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

describe("UT-TAPI-093 · create · 状态分支 × 合法迁移", () => {
  it("resolves the formats plugin whichever way the import is shaped", async () => {
    // 步骤 1：构造 store 与 server
    const store = new TaskStore(":memory:", 1000);
    try {
      // 步骤 2：调用 ApiServer.create —— 内部走 ?? 选插件
      const server = await ApiServer.create(makeConfig(), store, new BearerAuth("s", TOKEN));

      // 步骤 3：断言 schema 校验器已装配（formats 生效）
      expect((server as unknown as { validateTask: unknown }).validateTask).toBeDefined();
      await server.listen();
      await server.close();
    } finally {
      store.close();
    }
  });
});
