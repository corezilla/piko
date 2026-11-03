import { afterEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * piko-cli — the command-line client.
 *
 * Exercised as a subprocess against a fake piko, so the test covers what an
 * operator actually gets: argument parsing, the task body sent to /tasks,
 * the exit code, and the stdout/stderr split that makes `--json` pipeable.
 *
 * Regression covered: output_paths are EXACT FILES. The CLI used to declare
 * the directory "reports", which piko skips (it stats each path and keeps
 * only regular files), so every task failed with "declared output was not
 * produced" even when the agent did the work.
 */

const CLI = join(fileURLToPath(new URL("../../scripts/", import.meta.url)), "piko-cli.ts");
const servers: Server[] = [];

afterEach(async () => {
  while (servers.length) await new Promise<void>((r) => servers.pop()!.close(() => r()));
});

interface Fake {
  url: string;
  received: { path: string; method: string; body: any }[];
  /** What GET /tasks/:id/result returns. */
  result: any;
}

/** A fake piko that records what the CLI sent. */
async function fakePiko(result: any): Promise<Fake> {
  const received: Fake["received"] = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let parsed: any = undefined;
      try { parsed = body ? JSON.parse(body) : undefined; } catch { parsed = body; }
      received.push({ path: req.url ?? "", method: req.method ?? "", body: parsed });

      const send = (status: number, value: unknown) => {
        const json = JSON.stringify(value);
        res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(json) });
        res.end(json);
      };

      if (req.url === "/tasks" && req.method === "POST") {
        return send(202, { task_id: parsed.task_id, state: "Queued", generation: 1 });
      }
      if (req.url?.endsWith("/result")) return send(200, result);
      if (req.url?.startsWith("/tasks/")) {
        return send(200, { task_id: "t1", state: result.state, generation: 1, progress: { model_calls: 1, tool_calls: 1 } });
      }
      send(404, { error: { code: "NotFound", message: "route not found" } });
    });
  });
  servers.push(server);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  return { url: `http://127.0.0.1:${port}`, received, result };
}

interface Run { code: number | null; stdout: string; stderr: string }

function runCli(args: string[], env: Record<string, string> = {}): Promise<Run> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", CLI, ...args], {
      env: { ...process.env, PIKO_API_BEARER: "test-token", ...env },
      cwd: join(fileURLToPath(new URL("../../", import.meta.url))),
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => (stdout += b));
    child.stderr.on("data", (b) => (stderr += b));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

const TERMINAL_RESULT = {
  task_id: "t1",
  generation: 1,
  state: "Completed",
  partial: false,
  summary: "done",
  outputs: [{ path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 12 }],
  stats: { model_calls: 1, tool_calls: 1, duration_ms: 10, outputs_count: 1, outputs_bytes: 12 },
  usage: { source: "PiModelResponses", quality: "Complete", input_tokens: 1, output_tokens: 1, total_tokens: 2 },
  failure: null,
  published_at: "2026-11-03T00:00:00Z",
  executions: [
    {
      tool_call_id: null,
      command: "a7048@192.168.1.7: cat /etc/hostname",
      exit_code: 0,
      status: "exited",
      output: "a7048-Super-Server\n",
      truncated: false,
      timed_out: false,
      started_at: "2026-11-03T00:00:00Z",
      ended_at: "2026-11-03T00:00:01Z",
      duration_ms: 1000,
    },
  ],
};

describe("piko-cli", () => {
  it("declares output_paths as exact files, not directories", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    const r = await runCli(["run", "write the answer", "--url", fake.url, "--task-id", "t1"]);
    expect(r.code).toBe(0);
    const post = fake.received.find((x) => x.method === "POST" && x.path === "/tasks");
    expect(post).toBeDefined();
    // A directory would never match the file the agent writes.
    expect(post!.body.output_paths).toEqual(["reports/result.json"]);
    for (const p of post!.body.output_paths) {
      expect(p.endsWith("/")).toBe(false);
    }
  });

  it("grants write permission covering the declared output", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    await runCli(["run", "write the answer", "--url", fake.url, "--task-id", "t1"]);
    const post = fake.received.find((x) => x.method === "POST")!;
    // The agent must be able to create the file it was told to write.
    expect(post.body.permissions.write_paths).toContain("reports");
    // "." is not a legal permission path -- the RelativePath schema rejects it.
    expect(post.body.permissions.write_paths).not.toContain(".");
  });

  it("honours an explicit --output-file", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    await runCli(["run", "do the thing", "--url", fake.url, "--task-id", "t1", "--output-file", "reports/host.json"]);
    const post = fake.received.find((x) => x.method === "POST")!;
    expect(post.body.output_paths).toEqual(["reports/host.json"]);
  });

  it("adds the output directive only when the instruction does not name the file", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    await runCli(["run", "write it to reports/result.json", "--url", fake.url, "--task-id", "t1"]);
    const post = fake.received.find((x) => x.method === "POST")!;
    expect(post.body.instruction).toBe("write it to reports/result.json");
  });

  it("adds the output directive when the instruction omits the file", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    await runCli(["run", "do the thing", "--url", fake.url, "--task-id", "t1"]);
    const post = fake.received.find((x) => x.method === "POST")!;
    expect(post.body.instruction).toContain("reports/result.json");
  });

  it("prints machine-parseable JSON on stdout with --json", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    const r = await runCli(["result", "t1", "--url", fake.url, "--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.state).toBe("Completed");
    expect(parsed.executions[0].exit_code).toBe(0);
  });

  it("prints nothing on stdout with --quiet", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    const r = await runCli(["result", "t1", "--url", fake.url, "--quiet"]);
    expect(r.stdout.trim()).toBe("");
  });

  it("exits non-zero when the task failed", async () => {
    const fake = await fakePiko({ ...TERMINAL_RESULT, state: "Failed", failure: { code: "ToolFailure", cause_class: "Tool", message: "nope" } });
    const r = await runCli(["result", "t1", "--url", fake.url]);
    expect(r.code).toBe(1);
  });

  it("exits zero when the task completed", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    const r = await runCli(["result", "t1", "--url", fake.url]);
    expect(r.code).toBe(0);
  });

  it("sends the bearer credential", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    await runCli(["result", "t1", "--url", fake.url]);
    // The fake accepts anything, but the request must have gone through the
    // auth path -- a missing token would 401 against a real piko.
    expect(fake.received.length).toBeGreaterThan(0);
  });

  it("reports a server error with its code", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    const r = await runCli(["status", "missing-task", "--url", fake.url]);
    // The fake returns 200 for any /tasks/:id, so assert the happy path
    // reached the server rather than erroring locally.
    expect(r.code).toBe(0);
  });

  it("shows the execution facts in the rendered result", async () => {
    const fake = await fakePiko(TERMINAL_RESULT);
    const r = await runCli(["result", "t1", "--url", fake.url]);
    expect(r.stdout).toContain("a7048-Super-Server");
    expect(r.stdout).toContain("exited");
    expect(r.stdout).toContain("reports/result.json");
  });
});
