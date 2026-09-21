/**
 * Shared harness for the scenario end-to-end cases
 * (piko-scenario-e2e-test-specification-v0.1, PTS-01..PTS-10).
 *
 * Every case drives a real Piko instance through the four task APIs and asserts
 * machine-checkable oracles against seeds produced by scripts/scenario-seeds.sh.
 * Live execution is opt-in: set SCENARIO_E2E=1. Otherwise the suite skips.
 */
import { execFileSync, execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const REPO_ROOT = process.env.PIKO_REPO_ROOT ?? "/Users/ben/work/piko";
export const PIKO_URL = process.env.PIKO_URL ?? "http://127.0.0.1:8787";
export const PIKO_BEARER =
  process.env.PIKO_BEARER ??
  safeRead(join(process.env.HOME ?? "", "piko-secrets/piko-api-bearer")).trim();
export const MATRIX_BASE = process.env.MATRIX_BASE ?? "https://127.0.0.1:8448";
export const SQLITE_PATH = process.env.PIKO_SQLITE_PATH ?? join(REPO_ROOT, "var/piko-omlx.sqlite");
export const PIKO_RUNTIME_CONFIG = process.env.PIKO_RUNTIME_CONFIG ?? join(REPO_ROOT, "config/runtime.json");
export const CA_CERT = process.env.CA_CERT ?? join(process.env.HOME ?? "", "piko-matrix-homeserver/tls/server.crt");
export const HOMESERVER_DIR = process.env.HOMESERVER_DIR ?? join(process.env.HOME ?? "", "piko-matrix-homeserver");
export const SECRETS_DIR = process.env.PIKO_SECRETS_DIR ?? join(process.env.HOME ?? "", "piko-secrets");
export const SEED_ROOT = process.env.SCEN_ROOT ?? join(REPO_ROOT, "var/scenario-seeds");
export const SEED_REL = "var/scenario-seeds";
export const PYTHON_BIN = process.env.PYTHON_BIN ?? "python3";

/**
 * Live when the environment is actually reachable (Piko + oMLX); the plain
 * reason for a skip is then a genuinely absent dependency, not a missing flag.
 * SCENARIO_E2E=0 forces the suite off (e.g. a quick offline run).
 */
export const LIVE = process.env.SCENARIO_E2E !== "0" && liveAvailableSync();

function httpCode(url: string): string {
  try {
    return execFileSync("curl", ["-s", "-m", "3", "-o", "/dev/null", "-w", "%{http_code}", url], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "000";
  }
}

export function liveAvailableSync(): boolean {
  if (!["404", "401", "400"].includes(httpCode(`${PIKO_URL}/runs/none`))) return false;
  const llm = httpCode(`${process.env.LLM_BASE ?? "http://127.0.0.1:9000/v1/"}models`);
  return llm === "200" || llm === "401";
}

export interface RunParams {
  case: string;
  read: string[];
  write: string[];
  output: string[];
  profile?: string;
  max_model_calls?: number;
  max_tool_calls?: number;
  deadline_secs?: number;
  cancel_after?: number;
}

export interface RunView {
  run_id: string;
  task_id: string;
  state: string;
  result_available?: boolean;
  cancel_requested?: boolean;
  failure?: Failure | null;
  progress?: { model_calls: number; tool_calls: number; last_activity_at?: string };
}
export interface Failure {
  code: string;
  cause_class: string;
  message: string;
}
export interface AgentResult {
  run_id: string;
  task_id: string;
  state: "Completed" | "Failed" | "Cancelled";
  partial: boolean;
  summary: string;
  outputs: { path: string; sha256: string; size_bytes: number }[];
  known_actions: unknown[];
  failure: Failure | null;
  usage: {
    quality: "Complete" | "Partial" | "Unknown";
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
    cache_read_tokens: number | null;
    cache_write_tokens: number | null;
    reasoning_tokens: number | null;
    model_attempts: number;
    usage_observed_attempts: number;
    missing_fields: string[];
  };
}

function safeRead(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

export function caseDir(caseName: string): string {
  return join(SEED_ROOT, caseName);
}
export function seedRel(caseName: string, ...rest: string[]): string {
  return join(SEED_REL, caseName, ...rest);
}
export function abs(caseName: string, ...rest: string[]): string {
  return join(SEED_ROOT, caseName, ...rest);
}

/** Rebuild every seed, output dir, params.json and frozen instruction. */
export function resetSeeds(): void {
  execFileSync("bash", ["scripts/scenario-seeds.sh"], { cwd: REPO_ROOT, stdio: "pipe" });
}

export function readInstruction(caseName: string): string {
  return readFileSync(join(caseDir(caseName), "instruction.txt"), "utf8");
}
export function readParams(caseName: string): RunParams {
  return JSON.parse(readFileSync(join(caseDir(caseName), "params.json"), "utf8")) as RunParams;
}
export function readJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
export function readText(path: string): string {
  return readFileSync(path, "utf8");
}
export function exists(path: string): boolean {
  return existsSync(path);
}
export function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export async function pikoHealthy(): Promise<boolean> {
  try {
    const r = await fetch(`${PIKO_URL}/runs/none`, {
      headers: { Authorization: `Bearer ${PIKO_BEARER}` },
    });
    return r.status === 404 || r.status === 401 || r.status === 400;
  } catch {
    return false;
  }
}
export async function llmHealthy(): Promise<boolean> {
  try {
    const key = safeRead(join(SECRETS_DIR, "piko-llm-key")).trim();
    const r = await fetch((process.env.LLM_BASE ?? "http://127.0.0.1:9000/v1/") + "models", {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    });
    return r.status === 200 || r.status === 401;
  } catch {
    return false;
  }
}
export async function matrixHealthy(): Promise<boolean> {
  try {
    const r = await fetch(`${MATRIX_BASE}/_matrix/client/versions`);
    return r.status === 200;
  } catch {
    return false;
  }
}

/** Synchronous Matrix reachability, for skipIf() evaluated at collection time. */
export function matrixReachableSync(): boolean {
  try {
    const code = execFileSync(
      "curl",
      ["-s", "-k", "-m", "3", "-o", "/dev/null", "-w", "%{http_code}", `${MATRIX_BASE}/_matrix/client/versions`],
      { stdio: ["ignore", "pipe", "ignore"] },
    )
      .toString()
      .trim();
    return code === "200";
  } catch {
    return false;
  }
}

export interface RunHandle {
  runId: string;
  view: RunView;
  result: AgentResult;
  elapsedMs: number;
  cancelReceipt?: { status: number; body: unknown };
}

export interface RunOptions {
  taskId?: string;
  cancelAfterSec?: number;
  timeoutMs?: number;
  /** Override the instruction (defaults to the frozen instruction.txt). */
  instruction?: string;
}

export async function runCase(caseName: string, opts: RunOptions = {}): Promise<RunHandle> {
  const params = readParams(caseName);
  const instruction = opts.instruction ?? readInstruction(caseName);
  const taskId = opts.taskId ?? `scen-${caseName}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const deadlineSecs = params.deadline_secs ?? 900;
  const deadline = new Date(Date.now() + deadlineSecs * 1000).toISOString();
  const payload = {
    task_id: taskId,
    instruction,
    workspace_ref: "piko",
    permissions: {
      read_paths: params.read,
      write_paths: params.write,
      tool_profile_ref: params.profile ?? "workspace-exec",
    },
    limits: {
      deadline_at: deadline,
      max_model_calls: params.max_model_calls ?? 24,
      max_tool_calls: params.max_tool_calls ?? 24,
    },
    output_paths: params.output,
  };
  const created = await postRun(payload);
  if (created.status !== 202) {
    throw new Error(`POST /runs ${caseName} -> ${created.status}: ${JSON.stringify(created.body)}`);
  }
  const runId = (created.body as RunView).run_id;
  const cancelAfter = opts.cancelAfterSec ?? params.cancel_after ?? 0;
  return waitRun(runId, { cancelAfterSec: cancelAfter, timeoutMs: opts.timeoutMs });
}

export async function postRun(payload: unknown): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${PIKO_URL}/runs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PIKO_BEARER}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await jsonOrText(res) };
}

export async function waitRun(
  runId: string,
  opts: { cancelAfterSec?: number; timeoutMs?: number } = {},
): Promise<RunHandle> {
  const start = Date.now();
  const timeout = opts.timeoutMs ?? 300_000;
  let cancelRequested = false;
  let cancelReceipt: { status: number; body: unknown } | undefined;
  let view: RunView | undefined;
  for (;;) {
    view = await getRun(runId);
    if (
      opts.cancelAfterSec &&
      !cancelRequested &&
      Date.now() - start >= opts.cancelAfterSec * 1000
    ) {
      cancelReceipt = await cancelRun(runId);
      cancelRequested = true;
    }
    if (["Completed", "Failed", "Cancelled"].includes(view.state)) break;
    if (Date.now() - start > timeout) {
      throw new Error(`run ${runId} did not reach terminal in ${timeout}ms (state=${view.state})`);
    }
    await sleep(2_000);
  }
  const result = await getResult(runId);
  return { runId, view, result, elapsedMs: Date.now() - start, cancelReceipt };
}

export async function getRun(runId: string): Promise<RunView> {
  const res = await fetch(`${PIKO_URL}/runs/${runId}`, { headers: { Authorization: `Bearer ${PIKO_BEARER}` } });
  if (res.status !== 200) throw new Error(`GET /runs/${runId} -> ${res.status}`);
  return (await res.json()) as RunView;
}

export async function getResult(runId: string): Promise<AgentResult> {
  const res = await fetch(`${PIKO_URL}/runs/${runId}/result`, {
    headers: { Authorization: `Bearer ${PIKO_BEARER}` },
  });
  if (res.status !== 200) throw new Error(`GET /runs/${runId}/result -> ${res.status}`);
  return (await res.json()) as AgentResult;
}

export async function cancelRun(runId: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${PIKO_URL}/runs/${runId}:cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PIKO_BEARER}` },
  });
  return { status: res.status, body: await jsonOrText(res) };
}

export async function sqliteScalar(sql: string): Promise<string> {
  // execFileSync (no shell) — Matrix event ids start with "$" and would be
  // expanded by a shell.
  return execFileSync("sqlite3", [SQLITE_PATH, sql]).toString().trim();
}

export function pytest(cwd: string): { code: number; stdout: string } {
  try {
    const stdout = execFileSync(PYTHON_BIN, ["-m", "pytest", "-q"], { cwd, stdio: "pipe" }).toString();
    return { code: 0, stdout };
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return { code: err.status ?? 1, stdout: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

export async function restartPiko(): Promise<void> {
  try {
    const pid = execSync("lsof -nP -iTCP:8787 -sTCP:LISTEN -t").toString().trim().split("\n")[0];
    if (pid) execSync(`kill -9 ${pid}`);
  } catch {
    /* not running */
  }
  await sleep(2_000);
  execSync(
    `nohup env PIKO_CONFIG=${PIKO_RUNTIME_CONFIG} NODE_EXTRA_CA_CERTS=${CA_CERT} npm start --prefix ${REPO_ROOT} >${join(REPO_ROOT, "var/piko-restart.log")} 2>&1 &`,
    { stdio: "ignore" },
  );
  for (let i = 0; i < 30; i++) {
    if (await pikoHealthy()) return;
    await sleep(1_000);
  }
  throw new Error("Piko did not come back up within 30s");
}

export async function killPiko(): Promise<void> {
  try {
    execSync("pkill -9 -f 'src/main.ts'", { stdio: "ignore" });
  } catch {
    /* nothing to kill */
  }
  for (let i = 0; i < 20; i++) {
    if (!(await pikoHealthy())) return;
    await sleep(500);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Kill bash children orphaned by a SIGKILL of Piko (they are not reaped). */
export function cleanupBashOrphans(): void {
  try {
    execSync("pkill -f 'sleep 25'", { stdio: "ignore" });
  } catch {
    /* none */
  }
}

async function jsonOrText(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------------------------------------------------------------- Matrix helpers
export interface MatrixTokens {
  ben: string;
  second: string;
  pikoBot: string;
  roomId: string;
}

export function loadMatrixTokens(): MatrixTokens {
  const users = JSON.parse(safeRead(join(HOMESERVER_DIR, "users.json")) || "{}") as Record<
    string,
    { access_token?: string }
  >;
  const room = JSON.parse(safeRead(join(HOMESERVER_DIR, "room-scenario.json")) || "{}") as {
    room_id?: string;
  };
  return {
    ben: process.env.BEN_TOK ?? users["ben"]?.access_token ?? "",
    second: process.env.SECOND_TOK ?? users["second-user"]?.access_token ?? "",
    pikoBot: process.env.PIKO_BOT_TOK ?? safeRead(join(SECRETS_DIR, "matrix-piko-bot")).trim(),
    roomId: process.env.ROOM_ID ?? room.room_id ?? "",
  };
}

/** Create a fresh scenario room (piko-bot power=0) and return its id. */
export function createScenarioRoom(): string {
  execFileSync("bash", ["scripts/scenario-env.sh"], { cwd: REPO_ROOT, stdio: "pipe" });
  const room = JSON.parse(safeRead(join(HOMESERVER_DIR, "room-scenario.json"))) as { room_id: string };
  return room.room_id;
}

export async function matrixSend(token: string, room: string, body: string): Promise<string> {
  const res = await fetch(
    `${MATRIX_BASE}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/send/m.room.message/${Date.now()}-${Math.random()}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ msgtype: "m.text", body }),
    },
  );
  if (res.status !== 200) throw new Error(`matrix send -> ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { event_id: string }).event_id;
}

export async function matrixKick(token: string, room: string, userId: string): Promise<void> {
  const res = await fetch(`${MATRIX_BASE}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/kick`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, reason: "scenario test" }),
  });
  if (res.status !== 200) throw new Error(`matrix kick -> ${res.status}: ${await res.text()}`);
}

export async function matrixJoin(token: string, room: string): Promise<void> {
  const res = await fetch(`${MATRIX_BASE}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  if (res.status !== 200) throw new Error(`matrix join -> ${res.status}: ${await res.text()}`);
}

export async function matrixInvite(token: string, room: string, userId: string): Promise<void> {
  const res = await fetch(`${MATRIX_BASE}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/invite`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (res.status !== 200) throw new Error(`matrix invite -> ${res.status}: ${await res.text()}`);
}

export interface MatrixEvent {
  event_id: string;
  sender: string;
  type: string;
  content: Record<string, unknown>;
}
export async function matrixMessages(token: string, room: string, limit = 40): Promise<MatrixEvent[]> {
  const res = await fetch(
    `${MATRIX_BASE}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/messages?dir=b&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.status !== 200) throw new Error(`matrix messages -> ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { chunk: MatrixEvent[] }).chunk;
}

export async function waitMatrixEventIngested(eventId: string, timeoutMs = 60_000): Promise<number> {
  const start = Date.now();
  for (;;) {
    const count = Number(await sqliteScalar(`SELECT count(*) FROM matrix_events WHERE event_id='${eventId}';`));
    if (count >= 1) return count;
    if (Date.now() - start > timeoutMs) return count;
    await sleep(1_000);
  }
}
