import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { resolveSecret } from "../../src/config.js";
import { emptyUsage, validateUsage } from "../../src/semantic.js";
import { isProviderUnavailableMessage } from "../../src/pi-runtime.js";
import { PikoError } from "../../src/types.js";

/**
 * UT-BOOT / UT-POLICY / UT-PI / UT-IPC · exported units the STD case set
 * declares but no entry file asserted.
 *
 * Gap G-EXEC-UT-1 (first STD unit run, ut-run-20261103-01): these symbols
 * ARE exported from src/ and the case documents name them as the subject
 * under test, yet no entry file referenced them -- so the declared VRC
 * ranges never landed on an assertion.
 *
 * Each describe names the Case ID it closes, so the mapping from a failing
 * assertion back to its STD case is direct.
 */

describe("UT-BOOT-007 · resolveSecret", () => {
  it("reads an env secret", async () => {
    process.env.PIKO_UT_SECRET = "s3cret";
    try {
      expect(await resolveSecret("env:PIKO_UT_SECRET")).toBe("s3cret");
    } finally {
      delete process.env.PIKO_UT_SECRET;
    }
  });

  it("fails closed when the env secret is missing", async () => {
    await expect(resolveSecret("env:PIKO_UT_DEFINITELY_MISSING")).rejects.toThrow(
      /missing env secret PIKO_UT_DEFINITELY_MISSING/,
    );
  });

  it("treats an empty env value as missing rather than as an empty secret", async () => {
    process.env.PIKO_UT_EMPTY = "";
    try {
      await expect(resolveSecret("env:PIKO_UT_EMPTY")).rejects.toThrow(/missing env secret/);
    } finally {
      delete process.env.PIKO_UT_EMPTY;
    }
  });

  it("reads a file secret and trims it", async () => {
    const dir = await mkdtemp(join(tmpdir(), "piko-secret-"));
    try {
      const path = join(dir, "key.txt");
      await writeFile(path, "  file-secret\n");
      expect(await resolveSecret(`file:${path}`)).toBe("file-secret");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects an unknown secret provider", async () => {
    await expect(resolveSecret("vault:whatever")).rejects.toThrow(
      /secret provider vault is not available/,
    );
  });
});

describe("UT-POLICY-004 · emptyUsage", () => {
  it("returns a Complete usage with zero tokens and no missing fields", () => {
    const usage = emptyUsage();
    expect(usage.quality).toBe("Complete");
    expect(usage.input_tokens).toBe(0);
    expect(usage.output_tokens).toBe(0);
    expect(usage.total_tokens).toBe(0);
    expect(usage.missing_fields).toEqual([]);
  });

  it("returns a usage that validateUsage accepts", () => {
    expect(() => validateUsage(emptyUsage())).not.toThrow();
  });
});

describe("UT-POLICY-011 · validateUsage", () => {
  it("accepts a Complete usage", () => {
    expect(() =>
      validateUsage({
        ...emptyUsage(),
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 15,
        model_attempts: 1,
        usage_observed_attempts: 1,
      }),
    ).not.toThrow();
  });

  it("rejects observed attempts exceeding model attempts", () => {
    expect(() =>
      validateUsage({ ...emptyUsage(), model_attempts: 1, usage_observed_attempts: 2 }),
    ).toThrow(/usage observed attempts exceed model attempts/);
  });

  it("rejects a total that does not equal input plus output", () => {
    expect(() =>
      validateUsage({
        ...emptyUsage(),
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 99,
      }),
    ).toThrow(/usage total mismatch/);
  });

  it("rejects cache usage exceeding input tokens", () => {
    expect(() =>
      validateUsage({
        ...emptyUsage(),
        input_tokens: 10,
        output_tokens: 0,
        total_tokens: 10,
        cache_read_tokens: 11,
      }),
    ).toThrow(/cache usage exceeds input/);
  });

  it("rejects reasoning usage exceeding output tokens", () => {
    expect(() =>
      validateUsage({
        ...emptyUsage(),
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 15,
        reasoning_tokens: 6,
      }),
    ).toThrow(/reasoning usage exceeds output/);
  });

  it("rejects a Partial usage that claims nothing is known", () => {
    expect(() =>
      validateUsage({
        ...emptyUsage(),
        quality: "Partial",
        input_tokens: null,
        output_tokens: null,
        total_tokens: null,
        cache_read_tokens: null,
        cache_write_tokens: null,
        reasoning_tokens: null,
        model_attempts: 1,
        usage_observed_attempts: 1,
        missing_fields: ["input_tokens", "output_tokens", "total_tokens", "cache_read_tokens", "cache_write_tokens", "reasoning_tokens"],
      }),
    ).toThrow(/invalid Partial usage/);
  });

  it("rejects a usage whose missing_fields disagrees with its nulls", () => {
    expect(() =>
      validateUsage({ ...emptyUsage(), missing_fields: ["input_tokens"] }),
    ).toThrow(/usage missing mismatch/);
  });

  it("rejects an Unknown quality that carries known fields", () => {
    expect(() =>
      validateUsage({ ...emptyUsage(), quality: "Unknown", missing_fields: ["input_tokens"] }),
    ).toThrow(/usage missing mismatch|invalid Unknown usage/);
  });
});

describe("UT-PI-004 · isProviderUnavailableMessage", () => {
  it("recognises a 503 provider error", () => {
    expect(isProviderUnavailableMessage("upstream said (503)")).toBe(true);
  });

  it("recognises a 502 provider error", () => {
    expect(isProviderUnavailableMessage("upstream said (502)")).toBe(true);
  });

  it("recognises a refused connection", () => {
    expect(isProviderUnavailableMessage("connect ECONNREFUSED 127.0.0.1:9000")).toBe(true);
  });

  it("recognises a fetch failure", () => {
    expect(isProviderUnavailableMessage("fetch failed")).toBe(true);
  });

  it("recognises provider_unavailable", () => {
    expect(isProviderUnavailableMessage("provider_unavailable")).toBe(true);
  });

  it("does not match an ordinary error", () => {
    expect(isProviderUnavailableMessage("invalid JSON body")).toBe(false);
  });

  it("does not match a schema violation", () => {
    expect(isProviderUnavailableMessage("must have required property 'workspace_ref'")).toBe(false);
  });
});

describe("UT-IPC-008 / UT-IPC-009 · PikoError", () => {
  it("carries the code, status and message", () => {
    const error = new PikoError("ScopeDenied", 403, "not allowed");
    expect(error.code).toBe("ScopeDenied");
    expect(error.status).toBe(403);
    expect(error.message).toBe("not allowed");
  });

  it("is an Error, so it survives a normal throw/catch", () => {
    expect(() => {
      throw new PikoError("InvalidRequest", 400, "bad");
    }).toThrow(PikoError);
    try {
      throw new PikoError("InvalidRequest", 400, "bad");
    } catch (e) {
      expect((e as PikoError).status).toBe(400);
      expect((e as PikoError).name).toBe("Error");
    }
  });
});
