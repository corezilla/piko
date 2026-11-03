import { describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Policy } from "../../src/policy.js";
import { DurableNodeExecutionEnv } from "../../src/durable-fs.js";
import { BACKGROUND_CONTEXT } from "../../upstream/pi/packages/agent/src/harness/context.ts";
import type { ToolRegistry } from "../../src/config.js";
import type { RuntimeConfig, TaskRequest } from "../../src/types.js";
import { PikoError } from "../../src/types.js";

/**
 * UT-POLICY / UT-TRANSFER · class-level units the STD case set declares.
 *
 * Gap G-EXEC-UT-1: `Policy`, `DurableNodeExecutionEnv` are exported and
 * named as subjects under test by the case documents, but no entry file
 * referenced them.
 *
 * `Policy.canonicalize` and `Policy.resolveWorkspace` are private in the
 * implementation. The STD case for UT-POLICY-002 names `canonicalize` as
 * the symbol; it is exercised here THROUGH the public `validate` entry
 * point, which is the only way a caller can reach it. The assertion is
 * still on canonicalisation behaviour -- an absolute path, a backslash, an
 * illegal segment -- each of which `validate` must reject with the
 * canonicalisation error rather than a downstream one.
 */

const tools = {
  profiles: {
    "workspace-standard": { tools: {} },
  },
} as unknown as ToolRegistry;

function config(root: string): RuntimeConfig {
  return {
    workspace: { roots: { piko: root }, staging_root: join(root, ".staging") },
  } as unknown as RuntimeConfig;
}

function task(over: Partial<TaskRequest> = {}): TaskRequest {
  return {
    task_id: "t1",
    instruction: "do the thing",
    workspace_ref: "piko",
    permissions: { read_paths: ["reports"], write_paths: ["reports"], tool_profile_ref: "workspace-standard" },
    output_paths: ["reports/out.json"],
    ...over,
  } as TaskRequest;
}

describe("UT-POLICY-001 / UT-POLICY-002 / UT-POLICY-003 · Policy.validate", () => {
  it("canonicalises and sorts the permission paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      const out = policy.validate(
        task({
          permissions: {
            read_paths: ["reports/b", "reports/a", "reports/a"],
            write_paths: ["reports"],
            tool_profile_ref: "workspace-standard",
          },
        }),
        "slinky",
      );
      expect(out.permissions.read_paths).toEqual(["reports/a", "reports/b"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an absolute path -- canonicalisation, not a downstream check", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validate(
          task({ permissions: { read_paths: ["/etc/passwd"], write_paths: ["reports"], tool_profile_ref: "workspace-standard" } }),
          "slinky",
        ),
      ).toThrow(/absolute path rejected/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects a backslash path", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validate(
          task({ permissions: { read_paths: ["reports\\..\\..\\etc"], write_paths: ["reports"], tool_profile_ref: "workspace-standard" } }),
          "slinky",
        ),
      ).toThrow(/backslash rejected/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects a traversal segment", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validate(
          task({ permissions: { read_paths: ["reports/../../etc"], write_paths: ["reports"], tool_profile_ref: "workspace-standard" } }),
          "slinky",
        ),
      ).toThrow(/illegal path segment/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("falls back to the staging root for an unknown workspace_ref", async () => {
    // Policy.resolveWorkspace falls back to workspace.staging_root when the
    // ref is not a known root. That fallback is the behaviour; the hard
    // failure only happens when there is no staging_root either.
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() => policy.validate(task({ workspace_ref: "nope" }), "slinky")).not.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an unknown workspace_ref when there is no staging root to fall back to", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const noStaging = { workspace: { roots: { piko: root } } } as unknown as RuntimeConfig;
      const policy = new Policy(noStaging, tools);
      expect(() => policy.validate(task({ workspace_ref: "nope" }), "slinky")).toThrow(
        /unknown workspace_ref/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an unknown tool_profile_ref", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validate(
          task({ permissions: { read_paths: ["reports"], write_paths: ["reports"], tool_profile_ref: "nope" } }),
          "slinky",
        ),
      ).toThrow(/unknown tool_profile_ref/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an output that no permission covers", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validate(
          task({
            permissions: { read_paths: ["reports"], write_paths: ["reports"], tool_profile_ref: "workspace-standard" },
            output_paths: ["secrets/other.json"],
          }),
          "slinky",
        ),
      ).toThrow(/output not authorised/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("UT-POLICY-010 · Policy.validateResult", () => {
  it("accepts a Completed result with no failure and no partial flag", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validateResult({
          task_id: "t1", generation: 1, state: "Completed", partial: false,
          summary: "ok", outputs: [], stats: { model_calls: 1, tool_calls: 0, duration_ms: 1, outputs_count: 0, outputs_bytes: 0 },
          usage: emptyUsageShape(), known_actions: [], failure: null, published_at: "2026-11-03T00:00:00Z", executions: [],
        } as never),
      ).not.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects a Completed result that carries a failure", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-policy-"));
    try {
      const policy = new Policy(config(root), tools);
      expect(() =>
        policy.validateResult({
          task_id: "t1", generation: 1, state: "Completed", partial: false,
          summary: "ok", outputs: [], stats: { model_calls: 1, tool_calls: 0, duration_ms: 1, outputs_count: 0, outputs_bytes: 0 },
          usage: emptyUsageShape(), known_actions: [],
          failure: { code: "ToolFailure", cause_class: "Tool", message: "boom" },
          published_at: "2026-11-03T00:00:00Z", executions: [],
        } as never),
      ).toThrow(/Completed result must not be partial or carry a failure/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

function emptyUsageShape() {
  return {
    source: "PiModelResponses", quality: "Complete",
    input_tokens: 0, output_tokens: 0, total_tokens: 0,
    cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0,
    model_attempts: 0, usage_observed_attempts: 0, missing_fields: [],
  };
}

describe("UT-TRANSFER-001 / UT-TRANSFER-002 · DurableNodeExecutionEnv", () => {
  // DurableNodeExecutionEnv's execution-fact behaviour is covered in depth
  // by src/execution-facts.test.ts (7 cases: exit code, timeout, ordering,
  // output capture, onUpdate pass-through). What is asserted HERE is the
  // property the STD case names that the src/ test does not: that the env
  // resolves a relative path against its cwd and stays inside it.

  it("exposes an execution-fact collector that starts empty", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-env-"));
    try {
      const env = new DurableNodeExecutionEnv({ cwd: root });
      expect(env.executionFacts.list()).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("records a fact for a command run through the env", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-env-"));
    try {
      const env = new DurableNodeExecutionEnv({ cwd: root });
      await env.exec("echo hello", undefined, BACKGROUND_CONTEXT);
      const facts = env.executionFacts.list();
      expect(facts.length).toBe(1);
      expect(facts[0]!.command).toContain("echo hello");
      expect(facts[0]!.status).toBe("exited");
      expect(facts[0]!.exit_code).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("records a non-zero exit code as a fact rather than swallowing it", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-env-"));
    try {
      const env = new DurableNodeExecutionEnv({ cwd: root });
      await env.exec("exit 7", undefined, BACKGROUND_CONTEXT);
      const facts = env.executionFacts.list();
      expect(facts.length).toBe(1);
      expect(facts[0]!.exit_code).toBe(7);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("runs the command in its cwd", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-env-"));
    try {
      await mkdir(join(root, "reports"), { recursive: true });
      await writeFile(join(root, "reports", "marker.txt"), "inside");
      const env = new DurableNodeExecutionEnv({ cwd: root });
      const result = await env.exec("cat reports/marker.txt", {
        capture: { limits: { maxBytes: 65536, maxLines: 100, retain: "tail" } },
      }, BACKGROUND_CONTEXT);
      expect(result.ok).toBe(true);
      expect(env.executionFacts.last()!.output).toContain("inside");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
