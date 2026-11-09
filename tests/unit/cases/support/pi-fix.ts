/**
 * 公共替身：PI 单元测试共用。
 */
import { vi } from "vitest";

/** 一个假的 fetch：记录被调用的 URL，返回一个 200。 */
export function fakeFetch(response: { status?: number; body?: string } = {}) {
  const calls: { input: unknown; init?: RequestInit }[] = [];
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    calls.push({ input, init });
    return new Response(response.body ?? "ok", { status: response.status ?? 200 });
  });
  return { fetch: fetch as unknown as typeof fetch, calls };
}

/** 一个假的 Response（只带用到的字段）。 */
export function fakeResponse(body = "ok", status = 200) {
  return new Response(body, { status });
}
