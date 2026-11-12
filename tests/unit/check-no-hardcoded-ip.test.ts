import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolve } from "node:path";

const REPO = resolve(import.meta.dirname ?? ".", "..", "..");

/**
 * The address rule, enforced rather than remembered.
 *
 * This machine is localhost / 127.0.0.1. Any other host is addressed by NAME
 * via an environment variable. The topology moved between the m5pro and m5air
 * setups, and every baked-in address silently pointed at the wrong machine.
 */

const guard = join(REPO, "scripts/check-no-hardcoded-ip.py");

function runGuard(...paths: string[]): { code: number; out: string } {
  try {
    const out = execFileSync("python3", [guard, ...paths], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e: any) {
    return { code: e.status ?? 1, out: String(e.stdout ?? "") + String(e.stderr ?? "") };
  }
}

describe("check-no-hardcoded-ip · the repository is clean", () => {
  it("finds no host address in scripts, tests, config or docs", () => {
    const { code, out } = runGuard();
    expect(out, out).not.toMatch(/hardcoded host addresses found/);
    expect(code).toBe(0);
  });
});

describe("check-no-hardcoded-ip · it catches what it should", () => {
  it("flags a LAN address", () => {
    const dir = mkdtempSync(join(tmpdir(), "ipguard-"));
    try {
      const f = join(dir, "bad.sh");
      writeFileSync(f, "HOST=192.168.1.7\n");
      const { code, out } = runGuard(f);
      expect(code).toBe(1);
      expect(out).toContain("192.168.1.7");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not flag loopback, which means 'this machine' everywhere", () => {
    const dir = mkdtempSync(join(tmpdir(), "ipguard-"));
    try {
      const f = join(dir, "ok.sh");
      writeFileSync(f, "URL=http://127.0.0.1:8787\n");
      expect(runGuard(f).code).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not flag section numbers, which look exactly like addresses", () => {
    const dir = mkdtempSync(join(tmpdir(), "ipguard-"));
    try {
      const f = join(dir, "doc.md");
      writeFileSync(f, "**7.2.1.1 `PERS-REPO-TX`**\n#### 4.2.2.1 assessment\n");
      expect(runGuard(f).code).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("scripts/load-env.sh · layering", () => {
  const loader = join(REPO, "scripts/load-env.sh");

  it("named a default only for this machine (loopback)", () => {
    const text = readFileSync(loader, "utf8");
    // Every default URL must be loopback. A default pointing at another host
    // is how a script quietly talks to the wrong machine.
    const defaults = [...text.matchAll(/:\s*"\$\{(PIKO_URL|TIER_URL)=([^}]*)\}"/g)];
    expect(defaults.length).toBeGreaterThan(0);
    for (const [, name, value] of defaults) {
      expect(value, `${name} default must be loopback`).toMatch(/http:\/\/127\.0\.0\.1:/);
    }
  });

  it("lets the caller's environment beat both files and defaults", () => {
    const out = execFileSync("bash", ["-c", `. "${loader}"; printf %s "$TIER_URL"`], {
      encoding: "utf8",
      env: { ...process.env, TIER_URL: "http://caller-wins.invalid:1" },
    });
    expect(out).toBe("http://caller-wins.invalid:1");
  });

  it("exposes every name it requires through --show", () => {
    const out = execFileSync("bash", [loader, "--show"], { encoding: "utf8" });
    for (const name of ["PIKO_URL", "TIER_URL", "A7048_HOST", "PIKO_REMOTE_HOST"]) {
      expect(out, name).toContain(name);
    }
  });
});
