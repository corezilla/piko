/**
 * 公共替身：A1（Mem0Adapter.search / constructor）单元测试共用。
 *
 * `pi-fix.ts` 的 fakeFetch 只能返回一个固定 body；`search` 的分支 Case 需要
 * 同一个替身按调用次序返回不同的 JSON（真侧/假侧各一次），这里补上。
 */
import { vi } from "vitest";

/** 一次被记录的 fetch 调用（URL + 原样 init）。 */
export type RecordedCall = { url: string; init?: RequestInit };

/** 一条脚本化响应：status/statusText/body 原样塞进 Response。 */
export type Responder = { status?: number; statusText?: string; body?: string };

/**
 * 记录调用的 fetch 替身：按调用次序消费 responders；耗尽后重复最后一个。
 * 每个 Case 自己 `vi.stubGlobal("fetch", ff.fetch)` 并在 finally 里
 * `vi.unstubAllGlobals()`。
 */
export function scriptedFetch(responders: Responder[]) {
  const calls: RecordedCall[] = [];
  let idx = 0;
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    const call = { url: String(input), init };
    calls.push(call);
    const r = responders[Math.min(idx, responders.length - 1)]!;
    idx += 1;
    return new Response(r.body ?? "{}", {
      status: r.status ?? 200,
      statusText: r.statusText,
    });
  });
  return { fetch: fetch as unknown as typeof fetch, calls };
}

/** 网络错误替身：fetch 永远 reject 出同一个 err（catch 路径用）。 */
export function rejectingFetch(err: Error) {
  const calls: RecordedCall[] = [];
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    throw err;
  });
  return { fetch: fetch as unknown as typeof fetch, calls };
}

/** 读出某次调用发出的请求体 JSON。 */
export function bodyOf(call: RecordedCall): Record<string, unknown> {
  return JSON.parse(String(call.init?.body)) as Record<string, unknown>;
}

/** 某次调用发出的请求头（Mem0Adapter 传的是普通对象）。 */
export function headersOf(call: RecordedCall): Record<string, string> {
  return (call.init?.headers ?? {}) as Record<string, string>;
}
