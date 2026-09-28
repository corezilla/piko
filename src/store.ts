import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  AgentResult,
  ArtifactDelivery,
  InputStaging,
  IntakeState,
  TaskRequest,
  TaskState,
  TaskView,
} from "./types.js";
import { PikoError } from "./types.js";
import { sameTask } from "./task-equality.js";
import { emptyUsage, validateUsage } from "./semantic.js";

const now = () => new Date().toISOString();
const TERMINAL: TaskState[] = ["Completed", "Failed", "Cancelled"];
const isTerminal = (s: string) => TERMINAL.includes(s as TaskState);

export type CreateRunKind = "created" | "existing" | "conflict" | "tombstone" | "queue_full";
export type CreateRunOutcome = {
  kind: CreateRunKind;
  task_id?: string;
  generation?: number;
  state?: TaskState;
};
export type SlotGrant = { task_id: string; lease_epoch: number };
export type FencedRunCommand = {
  task_id: string;
  expected_generation: number;
  expected_state_in?: TaskState[];
  expected_lease_epoch?: number;
  mutation: (r: any) => void;
};

/**
 * Task Store — the single authoritative writer (M003, runs in P0).
 * Tables are keyed by task_id (there is no separate run_id).
 */
export class TaskStore {
  readonly db: DatabaseSync;
  constructor(path: string, busyMs: number) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(
      `PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=${busyMs}`,
    );
    this.migrate();
  }
  close() {
    this.db.close();
  }

  private migrate() {
    this.db.exec(`
CREATE TABLE IF NOT EXISTS instance_meta(key TEXT PRIMARY KEY,value_json TEXT NOT NULL) STRICT;
CREATE TABLE IF NOT EXISTS tasks(
  task_id TEXT PRIMARY KEY,
  owner_principal TEXT NOT NULL,
  identity_state TEXT NOT NULL CHECK(identity_state IN ('Active','Tombstone')),
  task_json TEXT,
  accepted_at TEXT NOT NULL,
  purge_after TEXT NOT NULL,
  CHECK((identity_state='Active' AND task_json IS NOT NULL) OR(identity_state='Tombstone' AND task_json IS NULL))
) STRICT;
CREATE TABLE IF NOT EXISTS runs(
  task_id TEXT PRIMARY KEY REFERENCES tasks(task_id),
  state TEXT NOT NULL CHECK(state IN ('Queued','Running','Cancelling','Completed','Failed','Cancelled')),
  generation INTEGER NOT NULL CHECK(generation>=1),
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN(0,1)),
  discussion_intake_state TEXT NOT NULL CHECK(discussion_intake_state IN('Disabled','Open','Closing','Closed')),
  input_staging_json TEXT NOT NULL,
  artifact_delivery_json TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  model_calls INTEGER NOT NULL DEFAULT 0,
  tool_calls INTEGER NOT NULL DEFAULT 0,
  last_activity_at TEXT
) STRICT;
CREATE TABLE IF NOT EXISTS run_sessions(
  task_id TEXT PRIMARY KEY REFERENCES runs(task_id),
  pi_session_id TEXT NOT NULL UNIQUE,
  lane_name TEXT NOT NULL CHECK(lane_name='main'),
  active_operation_id TEXT,
  last_operation_id TEXT,
  observed_tip_id TEXT,
  lease_epoch INTEGER NOT NULL CHECK(lease_epoch>=1)
) STRICT;
CREATE TABLE IF NOT EXISTS execution_slot(
  slot_id INTEGER PRIMARY KEY CHECK(slot_id=1),
  task_id TEXT REFERENCES runs(task_id),
  owner_id TEXT,
  boot_id TEXT,
  lease_epoch INTEGER NOT NULL,
  heartbeat_at TEXT
) STRICT;
INSERT OR IGNORE INTO execution_slot(slot_id,lease_epoch) VALUES(1,0);
CREATE TABLE IF NOT EXISTS results(
  task_id TEXT PRIMARY KEY REFERENCES runs(task_id),
  generation INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  result_sha256 TEXT NOT NULL,
  published_at TEXT NOT NULL,
  UNIQUE(task_id,generation)
) STRICT;
CREATE TABLE IF NOT EXISTS model_attempts(
  task_id TEXT NOT NULL REFERENCES runs(task_id),
  operation_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN('Reserved','Started','UsageObserved','Terminal','Unknown')),
  raw_usage_json TEXT,
  record_version INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(task_id,operation_id,step_id,attempt)
) STRICT;
CREATE TABLE IF NOT EXISTS tool_calls(
  task_id TEXT NOT NULL REFERENCES runs(task_id),
  operation_id TEXT NOT NULL,
  tool_call_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  effect TEXT NOT NULL,
  replay TEXT NOT NULL CHECK(replay IN('never','safe')),
  recovery_contract_ref TEXT,
  state TEXT NOT NULL CHECK(state IN('Reserved','Started','Terminal','Unknown')),
  recovery_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(task_id,operation_id,tool_call_id)
) STRICT;
CREATE TABLE IF NOT EXISTS matrix_state(singleton INTEGER PRIMARY KEY CHECK(singleton=1),sync_cursor TEXT,membership_version INTEGER NOT NULL) STRICT;
INSERT OR IGNORE INTO matrix_state VALUES(1,NULL,0);
CREATE TABLE IF NOT EXISTS matrix_events(room_id TEXT NOT NULL,event_id TEXT NOT NULL,sender TEXT NOT NULL,txn_id TEXT,observed_at TEXT NOT NULL,PRIMARY KEY(room_id,event_id)) STRICT;
CREATE TABLE IF NOT EXISTS discussion_turns(
  task_id TEXT NOT NULL REFERENCES runs(task_id),
  event_id TEXT NOT NULL,
  turn_seq INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN('Pending','QueuedInPi','Consumed','Abandoned')),
  visible_content TEXT NOT NULL,
  pi_entry_id TEXT,
  pi_operation_id TEXT,
  PRIMARY KEY(task_id,event_id),
  UNIQUE(task_id,turn_seq)
) STRICT;
CREATE TABLE IF NOT EXISTS matrix_sends(
  txn_id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES runs(task_id),
  turn_seq INTEGER,
  payload_sha256 TEXT NOT NULL,
  event_id TEXT,
  state TEXT NOT NULL CHECK(state IN('Pending','Sent','Unknown'))
) STRICT;
CREATE TABLE IF NOT EXISTS audit_events(
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  actor_class TEXT NOT NULL,
  task_id TEXT,
  detail_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL
) STRICT;
CREATE TABLE IF NOT EXISTS discussion_access_loss(task_id TEXT PRIMARY KEY REFERENCES runs(task_id),room_id TEXT NOT NULL,detected_at TEXT NOT NULL) STRICT;
CREATE TABLE IF NOT EXISTS provider_calls(task_id TEXT NOT NULL REFERENCES runs(task_id),operation_id TEXT NOT NULL,ts TEXT NOT NULL,status INTEGER,request_id TEXT,note TEXT,latency_ms INTEGER) STRICT;
CREATE INDEX IF NOT EXISTS provider_calls_task ON provider_calls(task_id,ts);
`);
    this.db.exec("PRAGMA user_version=3");
  }

  private tx<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const x = fn();
      this.db.exec("COMMIT");
      return x;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  /** M003 §5.1.1 — create or return existing task+run; no deadline check (limits removed). */
  createOrGet(task: TaskRequest, principal: string, capacity: number, triggerContent?: string): CreateRunOutcome {
    return this.tx(() => {
      const old = this.db.prepare("SELECT * FROM tasks WHERE task_id=?").get(task.task_id) as any;
      if (old) {
        if (old.identity_state === "Tombstone") return { kind: "tombstone" };
        if (!sameTask(JSON.parse(old.task_json), task)) return { kind: "conflict" };
        const view = this.getRun(task.task_id);
        return { kind: "existing", task_id: task.task_id, generation: view.generation, state: view.state };
      }
      const q = (this.db.prepare("SELECT count(*) n FROM runs WHERE state='Queued'").get() as any).n as number;
      if (q >= capacity) return { kind: "queue_full" };
      const accepted = now();
      const purge = new Date(Date.now() + 7 * 864e5).toISOString();
      const staging: InputStaging = { state: task.input_refs?.length ? "pending" : "none", fetched: [], failed: [] };
      const delivery: ArtifactDelivery = { state: "none", delivered: [], failed: [] };
      this.db
        .prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?)")
        .run(task.task_id, principal, "Active", JSON.stringify(task), accepted, purge);
      this.db
        .prepare(
          "INSERT INTO runs(task_id,state,generation,cancel_requested,discussion_intake_state,input_staging_json,artifact_delivery_json,accepted_at) VALUES(?, 'Queued',1,0,?,?,?,?)",
        )
        .run(
          task.task_id,
          task.discussion ? "Open" : "Disabled",
          JSON.stringify(staging),
          JSON.stringify(delivery),
          accepted,
        );
      if (task.discussion) {
        this.db
          .prepare("INSERT INTO discussion_turns VALUES(?,?,1,'Pending',?,NULL,NULL)")
          .run(task.task_id, task.discussion.trigger_event_id, triggerContent ?? "");
      }
      return { kind: "created", task_id: task.task_id, generation: 1, state: "Queued" };
    });
  }

  getTask(taskId: string): TaskRequest {
    const r = this.db.prepare("SELECT task_json FROM tasks WHERE task_id=? AND identity_state='Active'").get(taskId) as any;
    if (!r) throw new PikoError("NotFound", 404, "task not found");
    return JSON.parse(r.task_json);
  }

  /** M003 §5.1.2 — fenced run mutation. Returns updated generation. */
  mutateRun(command: FencedRunCommand): number {
    return this.tx(() => {
      const r = this.db.prepare("SELECT * FROM runs WHERE task_id=?").get(command.task_id) as any;
      if (!r) throw new PikoError("NotFound", 404, "run not found");
      if (r.generation !== command.expected_generation) throw new PikoError("FencedWrite", 409, "generation moved");
      if (command.expected_state_in && !command.expected_state_in.includes(r.state)) {
        throw new PikoError("FencedWrite", 409, "state moved");
      }
      if (command.expected_lease_epoch !== undefined) {
        const slot = this.db.prepare("SELECT task_id,lease_epoch FROM execution_slot WHERE slot_id=1").get() as any;
        if (slot.task_id !== command.task_id || slot.lease_epoch !== command.expected_lease_epoch) {
          throw new PikoError("LeaseLost", 409, "lease moved");
        }
      }
      const next = { ...r, generation: r.generation + 1 };
      command.mutation(next);
      this.db
        .prepare("UPDATE runs SET generation=?,state=?,cancel_requested=?,last_activity_at=? WHERE task_id=?")
        .run(next.generation, next.state, next.cancel_requested, now(), command.task_id);
      return next.generation;
    });
  }

  getRun(taskId: string): TaskView {
    const r = this.db.prepare("SELECT * FROM runs WHERE task_id=?").get(taskId) as any;
    if (!r) {
      const t = this.db.prepare("SELECT identity_state FROM tasks WHERE task_id=?").get(taskId) as any;
      if (t?.identity_state === "Tombstone") throw new PikoError("Gone", 410, "task identity was purged");
      throw new PikoError("NotFound", 404, "task not found");
    }
    const hasResult = !!this.db.prepare("SELECT 1 FROM results WHERE task_id=?").get(taskId);
    const usage = this.usageSoFar(taskId);
    return {
      task_id: r.task_id,
      state: r.state,
      generation: r.generation,
      accepted_at: r.accepted_at,
      started_at: r.started_at,
      finished_at: r.finished_at,
      result_available: hasResult,
      cancel_requested: !!r.cancel_requested,
      discussion_intake_state: r.discussion_intake_state as IntakeState,
      input_staging: JSON.parse(r.input_staging_json),
      progress: {
        model_calls: r.model_calls,
        tool_calls: r.tool_calls,
        last_activity_at: r.last_activity_at,
        elapsed_ms: r.started_at ? Math.max(0, Date.now() - Date.parse(r.started_at)) : 0,
        usage_so_far: usage,
        recent_actions: this.knownActions(taskId).slice(0, 50),
        current_action: null,
      },
      artifact_delivery: JSON.parse(r.artifact_delivery_json),
    };
  }

  setInputStaging(taskId: string, staging: InputStaging) {
    this.db.prepare("UPDATE runs SET input_staging_json=? WHERE task_id=?").run(JSON.stringify(staging), taskId);
  }
  setArtifactDelivery(taskId: string, delivery: ArtifactDelivery) {
    this.db.prepare("UPDATE runs SET artifact_delivery_json=? WHERE task_id=?").run(JSON.stringify(delivery), taskId);
  }
  inputStaging(taskId: string): InputStaging {
    return JSON.parse((this.db.prepare("SELECT input_staging_json FROM runs WHERE task_id=?").get(taskId) as any).input_staging_json);
  }

  /** M003 §5.1.7 — claim the single slot for the oldest Queued Run. */
  tryClaimSlot(owner: string, boot: string): SlotGrant | "slot_busy" {
    return this.tx(() => {
      const slot = this.db.prepare("SELECT * FROM execution_slot WHERE slot_id=1").get() as any;
      if (slot.task_id) return "slot_busy";
      const r = this.db
        .prepare(
          "SELECT task_id FROM runs r WHERE state='Queued' AND json_extract(r.input_staging_json,'$.state') IN ('none','ready') ORDER BY accepted_at,task_id LIMIT 1",
        )
        .get() as any;
      if (!r) return "slot_busy";
      const epoch = slot.lease_epoch + 1;
      this.db
        .prepare("UPDATE execution_slot SET task_id=?,owner_id=?,boot_id=?,lease_epoch=?,heartbeat_at=? WHERE slot_id=1")
        .run(r.task_id, owner, boot, epoch, now());
      this.db
        .prepare("UPDATE runs SET state='Running',started_at=?,last_activity_at=? WHERE task_id=? AND state='Queued'")
        .run(now(), now(), r.task_id);
      this.db
        .prepare("INSERT OR IGNORE INTO run_sessions VALUES(?,?,'main',NULL,NULL,NULL,?)")
        .run(r.task_id, r.task_id, epoch);
      this.db.prepare("UPDATE run_sessions SET lease_epoch=? WHERE task_id=?").run(epoch, r.task_id);
      return { task_id: r.task_id, lease_epoch: epoch };
    });
  }

  /** MECH-RECOVERY — reclaim an orphaned non-terminal Run after boot. */
  recoverOrphaned(owner: string, boot: string): SlotGrant | null {
    return this.tx(() => {
      const slot = this.db.prepare("SELECT * FROM execution_slot WHERE slot_id=1").get() as any;
      if (!slot.task_id) return null;
      const run = this.db.prepare("SELECT state FROM runs WHERE task_id=?").get(slot.task_id) as any;
      if (!run || isTerminal(run.state)) {
        this.db.prepare("UPDATE execution_slot SET task_id=NULL,owner_id=NULL,boot_id=NULL,heartbeat_at=NULL WHERE slot_id=1").run();
        return null;
      }
      const epoch = slot.lease_epoch + 1;
      this.db
        .prepare("UPDATE execution_slot SET owner_id=?,boot_id=?,lease_epoch=?,heartbeat_at=? WHERE slot_id=1")
        .run(owner, boot, epoch, now());
      this.db.prepare("UPDATE run_sessions SET lease_epoch=? WHERE task_id=?").run(epoch, slot.task_id);
      return { task_id: slot.task_id, lease_epoch: epoch };
    });
  }

  readSlot(): { task_id: string | null; owner_id: string | null; boot_id: string | null; lease_epoch: number; heartbeat_at: string | null } {
    return this.db.prepare("SELECT task_id,owner_id,boot_id,lease_epoch,heartbeat_at FROM execution_slot WHERE slot_id=1").get() as any;
  }
  renewSlot(taskId: string, epoch: number): boolean {
    const x = this.db.prepare("UPDATE execution_slot SET heartbeat_at=? WHERE slot_id=1 AND task_id=? AND lease_epoch=?").run(now(), taskId, epoch);
    return x.changes === 1;
  }
  releaseSlot(taskId: string, epoch: number): boolean {
    const x = this.db
      .prepare("UPDATE execution_slot SET task_id=NULL,owner_id=NULL,boot_id=NULL,heartbeat_at=NULL WHERE slot_id=1 AND task_id=? AND lease_epoch=?")
      .run(taskId, epoch);
    return x.changes === 1;
  }
  scanNonTerminal(): string[] {
    return (this.db.prepare("SELECT task_id FROM runs WHERE state NOT IN('Completed','Failed','Cancelled') ORDER BY accepted_at").all() as any[]).map((x) => x.task_id);
  }

  /** P-INPUT pre-slot gate: the oldest Queued Run whose inputs still need staging. */
  nextNeedingStaging(): string | null {
    const r = this.db
      .prepare(
        "SELECT task_id FROM runs WHERE state='Queued' AND json_extract(input_staging_json,'$.state')='pending' ORDER BY accepted_at,task_id LIMIT 1",
      )
      .get() as any;
    return r?.task_id ?? null;
  }

  /** M003 §5.1.14 (ledger) — model/tool attempt reservation (no budget caps). */
  reserveModel(taskId: string, op: string, step: string, attempt: number): boolean {
    return this.tx(() => {
      const ex = this.db
        .prepare("SELECT state FROM model_attempts WHERE task_id=? AND operation_id=? AND step_id=? AND attempt=?")
        .get(taskId, op, step, attempt);
      if (ex) return true;
      this.db.prepare("INSERT INTO model_attempts VALUES(?,?,?,?, 'Started',NULL,1,?)").run(taskId, op, step, attempt, now());
      this.db.prepare("UPDATE runs SET model_calls=model_calls+1,last_activity_at=? WHERE task_id=?").run(now(), taskId);
      return true;
    });
  }
  observeUsage(taskId: string, op: string, step: string, attempt: number, raw: unknown) {
    this.db
      .prepare(
        "UPDATE model_attempts SET state='UsageObserved',raw_usage_json=?,record_version=record_version+1,updated_at=? WHERE task_id=? AND operation_id=? AND step_id=? AND attempt=?",
      )
      .run(JSON.stringify(raw), now(), taskId, op, step, attempt);
  }
  terminalModel(taskId: string, op: string, step: string, attempt: number, unknown = false) {
    this.db
      .prepare(
        "UPDATE model_attempts SET state=?,record_version=record_version+1,updated_at=? WHERE task_id=? AND operation_id=? AND step_id=? AND attempt=?",
      )
      .run(unknown ? "Unknown" : "Terminal", now(), taskId, op, step, attempt);
  }
  reserveTool(
    taskId: string,
    op: string,
    id: string,
    name: string,
    effect: string,
    replay: string,
    contract?: string,
  ): "Admitted" | "UnsafeRetryBlocked" {
    return this.tx(() => {
      const ex = this.db
        .prepare("SELECT replay,state FROM tool_calls WHERE task_id=? AND operation_id=? AND tool_call_id=?")
        .get(taskId, op, id) as any;
      if (ex) {
        if (ex.replay !== "safe") return "UnsafeRetryBlocked";
        this.db
          .prepare("UPDATE tool_calls SET recovery_count=recovery_count+1,updated_at=? WHERE task_id=? AND operation_id=? AND tool_call_id=?")
          .run(now(), taskId, op, id);
        return "Admitted";
      }
      this.db
        .prepare("INSERT INTO tool_calls VALUES(?,?,?,?,?,?,?,'Reserved',0,?)")
        .run(taskId, op, id, name, effect, replay, contract ?? null, now());
      this.db.prepare("UPDATE runs SET tool_calls=tool_calls+1,last_activity_at=? WHERE task_id=?").run(now(), taskId);
      return "Admitted";
    });
  }
  terminalTool(taskId: string, op: string, id: string, unknown = false) {
    this.db
      .prepare("UPDATE tool_calls SET state=?,updated_at=? WHERE task_id=? AND operation_id=? AND tool_call_id=?")
      .run(unknown ? "Unknown" : "Terminal", now(), taskId, op, id);
  }

  markTurn(taskId: string, event: string, status: "QueuedInPi" | "Consumed" | "Abandoned", entry?: string, op?: string) {
    this.db
      .prepare("UPDATE discussion_turns SET status=?,pi_entry_id=coalesce(?,pi_entry_id),pi_operation_id=coalesce(?,pi_operation_id) WHERE task_id=? AND event_id=?")
      .run(status, entry ?? null, op ?? null, taskId, event);
  }
  pendingTurns(taskId: string) {
    return this.db.prepare("SELECT * FROM discussion_turns WHERE task_id=? AND status IN('Pending','QueuedInPi') ORDER BY turn_seq").all(taskId) as any[];
  }
  markDiscussionAccessLost(room: string): string[] {
    return this.tx(() => {
      const rows = this.db
        .prepare("SELECT r.task_id,t.task_json FROM runs r JOIN tasks t USING(task_id) WHERE t.identity_state='Active' AND r.state NOT IN('Completed','Failed','Cancelled')")
        .all() as any[];
      const affected = rows
        .filter((x) => {
          try {
            return JSON.parse(x.task_json).discussion?.room_id === room;
          } catch {
            return false;
          }
        })
        .map((x) => x.task_id as string);
      const at = now();
      for (const taskId of affected) this.db.prepare("INSERT OR IGNORE INTO discussion_access_loss VALUES(?,?,?)").run(taskId, room, at);
      return affected;
    });
  }
  discussionAccessLost(taskId: string): boolean {
    return !!this.db.prepare("SELECT 1 FROM discussion_access_loss WHERE task_id=?").get(taskId);
  }
  recordProviderCall(taskId: string, operationId: string, status: number | null, requestId: string | null, note: string, latencyMs: number | null) {
    this.db
      .prepare("INSERT INTO provider_calls(task_id,operation_id,ts,status,request_id,note,latency_ms) VALUES(?,?,?,?,?,?,?)")
      .run(taskId, operationId, now(), status, requestId, note, latencyMs);
  }
  recordMatrixEvent(room: string, event: string, sender: string, txn?: string): boolean {
    const x = this.db.prepare("INSERT OR IGNORE INTO matrix_events VALUES(?,?,?,?,?)").run(room, event, sender, txn ?? null, now());
    return x.changes === 1;
  }
  ingestMatrixEvent(room: string, event: string, sender: string, txn: string | undefined, turns: { task: string; visible: string }[]): boolean {
    return this.tx(() => {
      const inserted = this.db.prepare("INSERT OR IGNORE INTO matrix_events VALUES(?,?,?,?,?)").run(room, event, sender, txn ?? null, now());
      if (!inserted.changes) return false;
      for (const turn of turns) {
        const r = this.db.prepare("SELECT discussion_intake_state FROM runs WHERE task_id=?").get(turn.task) as any;
        if (r?.discussion_intake_state !== "Open") continue;
        const seq = (this.db.prepare("SELECT coalesce(max(turn_seq),0)+1 n FROM discussion_turns WHERE task_id=?").get(turn.task) as any).n;
        this.db.prepare("INSERT INTO discussion_turns VALUES(?,?,?,'Pending',?,NULL,NULL)").run(turn.task, event, seq, turn.visible);
      }
      return true;
    });
  }
  hasMatrixEvent(room: string, event: string): boolean {
    return !!this.db.prepare("SELECT 1 FROM matrix_events WHERE room_id=? AND event_id=?").get(room, event);
  }
  ingestMatrixBatch(events: { room: string; event: string; sender: string; txn?: string; turns: { task: string; visible: string }[] }[], cursor: string) {
    return this.tx(() => {
      for (const item of events) {
        const inserted = this.db.prepare("INSERT OR IGNORE INTO matrix_events VALUES(?,?,?,?,?)").run(item.room, item.event, item.sender, item.txn ?? null, now());
        if (!inserted.changes) continue;
        for (const turn of item.turns) {
          const r = this.db.prepare("SELECT discussion_intake_state FROM runs WHERE task_id=?").get(turn.task) as any;
          if (r?.discussion_intake_state !== "Open") continue;
          const seq = (this.db.prepare("SELECT coalesce(max(turn_seq),0)+1 n FROM discussion_turns WHERE task_id=?").get(turn.task) as any).n;
          this.db.prepare("INSERT INTO discussion_turns VALUES(?,?,?,'Pending',?,NULL,NULL)").run(turn.task, item.event, seq, turn.visible);
        }
      }
      this.db.prepare("UPDATE matrix_state SET sync_cursor=? WHERE singleton=1").run(cursor);
      return events.length;
    });
  }
  openDiscussionRuns(room: string): string[] {
    return (this.db
      .prepare("SELECT r.task_id,t.task_json FROM runs r JOIN tasks t USING(task_id) WHERE r.discussion_intake_state='Open' AND t.identity_state='Active'")
      .all() as any[])
      .filter((x) => {
        try {
          return JSON.parse(x.task_json).discussion?.room_id === room;
        } catch {
          return false;
        }
      })
      .map((x) => x.task_id as string);
  }
  matrixCursor(): string | null {
    return (this.db.prepare("SELECT sync_cursor FROM matrix_state WHERE singleton=1").get() as any).sync_cursor;
  }
  setMatrixCursor(cursor: string) {
    this.db.prepare("UPDATE matrix_state SET sync_cursor=? WHERE singleton=1").run(cursor);
  }
  prepareMatrixSend(txn: string, taskId: string, turn: number, payloadSha: string): { state: string; event_id?: string } {
    return this.tx(() => {
      const old = this.db.prepare("SELECT * FROM matrix_sends WHERE txn_id=?").get(txn) as any;
      if (old) {
        if (old.payload_sha256 !== payloadSha) throw new PikoError("TaskConflict", 409, "Matrix transaction payload changed");
        return old;
      }
      this.db.prepare("INSERT INTO matrix_sends VALUES(?,?,?,?,NULL,'Pending')").run(txn, taskId, turn, payloadSha);
      return { state: "Pending" };
    });
  }
  finishMatrixSend(txn: string, event: string) {
    this.db.prepare("UPDATE matrix_sends SET state='Sent',event_id=? WHERE txn_id=?").run(event, txn);
  }
  unknownMatrixSend(txn: string) {
    this.db.prepare("UPDATE matrix_sends SET state='Unknown' WHERE txn_id=? AND state!='Sent'").run(txn);
  }
  tryCloseIntake(taskId: string, epoch: number): boolean {
    return this.tx(() => {
      const pending = (this.db.prepare("SELECT count(*) n FROM discussion_turns WHERE task_id=? AND status IN('Pending','QueuedInPi')").get(taskId) as any).n;
      if (pending) return false;
      const r = this.db
        .prepare("SELECT discussion_intake_state FROM runs WHERE task_id=? AND EXISTS(SELECT 1 FROM run_sessions WHERE task_id=? AND lease_epoch=?)")
        .get(taskId, taskId, epoch) as any;
      if (!r) return false;
      if (r.discussion_intake_state === "Closing") return true;
      if (r.discussion_intake_state !== "Open") return false;
      return this.db.prepare("UPDATE runs SET discussion_intake_state='Closing' WHERE task_id=? AND discussion_intake_state='Open'").run(taskId).changes === 1;
    });
  }

  /** MECH-CANCEL — route by state; Queued yields a zero-call Cancelled Result. */
  cancel(taskId: string): { outcome: "CancelledBeforeStart" | "StopRequested" | "AlreadyTerminal"; requested_at: string } {
    return this.tx(() => {
      const r = this.getRun(taskId);
      const at = now();
      if (isTerminal(r.state)) return { outcome: "AlreadyTerminal", requested_at: at };
      if (r.state === "Queued") {
        const result: AgentResult = {
          task_id: taskId,
          generation: 1,
          state: "Cancelled",
          partial: false,
          summary: "Cancelled before execution started.",
          outputs: [],
          stats: { model_calls: 0, tool_calls: 0, duration_ms: 0, outputs_count: 0, outputs_bytes: 0 },
          known_actions: [],
          usage: emptyUsage(),
          failure: { code: "CancelledByRequest", cause_class: "Cancellation", message: "Cancelled before start." },
          published_at: at,
        };
        this.insertResult(result);
        this.db.prepare("UPDATE discussion_turns SET status='Abandoned' WHERE task_id=? AND status IN('Pending','QueuedInPi')").run(taskId);
        this.db
          .prepare("UPDATE runs SET state='Cancelled',cancel_requested=1,discussion_intake_state=CASE WHEN discussion_intake_state='Disabled' THEN 'Disabled' ELSE 'Closed' END,finished_at=? WHERE task_id=?")
          .run(at, taskId);
        return { outcome: "CancelledBeforeStart", requested_at: at };
      }
      this.db
        .prepare("UPDATE runs SET state='Cancelling',cancel_requested=1,discussion_intake_state=CASE WHEN discussion_intake_state='Open' THEN 'Closing' ELSE discussion_intake_state END WHERE task_id=?")
        .run(taskId);
      return { outcome: "StopRequested", requested_at: at };
    });
  }
  cancelRequested(taskId: string): boolean {
    return !!(this.db.prepare("SELECT cancel_requested FROM runs WHERE task_id=?").get(taskId) as any)?.cancel_requested;
  }
  generation(taskId: string): number {
    return (this.db.prepare("SELECT generation FROM runs WHERE task_id=?").get(taskId) as any).generation;
  }

  private usageSoFar(taskId: string): { input_tokens: number | null; output_tokens: number | null; total_tokens: number | null } {
    const rows = this.db.prepare("SELECT raw_usage_json FROM model_attempts WHERE task_id=? AND raw_usage_json IS NOT NULL").all(taskId) as any[];
    if (!rows.length) return { input_tokens: null, output_tokens: null, total_tokens: null };
    let i = 0,
      o = 0,
      t = 0,
      ci = 0,
      co = 0;
    for (const r of rows) {
      const v = JSON.parse(r.raw_usage_json);
      i += v.input ?? 0;
      o += v.output ?? 0;
      t += v.totalTokens ?? 0;
      ci += v.cacheRead ?? 0;
      co += v.cacheWrite ?? 0;
    }
    return { input_tokens: i + ci + co, output_tokens: o, total_tokens: t };
  }
  rawUsage(taskId: string) {
    return this.db
      .prepare("SELECT raw_usage_json FROM model_attempts WHERE task_id=? AND raw_usage_json IS NOT NULL")
      .all(taskId)
      .map((r: any) => {
        const value = JSON.parse(r.raw_usage_json);
        if (
          value.cost &&
          typeof value.input === "number" &&
          typeof value.cacheRead === "number" &&
          typeof value.cacheWrite === "number" &&
          typeof value.output === "number" &&
          value.totalTokens === value.input + value.output + value.cacheRead + value.cacheWrite
        ) {
          return { ...value, input: value.input + value.cacheRead + value.cacheWrite };
        }
        return value;
      });
  }
  knownActions(taskId: string) {
    const actions: any[] = [];
    for (const x of this.db
      .prepare("SELECT operation_id,step_id,attempt,state FROM model_attempts WHERE task_id=? ORDER BY updated_at DESC")
      .all(taskId) as any[]) {
      actions.push({
        kind: "ModelCall",
        status: x.state === "Terminal" ? "Completed" : x.state === "Unknown" ? "Unknown" : "InProgress",
        description: `${x.operation_id}/${x.step_id} attempt ${x.attempt}`,
      });
    }
    for (const x of this.db
      .prepare("SELECT operation_id,tool_call_id,tool_name,state FROM tool_calls WHERE task_id=? ORDER BY updated_at DESC")
      .all(taskId) as any[]) {
      actions.push({
        kind: "ToolCall",
        status: x.state === "Terminal" ? "Completed" : x.state === "Unknown" ? "Unknown" : "InProgress",
        description: `${x.tool_name} ${x.operation_id}/${x.tool_call_id}`,
      });
    }
    for (const x of this.db.prepare("SELECT txn_id,state FROM matrix_sends WHERE task_id=? ORDER BY txn_id").all(taskId) as any[]) {
      actions.push({ kind: "MatrixSend", status: x.state === "Sent" ? "Completed" : "Unknown", description: x.txn_id });
    }
    return actions;
  }

  private insertResult(result: AgentResult) {
    validateUsage(result.usage);
    const json = JSON.stringify(result);
    const sha = createHash("sha256").update(json).digest("hex");
    this.db.prepare("INSERT INTO results VALUES(?,?,?,?,?)").run(result.task_id, result.generation, json, sha, result.published_at);
  }

  /** MECH-RUN — Result two-step commit, step 1: publish immutable Result generation. */
  publishResult(result: AgentResult, epoch: number): void {
    this.tx(() => {
      const slot = this.db.prepare("SELECT task_id,lease_epoch FROM execution_slot WHERE slot_id=1").get() as any;
      if (slot.task_id !== result.task_id || slot.lease_epoch !== epoch) throw new PikoError("LeaseLost", 409, "execution lease was lost");
      this.insertResult(result);
      this.db.prepare("UPDATE runs SET generation=generation+1 WHERE task_id=?").run(result.task_id);
    });
  }

  /** Step 2: write terminal state and release the slot. */
  finish(result: AgentResult, epoch: number): void {
    this.tx(() => {
      const slot = this.db.prepare("SELECT task_id,lease_epoch FROM execution_slot WHERE slot_id=1").get() as any;
      if (slot.task_id !== result.task_id || slot.lease_epoch !== epoch) throw new PikoError("LeaseLost", 409, "execution lease was lost");
      const run = this.db.prepare("SELECT discussion_intake_state FROM runs WHERE task_id=?").get(result.task_id) as any;
      const pending = (this.db.prepare("SELECT count(*) n FROM discussion_turns WHERE task_id=? AND status IN('Pending','QueuedInPi')").get(result.task_id) as any).n as number;
      if (result.state === "Completed" && run.discussion_intake_state !== "Disabled" && (run.discussion_intake_state !== "Closing" || pending !== 0)) {
        throw new PikoError("DiscussionNotClosed", 409, "discussion result cannot complete before intake closes");
      }
      if (result.state !== "Completed") {
        this.db.prepare("UPDATE discussion_turns SET status='Abandoned' WHERE task_id=? AND status IN('Pending','QueuedInPi')").run(result.task_id);
      }
      if (!this.db.prepare("SELECT 1 FROM results WHERE task_id=? AND generation=?").get(result.task_id, result.generation)) {
        this.insertResult(result);
      }
      this.db
        .prepare("UPDATE runs SET state=?,finished_at=?,discussion_intake_state=CASE WHEN discussion_intake_state='Disabled' THEN 'Disabled' ELSE 'Closed' END WHERE task_id=?")
        .run(result.state, result.published_at, result.task_id);
      this.db
        .prepare("UPDATE execution_slot SET task_id=NULL,owner_id=NULL,boot_id=NULL,heartbeat_at=NULL WHERE slot_id=1 AND task_id=? AND lease_epoch=?")
        .run(result.task_id, epoch);
    });
  }

  /** Terminal publish for a Queued Run that never took the slot (P-INPUT precondition failure). */
  finishQueued(result: AgentResult): void {
    this.tx(() => {
      const r = this.db.prepare("SELECT state FROM runs WHERE task_id=?").get(result.task_id) as any;
      if (!r) throw new PikoError("NotFound", 404, "run not found");
      if (isTerminal(r.state)) return;
      if (!this.db.prepare("SELECT 1 FROM results WHERE task_id=? AND generation=?").get(result.task_id, result.generation)) {
        this.insertResult(result);
      }
      this.db
        .prepare("UPDATE runs SET state=?,finished_at=?,discussion_intake_state=CASE WHEN discussion_intake_state='Disabled' THEN 'Disabled' ELSE 'Closed' END WHERE task_id=?")
        .run(result.state, result.published_at, result.task_id);
      this.db.prepare("UPDATE discussion_turns SET status='Abandoned' WHERE task_id=? AND status IN('Pending','QueuedInPi')").run(result.task_id);
    });
  }

  result(taskId: string): AgentResult {
    const r = this.db.prepare("SELECT result_json FROM results WHERE task_id=?").get(taskId) as any;
    if (r) return JSON.parse(r.result_json);
    const state = this.getRun(taskId).state;
    if (!isTerminal(state)) throw new PikoError("TaskNotTerminal", 409, "task is not terminal");
    throw new PikoError("ResultUnavailable", 500, "terminal result missing");
  }

  /** MECH-TRANSFER / CAP-PURGE — operator-forced cleanup; tombstone is permanent. */
  purge(scope: { task_id: string } | "all"): { removed: number; tombstones: number } {
    return this.tx(() => {
      const rows =
        scope === "all"
          ? (this.db
              .prepare("SELECT task_id FROM tasks WHERE identity_state='Active' AND purge_after<? AND EXISTS(SELECT 1 FROM runs WHERE runs.task_id=tasks.task_id AND state IN('Completed','Failed','Cancelled'))")
              .all(now()) as any[])
          : [{ task_id: scope.task_id }];
      let removed = 0,
        tombstones = 0;
      for (const x of rows) {
        const identity = this.db.prepare("SELECT identity_state FROM tasks WHERE task_id=?").get(x.task_id) as any;
        if (!identity) continue;
        if (identity.identity_state === "Tombstone") continue;
        for (const table of ["matrix_sends", "discussion_turns", "discussion_access_loss", "provider_calls", "tool_calls", "model_attempts", "results", "run_sessions"]) {
          this.db.prepare(`DELETE FROM ${table} WHERE task_id=?`).run(x.task_id);
        }
        this.db.prepare("DELETE FROM runs WHERE task_id=?").run(x.task_id);
        this.db.prepare("UPDATE tasks SET identity_state='Tombstone',task_json=NULL WHERE task_id=?").run(x.task_id);
        this.db.prepare("INSERT INTO audit_events(event_name,actor_class,task_id,detail_json,occurred_at) VALUES('event.audit.forced-purge','operator',?,?,?)").run(x.task_id, JSON.stringify(scope), now());
        removed += 1;
        tombstones += 1;
      }
      return { removed, tombstones };
    });
  }

  /** Retention GC used by the operator `purge --all` path. */
  purgeExpired(): number {
    return this.purge("all").removed;
  }
}


/**
 * Read-only view of the Task Store. P1 may read authoritative facts directly
 * (WAL-safe concurrent readers), but MUST apply every write through the P0 data
 * channel (src/ipc.ts) so the P0 process stays the single writer.
 */
export type TaskStoreReader = Pick<
  TaskStore,
  | "getTask"
  | "getRun"
  | "cancelRequested"
  | "generation"
  | "pendingTurns"
  | "rawUsage"
  | "knownActions"
  | "discussionAccessLost"
>;

export function asReader(store: TaskStore): TaskStoreReader {
  return {
    getTask: store.getTask.bind(store),
    getRun: store.getRun.bind(store),
    cancelRequested: store.cancelRequested.bind(store),
    generation: store.generation.bind(store),
    pendingTurns: store.pendingTurns.bind(store),
    rawUsage: store.rawUsage.bind(store),
    knownActions: store.knownActions.bind(store),
    discussionAccessLost: store.discussionAccessLost.bind(store),
  };
}
