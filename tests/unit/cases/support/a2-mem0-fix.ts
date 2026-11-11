/**
 * 公共替身：A2（Mem0Adapter.add / pollForExtractedMemory）单元测试共用。
 *
 * 需求：
 *  - 同一个 fetch 替身要按 **URL 路由** 返回不同响应（add 与 search 是两条不同
 *    的路径，且 search 可能被轮询多次）；
 *  - 需要能返回 **非 JSON** 的响应体（走 `catch ()` 分支）；
 *  - 需要能 **reject**（走网络错误 catch 分支）；
 *  - 轮询有 10 秒死线，必须能推进假时钟直到 promise 落定。
 *
 * 每个 Case 自己 `vi.stubGlobal("fetch", stub.fetch)`，并在 finally 里
 * `vi.unstubAllGlobals()`。
 */
import { vi } from "vitest";

/** 一条响应脚本。 */
export type Reply =
  | { kind: "json"; status?: number; statusText?: string; body: unknown }
  | { kind: "text"; status?: number; statusText?: string; text: string }
  | { kind: "reject"; error: unknown };

/** JSON 响应。 */
export function json(body: unknown, status = 200, statusText = ""): Reply {
  return { kind: "json", status, statusText, body };
}

/** 非 JSON 文本响应（`response.json()` 会抛，走 `catch ()`）。 */
export function text(body: string, status = 500, statusText = "Internal Server Error"): Reply {
  return { kind: "text", status, statusText, text: body };
}

/** 网络层错误（fetch reject）。 */
export function reject(error: unknown): Reply {
  return { kind: "reject", error };
}

/** 一次被记录的 fetch 调用（全部字段都已解析成可直接对账的值）。 */
export interface RecordedCall {
  /** 完整 URL。 */
  url: string;
  /** HTTP 方法。 */
  method: string;
  /** 请求头（原样对象）。 */
  headers: Record<string, string>;
  /** 请求体原文。 */
  rawBody: string;
  /** 请求体解析后的 JSON。 */
  body: any;
}

/** Mem0 的两条路径。 */
export const ADD_PATH = "/v3/memories/add/";
export const SEARCH_PATH = "/v3/memories/search/";

/**
 * 按路径路由的 fetch 替身：每个路径一条响应队列，按调用次序消费；
 * 队列耗尽后重复最后一条。调用全部记录在 `calls` 里。
 */
export class Mem0FetchStub {
  readonly calls: RecordedCall[] = [];
  private readonly queues = new Map<string, Reply[]>();
  private readonly defaults = new Map<string, Reply>();
  private fallback: Reply = json({ results: [] });

  /** 给某条路径排入响应（按调用次序消费）。 */
  on(path: string, ...replies: Reply[]): this {
    const q = this.queues.get(path) ?? [];
    q.push(...replies);
    this.queues.set(path, q);
    return this;
  }

  /** 给某条路径设定默认响应（队列耗尽后使用）。 */
  fallbackFor(path: string, reply: Reply): this {
    this.defaults.set(path, reply);
    return this;
  }

  /** 未命中任何路径时的默认响应。 */
  fallbackTo(reply: Reply): this {
    this.fallback = reply;
    return this;
  }

  private pick(url: string): Reply {
    for (const [path, queue] of this.queues) {
      if (!url.includes(path)) continue;
      if (queue.length === 0) continue;
      const r = queue.length === 1 ? queue[0]! : queue.shift()!;
      return r;
    }
    for (const [path, reply] of this.defaults) {
      if (url.includes(path)) return reply;
    }
    return this.fallback;
  }

  /** 可直接 `vi.stubGlobal("fetch", stub.fetch)` 的替身。 */
  get fetch(): typeof fetch {
    const stub = this;
    const fn = vi.fn(async (input: unknown, init?: RequestInit) => {
      const url = String(input);
      const rawBody = typeof init?.body === "string" ? init.body : "";
      let body: any = undefined;
      try {
        body = rawBody === "" ? undefined : JSON.parse(rawBody);
      } catch {
        body = undefined;
      }
      stub.calls.push({
        url,
        method: String(init?.method ?? "GET"),
        headers: { ...((init?.headers ?? {}) as Record<string, string>) },
        rawBody,
        body,
      });
      const reply = stub.pick(url);
      if (reply.kind === "reject") throw reply.error;
      if (reply.kind === "text") {
        return new Response(reply.text, {
          status: reply.status ?? 500,
          statusText: reply.statusText ?? "",
        });
      }
      return new Response(JSON.stringify(reply.body), {
        status: reply.status ?? 200,
        statusText: reply.statusText ?? "",
        headers: { "Content-Type": "application/json" },
      });
    });
    return fn as unknown as typeof fetch;
  }

  /** 命中某条路径的全部调用。 */
  callsTo(path: string): RecordedCall[] {
    return this.calls.filter((c) => c.url.includes(path));
  }

  /** add 请求（按次序）。 */
  get addCalls(): RecordedCall[] {
    return this.callsTo(ADD_PATH);
  }

  /** search 请求（按次序）。 */
  get searchCalls(): RecordedCall[] {
    return this.callsTo(SEARCH_PATH);
  }
}

/** 假 baseUrl / apiKey。 */
export const MEM0_BASE = "https://mem0.test";
export const MEM0_KEY = "test-api-key";

/**
 * 推进假时钟直到 `p` 落定。轮询内部 `await new Promise(r => setTimeout(r, 700))`，
 * 只有把假时钟推过 10 秒死线，promise 才会 resolve。
 *
 * @returns promise 的落定值（落定为 rejected 时抛出原错误）。
 */
export async function drainPoll<T>(
  p: Promise<T>,
  options: { steps?: number; stepMs?: number } = {},
): Promise<T> {
  const steps = options.steps ?? 40;
  const stepMs = options.stepMs ?? 700;
  let done = false;
  let value: T | undefined;
  let failure: unknown;
  let failed = false;
  void p.then(
    (v) => {
      done = true;
      value = v;
    },
    (e) => {
      done = true;
      failed = true;
      failure = e;
    },
  );
  for (let i = 0; i < steps && !done; i += 1) {
    await vi.advanceTimersByTimeAsync(stepMs);
  }
  if (!done) throw new Error("drainPoll: promise 在推进假时钟后仍未落定");
  if (failed) throw failure;
  return value as T;
}

/** 造一条合法的 add 入参。 */
export function validMessages(content = "hello"): Array<{ role: "user" | "assistant"; content: string }> {
  return [{ role: "user", content }];
}

/** 一条命中记录（search 的 v3 响应形状）。 */
export function hit(id: string, createdAt = "2026-01-01T00:00:00Z", extra: Record<string, unknown> = {}) {
  return {
    id,
    memory: `memory-${id}`,
    score: 1,
    metadata: {},
    created_at: createdAt,
    ...extra,
  };
}
