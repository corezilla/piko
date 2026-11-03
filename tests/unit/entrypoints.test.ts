import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { loadConfig } from "../../src/config.js";

/**
 * UT-BOOT · loadConfig and the process entry points.
 *
 * Gap G-EXEC-UT-1: `loadConfig` is exported and is the subject of four STD
 * cases (UT-BOOT-003 / 006 / 007 / 008), but no entry file called it. It
 * is the gate every runtime path passes through -- if it accepts a bad
 * config or rejects a good one, everything downstream is affected.
 *
 * The entry points (`main`, `runControlProcess`, `runExecutionProcess`) are
 * NOT exercised here: they boot a real server / fork a real child, which
 * is a live concern rather than a unit one. They are registered as
 * G-EXEC-UT-1b in the plan rather than pretended at.
 */

const REPO_ROOT = resolve(import.meta.dirname ?? ".", "..", "..");

/** A config that satisfies the runtime schema, with the paths the loader reads. */
async function writeConfig(dir: string, over: Record<string, unknown> = {}): Promise<string> {
  const base = JSON.parse(await readFile(join(REPO_ROOT, "config", "runtime.example.json"), "utf8"));
  const merged = {
    ...base,
    listen: { host: "127.0.0.1", port: 8787 },
    task_store: { sqlite_path: join(dir, "store.sqlite"), busy_timeout_ms: 5000 },
    pi: {
      ...base.pi,
      session_root: join(dir, "sessions"),
    },
    tools: { profile_registry_path: join(REPO_ROOT, "config", "tool-profiles.json") },
    ...over,
  };
  const path = join(dir, "runtime.json");
  await writeFile(path, JSON.stringify(merged, null, 2));
  return path;
}

describe("UT-BOOT-003 / UT-BOOT-006 / UT-BOOT-007 / UT-BOOT-008 · loadConfig", () => {
  it("loads and validates the shipped example config", async () => {
    const dir = await mkdtemp(join(tmpdir(), "piko-loadcfg-"));
    try {
      const path = await writeConfig(dir);
      const { config, tools } = await loadConfig(path, REPO_ROOT);
      expect(config.listen.port).toBe(8787);
      expect(tools.profiles).toBeDefined();
      expect(Object.keys(tools.profiles).length).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects a config that violates the schema", async () => {
    const dir = await mkdtemp(join(tmpdir(), "piko-loadcfg-"));
    try {
      const path = await writeConfig(dir, { listen: { host: "127.0.0.1" } } as never);
      await expect(loadConfig(path, REPO_ROOT)).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects a config whose tool profile registry path does not exist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "piko-loadcfg-"));
    try {
      const path = await writeConfig(dir, {
        tools: { profile_registry_path: join(dir, "missing-profiles.json") },
      } as never);
      await expect(loadConfig(path, REPO_ROOT)).rejects.toThrow(/ENOENT|no such file/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("accepts a config whose profile_ref is not in the registry", async () => {
    // The ISD scopes the existence check to TASK time, not config time:
    // piko-policy-impl.isd.md §「校验顺序」 puts tool_profile_ref after the
    // path checks, and pi-runtime rejects it with UnknownToolProfile /
    // policy rejects with ScopeDenied. The loader's job is schema
    // validation -- requiring the ref to exist here would reject a config
    // that is merely incomplete for a particular task, not invalid.
    const dir = await mkdtemp(join(tmpdir(), "piko-loadcfg-"));
    try {
      const path = await writeConfig(dir, {
        agent: { model: "x", profile_ref: "no-such-profile" },
      } as never);
      const { config } = await loadConfig(path, REPO_ROOT);
      expect(config.agent.profile_ref).toBe("no-such-profile");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects invalid JSON rather than returning a half-built config", async () => {
    const dir = await mkdtemp(join(tmpdir(), "piko-loadcfg-"));
    try {
      const path = join(dir, "broken.json");
      await writeFile(path, "{ not json");
      await expect(loadConfig(path, REPO_ROOT)).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
