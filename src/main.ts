import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { loadConfig, resolveSecret, type ToolRegistry } from "./config.js";
import { TaskStore } from "./store.js";
import { BearerAuth } from "./auth.js";
import { MatrixRuntime } from "./matrix.js";
import { PiRuntime } from "./pi-runtime.js";
import { RunWorker } from "./worker.js";
import { ApiServer } from "./server.js";
import { Transfer } from "./transfer.js";
import { ExecutionProcessSupervisor } from "./supervisor.js";
import type { RuntimeConfig } from "./types.js";

/**
 * P1 entrypoint (separate OS process). Carries all blocking external IO:
 * Pi execution, community tools, data-plane scp, Matrix. It talks to P0 only
 * through the local channel; it does not serve HTTP and does not own authority.
 */
export async function runExecutionProcess(configPath: string, root: string) {
  const { config, tools } = await loadConfig(configPath, root);
  const store = new TaskStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const llmKey = await resolveSecret(config.llmtier.api_key_secret_ref);
  const matrixToken = config.matrix.enabled && config.matrix.access_token_secret_ref ? await resolveSecret(config.matrix.access_token_secret_ref) : undefined;
  const matrix = new MatrixRuntime(config, store, matrixToken);
  await matrix.start();
  const pi = new PiRuntime(config, tools, store, llmKey);
  const transfer = new Transfer(config);
  const worker = new RunWorker(config, store, pi, matrix, transfer);
  worker.start();

  const heartbeat = setInterval(() => process.send?.({ type: "heartbeat", at: Date.now() }), 1000);
  process.send?.({ type: "ready", boot_id: randomUUID(), host: hostname() });

  const shutdown = async () => {
    clearInterval(heartbeat);
    await worker.close();
    await matrix.close();
    await pi.close();
    store.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
  process.on("message", (msg: any) => {
    if (msg?.type === "abort") {
      // A queued cancel is handled by P0 in the store; P1 relies on the cancel flag
      // observed by the running Pi operation. A hard abort terminates the process.
      void shutdown();
    }
  });
}

/**
 * P0 entrypoint (control process). Serves HTTP and owns the Task Store; spawns and
 * supervises the P1 execution process.
 */
export async function runControlProcess(configPath: string, root: string) {
  const { config, tools } = await loadConfig(configPath, root);
  const store = new TaskStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const bearer = await resolveSecret(config.api_auth.bearer_token_secret_ref);
  const matrix = new MatrixRuntime(config, store, undefined); // P0 holds no Matrix credential
  const auth = new BearerAuth(config.api_auth.principal_id, Buffer.from(bearer));

  const supervisor = new ExecutionProcessSupervisor(
    { ...process.env, PIKO_EXEC_CONFIG: configPath, PIKO_EXEC_ROOT: root, PIKO_ROLE: "exec" },
    (code, signal) => console.error(`[P0] execution process exited code=${code} signal=${signal}`),
  );
  supervisor.spawn();

  const server = await ApiServer.create(config, store, auth, matrix);
  await server.listen();
  console.log(`[P0] Piko control process listening on http://${config.listen.host}:${config.listen.port}`);

  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    await server.close();
    await supervisor.stop();
    store.close();
  };
  process.once("SIGINT", () => void close().then(() => process.exit(0)));
  process.once("SIGTERM", () => void close().then(() => process.exit(0)));
}

/** Role dispatch: exec-process.ts runs P1; main.ts runs P0. */
export async function main(argv = process.argv, env = process.env) {
  const configPath = resolve(argv[2] ?? env.PIKO_CONFIG ?? "config/runtime.json");
  const root = resolve(import.meta.dirname ?? ".", "..");
  if (env.PIKO_ROLE === "exec") await runExecutionProcess(env.PIKO_EXEC_CONFIG ?? configPath, env.PIKO_EXEC_ROOT ?? root);
  else await runControlProcess(configPath, root);
}

export type { RuntimeConfig, ToolRegistry };


const isEntrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href === import.meta.url : false;
if (isEntrypoint) main().catch((error) => { console.error(error); process.exitCode = 1; });
