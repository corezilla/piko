/**
 * 公共替身：GraphRAG 适配器 / doc-search 工具的单元测试共用（B 组）。
 *
 * 提供一个可按调用次序返回不同响应的 fetch 替身，并记录每次调用的
 * URL / 方法 / 请求头 / 请求体，供断言逐值对账。
 */
import { vi } from "vitest";

/** 一次 fetch 调用留下的记录。 */
export interface FetchCall {
  /** 实际请求的 URL（字符串化后）。 */
  url: string;
  /** HTTP 方法。 */
  method: string;
  /** 请求头（键统一小写）。 */
  headers: Record<string, string>;
  /** 请求体原文。 */
  rawBody: string;
  /** 请求体解析后的 JSON；不是合法 JSON 时为 undefined。 */
  body: unknown;
}

/** fetch 替身的应答函数。 */
export type FetchHandler = (
  url: string,
  init?: RequestInit,
) => Response | Promise<Response>;

/**
 * 装上 fetch 替身：每次调用都记录请求，并交给 handler 应答。
 * 用完记得 `vi.unstubAllGlobals()`。
 */
export function stubFetch(handler: FetchHandler): {
  calls: FetchCall[];
  fetch: ReturnType<typeof vi.fn>;
} {
  const calls: FetchCall[] = [];
  const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    const rawBody = typeof init?.body === "string" ? init.body : "";
    calls.push({
      url,
      method: init?.method ?? "GET",
      headers: readHeaders(init?.headers),
      rawBody,
      body: parseJson(rawBody),
    });
    return await handler(url, init);
  });
  vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
  return { calls, fetch };
}

/** 构造一个 JSON 响应体。 */
export function jsonResponse(
  body: unknown,
  init?: { status?: number; statusText?: string },
): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    statusText: init?.statusText ?? "",
  });
}

/** 构造一个原样字符串响应体（用于截断/损坏的载荷）。 */
export function rawResponse(
  text: string,
  init?: { status?: number; statusText?: string },
): Response {
  return new Response(text, {
    status: init?.status ?? 200,
    statusText: init?.statusText ?? "",
  });
}

/** 把请求头规整成键小写的普通对象。 */
function readHeaders(headers: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    headers.forEach((value, key) => {
      out[key.toLowerCase()] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    for (const [key, value] of headers) out[key.toLowerCase()] = String(value);
    return out;
  }
  for (const [key, value] of Object.entries(headers)) {
    out[key.toLowerCase()] = String(value);
  }
  return out;
}

/** 解析请求体 JSON；解析不了就返回 undefined。 */
function parseJson(raw: string): unknown {
  if (raw === "") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
