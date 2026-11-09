/**
 * 公共替身：REPO 单元测试共用。
 *
 * store.ts 是 P0 的唯一写者，全部状态在 SQLite 里。故这里给一个内存库的
 * 装置（真 TaskStore）＋ 几个常用任务的构造器。
 */
import { TaskStore } from "../../../../src/store.js";
import type { AgentResult, TaskRequest } from "../../../../src/types.js";
import { emptyUsage } from "../../../../src/semantic.js";

/** 一条最小可用的任务定义。 */
export const task = (id: string, extra: Partial<TaskRequest> = {}): TaskRequest =>
  ({
    task_id: id,
    instruction: "run",
    workspace_ref: "piko",
    permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
    output_paths: [],
    ...extra,
  }) as TaskRequest;

/** 一条带讨论的任务定义。 */
export const discussionTask = (id: string, room = "!room:test", event = "$e1"): TaskRequest =>
  task(id, { discussion: { room_id: room, trigger_event_id: event } } as Partial<TaskRequest>);

/** 一个内存库。 */
export function newStore(): TaskStore {
  return new TaskStore(":memory:", 1000);
}

/** 造一条已受理的任务。 */
export function accept(store: TaskStore, definition: TaskRequest, principal = "slinky", capacity = 10) {
  return store.createOrGet(definition, principal, capacity);
}

/** 造一条带讨论的已受理任务。 */
export function acceptDiscussion(store: TaskStore, id: string, room = "!room:test") {
  return accept(store, discussionTask(id, room), "slinky", 10);
}

/** 一份可发布的 AgentResult。 */
export function result(id: string, over: Partial<AgentResult> = {}): AgentResult {
  const at = "2026-11-09T00:00:00.000Z";
  return {
    task_id: id,
    generation: 1,
    state: "Completed",
    partial: false,
    summary: "done",
    outputs: [],
    executions: [],
    stats: { model_calls: 0, tool_calls: 0, duration_ms: 0, outputs_count: 0, outputs_bytes: 0 },
    known_actions: [],
    usage: emptyUsage(),
    failure: null,
    published_at: at,
    ...over,
  } as AgentResult;
}

/** 一个可写的用量记录（供 observeUsage 用）。 */
export const rawUsageSample = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 0,
  cacheWrite: 0,
  ...over,
});
