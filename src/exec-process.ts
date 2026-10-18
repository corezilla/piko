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

  // V0.1: resolve Mem0 api key at startup (matches LLM/Matrix pattern)
  let mem0ApiKey: string | undefined;
  if (config.identity?.memory) {
    mem0ApiKey = await resolveSecret(config.identity.memory.api_key_secret_ref);
  }

  // V0.1: resolve GraphRAG api key at startup (sibling to mem0, same secret pattern)
  let graphragApiKey: string | undefined;
  if (config.identity?.doc_search) {
    graphragApiKey = await resolveSecret(config.identity.doc_search.api_key_secret_ref);
  }

  let matrixToken: string | undefined;
  if (config.matrix.enabled) {
    if (config.matrix.direct_access_token) {
      matrixToken = config.matrix.direct_access_token;
    } else if (config.matrix.access_token_secret_ref) {
      matrixToken = await resolveSecret(config.matrix.access_token_secret_ref);
    }
  }
  const matrix = new MatrixRuntime(config, store, matrixToken);
  await matrix.start();
  const channel = new ProcessChannel(
    (msg) => process.send?.(msg),
    (cmd: Command) => {
      if (cmd.kind === "shutdown") void shutdown();
    },
  );
  const pi = new PiRuntime(config, tools, store, channel, llmKey, mem0ApiKey, graphragApiKey);
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
  // The channel routes P0 commands: `abort` prompts the worker to abort the in-flight
  // operation (P0's store flag is authoritative); `shutdown` ends P1 cleanly.
  process.on("message", (msg: any) => {
    if (msg?.ipc !== "command") return;
    if (msg.command?.kind === "shutdown") void shutdown();
    if (msg.command?.kind === "abort" && typeof msg.command.task_id === "string") worker.requestAbort(msg.command.task_id);
  });
}

const configPath = process.env.PIKO_EXEC_CONFIG ?? "config/runtime.json";
const root = process.env.PIKO_EXEC_ROOT ?? process.cwd();
runExecutionProcess(configPath, root).catch((error) => {
  console.error("[P1] execution process failed", error);
  process.exit(1);
});
