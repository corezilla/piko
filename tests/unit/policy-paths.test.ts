import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import {
  resolveWorkspace,
  authorizePath,
  collectOutputs,
  ensureTaskDirs,
} from "../../src/workspace.js";
import { normalizedTask, sameTask } from "../../src/task-equality.js";
import type { TaskRequest } from "../../src/types.js";

/**
 * Path policy + task identity — the two pure/structural cores of M002.
 * Covers UT-POLICY-*: workspace resolution, path authorization (incl. traversal
 * rejection), output collection, task directory creation, and the task_id
 * equality that ST-APP-005 idempotency depends on.
 */

const roots: string[] = [];
afterEach(async () => {
  while (roots.length) await rm(roots.pop()!, { recursive: true, force: true });
});
async function tmp(): Promise<string> {
  const d = await mkdtemp(join(tmpdir(), "piko-policy-"));
  roots.push(d);
  return d;
}

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});

describe("UT-POLICY-001 · resolveWorkspace", () => {
  it("resolves a registered workspace_ref to its realpath'd root", async () => {
    const root = await tmp();
    // resolveWorkspace returns a realpath: on macOS /var is a symlink to
    // /private/var, so compare against the resolved form, not the literal input.
    expect(await resolveWorkspace("piko", { piko: root })).toBe(realpathSync(root));
  });

  it("rejects an unregistered workspace_ref", async () => {
    await expect(resolveWorkspace("nope", { piko: "/tmp" })).rejects.toThrow(/workspace/i);
  });
});

// Use a real directory: authorizePath realpaths the workspace, and on macOS
// the /var -> /private/var symlink would otherwise make a literal /ws base
// resolve outside itself.
// authorizePath validates against resolved real paths, so the declared
// directories must already exist (ensureTaskDirs is what creates them).
async function wsBase(): Promise<string> {
  const base = await tmp();
  await mkdir(join(base, "out"), { recursive: true });
  await mkdir(join(base, "src"), { recursive: true });
  return base;
}

describe("UT-POLICY-002 · authorizePath", () => {
  it("allows a path inside a declared write path", async () => {
    const base = await wsBase();
    const out = await authorizePath(base, "out/report.txt", ["out"], true);
    expect(out).toBe(resolve(realpathSync(base), "out/report.txt"));
  });

  it("allows a path that equals the declared root itself", async () => {
    const base = await wsBase();
    const out = await authorizePath(base, "out", ["out"], true);
    expect(out).toBe(resolve(realpathSync(base), "out"));
  });

  it("rejects a path outside every declared path", async () => {
    const base = await wsBase();
    await expect(authorizePath(base, "etc/passwd", ["out"], true)).rejects.toThrow();
  });

  it("rejects traversal that escapes the declared path", async () => {
    const base = await wsBase();
    await expect(authorizePath(base, "out/../../etc/passwd", ["out"], true)).rejects.toThrow();
  });

  it("rejects a sibling directory whose name starts with a declared path", async () => {
    const base = await wsBase();
    await mkdir(join(base, "outbox"), { recursive: true });
    // A naive `path.startsWith(root)` containment check would let "outbox"
    // pass a declaration of "out"; containment must be path-segment based.
    await expect(authorizePath(base, "outbox/x", ["out"], true)).rejects.toThrow();
  });

  it("rejects a workspace sibling reached via .. that shares a name prefix", async () => {
    const base = await wsBase();
    await mkdir(join(dirname(base), `${basename(base)}-evil`), { recursive: true });
    try {
      await expect(authorizePath(base, `../${basename(base)}-evil/x`, ["."], true)).rejects.toThrow();
    } finally {
      await rm(join(dirname(base), `${basename(base)}-evil`), { recursive: true, force: true });
    }
  });

  it("allows a read against a read-only declaration", async () => {
    const base = await wsBase();
    await expect(authorizePath(base, "src/x", ["src"], false)).resolves.toContain("src");
  });
});

describe("UT-POLICY-003 · ensureTaskDirs / collectOutputs", () => {
  it("creates the task directory under the workspace", async () => {
    const root = await tmp();
    // ensureTaskDirs creates the DIRECTORY of each declared write/output path.
    const t2 = task({
      permissions: { read_paths: [], write_paths: ["out/report.txt"], tool_profile_ref: "workspace-standard" },
      output_paths: ["out/report.txt"],
    });
    await ensureTaskDirs(root, t2);
    expect(existsSync(join(root, "out"))).toBe(true);
  });

  it("collects declared outputs that exist and records their digest", async () => {
    const root = await tmp();
    await mkdir(join(root, "out"), { recursive: true });
    await writeFile(join(root, "out/a.txt"), "alpha");
    const t = task({ output_paths: ["out/a.txt", "out/missing.txt"] });
    const outs = await collectOutputs(t, root);
    const found = outs.find((o) => o.path === "out/a.txt");
    expect(found?.size_bytes).toBe(5);
    expect(found?.sha256).toMatch(/^[0-9a-f]{64}$/);
    // A declared but absent file must not be invented.
    expect(outs.find((o) => o.path === "out/missing.txt")).toBeUndefined();
  });
});

describe("UT-POLICY-004 · task identity equality", () => {
  it("normalises field order without changing equality", () => {
    const a = normalizedTask(task());
    const b = normalizedTask({ ...task(), permissions: { ...task().permissions } } as TaskRequest);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("sameTask is true for an identical definition (idempotent replay)", () => {
    expect(sameTask(task(), task())).toBe(true);
  });

  it("sameTask is false when the instruction differs (conflict)", () => {
    expect(sameTask(task(), task({ instruction: "other" }))).toBe(false);
  });

  it("sameTask is false when permissions differ", () => {
    const t = task();
    expect(
      sameTask(t, task({ permissions: { ...t.permissions, write_paths: ["other"] } })),
    ).toBe(false);
  });
});