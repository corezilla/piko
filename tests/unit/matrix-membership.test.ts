import { afterEach, describe, expect, it } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../src/matrix.js";
import { TaskStore } from "../../src/store.js";
import type { RuntimeConfig, TaskRequest } from "../../src/types.js";

/**
 * Matrix runtime — error classification, membership gating and fail-closed
 * bookkeeping.
 * Covers UT-MATRIX-* items that the send-idempotency suite does not reach:
 * permanent-vs-transient classification, membership checks, and the audit
 * that records access loss without stopping intake.
 */

const stores: TaskStore[] = [];
afterEach(() => {
  while (stores.length) stores.pop()!.close();
});
const config = {
  matrix: { enabled: true, homeserver: "https://hs.test", user_id: "@piko-bot:test" },
  workspace: { roots: { piko: "/tmp" }, staging_root: "/tmp/staging" },
} as unknown as RuntimeConfig;

function fixture() {
  const store = new TaskStore(":memory:", 1000);
  stores.push(store);
  const matrix = new MatrixRuntime(config, store) as unknown as Record<string, any>;
  matrix.client = { getJoinedRooms: async () => ({ joined_rooms: [] }) };
  return { store, matrix };
}

const task = (id: string, room: string): TaskRequest => ({
  task_id: id,
  instruction: "reply",
  workspace_ref: "piko",
  discussion: { room_id: room, trigger_event_id: "$e" },
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
});

describe("UT-MATRIX-001 · isPermanentMatrixError", () => {
  it("treats auth/permission/room errors as permanent", () => {
    for (const errcode of ["M_UNKNOWN_TOKEN", "M_FORBIDDEN", "M_UNKNOWN_ROOM", "M_BAD_JSON"]) {
      expect(isPermanentMatrixError({ errcode })).toBe(true);
    }
  });

  it("treats rate limiting and transport errors as transient", () => {
    expect(isPermanentMatrixError({ errcode: "M_LIMIT_EXCEEDED", httpStatus: 429 })).toBe(false);
    expect(isPermanentMatrixError(new Error("ConnectionError"))).toBe(false);
  });

  it("returns false for non-error input instead of throwing", () => {
    expect(isPermanentMatrixError(undefined)).toBe(false);
    expect(isPermanentMatrixError("nope")).toBe(false);
  });
});

describe("UT-MATRIX-002 · membership gating", () => {
  it("isJoined reflects the homeserver's joined_rooms", async () => {
    const { matrix } = fixture();
    expect(await matrix.isJoined("!room:test")).toBe(false);
    matrix.client = { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) };
    expect(await matrix.isJoined("!room:test")).toBe(true);
    expect(await matrix.isJoined("!other:test")).toBe(false);
  });

  it("isJoined answers true on a transport error, so a blip does not fail-closed", async () => {
    const { matrix } = fixture();
    matrix.client = {
      getJoinedRooms: async () => {
        throw new Error("ConnectionError");
      },
    };
    // Conservative: only a confirmed absence proves loss.
    expect(await matrix.isJoined("!room:test")).toBe(true);
  });
});

describe("UT-MATRIX-003 · fail-closed bookkeeping", () => {
  it("recordDiscussionAccessLost marks the loss and converges queued tasks", () => {
    const { store, matrix } = fixture();
    const c = store.createOrGet(task("mx-1", "!room:test"), "slinky", 10, "$e");
    const id = (c as { task_id: string }).task_id;

    expect(store.discussionAccessLost(id)).toBe(false);
    matrix.recordDiscussionAccessLost("!room:test");

    expect(store.discussionAccessLost(id)).toBe(true);
    // recordDiscussionAccessLost already converges Queued tasks, so the task
    // must already be terminal here rather than lingering in Queued.
    expect(store.getRun(id).state).toBe("Failed");
    // A follow-up sweep has nothing left to converge (idempotent).
    expect(store.failAccessLostTasks()).not.toContain(id);
  });

  it("recording a loss for an unrelated room does not affect the task", () => {
    const { store, matrix } = fixture();
    const c = store.createOrGet(task("mx-2", "!room:test"), "slinky", 10, "$e");
    const id = (c as { task_id: string }).task_id;
    matrix.recordDiscussionAccessLost("!other:test");
    expect(store.discussionAccessLost(id)).toBe(false);
    expect(store.getRun(id).state).toBe("Queued");
  });
});