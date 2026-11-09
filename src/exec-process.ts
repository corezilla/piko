import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { loadConfig, resolveSecret } from "./config.js";
import { TaskStore } from "./store.js";
import { MatrixRuntime } from "./matrix.js";
import { PiRuntime } from "./pi-runtime.js";
import { RunWorker } from "./worker.js";
import { Transfer } from "./transfer.js";
import { ProcessChannel, type Command } from "./ipc.js";
import type { RuntimeConfig } from "./types.js";

/**
 * The collaborators `runExecutionProcess` builds.
 *
 * Everything the entrypoint touches is behind this record so the startup
 * sequence — which secret is resolved, in what order, and what happens when
 * one is missing — is exercisable without a Matrix homeserver, a Pi harness,
 * or a live store.
 */
export interface ExecutionProcessDeps {
  loadConfig: typeof loadConfig;
  resolveSecret: typeof resolveSecret;
  openStore: (path: string, busyTimeoutMs: number) => { close(): void };
  createMatrix: (config: RuntimeConfig, store: unknown, token: string | undefined) => {
    start(): Promise<void>;
    close(): Promise<void>;
  };
  createPi: (
    config: RuntimeConfig,
    tools: unknown,
    store: unknown,
    channel: unknown,
    llmKey: string,
    mem0ApiKey: string | undefined,
    graphragApiKey: string | undefined,
    transfer: unknown,
  ) => { close(): Promise<void> };
  createTransfer: (config: RuntimeConfig) => unknown;
  createWorker: (
    config: RuntimeConfig,
    store: unknown,
    pi: unknown,
    matrix: unknown,
    transfer: unknown,
    channel: unknown,
  ) => { start(): void; close(): Promise<void>; requestAbort(taskId: string): void };
  createChannel: (onCommand: (cmd: Command) => void) => unknown;
}

/**
 * The production collaborators.
 *
 * Kept as a named export so a test can start from the real ones and replace
 * a single collaborator.
 */
export const productionDeps: ExecutionProcessDeps = {
  loadConfig,
  resolveSecret,
  openStore: (path, busyTimeoutMs) => new TaskStore(path, busyTimeoutMs),
  createMatrix: (config, store, token) => new MatrixRuntime(config, store as never, token),
  createPi: (config, tools, store, channel, llmKey, mem0ApiKey, graphragApiKey, transfer) =>
    new PiRuntime(
      config,
      tools as never,
      store as never,
      channel as never,
      llmKey,
      mem0ApiKey,
      graphragApiKey,
      transfer as never,
    ),
  createTransfer: (config) => new Transfer(config),
  createWorker: (config, store, pi, matrix, transfer, channel) =>
    new RunWorker(
      config,
      store as never,
      pi as never,
      matrix as never,
      transfer as never,
      channel as never,
    ),
  createChannel: (onCommand) => new ProcessChannel((msg) => process.send?.(msg), onCommand),
};

/**
 * P1 entrypoint (separate OS process). Carries all blocking external IO:
 * Pi execution, community tools, data-plane scp, Matrix. It talks to P0 only
 * through the local channel; it does not serve HTTP and does not own authority.
 */
export async function runExecutionProcess(
  configPath: string,
  root: string,
  deps: ExecutionProcessDeps = productionDeps,
) {
  const { config, tools } = await deps.loadConfig(configPath, root);
  const store = deps.openStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const llmKey = (await deps.resolveSecret(config.llmtier.api_key_secret_ref!))!;

  // V0.1: resolve Mem0 api key at startup (matches LLM/Matrix pattern)
  let mem0ApiKey: string | undefined;
  if (config.identity?.memory) {
    mem0ApiKey = await deps.resolveSecret(config.identity.memory.api_key_secret_ref);
  }

  // V0.1: resolve GraphRAG api key at startup (sibling to mem0, same secret pattern)
  let graphragApiKey: string | undefined;
  if (config.identity?.doc_search) {
    graphragApiKey = await deps.resolveSecret(config.identity.doc_search.api_key_secret_ref);
  }

  let matrixToken: string | undefined;
  if (config.matrix.enabled) {
    if (config.matrix.direct_access_token) {
      matrixToken = config.matrix.direct_access_token;
    } else if (config.matrix.access_token_secret_ref) {
      matrixToken = await deps.resolveSecret(config.matrix.access_token_secret_ref);
    }
  }
  const matrix = deps.createMatrix(config, store, matrixToken);
  await matrix.start();
  const channel = deps.createChannel((cmd: Command) => {
    if (cmd.kind === "shutdown") void shutdown();
  });
  // Transfer is created before PiRuntime: the remote_bash tool reuses its SSH
  // credential skeleton (private key + known_hosts pinning).
  const transfer = deps.createTransfer(config);
  const pi = deps.createPi(config, tools, store, channel, llmKey, mem0ApiKey, graphragApiKey, transfer);
  const worker = deps.createWorker(config, store, pi, matrix, transfer, channel);
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
  return { worker, matrix, pi, store, shutdown };
}

// The entrypoint runs only when this module is the process entry, not when it
// is imported (the unit tests import it to exercise the startup sequence).
const isEntry = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) {
  const configPath = process.env.PIKO_EXEC_CONFIG ?? "config/runtime.json";
  const root = process.env.PIKO_EXEC_ROOT ?? process.cwd();
  runExecutionProcess(configPath, root).catch((error) => {
    console.error("[P1] execution process failed", error);
    process.exit(1);
  });
}
