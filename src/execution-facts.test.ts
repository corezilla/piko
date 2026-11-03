import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DurableNodeExecutionEnv } from "./durable-fs.js";
import { ExecutionFactCollector, statusFromErrorCode } from "./execution-facts.js";
import { BACKGROUND_CONTEXT } from "../upstream/pi/packages/agent/src/harness/context.ts";

const roots: string[] = [];
function makeEnv(): DurableNodeExecutionEnv {
  const root = mkdtempSync(join(tmpdir(), "piko-execfact-"));
  roots.push(root);
  return new DurableNodeExecutionEnv({ cwd: root });
}

describe("DurableNodeExecutionEnv.exec — execution facts", () => {
  it("records a successful command with exit code 0", async () => {
    const env = makeEnv();
    const result = await env.exec("echo hello", undefined, BACKGROUND_CONTEXT);
    assert.equal(result.ok, true);

    const facts = env.executionFacts.list();
    assert.equal(facts.length, 1);
    assert.equal(facts[0]?.exit_code, 0);
    assert.equal(facts[0]?.status, "exited");
    assert.equal(facts[0]?.timed_out, false);
    assert.equal(facts[0]?.command, "echo hello");
    assert.ok((facts[0]?.duration_ms ?? -1) >= 0);
  });

  it("records a non-zero exit code instead of losing it", async () => {
    const env = makeEnv();
    const result = await env.exec("exit 42", undefined, BACKGROUND_CONTEXT);
    assert.equal(result.ok, true);

    const facts = env.executionFacts.list();
    assert.equal(facts.length, 1);
    // This is the value Pi's bash tool discards: it converts the code to an
    // Error string and throws before returning it.
    assert.equal(facts[0]?.exit_code, 42);
    assert.equal(facts[0]?.status, "exited");
  });

  it("records a timeout as status=timeout with timed_out=true", async () => {
    const env = makeEnv();
    const result = await env.exec("sleep 5", { timeout: 0.2 }, BACKGROUND_CONTEXT);
    assert.equal(result.ok, false);

    const facts = env.executionFacts.list();
    assert.equal(facts.length, 1);
    assert.equal(facts[0]?.status, "timeout");
    assert.equal(facts[0]?.timed_out, true);
    assert.equal(facts[0]?.exit_code, null);
  });

  it("records facts in execution order across multiple commands", async () => {
    const env = makeEnv();
    await env.exec("echo one", undefined, BACKGROUND_CONTEXT);
    await env.exec("exit 3", undefined, BACKGROUND_CONTEXT);
    await env.exec("echo three", undefined, BACKGROUND_CONTEXT);

    const facts = env.executionFacts.list();
    assert.equal(facts.length, 3);
    assert.equal(facts[0]?.command, "echo one");
    assert.equal(facts[1]?.exit_code, 3);
    assert.equal(facts[2]?.command, "echo three");
  });

  it("exposes the collector last() helper", async () => {
    const env = makeEnv();
    await env.exec("echo only", undefined, BACKGROUND_CONTEXT);
    assert.equal(env.executionFacts.last()?.command, "echo only");
  });

  it("captures the command output", async () => {
    const env = makeEnv();
    // Pi only delivers text through onUpdate when capture is configured -- the
    // bash tool always configures it, so mirror that here.
    await env.exec(
      "echo captured-text",
      { capture: { limits: { maxBytes: 65536, maxLines: 1000, retain: "tail" } } },
      BACKGROUND_CONTEXT,
    );
    const fact = env.executionFacts.last();
    assert.match(fact?.output ?? "", /captured-text/);
  });

  it("still calls the caller's onUpdate", async () => {
    const env = makeEnv();
    let updates = 0;
    await env.exec("echo hi", { onUpdate: () => { updates += 1; } }, BACKGROUND_CONTEXT);
    assert.ok(updates > 0, "caller onUpdate must still be invoked");
  });
});

describe("statusFromErrorCode", () => {
  it("maps Pi execution error codes", () => {
    assert.equal(statusFromErrorCode("timeout"), "timeout");
    assert.equal(statusFromErrorCode("aborted"), "aborted");
    assert.equal(statusFromErrorCode("spawn_error"), "spawn_error");
    assert.equal(statusFromErrorCode("shell_unavailable"), "spawn_error");
    assert.equal(statusFromErrorCode("unknown"), "spawn_error");
    assert.equal(statusFromErrorCode(undefined), "spawn_error");
  });
});

describe("ExecutionFactCollector", () => {
  it("starts empty", () => {
    const collector = new ExecutionFactCollector();
    assert.deepEqual(collector.list(), []);
    assert.equal(collector.last(), undefined);
  });

  it("clears recorded facts", () => {
    const collector = new ExecutionFactCollector();
    collector.record({
      tool_call_id: null,
      command: "ls",
      exit_code: 0,
      status: "exited",
      output: "",
      truncated: false,
      timed_out: false,
      started_at: "2026-11-03T00:00:00Z",
      ended_at: "2026-11-03T00:00:01Z",
      duration_ms: 1000,
    });
    assert.equal(collector.list().length, 1);
    collector.clear();
    assert.equal(collector.list().length, 0);
  });
});
