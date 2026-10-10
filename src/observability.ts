import { systemClock, type Clock } from "./clock.js";

/**
 * M009 `observability` — structured events, metrics, audit and a redacted
 * diagnostic snapshot. It only collects/shapes/redacts/exports; it never
 * decides business facts, and any sink failure degrades only itself (fail-open).
 */

export type EventEnvelope = {
  event_name: string;
  at: string;
  instance_id: string;
  task_id?: string;
  generation?: number;
  epoch?: number;
  redacted_error_class?: string;
  fields?: Record<string, string | number | boolean | null>;
};

export type MetricOp = "inc" | "observe" | "set";

export type AuditRecord = { event_name: string; task_id: string | null; detail: Record<string, unknown> };

export type DiagnosticSnapshot = {
  instance_id: string;
  generated_at: string;
  metrics: Record<string, { value: number; unit: string; labels?: Record<string, string> }>;
  counters: Record<string, number>;
  recent_events: EventEnvelope[];
  audit_tail: AuditRecord[];
};

const METRIC_UNITS: Record<string, string> = {
  count: "count",
  ms: "ms",
  bytes: "bytes",
  seconds: "seconds",
  ratio: "ratio",
};

/** Redaction boundary: never emit these field names verbatim. */
const FORBIDDEN_KEYS = /(credential|secret|token|password|authorization|instruction|content|api[-_]?key)/i;

export function redact(fields: Record<string, unknown> | undefined): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(fields ?? {})) {
    if (FORBIDDEN_KEYS.test(k)) {
      out[k] = "[redacted]";
      continue;
    }
    out[k] = typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? v : v === null ? null : String(v);
  }
  return out;
}

export class Observability {
  private readonly events: EventEnvelope[] = [];
  private readonly counters = new Map<string, number>();
  private readonly metrics = new Map<string, { value: number; unit: string; labels?: Record<string, string> }>();
  private readonly auditTrail: AuditRecord[] = [];

  constructor(
    private readonly config: { instance_id: string; observability?: { log_level?: string; metrics_enabled?: boolean } },
    private readonly clock: Clock = systemClock,
  ) {}

  private keep(limit: number): number {
    return Math.max(16, limit);
  }

  /** Structured log event. Fails open: a sink problem must never break the caller. */
  emit(name: string, fields?: Record<string, unknown>): void {
    try {
      this.events.push({
        event_name: name,
        at: this.clock.iso(),
        instance_id: this.config.instance_id,
        ...(fields?.task_id ? { task_id: String(fields.task_id) } : {}),
        ...(typeof fields?.generation === "number" ? { generation: fields.generation } : {}),
        ...(typeof fields?.epoch === "number" ? { epoch: fields.epoch } : {}),
        ...(fields?.redacted_error_class ? { redacted_error_class: String(fields.redacted_error_class) } : {}),
        fields: redact(fields),
      });
      if (this.events.length > 500) this.events.splice(0, this.events.length - 500);
    } catch {
      /* observability must not break execution */
    }
  }

  metric(id: string, op: MetricOp, value?: number, labels?: Record<string, string>, unit = "count"): void {
    try {
      if (this.config.observability?.metrics_enabled === false) return;
      const key = labels && Object.keys(labels).length ? `${id}{${Object.entries(labels).sort().map(([k, v]) => `${k}=${v}`).join(",")}}` : id;
      const cur = this.metrics.get(key);
      const next =
        op === "inc" ? (cur?.value ?? 0) + (value ?? 1) : op === "set" ? (value ?? 0) : Math.min(cur?.value ?? Number.POSITIVE_INFINITY, value ?? 0);
      this.metrics.set(key, { value: next, unit: METRIC_UNITS[unit] ?? unit, ...(labels ? { labels } : {}) });
    } catch {
      /* fail open */
    }
  }

  /** Audit is a fact recorded for later review; the sink must not own business state. */
  audit(record: AuditRecord): void {
    try {
      this.auditTrail.push({ event_name: record.event_name, task_id: record.task_id ?? null, detail: redact(record.detail as Record<string, unknown>) });
      if (this.auditTrail.length > 200) this.auditTrail.splice(0, this.auditTrail.length - 200);
    } catch {
      /* fail open */
    }
  }

  /** Read-only, redacted diagnostic snapshot for operator endpoints. */
  snapshot(limit = 50): DiagnosticSnapshot {
    const counters: Record<string, number> = {};
    for (const [k, v] of this.counters) counters[k] = v;
    return {
      instance_id: this.config.instance_id,
      generated_at: this.clock.iso(),
      metrics: Object.fromEntries(this.metrics),
      counters,
      recent_events: this.events.slice(-this.keep(limit)),
      audit_tail: this.auditTrail.slice(-this.keep(limit)),
    };
  }

  bump(counter: string, delta = 1): void {
    try {
      this.counters.set(counter, (this.counters.get(counter) ?? 0) + delta);
    } catch {
      /* fail open */
    }
  }
}