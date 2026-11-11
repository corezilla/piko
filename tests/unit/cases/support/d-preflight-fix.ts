/**
 * 公共替身：`preflightModelProvider` / `prefetchSkillContext` 的单元测试共用。
 *
 * 这里只放替身（假的 fetch、假的 Response），不放断言——断言留在各 Case 脚本里，
 * 逐值对账。
 */
import { vi } from "vitest";

/** 一次被拦截的 fetch 调用。 */
export interface PreflightFetchCall {
  /** 请求 URL（实现传入 URL 对象，这里存成字符串）。 */
  url: string;
  /** 请求头（实现传入普通对象 `{authorization}`）。 */
  headers: Record<string, string>;
  /** 中止信号（实现传入 AbortController 的 signal）。 */
  signal: AbortSignal | undefined;
}

/** 拦截全局 fetch 的替身。 */
export interface PreflightFetchStub {
  calls: PreflightFetchCall[];
  restore(): void;
}

/** 只带实现用到字段的假 Response（ok / status / json）。 */
export function fakeResponse(options: { ok?: boolean; status?: number; json?: unknown } = {}): Response {
  const status = options.status ?? 200;
  return {
    ok: options.ok ?? (status >= 200 && status < 300),
    status,
    json: async () => options.json,
  } as unknown as Response;
}

/** 默认响应器：200 + `{data:[{id:...}]}`。 */
export function modelsResponder(ids: string[] = ["gpt-4o-mini"]): (call: PreflightFetchCall) => Response {
  return () => fakeResponse({ status: 200, json: { data: ids.map((id) => ({ id })) } });
}

/** 拦截全局 fetch 并记录每次调用；`responder` 决定这次请求的响应。 */
export function stubFetch(responder: (call: PreflightFetchCall) => unknown): PreflightFetchStub {
  const calls: PreflightFetchCall[] = [];
  const stub = vi.fn(async (input: unknown, init?: RequestInit) => {
    const call: PreflightFetchCall = {
      url: String(input),
      headers: { ...((init?.headers ?? {}) as Record<string, string>) },
      signal: init?.signal ?? undefined,
    };
    calls.push(call);
    return (await responder(call)) as Response;
  });
  vi.stubGlobal("fetch", stub as unknown as typeof fetch);
  return {
    calls,
    restore: () => vi.unstubAllGlobals(),
  };
}

/**
 * 永不 settle 的响应器：只有 signal 被 abort 时才以 AbortError reject。
 * 用于观察超时分支——真实 fetch 在 abort 时也是以 AbortError 收场。
 */export function neverSettles(call: PreflightFetchCall): Promise<Response> {
  return new Promise<Response>((_resolve, reject) => {
    const signal = call.signal;
    if (!signal) return;
    const onAbort = () => {
      const error = new Error("The operation was aborted.");
      error.name = "AbortError";
      reject(error);
    };
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * 抓住一个 promise 的 rejection 并原样返回那个 Error。
 * promise 若 resolve 则这里抛错——Case 断言的是"抛什么"，不是"抛没抛"。
 */
export async function captureError(promise: Promise<unknown>): Promise<Error> {
  let caught: unknown;
  let resolved = false;
  try {
    await promise;
    resolved = true;
  } catch (error) {
    caught = error;
  }
  if (resolved) throw new Error("expected the promise to reject, but it resolved");
  return caught as Error;
}
