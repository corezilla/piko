import { describe, expect, it } from "vitest";
import { validateUsage, emptyUsage } from "../../src/semantic.js";
import { aggregateUsage } from "../../src/worker.js";
import type { TokenUsage } from "../../src/types.js";

/**
 * Usage semantics — the three-state quality rule and per-field invariants.
 * Covers UT-USAGE-001..002: validateUsage boundary/error paths and the empty
 * usage baseline that every Run starts from.
 */

const base = (over: Partial<TokenUsage> = {}): TokenUsage => ({ ...emptyUsage(), ...over });

describe("UT-USAGE-001 · validateUsage", () => {
  it("accepts the Complete baseline produced by emptyUsage()", () => {
    expect(() => validateUsage(emptyUsage())).not.toThrow();
  });

  it("rejects observed attempts exceeding model attempts", () => {
    expect(() => validateUsage(base({ model_attempts: 1, usage_observed_attempts: 2 }))).toThrow(
      /observed attempts exceed/,
    );
  });

  it("keeps missing_fields consistent with null fields", () => {
    const u = base({ input_tokens: null });
    u.missing_fields = [];
    expect(() => validateUsage(u)).toThrow(/missing mismatch/);
  });

  it("rejects Partial that carries all six fields (not a partial)", () => {
    // Partial must sit strictly between "nothing known" and "everything known":
    // all six fields populated but quality still says Partial.
    const u = base({ quality: "Partial", model_attempts: 1, usage_observed_attempts: 1, input_tokens: 4, output_tokens: 2, total_tokens: 6 });
    expect(() => validateUsage(u)).toThrow(/invalid Partial usage/);
  });

  it("rejects Partial that knows nothing at all", () => {
    const u = base({ quality: "Partial", model_attempts: 1, usage_observed_attempts: 0 });
    expect(() => validateUsage(u)).toThrow(/invalid Partial usage/);
  });

  it("rejects Unknown that nonetheless carries a known field", () => {
    // Unknown requires zero known fields. Build the sample directly so that
    // every null field is declared missing: the mismatch guard passes and the
    // rejection is unambiguously about quality.
    const u: TokenUsage = {
      source: "PiModelResponses",
      quality: "Unknown",
      input_tokens: null,
      output_tokens: 1,
      total_tokens: null,
      cache_read_tokens: null,
      cache_write_tokens: null,
      reasoning_tokens: null,
      model_attempts: 1,
      usage_observed_attempts: 0,
      missing_fields: ["input_tokens", "total_tokens", "cache_read_tokens", "cache_write_tokens", "reasoning_tokens"],
    };
    expect(() => validateUsage(u)).toThrow(/invalid Unknown usage/);
  });


  it("enforces total = input + output", () => {
    const u = base({ input_tokens: 10, output_tokens: 5, total_tokens: 99 });
    expect(() => validateUsage(u)).toThrow(/total mismatch/);
  });

  it("rejects cache usage above input and reasoning above output", () => {
    const cache = base({ input_tokens: 4, output_tokens: 2, total_tokens: 6, cache_read_tokens: 99 });
    expect(() => validateUsage(cache)).toThrow(/cache usage exceeds input/);
    const reason = base({ input_tokens: 4, output_tokens: 2, total_tokens: 6, reasoning_tokens: 99 });
    expect(() => validateUsage(reason)).toThrow(/reasoning usage exceeds output/);
  });
});

describe("UT-USAGE-002 · emptyUsage baseline", () => {
  it("is a Complete usage with every field present", () => {
    const u = emptyUsage();
    expect(u.quality).toBe("Complete");
    expect(u.missing_fields).toEqual([]);
    expect(u.total_tokens).toBe(0);
  });

  it("aggregateUsage reduces to zero with no attempts", () => {
    expect(aggregateUsage([], 0).total_tokens).toBe(0);
  });

  it("aggregateUsage sums token fields across attempts", () => {
    // Rows use Pi's raw field names; aggregateUsage maps them to TokenUsage.
    const rows = [
      { input: 10, output: 2, totalTokens: 12, cacheRead: 0, cacheWrite: 0, reasoning: 0 },
      { input: 5, output: 1, totalTokens: 6, cacheRead: 0, cacheWrite: 0, reasoning: 0 },
    ];
    const agg = aggregateUsage(rows, 2);
    expect(agg.total_tokens).toBe(18);
    expect(agg.input_tokens).toBe(15);
    expect(agg.model_attempts).toBe(2);
  });
});