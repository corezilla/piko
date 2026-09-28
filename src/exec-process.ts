import { resolve } from "node:path";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { loadConfig, resolveSecret } from "./config.js";
import { TaskStore } from "./store.js";
import { MatrixRuntime } from "./matrix.js";
import { PiRuntime } from "./pi-runtime.js";
import { RunWorker } from "./worker.js";
import { Transfer } from "./transfer.js";
import { ProcessChannel, type Command } from "./ipc.js";

/**
 * P1 entrypoint (separate OS process). Carries all blocking external IO:
 * Pi execution, community tools, data-plane scp, Matrix. It talks to P0 only
 * through the local channel; it does not serve HTTP and does not own authority.
 */
export async function runExecutionProcess(configPath: string, root: string) {
  const { config, tools } = await loadConfig(configPath, root);
  const store = new TaskStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const llmKey = await resolveSecret(config.llmtier.api_key_secret_ref);
  const matrixToken =
    config.matrix.enabled && config.matrix.access_token_secret_ref ? await resolveSecret(config.matrix.access_token_secret_ref) : undefined;
  const matrix = new MatrixRuntime(config, store, matrixToken);
  await matrix.start();
  const channel = new ProcessChannel(
    (msg) => process.send?.(msg),
    (cmd: Command) => {
      if (cmd.kind === "shutdown") void shutdown();
    },
  );
  const pi = new PiRuntime(config, tools, store, channel, llmKey);
  const transfer = new Transfer(config);
  const worker = new RunWorker(config, store, pi, matrix, transfer, channel);
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
    if (msg?.type === "abort") void shutdown();
  });
}

const configPath = process.env.PIKO_EXEC_CONFIG ?? "config/runtime.json";
const root = process.env.PIKO_EXEC_ROOT ?? process.cwd();
runExecutionProcess(configPath, root).catch((error) => {
  console.error("[P1] execution process failed", error);
  process.exit(1);
});
