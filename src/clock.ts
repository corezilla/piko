/**
 * Injectable time source. Production uses the real clock; tests inject a
 * controlled clock (`FAKE-CLOCK`) so timing paths (lease heartbeat, drain
 * deadlines, monotonic elapsed) become deterministic and reproducible.
 */

export interface Clock {
  /** Wall-clock milliseconds since epoch (persisted UTC). */
  now(): number;
  /** Monotonic milliseconds since process start; immune to wall-clock jumps. */
  monotonic(): number;
  /** ISO-8601 UTC instant, e.g. for `accepted_at` / `finished_at`. */
  iso(): string;
}

const originMonotonic = (() => {
  try {
    // performance.now() is monotonic and unaffected by system clock changes.
    return typeof performance !== "undefined" ? performance.now() : 0;
  } catch {
    return 0;
  }
})();

export const systemClock: Clock = {
  now: () => Date.now(),
  monotonic: () =>
    (typeof performance !== "undefined" ? performance.now() : Date.now()) - originMonotonic,
  iso: () => new Date().toISOString(),
};

/** A manually advanced clock for tests (`FAKE-CLOCK`). */
export class ManualClock implements Clock {
  constructor(private wallMs = 0, private monoMs = 0) {}
  now(): number {
    return this.wallMs;
  }
  monotonic(): number {
    return this.monoMs;
  }
  iso(): string {
    return new Date(this.wallMs).toISOString();
  }
  advance(ms: number): void {
    this.wallMs += ms;
    this.monoMs += ms;
  }
  set(wallIso: string, monoMs?: number): void {
    this.wallMs = Date.parse(wallIso);
    if (monoMs !== undefined) this.monoMs = monoMs;
  }
}