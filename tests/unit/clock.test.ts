import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../src/clock.js";

/**
 * CHK-CLK-01 — the `FAKE-CLOCK` asset's own self-check.
 * A controlled clock must be deterministic, independently controllable on the
 * wall and monotonic axes, and convertible to a UTC instant.
 */
describe("FAKE-CLOCK self-check (CHK-CLK-01)", () => {
  it("advances both axes together and is fully deterministic", () => {
    const clock = new ManualClock();
    clock.advance(1000);
    clock.advance(250);
    expect(clock.now()).toBe(1250);
    expect(clock.monotonic()).toBe(1250);
    expect(clock.iso()).toBe("1970-01-01T00:00:01.250Z");
  });

  it("supports setting a wall instant independently of the monotonic axis", () => {
    const clock = new ManualClock();
    clock.set("2026-09-29T12:00:00.000Z", 500);
    expect(clock.iso()).toBe("2026-09-29T12:00:00.000Z");
    expect(clock.monotonic()).toBe(500);
    // Wall clock moved; monotonic unaffected by a (simulated) backward jump.
    clock.set("2026-09-29T11:00:00.000Z", 800);
    expect(clock.now()).toBeLessThan(Date.parse("2026-09-29T12:00:00.000Z"));
    expect(clock.monotonic()).toBe(800);
  });

  it("the system clock exposes a non-decreasing monotonic axis and a UTC instant", () => {
    const a = systemClock.monotonic();
    const b = systemClock.monotonic();
    expect(b).toBeGreaterThanOrEqual(a);
    expect(systemClock.iso()).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
  });
});