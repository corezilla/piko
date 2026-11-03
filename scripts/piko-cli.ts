#!/usr/bin/env -S npx tsx
// scripts/piko-cli.ts — a command-line client for the Piko agent runtime.
//
// Speaks the same HTTP contract slinky speaks (agent-runtime v0.3,
// simplified.6), so anything it can do is exactly what slinky can do.
// It exists for debugging and testing: submit a task, watch it run,
// read the machine-judgeable result, cancel it.
//
// Dependency-free on purpose: plain fetch + node builtins only, so it can
// be copied to any host that can reach piko (m5air, a laptop, CI) without
// installing piko's dependencies.
//
// Usage:
//   tsx scripts/piko-cli.ts <command> [options]
//
//   run <instruction>        Submit a task and follow it to a terminal state.
//   submit <instruction>     Submit a task, print the id, do NOT wait.
//   status <task_id>         Show one task's current state.
//   result <task_id>         Fetch the terminal result (AgentResult).
//   wait <task_id>           Block until a task reaches a terminal state.
//   cancel <task_id>         Request cancellation.
//   list                     List known tasks from the local journal.
//   diag                     Fetch the operator diagnostics snapshot.
//   repl                     Interactive shell.
//
// Common options:
//   --url <base>             Piko base URL       (env PIKO_URL,   default http://127.0.0.1:8787)
//   --token <bearer>         Bearer credential   (env PIKO_API_BEARER)
//   --profile <ref>          Tool profile        (default workspace-exec)
//   --workspace <ref>        Workspace root key  (default piko)
//   --task-id <id>           Use this id instead of a generated one.
//   --out <path>             Write the result JSON to this file.
//   --output-file <path>     An exact output FILE the task promises
//                            (repeatable, default reports/result.json).
//   --timeout <seconds>      Give up waiting after this long (default 1800).
//   --interval <seconds>     Poll interval while waiting (default 3).
//   --no-color               Disable ANSI colour.
//   --json                   Print raw JSON instead of the rendered view.
//   --quiet                  Only print the final result.
//
// Note: output_paths are EXACT FILES. Declaring a directory ("reports")
// never matches the file the agent actually writes, and the task then fails
// with "declared output was not produced" -- so --output-file must name the
// file the instruction asks for.
//
// Examples:
//   tsx scripts/piko-cli.ts run "write the answer to reports/result.json"
//   tsx scripts/piko-cli.ts run "run 'cat /etc/hostname' on a7048@192.168.1.7 via remote_bash and write it to reports/host.json" --output-file reports/host.json
//   tsx scripts/piko-cli.ts status  my-task-001
//   tsx scripts/piko-cli.ts result my-task-001 --json
//   tsx scripts/piko-cli.ts repl

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------- config

interface Options {
  url: string;
  token: string | undefined;
  profile: string;
  workspace: string;
  taskId: string | undefined;
  out: string | undefined;
  timeoutSec: number;
  intervalSec: number;
  color: boolean;
  json: boolean;
  quiet: boolean;
  writePaths: string[];
  readPaths: string[];
  /** Exact output FILES the task promises. Not directories. */
  outputFiles: string[];
}

const JOURNAL = join(homedir(), ".piko-cli.json");
const TERMINAL = new Set(["Completed", "Failed", "Cancelled"]);

function envToken(): string | undefined {
  // PIKO_API_BEARER is what piko itself reads; PIKO_TOKEN is a convenience
  // alias so the CLI can be used without touching piko's own env names.
  return process.env.PIKO_API_BEARER ?? process.env.PIKO_TOKEN ?? undefined;
}

function parseArgs(argv: string[]): { command: string; positional: string[]; options: Options } {
  const options: Options = {
    url: process.env.PIKO_URL ?? "http://127.0.0.1:8787",
    token: envToken(),
    profile: "workspace-exec",
    workspace: "piko",
    taskId: undefined,
    out: undefined,
    timeoutSec: 1800,
    intervalSec: 3,
    color: process.stdout.isTTY === true && process.env.NO_COLOR === undefined,
    json: false,
    quiet: false,
    writePaths: [],
    readPaths: [],
    outputFiles: [],
  };
  const positional: string[] = [];
  let command = "";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`missing value for ${arg}`);
      return v;
    };
    switch (arg) {
      case "--url": options.url = next(); break;
      case "--token": options.token = next(); break;
      case "--profile": options.profile = next(); break;
      case "--workspace": options.workspace = next(); break;
      case "--task-id": options.taskId = next(); break;
      case "--out": options.out = next(); break;
      case "--timeout": options.timeoutSec = Number(next()); break;
      case "--interval": options.intervalSec = Number(next()); break;
      case "--write": options.writePaths.push(next()); break;
      case "--read": options.readPaths.push(next()); break;
      case "--output-file": options.outputFiles.push(next()); break;
      case "--no-color": options.color = false; break;
      case "--json": options.json = true; break;
      case "--quiet": options.quiet = true; break;
      case "-h":
      case "--help": command = "help"; break;
      default:
        if (arg.startsWith("-")) throw new Error(`unknown option: ${arg}`);
        if (!command) command = arg;
        else positional.push(arg);
    }
  }
  return { command: command || "help", positional, options };
}

// ---------------------------------------------------------------- colour

const C = {
  reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", cyan: "\x1b[36m",
};

function paint(options: Options, text: string, colour: string): string {
  return options.color ? `${colour}${text}${C.reset}` : text;
}

function stateColour(state: string): string {
  switch (state) {
    case "Completed": return C.green;
    case "Failed": return C.red;
    case "Cancelled": return C.yellow;
    case "Running": return C.cyan;
    default: return C.dim;
  }
}

// ---------------------------------------------------------------- http

class PikoClient {
  constructor(private readonly options: Options) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (this.options.token) h.authorization = `Bearer ${this.options.token}`;
    return h;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<{ status: number; body: T }> {
    const res = await fetch(`${this.options.url}${path}`, {
      method,
      headers: this.headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }
    return { status: res.status, body: parsed as T };
  }

  async submit(task: Record<string, unknown>): Promise<TaskView> {
    const res = await this.request<TaskView | ErrorBody>("POST", "/tasks", task);
    if (res.status !== 202 && res.status !== 200) {
      throw new Error(`${(res.body as ErrorBody).error?.code ?? res.status}: ${(res.body as ErrorBody).error?.message ?? "submit failed"}`);
    }
    return res.body as TaskView;
  }

  async status(taskId: string): Promise<TaskView> {
    const res = await this.request<TaskView | ErrorBody>("GET", `/tasks/${encodeURIComponent(taskId)}`);
    if (res.status !== 200) {
      throw new Error(`${(res.body as ErrorBody).error?.code ?? res.status}: ${(res.body as ErrorBody).error?.message ?? "status failed"}`);
    }
    return res.body as TaskView;
  }

  async result(taskId: string): Promise<AgentResult | ErrorBody> {
    const res = await this.request<AgentResult | ErrorBody>("GET", `/tasks/${encodeURIComponent(taskId)}/result`);
    return res.body;
  }

  async cancel(taskId: string): Promise<CancelReceipt> {
    const res = await this.request<CancelReceipt | ErrorBody>("POST", `/tasks/${encodeURIComponent(taskId)}:cancel`);
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`${(res.body as ErrorBody).error?.code ?? res.status}: ${(res.body as ErrorBody).error?.message ?? "cancel failed"}`);
    }
    return res.body as CancelReceipt;
  }

  async diagnostics(): Promise<{ ok: true; body: unknown } | { ok: false; message: string }> {
    const res = await this.request<unknown | ErrorBody>("GET", "/diagnostics");
    if (res.status !== 200) {
      const body = res.body as ErrorBody;
      return { ok: false, message: `${body.error?.code ?? res.status}: ${body.error?.message ?? "diagnostics unavailable"}` };
    }
    return { ok: true, body: res.body };
  }
}

interface ErrorBody { error?: { code?: string; message?: string; request_id?: string } }
interface TaskView {
  task_id: string; state: string; generation: number; accepted_at: string;
  started_at: string | null; finished_at: string | null; result_available: boolean;
  cancel_requested: boolean;
  progress?: { model_calls: number; tool_calls: number; elapsed_ms: number; current_action?: { kind?: string; description?: string } | null };
  artifact_delivery?: { state: string; delivered: unknown[]; failed: unknown[] };
}
interface CancelReceipt { task_id: string; outcome: string }
interface ExecutionFact {
  tool_call_id: string | null; command: string; exit_code: number | null;
  status: string; output: string; truncated: boolean; timed_out: boolean;
  started_at: string; ended_at: string; duration_ms: number;
}
interface AgentResult {
  task_id: string; generation: number; state: string; partial: boolean;
  summary: string;
  outputs: { path: string; sha256: string; size_bytes: number }[];
  stats: { model_calls: number; tool_calls: number; duration_ms: number; outputs_count: number; outputs_bytes: number };
  usage: { source: string; quality: string; input_tokens: number; output_tokens: number; total_tokens: number };
  failure: { code: string; cause_class: string; message: string } | null;
  published_at: string;
  executions: ExecutionFact[];
}

// ---------------------------------------------------------------- journal
// A tiny local list of task ids this client has seen, so `list` and the
// REPL's tab-completion have something to work with. Piko has no list
// endpoint (the contract is four operations), so this is client-side only.

interface JournalEntry { task_id: string; instruction: string; submitted_at: string; profile: string; state?: string }

function readJournal(): JournalEntry[] {
  try {
    if (!existsSync(JOURNAL)) return [];
    const parsed = JSON.parse(readFileSync(JOURNAL, "utf8"));
    return Array.isArray(parsed) ? (parsed as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

function writeJournal(entry: JournalEntry): void {
  const entries = readJournal().filter((e) => e.task_id !== entry.task_id);
  entries.unshift(entry);
  mkdirSync(join(homedir()), { recursive: true });
  writeFileSync(JOURNAL, JSON.stringify(entries.slice(0, 200), null, 2));
}

function updateJournalState(taskId: string, state: string): void {
  const entries = readJournal();
  const entry = entries.find((e) => e.task_id === taskId);
  if (!entry) return;
  entry.state = state;
  writeFileSync(JOURNAL, JSON.stringify(entries, null, 2));
}

// ---------------------------------------------------------------- rendering

function renderTask(options: Options, view: TaskView): string {
  const lines: string[] = [];
  const state = paint(options, view.state, stateColour(view.state));
  lines.push(`${paint(options, view.task_id, C.bold)}  ${state}  ${paint(options, `gen ${view.generation}`, C.dim)}`);
  if (view.started_at) lines.push(paint(options, `  started   ${view.started_at}`, C.dim));
  if (view.finished_at) lines.push(paint(options, `  finished  ${view.finished_at}`, C.dim));
  if (view.progress) {
    lines.push(paint(options, `  calls     model=${view.progress.model_calls} tool=${view.progress.tool_calls}`, C.dim));
  }
  return lines.join("\n");
}

function renderResult(options: Options, result: AgentResult): string {
  const lines: string[] = [];
  const state = paint(options, result.state, stateColour(result.state));
  lines.push(`${paint(options, result.task_id, C.bold)}  ${state}${result.partial ? paint(options, "  (partial)", C.yellow) : ""}`);
  lines.push(`  ${paint(options, "summary", C.dim)}  ${result.summary}`);

  if (result.failure) {
    lines.push("");
    lines.push(`  ${paint(options, "failure", C.red)}  ${result.failure.code} (${result.failure.cause_class})`);
    lines.push(`          ${result.failure.message}`);
  }

  if (result.outputs.length > 0) {
    lines.push("");
    lines.push(`  ${paint(options, "outputs", C.bold)}`);
    for (const o of result.outputs) {
      lines.push(`    ${o.path}  ${paint(options, `${o.size_bytes}B`, C.dim)}  sha256:${o.sha256.slice(0, 16)}…`);
    }
  }

  if (result.executions.length > 0) {
    lines.push("");
    lines.push(`  ${paint(options, "executions", C.bold)}`);
    for (const f of result.executions) {
      const bad = f.status !== "exited" || (f.exit_code !== null && f.exit_code !== 0);
      const badge = paint(options, `${f.status}${f.exit_code !== null ? ` exit=${f.exit_code}` : ""}`, bad ? C.red : C.green);
      lines.push(`    ${badge}  ${f.command}`);
      const out = f.output.trim();
      if (out) {
        const shown = out.length > 400 ? `${out.slice(0, 400)}… (${out.length} bytes)` : out;
        lines.push(`      ${paint(options, shown.split("\n").join("\n      "), C.dim)}`);
      }
      if (f.truncated) lines.push(paint(options, "      (output truncated)", C.yellow));
    }
  }

  lines.push("");
  lines.push(paint(options, `  stats      model=${result.stats.model_calls} tool=${result.stats.tool_calls} usage=${result.usage.total_tokens}tok`, C.dim));
  return lines.join("\n");
}

// ---------------------------------------------------------------- commands

function buildTask(options: Options, instruction: string): Record<string, unknown> {
  // output_paths are EXACT FILES, not directories: piko stats each path and
  // skips anything that is not a regular file, so declaring "reports" would
  // never match the "reports/result.json" the agent actually writes, and the
  // task would fail with "declared output was not produced".
  const outputFiles = options.outputFiles.length > 0 ? options.outputFiles : ["reports/result.json"];

  // The write permission must cover the declared output, otherwise the agent
  // cannot create it and the task fails with "path is outside task
  // permissions" instead of doing the work.
  //
  // A root-level output ("result.json") has no parent directory to grant, so
  // the file path itself is granted. "." is NOT a legal permission path --
  // the RelativePath schema rejects it -- so it is never used here.
  const writePaths = options.writePaths.length > 0
    ? [...new Set([...options.writePaths, ...outputFiles.map((f) => dirnameOf(f))])]
    : [...new Set(outputFiles.map((f) => dirnameOf(f)))];

  return {
    task_id: options.taskId ?? `cli-${Date.now().toString(36)}`,
    instruction: withOutputDirective(instruction, outputFiles),
    workspace_ref: options.workspace,
    permissions: {
      read_paths: options.readPaths.length > 0 ? options.readPaths : writePaths,
      write_paths: writePaths,
      tool_profile_ref: options.profile,
    },
    output_paths: outputFiles,
  };
}

/**
 * Append the output directive when the instruction does not already name the
 * declared file.
 *
 * Without this, the agent picks its own filename and the task fails with
 * "declared output was not produced" even though the work was done. When the
 * instruction DOES name the file, the instruction wins -- the agent's
 * judgement about the actual filename is better than the CLI's default.
 */
function withOutputDirective(instruction: string, outputFiles: readonly string[]): string {
  if (outputFiles.some((f) => instruction.includes(f))) return instruction;
  const list = outputFiles.map((f) => `"${f}"`).join(", ");
  return `${instruction}\n\nWrite the result as JSON to ${list}. The file must exist when you finish.`;
}

/**
 * "reports/result.json" -> "reports";  "result.json" -> "result.json".
 *
 * The root case returns the file itself because the schema forbids "." as a
 * permission path and there is no parent directory to name.
 */
function dirnameOf(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx <= 0 ? path : path.slice(0, idx);
}

async function cmdRun(options: Options, instruction: string): Promise<number> {
  const client = new PikoClient(options);
  const task = buildTask(options, instruction);
  const view = await client.submit(task);
  writeJournal({ task_id: view.task_id, instruction, submitted_at: new Date().toISOString(), profile: options.profile, state: view.state });
  if (!options.quiet && !options.json) {
    console.error(paint(options, `submitted ${view.task_id}`, C.green));
    console.error(renderTask(options, view));
  }
  const result = await follow(client, options, view.task_id);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  return result.state === "Completed" ? 0 : 1;
}

async function cmdSubmit(options: Options, instruction: string): Promise<number> {
  const client = new PikoClient(options);
  const view = await client.submit(buildTask(options, instruction));
  writeJournal({ task_id: view.task_id, instruction, submitted_at: new Date().toISOString(), profile: options.profile, state: view.state });
  console.log(view.task_id);
  return 0;
}

async function cmdStatus(options: Options, taskId: string): Promise<number> {
  const client = new PikoClient(options);
  const view = await client.status(taskId);
  if (options.json) { console.log(JSON.stringify(view, null, 2)); return 0; }
  if (!options.quiet) console.log(renderTask(options, view));
  return 0;
}

async function cmdResult(options: Options, taskId: string): Promise<number> {
  const client = new PikoClient(options);
  const body = await client.result(taskId);
  if (options.out) {
    writeFileSync(options.out, JSON.stringify(body, null, 2));
    if (!options.quiet) console.error(paint(options, `wrote ${options.out}`, C.green));
  }
  if (options.json) {
    console.log(JSON.stringify(body, null, 2));
  } else if (!options.out && !options.quiet) {
    console.log(renderResult(options, body as AgentResult));
  }
  return (body as AgentResult).state === "Completed" ? 0 : 1;
}

async function cmdWait(options: Options, taskId: string): Promise<number> {
  const client = new PikoClient(options);
  const result = await follow(client, options, taskId);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  return result.state === "Completed" ? 0 : 1;
}

async function cmdCancel(options: Options, taskId: string): Promise<number> {
  const client = new PikoClient(options);
  const receipt = await client.cancel(taskId);
  console.log(receipt.outcome);
  return 0;
}

async function cmdList(options: Options): Promise<number> {
  const entries = readJournal();
  if (options.json) { console.log(JSON.stringify(entries, null, 2)); return 0; }
  if (entries.length === 0) {
    console.error(paint(options, "no tasks yet", C.dim));
    return 0;
  }
  const client = new PikoClient(options);
  for (const entry of entries) {
    let state = entry.state ?? "unknown";
    try {
      const view = await client.status(entry.task_id);
      state = view.state;
      updateJournalState(entry.task_id, state);
    } catch {
      /* the task may have aged out of retention; show what we recorded */
    }
    const badge = paint(options, state.padEnd(9), stateColour(state));
    const instruction = entry.instruction.length > 60 ? `${entry.instruction.slice(0, 60)}…` : entry.instruction;
    console.error(`${badge} ${entry.task_id.padEnd(24)} ${paint(options, instruction, C.dim)}`);
  }
  return 0;
}

async function cmdDiag(options: Options): Promise<number> {
  const client = new PikoClient(options);
  const res = await client.diagnostics();
  if (!res.ok) {
    console.error(paint(options, `diagnostics unavailable: ${res.message}`, C.red));
    return 1;
  }
  console.log(JSON.stringify(res.body, null, 2));
  return 0;
}

// ---------------------------------------------------------------- follow

async function follow(client: PikoClient, options: Options, taskId: string): Promise<AgentResult> {
  const deadline = Date.now() + options.timeoutSec * 1000;
  let lastLine = "";

  while (Date.now() < deadline) {
    const body = await client.result(taskId);
    const result = body as AgentResult;

    if (result && typeof result.state === "string" && TERMINAL.has(result.state)) {
      if (!options.quiet && !options.json) {
        console.log("");
        console.log(renderResult(options, result));
      }
      if (options.out) {
        writeFileSync(options.out, JSON.stringify(result, null, 2));
        if (!options.quiet) console.error(paint(options, `wrote ${options.out}`, C.green));
      }
      updateJournalState(taskId, result.state);
      return result;
    }

    // Not terminal yet. Two shapes come back from /result: 409 TaskNotTerminal
    // (still running) and 404 (not found / aged out). Surface progress from
    // the task view instead.
    //
    // Progress goes to STDERR: stdout stays machine-parseable so `--json`
    // can be piped into jq without the progress line corrupting it.
    try {
      const view = await client.status(taskId);
      const line = `${view.state} model=${view.progress?.model_calls ?? 0} tool=${view.progress?.tool_calls ?? 0}`;
      if (line !== lastLine && !options.quiet && !options.json) {
        lastLine = line;
        // Erase the previous progress line before writing the new one; the
        // trailing spaces matter, otherwise a shorter line leaves the tail
        // of the previous one behind.
        const padded = `  ${line}`.padEnd(60);
        process.stderr.write(options.color ? `\r\x1b[2K${paint(options, padded, C.dim)}` : `${padded}\n`);
      }
    } catch {
      /* transient */
    }

    await sleep(options.intervalSec * 1000);
  }

  throw new Error(`timed out after ${options.timeoutSec}s waiting for ${taskId}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------- repl

async function cmdRepl(options: Options): Promise<number> {
  const client = new PikoClient(options);

  console.error(paint(options, `piko-cli — ${options.url}`, C.bold));
  console.error(paint(options, "commands: run <text> | submit <text> | status <id> | result <id> | wait <id> | cancel <id> | list | diag | help | quit", C.dim));

  // A TTY gets the line editor; a pipe gets plain line reads. readline's
  // promise API does not resume after a command when stdin is not a TTY, so
  // piped sessions would silently stop after the first command.
  const interactive = process.stdin.isTTY === true;

  if (!interactive) {
    for await (const raw of readLines(process.stdin)) {
      const line = raw.trim();
      if (!line) continue;
      if (line === "quit" || line === "exit") break;
      await runReplCommand(options, line);
    }
    return 0;
  }

  const readline = await import("node:readline/promises");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (;;) {
      let line: string;
      try {
        line = await rl.question(paint(options, "piko> ", C.cyan));
      } catch {
        break; // EOF
      }
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === "quit" || trimmed === "exit") break;
      await runReplCommand(options, trimmed);
    }
  } finally {
    rl.close();
  }
  return 0;
}

/** Split a readable stream into lines, without readline's TTY machinery. */
async function* readLines(stream: AsyncIterable<string>): AsyncGenerator<string> {
  let buffer = "";
  for await (const chunk of stream) {
    buffer += chunk;
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      yield buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
    }
  }
  if (buffer.length > 0) yield buffer;
}

async function runReplCommand(options: Options, trimmed: string): Promise<void> {
  const [verb, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ");
  try {
    switch (verb) {
      case "run": await cmdRun(options, arg); break;
      case "submit": await cmdSubmit(options, arg); break;
      case "status": await cmdStatus(options, arg); break;
      case "result": await cmdResult(options, arg); break;
      case "wait": await cmdWait(options, arg); break;
      case "cancel": await cmdCancel(options, arg); break;
      case "list": await cmdList(options); break;
      case "diag": await cmdDiag(options); break;
      case "help": console.log(HELP); break;
      default:
        console.error(paint(options, `unknown command: ${verb}`, C.red));
    }
  } catch (e) {
    console.error(paint(options, `error: ${(e as Error).message}`, C.red));
  }
}

const HELP = `
piko-cli — command-line client for the Piko agent runtime

  run <instruction>        Submit a task and follow it to a terminal state.
  submit <instruction>     Submit a task, print the id, do NOT wait.
  status <task_id>         Show one task's current state.
  result <task_id>         Fetch the terminal result (AgentResult).
  wait <task_id>           Block until a task reaches a terminal state.
  cancel <task_id>         Request cancellation.
  list                     List tasks this client has submitted.
  diag                     Fetch the operator diagnostics snapshot.
  repl                     Interactive shell.

Options
  --url <base>          Piko base URL      (env PIKO_URL, default http://127.0.0.1:8787)
  --token <bearer>      Bearer credential  (env PIKO_API_BEARER or PIKO_TOKEN)
  --profile <ref>       Tool profile       (default workspace-exec)
  --workspace <ref>     Workspace root key (default piko)
  --task-id <id>        Use this id instead of a generated one.
  --out <path>          Write the result JSON to this file.
  --timeout <seconds>   Give up waiting after this long (default 1800).
  --interval <seconds>  Poll interval while waiting (default 3).
  --write <path>        Declare a writable path (repeatable).
  --read <path>         Declare a readable path (repeatable).
  --output-file <path>  An exact output FILE the task promises (repeatable,
                         default reports/result.json). Must match the file
                         the instruction tells the agent to write.
  --no-color            Disable ANSI colour.
  --json                Print raw JSON.
  --quiet               Only print the final result.

Exit code is 0 when the task ends Completed, 1 otherwise — usable in scripts.

Output streams: the RESULT goes to stdout (JSON with --json, rendered text
otherwise); progress and status chatter go to stderr, so stdout stays
pipeable into jq.
`.trim();

// ---------------------------------------------------------------- main

async function main(): Promise<number> {
  const { command, positional, options } = parseArgs(process.argv.slice(2));
  const instruction = positional.join(" ");

  switch (command) {
    case "run":
      if (!instruction) throw new Error("run needs an instruction");
      return cmdRun(options, instruction);
    case "submit":
      if (!instruction) throw new Error("submit needs an instruction");
      return cmdSubmit(options, instruction);
    case "status": {
      const id = positional[0] ?? options.taskId;
      if (!id) throw new Error("status needs a task id");
      return cmdStatus(options, id);
    }
    case "result": {
      const id = positional[0] ?? options.taskId;
      if (!id) throw new Error("result needs a task id");
      return cmdResult(options, id);
    }
    case "wait": {
      const id = positional[0] ?? options.taskId;
      if (!id) throw new Error("wait needs a task id");
      return cmdWait(options, id);
    }
    case "cancel": {
      const id = positional[0] ?? options.taskId;
      if (!id) throw new Error("cancel needs a task id");
      return cmdCancel(options, id);
    }
    case "list":
      return cmdList(options);
    case "diag":
      return cmdDiag(options);
    case "repl":
      return cmdRepl(options);
    case "help":
      console.log(HELP);
      return 0;
    default:
      console.error(`unknown command: ${command}\n`);
      console.log(HELP);
      return 2;
  }
}

main()
  .then((code) => { process.exitCode = code; })
  .catch((e) => {
    console.error(`error: ${(e as Error).message}`);
    process.exitCode = 2;
  });
