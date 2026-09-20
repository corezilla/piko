import { createServer, type IncomingHttpHeaders, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

export type MockUsage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_tokens_details?: { cached_tokens?: number; cache_write_tokens?: number };
  output_tokens_details?: { reasoning_tokens?: number };
};

export type ScriptStep =
  | { kind: "completed"; text: string; usage?: Partial<MockUsage> | "full" | "minimal"; reasoning?: { id: string; encrypted: string; summary: string } }
  | { kind: "toolCall"; toolName: string; args: string; callId: string; reasoning?: { id: string; encrypted: string; summary: string } }
  | { kind: "incomplete"; reason: string; text?: string }
  | { kind: "failed"; code: string; message: string }
  | { kind: "errorEvent"; code: string; message: string }
  | { kind: "truncated"; text: string }
  | { kind: "raw"; status: number; contentType?: string; body: string; headers?: Record<string, string> }
  | { kind: "hang"; ms: number };

export interface RecordedRequest {
  method: string;
  path: string;
  authorization?: string;
  body: unknown;
}

export interface MockLlmtier {
  baseUrl: string;
  port: number;
  requests: RecordedRequest[];
  close(): Promise<void>;
}

const msgId = (n: number) => `msg_${n}`;
const rsId = (n: number) => `rs_${n}`;
const fcId = (n: number) => `fc_${n}`;

function fullUsage(): MockUsage {
  return {
    input_tokens: 120, output_tokens: 8, total_tokens: 128,
    input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 },
    output_tokens_details: { reasoning_tokens: 2 },
  };
}

function minimalUsage(): MockUsage {
  return { input_tokens: 10, output_tokens: 5, total_tokens: 15 };
}

function buildUsage(step: Extract<ScriptStep, { kind: "completed" }>): MockUsage {
  if (step.usage === "minimal") return minimalUsage();
  if (step.usage && step.usage !== "full") return { ...fullUsage(), ...step.usage } as MockUsage;
  return fullUsage();
}

function sse(res: ServerResponse, write: (chunk: string) => boolean, events: unknown[]): void {
  res.setHeader("content-type", "text/event-stream");
  res.setHeader("cache-control", "no-cache");
  for (const event of events) write(`data: ${JSON.stringify(event)}\n\n`);
}

type ReasoningRef = { id: string; encrypted: string; summary: string };

function reasoningEvents(reasoning: ReasoningRef | undefined): unknown[] {
  if (!reasoning) return [];
  return [
    { type: "response.output_item.added", output_index: 0, item: { type: "reasoning", id: reasoning.id, summary: [] } },
    { type: "response.output_item.done", output_index: 0, item: { type: "reasoning", id: reasoning.id, encrypted_content: reasoning.encrypted, summary: [{ type: "summary_text", text: reasoning.summary }] } },
  ];
}

function reasoningOutputItem(reasoning: ReasoningRef | undefined): unknown[] {
  if (!reasoning) return [];
  return [{ type: "reasoning", id: reasoning.id, encrypted_content: reasoning.encrypted, summary: [{ type: "summary_text", text: reasoning.summary }] }];
}

export async function startMockLlmtier(opts: { model: string; script: ScriptStep[]; loopLast?: boolean }): Promise<MockLlmtier> {
  const requests: RecordedRequest[] = [];
  let cursor = 0;
  let respSeq = 0;

  const server: Server = createServer((req, res) => {
    let raw = "";
    req.on("data", (c: Buffer) => { raw += c.toString("utf8"); });
    req.on("end", () => {
      let body: unknown = raw;
      try { body = JSON.parse(raw); } catch { /* keep raw string */ }
      requests.push({
        method: req.method ?? "",
        path: req.url ?? "",
        authorization: req.headers.authorization,
        body,
      });

      if (req.method === "GET" && (req.url ?? "").endsWith("/models")) {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ object: "list", data: [{ id: opts.model, object: "model", owned_by: "mock-llmtier" }] }));
        return;
      }
      if (!(req.method === "POST" && (req.url ?? "").endsWith("/responses"))) {
        res.statusCode = 404;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: { message: "not found", type: "invalid_request_error" } }));
        return;
      }

      if (cursor >= opts.script.length && !opts.loopLast) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: { message: "mock script exhausted", type: "server_error" } }));
        return;
      }
      const index = Math.min(cursor, opts.script.length - 1);
      const step = opts.script[cursor < opts.script.length ? cursor : opts.script.length - 1];
      cursor += 1;
      const seq = ++respSeq;
      const rid = `resp_${seq}`;
      const write = (chunk: string): boolean => res.write(chunk);

      if (step.kind === "raw") {
        res.statusCode = step.status;
        for (const [k, v] of Object.entries(step.headers ?? {})) res.setHeader(k, v);
        res.setHeader("content-type", step.contentType ?? "application/json");
        res.end(step.body);
        return;
      }

      if (step.kind === "hang") {
        res.setHeader("content-type", "text/event-stream");
        const timer = setTimeout(() => res.end(), step.ms);
        res.on("close", () => clearTimeout(timer));
        return;
      }

      const reasoning = (step as { reasoning?: ReasoningRef }).reasoning;

      if (step.kind === "completed") {
        const usage = buildUsage(step);
        const msgItem = { type: "message", id: msgId(seq), role: "assistant", status: "completed", content: [{ type: "output_text", text: step.text }] };
        const events: unknown[] = [
          { type: "response.created", response: { id: rid, status: "in_progress" } },
          ...reasoningEvents(reasoning),
          { type: "response.output_item.added", output_index: 1, item: { type: "message", id: msgId(seq), role: "assistant", status: "in_progress", content: [] } },
          { type: "response.output_text.delta", item_id: msgId(seq), output_index: 1, content_index: 0, delta: step.text },
          { type: "response.output_item.done", output_index: 1, item: msgItem },
          { type: "response.completed", response: { id: rid, status: "completed", output: [...reasoningOutputItem(reasoning), msgItem], usage, error: null, incomplete_details: null } },
        ];
        sse(res, write, events);
        res.end();
        return;
      }

      if (step.kind === "toolCall") {
        const fcItem = { type: "function_call", id: fcId(seq), call_id: step.callId, name: step.toolName, arguments: step.args, status: "completed" };
        const events: unknown[] = [
          { type: "response.created", response: { id: rid, status: "in_progress" } },
          ...reasoningEvents(reasoning),
          { type: "response.output_item.added", output_index: 1, item: { type: "function_call", id: fcId(seq), call_id: step.callId, name: step.toolName, arguments: "", status: "in_progress" } },
          { type: "response.function_call_arguments.delta", item_id: fcId(seq), output_index: 1, delta: step.args },
          { type: "response.function_call_arguments.done", item_id: fcId(seq), arguments: step.args },
          { type: "response.output_item.done", output_index: 1, item: fcItem },
          { type: "response.completed", response: { id: rid, status: "completed", output: [...reasoningOutputItem(reasoning), fcItem], usage: fullUsage(), error: null, incomplete_details: null } },
        ];
        sse(res, write, events);
        res.end();
        return;
      }

      if (step.kind === "incomplete") {
        const msgItem = { type: "message", id: msgId(seq), role: "assistant", status: "completed", content: [{ type: "output_text", text: step.text ?? "" }] };
        sse(res, write, [
          { type: "response.created", response: { id: rid, status: "in_progress" } },
          { type: "response.output_item.added", output_index: 0, item: { type: "message", id: msgId(seq), role: "assistant", status: "in_progress", content: [] } },
          ...(step.text ? [{ type: "response.output_text.delta", item_id: msgId(seq), output_index: 0, content_index: 0, delta: step.text }] : []),
          { type: "response.output_item.done", output_index: 0, item: msgItem },
          { type: "response.incomplete", response: { id: rid, status: "incomplete", output: [msgItem], usage: minimalUsage(), error: null, incomplete_details: { reason: step.reason } } },
        ]);
        res.end();
        return;
      }

      if (step.kind === "failed") {
        sse(res, write, [
          { type: "response.created", response: { id: rid, status: "in_progress" } },
          { type: "response.failed", response: { id: rid, status: "failed", error: { code: step.code, message: step.message }, output: [] } },
        ]);
        res.end();
        return;
      }

      if (step.kind === "errorEvent") {
        sse(res, write, [
          { type: "response.created", response: { id: rid, status: "in_progress" } },
          { type: "error", code: step.code, message: step.message },
        ]);
        res.end();
        return;
      }

      if (step.kind === "truncated") {
        sse(res, write, [
          { type: "response.created", response: { id: rid, status: "in_progress" } },
          { type: "response.output_item.added", output_index: 0, item: { type: "message", id: msgId(seq), role: "assistant", status: "in_progress", content: [] } },
          { type: "response.output_text.delta", item_id: msgId(seq), output_index: 0, content_index: 0, delta: step.text },
        ]);
        // Destroy the socket mid-stream: no terminal event ever arrives.
        setImmediate(() => res.socket?.destroy());
        return;
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => { server.off("error", reject); resolve(); });
  });

  const port = (server.address() as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}/v1/`,
    port,
    requests,
    close: () => new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve()))),
  };
}
