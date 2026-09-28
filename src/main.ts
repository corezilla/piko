import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadConfig, resolveSecret } from "./config.js";
import { TaskStore } from "./store.js";
import { BearerAuth } from "./auth.js";
import { ApiServer } from "./server.js";
import { ExecutionProcessSupervisor } from "./supervisor.js";

/**
 * P0 entrypoint (control process). Serves HTTP and owns the Task Store; spawns and
 * supervises the P1 execution process. It imports no execution internals (no Pi,
 * no tools, no Matrix, no transfer) so it stays purely local and always responsive.
 */
export async function runControlProcess(configPath: string, root: string) {
  const { config } = await loadConfig(configPath, root);
  const store = new TaskStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const bearer = await resolveSecret(config.api_auth.bearer_token_secret_ref);
  const auth = new BearerAuth(config.api_auth.principal_id, Buffer.from(bearer));

  const supervisor = new ExecutionProcessSupervisor(
    { ...process.env, PIKO_EXEC_CONFIG: configPath, PIKO_EXEC_ROOT: root, PIKO_ROLE: "exec" },
    (code: number | null, signal: NodeJS.Signals | null) => console.error(`[P0] execution process exited code=${code} signal=${signal}`),
  );
  supervisor.spawn();

  const server = await ApiServer.create(config, store, auth);
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

export async function main(argv = process.argv, env = process.env) {
  const configPath = resolve(argv[2] ?? env.PIKO_CONFIG ?? "config/runtime.json");
  const root = resolve(import.meta.dirname ?? ".", "..");
  await runControlProcess(configPath, root);
}

const isEntrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href === import.meta.url : false;
if (isEntrypoint) main().catch((error) => { console.error(error); process.exitCode = 1; });
