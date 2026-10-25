import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../src/auth.js";
import { PikoError } from "../../src/types.js";

/**
 * Bearer authentication — the single credential gate in front of the API.
 * Covers UT-AUTH-001..003: exact credential match over UTF-8 bytes, header
 * shape rejection, and the length-mismatch paths around timingSafeEqual.
 * Every rejection is asserted as a PikoError("Unauthorized", 401), the shape
 * ApiServer maps straight onto a 401 response.
 */

const auth = (token = "secret") => new BearerAuth("slinky", Buffer.from(token));

function expectUnauthorized(fn: () => unknown, message: RegExp): void {
  let caught: unknown;
  try {
    fn();
  } catch (e) {
    caught = e;
  }
  expect(caught, "expected authenticate() to throw").toBeInstanceOf(PikoError);
  const err = caught as PikoError;
  expect([err.code, err.status]).toEqual(["Unauthorized", 401]);
  expect(err.message).toMatch(message);
}

describe("UT-AUTH-001 · exact credential", () => {
  it("returns the principal for the exact bearer credential", () => {
    expect(auth().authenticate("Bearer secret")).toBe("slinky");
  });

  it("compares UTF-8 bytes, so non-ASCII tokens round-trip", () => {
    const a = auth("clé🔑");
    expect(a.authenticate("Bearer clé🔑")).toBe("slinky");
  });
});

describe("UT-AUTH-002 · header shape", () => {
  it.each([
    ["missing header", undefined],
    ["empty header", ""],
    ["scheme without a space", "Bearersecret"],
    ["lowercase scheme", "bearer secret"],
    ["bare scheme", "Bearer"],
    ["different scheme", "Basic secret"],
  ])("rejects the %s as a missing credential", (_label, header) => {
    expectUnauthorized(() => auth().authenticate(header), /missing bearer credential/);
  });

  it("rejects a credential padded with whitespace instead of trimming it", () => {
    expectUnauthorized(() => auth().authenticate("Bearer secret "), /invalid bearer credential/);
  });
});

describe("UT-AUTH-003 · constant-time comparison safety", () => {
  // timingSafeEqual throws RangeError on differing buffer lengths; BearerAuth
  // must short-circuit on the length check and still report an invalid
  // credential, never leak the RangeError through as a 500.
  it("rejects a shorter prefix of the token", () => {
    expectUnauthorized(() => auth().authenticate("Bearer sec"), /invalid bearer credential/);
  });

  it("rejects a credential longer than the token without a RangeError", () => {
    expectUnauthorized(() => auth().authenticate("Bearer secret123456"), /invalid bearer credential/);
  });

  it("rejects a same-length credential that differs in content", () => {
    expectUnauthorized(() => auth().authenticate("Bearer secred"), /invalid bearer credential/);
  });

  it("rejects a token whose bytes differ only in Unicode normalisation", () => {
    const a = auth("cl\u00e9"); // NFC: "é" as one code point
    // Same visible text in NFD ("e" + combining acute): more bytes, invalid.
    expectUnauthorized(() => a.authenticate("Bearer cl\u0065\u0301"), /invalid bearer credential/);
  });
});
