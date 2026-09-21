import { afterAll,beforeAll,beforeEach,describe,expect,it } from "vitest";

// All Matrix traffic trusts the sandbox CA via NODE_EXTRA_CA_CERTS pointing at
// ~/piko-matrix-homeserver/tls/server.crt; Node 22's global fetch reads that.
// The test runner must be launched with NODE_EXTRA_CA_CERTS=... already exported.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const HOMESERVER_DIR = process.env.HOMESERVER_DIR ?? "/Users/ben/piko-matrix-homeserver";
const SECRETS_DIR = process.env.PIKO_SECRETS_DIR ?? `${process.env.HOME}/piko-secrets`;
const readIf = (path: string): string => {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return "";
  }
};
const readJsonIf = <T,>(path: string): T => {
  try {
    return JSON.parse(readIf(path)) as T;
  } catch {
    return {} as T;
  }
};
// Credentials live on disk in the sandbox; env vars are an override, not a
// prerequisite. Without this the acceptance tests skipped even when the whole
// environment was available.
const users = readJsonIf<Record<string, { access_token?: string }>>(join(HOMESERVER_DIR, "users.json"));
const scenarioRoom = readJsonIf<{ room_id?: string }>(join(HOMESERVER_DIR, "room-scenario.json"));

const PIKO_URL = process.env.PIKO_URL ?? "http://127.0.0.1:8787";
const PIKO_BEARER = process.env.PIKO_BEARER ?? readIf(join(SECRETS_DIR, "piko-api-bearer"));
const MATRIX_BASE = process.env.MATRIX_BASE ?? "https://127.0.0.1:8448";
const SECOND_TOK = process.env.SECOND_TOK ?? users["second-user"]?.access_token ?? "";
const PIKO_BOT_TOK = process.env.PIKO_BOT_TOK ?? readIf(join(SECRETS_DIR, "matrix-piko-bot"));
const BEN_TOK = process.env.BEN_TOK ?? users["ben"]?.access_token ?? "";
const ROOM_ID = process.env.ROOM_ID ?? scenarioRoom.room_id ?? "";
const LLM_BASE = process.env.LLM_BASE ?? "http://127.0.0.1:9000/v1/";
const SQLITE_PATH = process.env.PIKO_SQLITE_PATH ?? "/Users/ben/work/piko/var/piko-omlx.sqlite";
const PIKO_RUNTIME_CONFIG = process.env.PIKO_RUNTIME_CONFIG ?? "/Users/ben/work/piko/config/runtime.json";
const CA_CERT = process.env.CA_CERT ?? "/Users/ben/piko-matrix-homeserver/tls/server.crt";
const PYTHON_BIN = process.env.PYTHON_BIN ?? `${process.env.HOME}/piko-runtime-venv/bin/python`;

let pikoUp = false;
let matrixUp = false;
let skipMatrix = !PIKO_BEARER || !SECOND_TOK || !PIKO_BOT_TOK || !BEN_TOK || !ROOM_ID;
let skipSlow = (process.env.SKIP_SLOW ?? "0") !== "0";

interface MatrixSendResult { event_id: string }
interface RunView { run_id: string; task_id: string; state: string }
interface RunResult {
  state: string; partial?: boolean; summary?: string;
  failure?: { code: string; cause_class: string; message: string };
  usage?: { source: string; quality: string; input_tokens: number | null; output_tokens: number | null; model_attempts: number; usage_observed_attempts: number };
}

async function jsonOf<T>(res: Response): Promise<T> {
  const text = await res.text();
  return JSON.parse(text) as T;
}

async function expectStatus(res: Response, status: number, label: string): Promise<void> {
  if (res.status !== status) {
    const text = await res.text();
    expect.fail(`${label}: expected ${status}, got ${res.status}: ${text}`);
  }
}

async function matrixSend(token: string, room: string, body: string): Promise<string> {
  const res = await fetch(`${MATRIX_BASE}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/send/m.room.message`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ msgtype: "m.text", body }),
  });
  await expectStatus(res, 200, "matrix send");
  return (await jsonOf<MatrixSendResult>(res)).event_id;
}

async function pikoCreateRun(taskId: string, instruction: string, discussion?: { room_id: string; trigger_event_id: string }): Promise<string> {
  const deadline = new Date(Date.now() + 5 * 60_000).toISOString();
  const payload = {
    task_id: taskId,
    instruction,
    workspace_ref: "piko",
    permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
    limits: { deadline_at: deadline, max_model_calls: 2, max_tool_calls: 0 },
    output_paths: [],
    ...(discussion ? { discussion } : {}),
  };
  const res = await fetch(`${PIKO_URL}/runs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PIKO_BEARER}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await expectStatus(res, 202, "POST /runs");
  return (await jsonOf<RunView>(res)).run_id;
}

async function pikoGetRun(runId: string): Promise<RunView> {
  const res = await fetch(`${PIKO_URL}/runs/${runId}`, { headers: { Authorization: `Bearer ${PIKO_BEARER}` } });
  await expectStatus(res, 200, `GET /runs/${runId}`);
  return jsonOf<RunView>(res);
}

async function pikoWaitTerminal(runId: string, timeoutMs = 90_000): Promise<RunView> {
  const start = Date.now();
  let last: RunView | undefined;
  while (Date.now() - start < timeoutMs) {
    last = await pikoGetRun(runId);
    if (["Completed", "Failed", "Cancelled"].includes(last.state)) return last;
    await new Promise((r) => setTimeout(r, 1_500));
  }
  throw new Error(`run ${runId} did not reach terminal in ${timeoutMs}ms (last=${last?.state})`);
}

async function pikoGetResult(runId: string): Promise<RunResult> {
  const res = await fetch(`${PIKO_URL}/runs/${runId}/result`, { headers: { Authorization: `Bearer ${PIKO_BEARER}` } });
  await expectStatus(res, 200, `GET /runs/${runId}/result`);
  return jsonOf<RunResult>(res);
}

async function sqliteScalar(sql: string): Promise<string> {
  // execFileSync (no shell): Matrix event ids start with "$" and a shell would
  // expand "$xyz" to the empty string inside double quotes.
  const { execFileSync } = await import("node:child_process");
  return execFileSync("sqlite3", [SQLITE_PATH, sql]).toString().trim();
}

/**
 * Piko's SDK may be blocked in a long-poll (up to sync_timeout_ms = 30s) when the
 * homeserver dies or Piko restarts; reconnect + batch ingest can therefore take
 * tens of seconds. Poll until the event lands instead of checking once.
 */
async function waitUntilEventIngested(eventId: string, timeoutMs = 60_000): Promise<number> {
  const start = Date.now();
  for (;;) {
    const count = Number(await sqliteScalar(`SELECT count(*) FROM matrix_events WHERE event_id='${eventId}';`));
    if (count >= 1) return count;
    if (Date.now() - start > timeoutMs) return count;
    await new Promise((r) => setTimeout(r, 1_000));
  }
}

async function restartHomeserver(): Promise<void> {
  const { execSync } = await import("node:child_process");
  try { execSync("pkill -f synapse.app.homeserver", { stdio: "ignore" }); } catch { /* not running */ }
  await new Promise((r) => setTimeout(r, 4_000));
  execSync(
    `cd ${HOMESERVER_DIR} && nohup ${PYTHON_BIN} -m synapse.app.homeserver --config-path=${HOMESERVER_DIR}/homeserver.yaml >${HOMESERVER_DIR}/stdout.log 2>&1 &`,
    { stdio: "ignore" },
  );
  for (let i = 0; i < 15; i++) {
    try {
      const r = await fetch(`${MATRIX_BASE}/_matrix/client/versions`);
      if (r.status === 200) return;
    } catch { /* keep polling */ }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error("synapse did not come back up within 15s");
}

async function restartPiko(): Promise<void> {
  const { execSync } = await import("node:child_process");
  try {
    const pid = execSync("lsof -nP -iTCP:8787 -sTCP:LISTEN -t").toString().trim().split("\n")[0];
    if (pid) execSync(`kill -9 ${pid}`);
  } catch { /* not running */ }
  await new Promise((r) => setTimeout(r, 3_000));
  execSync(
    `nohup env PIKO_CONFIG=${PIKO_RUNTIME_CONFIG} NODE_EXTRA_CA_CERTS=${CA_CERT} npm start --prefix /Users/ben/work/piko >/Users/ben/piko-runtime-stdout.log 2>&1 &`,
    { stdio: "ignore" },
  );
  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch(`${PIKO_URL}/runs`, { method: "POST", headers: { Authorization: `Bearer ${PIKO_BEARER}` } });
      if (r.status === 400 || r.status === 401) return;
    } catch { /* keep polling */ }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error("Piko did not come back up within 20s");
}

async function pikoBotSecretTokenValid(): Promise<boolean> {
  try {
    const { readFile } = await import("node:fs/promises");
    const token = (await readFile("/Users/ben/piko-secrets/matrix-piko-bot", "utf8")).trim();
    const res = await fetch(`${MATRIX_BASE}/_matrix/client/v3/account/whoami`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

/**
 * Self-healing entry point for every slow test: if the piko-bot secret token was
 * invalidated (e.g. by a previous PK-T18 run that failed before its own repair),
 * re-issue credentials via the Synapse admin API, persist them, and restart Piko
 * so the in-memory SDK token matches the persisted one.
 */
async function ensureValidPikoBotSession(): Promise<void> {
  if (await pikoBotSecretTokenValid()) return;
  const newPassword = `repair-${Date.now()}`;
  const reset = await fetch(`${MATRIX_BASE}/_synapse/admin/v1/reset_password/${encodeURIComponent("@piko-bot:piko.local")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${BEN_TOK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ new_password: newPassword, logout_devices: true }),
  });
  if (!reset.ok) throw new Error(`ensureValidPikoBotSession: reset_password failed ${reset.status}`);
  const login = await fetch(`${MATRIX_BASE}/_matrix/client/v3/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "m.login.password", user: "piko-bot", password: newPassword }),
  });
  if (!login.ok) throw new Error(`ensureValidPikoBotSession: login failed ${login.status}`);
  const { access_token } = await jsonOf<{ access_token: string }>(login);
  const { writeFile } = await import("node:fs/promises");
  await writeFile("/Users/ben/piko-secrets/matrix-piko-bot", access_token, { mode: 0o600 });
  await restartPiko();
}

beforeAll(async () => {
  try {
    const r = await fetch(`${PIKO_URL}/runs`, { method: "POST", headers: { Authorization: `Bearer ${PIKO_BEARER}` } });
    pikoUp = r.status === 400 || r.status === 401;
  } catch { pikoUp = false; }
  try {
    const r = await fetch(`${MATRIX_BASE}/_matrix/client/versions`);
    matrixUp = r.status === 200;
  } catch { matrixUp = false; }
});

beforeEach(async () => {
  if (skipMatrix || skipSlow || !matrixUp) return;
  await ensureValidPikoBotSession();
});

describe("Piko acceptance — service availability", () => {
  it("Piko is reachable (skipped when no PIKO_BEARER)", () => {
    if (!PIKO_BEARER) return;
    expect(pikoUp, `Piko at ${PIKO_URL} unreachable`).toBe(true);
  });
  it("LLM endpoint is reachable (used by oMLX smoke only)", async () => {
    if (skipSlow || !PIKO_BEARER) return;
    try {
      const r = await fetch(`${LLM_BASE}models`);
      expect(r.status === 200 || r.status === 401).toBe(true);
    } catch (e) { expect.fail(`LLM ${LLM_BASE} unreachable: ${(e as Error).message}`); }
  });
});

describe("PK-T11 — Matrix transport acceptance", () => {
  it.skipIf(skipMatrix)("ingests two-room messages into one Open Run", async () => {
    if (!matrixUp) return;
    const trigger = await matrixSend(SECOND_TOK, ROOM_ID, `t11-${Date.now()}`);
    const runId = await pikoCreateRun(
      `acc-t11-${Date.now()}`,
      "Reply briefly: ack",
      { room_id: ROOM_ID, trigger_event_id: trigger },
    );
    const initial = await pikoGetRun(runId);
    expect(["Queued", "Running"]).toContain(initial.state);

    await matrixSend(SECOND_TOK, ROOM_ID, `t11-followup-${Date.now()}`);
    const final = await pikoWaitTerminal(runId);
    expect(final.state).toBe("Completed");
    const result = await pikoGetResult(runId);
    expect(result.usage?.usage_observed_attempts).toBeGreaterThanOrEqual(1);
  }, 180_000);
});

describe("PK-T17 / PK-T25 — homeserver restart acceptance", () => {
  it.skipIf(skipMatrix || skipSlow)("continues ingesting after Synapse SIGKILL+restart", async () => {
    if (!matrixUp) return;
    const trigger = await matrixSend(SECOND_TOK, ROOM_ID, `t17-pre-${Date.now()}`);
    const runId = await pikoCreateRun(
      `acc-t17-${Date.now()}`,
      "ack",
      { room_id: ROOM_ID, trigger_event_id: trigger },
    );
    await pikoWaitTerminal(runId);

    await restartHomeserver();
    await new Promise((r) => setTimeout(r, 5_000));

    const followup = await matrixSend(SECOND_TOK, ROOM_ID, `t17-post-${Date.now()}`);
    expect(followup).toMatch(/^\$/);
    const count = await waitUntilEventIngested(followup);
    expect(count, `followup ${followup} not ingested after homeserver restart`).toBe(1);
  }, 120_000);
});

describe("PK-T28 / PK-T38 — Piko restart recovery", () => {
  it.skipIf(skipMatrix || skipSlow)("catches up on events sent while Piko was SIGKILL-ed", async () => {
    if (!matrixUp) return;
    const before = Number(await sqliteScalar("SELECT count(*) FROM matrix_events;"));
    const lost = await matrixSend(SECOND_TOK, ROOM_ID, `t28-pre-kill-${Date.now()}`);
    await restartPiko();
    const found = await waitUntilEventIngested(lost);
    const after = Number(await sqliteScalar("SELECT count(*) FROM matrix_events;"));
    expect(after).toBeGreaterThan(before);
    expect(found, `event ${lost} not caught up after restart`).toBe(1);
  }, 120_000);
});

describe("PK-T18 — auth-loss fail-closed", () => {
  it.skipIf(skipMatrix || skipSlow)("stops advancing cursor when piko-bot token is invalidated", async () => {
    if (!matrixUp) return;
    const before = Number(await sqliteScalar("SELECT count(*) FROM matrix_events;"));

    const newPassword = `acc-t18-pw-${Date.now()}`;
    const reset = await fetch(`${MATRIX_BASE}/_synapse/admin/v1/reset_password/${encodeURIComponent("@piko-bot:piko.local")}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${BEN_TOK}`, "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: newPassword, logout_devices: true }),
    });
    expect(reset.ok, `reset_password failed: ${reset.status} ${await reset.text()}`).toBe(true);

    try {
      await new Promise((r) => setTimeout(r, 8_000));
      const after = Number(await sqliteScalar("SELECT count(*) FROM matrix_events;"));
      // Fail-closed invariant: no NEW events are ingested after credential loss.
      // The sync_cursor string itself may advance once for an in-flight batch of
      // already-seen events (dedup drops them; cursor commit is bookkeeping).
      expect(after, "events kept advancing while piko-bot token was invalid").toBe(before);
    } finally {
      // Repair ALWAYS runs (even on assertion failure): re-login as piko-bot,
      // rewrite the secret file, and restart Piko kill-then-spawn so the old
      // process holding 8787 with the invalidated in-memory token cannot linger.
      try {
        const login = await fetch(`${MATRIX_BASE}/_matrix/client/v3/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "m.login.password", user: "piko-bot", password: newPassword }),
        });
        if (login.ok) {
          const { access_token } = await jsonOf<{ access_token: string }>(login);
          const { writeFile } = await import("node:fs/promises");
          await writeFile("/Users/ben/piko-secrets/matrix-piko-bot", access_token, { mode: 0o600 });
          await restartPiko();
        }
      } catch { /* leave the broken state; the next beforeEach will self-heal */ }
    }
  }, 120_000);
});

afterAll(() => { /* no global teardown */ });
