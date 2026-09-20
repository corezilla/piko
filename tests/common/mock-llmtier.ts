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
  | { kind: "completed"; text: string; usage?: Partial<MockUsage> | "full" | "minimal"; reasoning?: ReasoningRef }
  | { kind: "toolCall"; toolName: string; args: string; callId: string; reasoning?: ReasoningRef }
  | { kind: "refusal"; text: string }
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
  /** Every SSE event emitted, in wire order (for schema-conformance validation). */
  emitted: Record<string, unknown>[];
  close(): Promise<void>;
}

type ReasoningRef = { id: string; encrypted: string; summary: string };

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

export async function startMockLlmtier(opts: { model: string; script: ScriptStep[]; loopLast?: boolean; enforceStream?: boolean }): Promise<MockLlmtier> {
  const requests: RecordedRequest[] = [];
  const emitted: Record<string, unknown>[] = [];
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

      // LLMTier candidate.7 semantics: non-streaming is rejected outright.
      if ((opts.enforceStream ?? true) && (body as any)?.stream !== true) {
        res.statusCode = 400;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: { message: "stream=true required" } }));
        return;
      }

      if (cursor >= opts.script.length && !opts.loopLast) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: { message: "mock script exhausted", type: "server_error" } }));
        return;
      }
      const step = opts.script[cursor < opts.script.length ? cursor : opts.script.length - 1];
      cursor += 1;
      const seq = ++respSeq;
      const rid = `resp_${seq}`;

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

      // LLMTier wire envelope: "event: <type>\ndata: {...}\n\n" per event with a
      // monotonic sequence_number, terminated by "data: [DONE]\n\n".
      let seqNum = 0;
      const writeEvent = (event: Record<string, unknown>): void => {
        const withSeq: Record<string, unknown> = { sequence_number: seqNum++, ...event };
        emitted.push(withSeq);
        res.write(`event: ${String(withSeq.type)}\ndata: ${JSON.stringify(withSeq)}\n\n`);
      };
      const reasoning = (step as { reasoning?: ReasoningRef }).reasoning;

      const responseView = (view: Record<string, unknown>): Record<string, unknown> => ({
        id: rid, object: "response", created_at: Math.floor(Date.now() / 1000),
        model: (body as any)?.model ?? opts.model,
        usage: null, error: null, ...view,
      });

      if (step.kind === "completed") {
        const usage = buildUsage(step);
        const msgItem = { type: "message", id: msgId(seq), role: "assistant", status: "completed", content: [{ type: "output_text", text: step.text, annotations: [] }] };
        const output = [...reasoningOutputItem(reasoning), msgItem];
        writeEvent({ type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) });
        for (const e of reasoningEvents(reasoning)) writeEvent(e as Record<string, unknown>);
        writeEvent({ type: "response.output_item.added", output_index: output.length - 1, item: { type: "message", id: msgId(seq), role: "assistant", status: "in_progress", content: [] } });
        writeEvent({ type: "response.output_text.delta", item_id: msgId(seq), output_index: output.length - 1, content_index: 0, delta: step.text });
        writeEvent({ type: "response.output_item.done", output_index: output.length - 1, item: msgItem });
        writeEvent({ type: "response.completed", response: responseView({ status: "completed", output, usage, error: null }) });
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      if (step.kind === "toolCall") {
        const fcItem = { type: "function_call", id: fcId(seq), call_id: step.callId, name: step.toolName, arguments: step.args, status: "completed" };
        const output = [...reasoningOutputItem(reasoning), fcItem];
        writeEvent({ type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) });
        for (const e of reasoningEvents(reasoning)) writeEvent(e as Record<string, unknown>);
        writeEvent({ type: "response.output_item.added", output_index: output.length - 1, item: { type: "function_call", id: fcId(seq), call_id: step.callId, name: step.toolName, arguments: "", status: "in_progress" } });
        writeEvent({ type: "response.function_call_arguments.delta", item_id: fcId(seq), output_index: output.length - 1, delta: step.args });
        writeEvent({ type: "response.function_call_arguments.done", item_id: fcId(seq), output_index: output.length - 1, arguments: step.args });
        writeEvent({ type: "response.output_item.done", output_index: output.length - 1, item: fcItem });
        writeEvent({ type: "response.completed", response: responseView({ status: "completed", output, usage: fullUsage(), error: null }) });
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      if (step.kind === "refusal") {
        const msgItem = { type: "message", id: msgId(seq), role: "assistant", status: "completed", content: [{ type: "refusal", refusal: step.text }] };
        writeEvent({ type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) });
        writeEvent({ type: "response.output_item.added", output_index: 0, item: { type: "message", id: msgId(seq), role: "assistant", status: "in_progress", content: [] } });
        writeEvent({ type: "response.refusal.delta", item_id: msgId(seq), output_index: 0, content_index: 0, delta: step.text });
        writeEvent({ type: "response.output_item.done", output_index: 0, item: msgItem });
        writeEvent({ type: "response.completed", response: responseView({ status: "completed", output: [msgItem], usage: fullUsage(), error: null }) });
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      if (step.kind === "incomplete") {
        const msgItem = { type: "message", id: msgId(seq), role: "assistant", status: "completed", content: [{ type: "output_text", text: step.text ?? "", annotations: [] }] };
        writeEvent({ type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) });
        writeEvent({ type: "response.output_item.added", output_index: 0, item: { type: "message", id: msgId(seq), role: "assistant", status: "in_progress", content: [] } });
        if (step.text) writeEvent({ type: "response.output_text.delta", item_id: msgId(seq), output_index: 0, content_index: 0, delta: step.text });
        writeEvent({ type: "response.output_item.done", output_index: 0, item: msgItem });
        writeEvent({ type: "response.incomplete", response: responseView({ status: "incomplete", output: [msgItem], usage: minimalUsage(), incomplete_details: { reason: step.reason } }) });
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      if (step.kind === "failed") {
        writeEvent({ type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) });
        writeEvent({
          type: "response.failed",
          response: responseView({
            status: "failed", output: [],
            error: { message: step.message, type: "provider_error", code: step.code, param: null },
          }),
        });
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      if (step.kind === "errorEvent") {
        writeEvent({ type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) });
        writeEvent({ type: "error", code: step.code, message: step.message, param: null });
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      if (step.kind === "truncated") {
        res.setHeader("content-type", "text/event-stream");
        res.write(`event: response.created\ndata: ${JSON.stringify({ sequence_number: 0, type: "response.created", response: responseView({ status: "in_progress", output: [], usage: null }) })}\n\n`);
        res.write(`event: response.output_text.delta\ndata: ${JSON.stringify({ sequence_number: 1, type: "response.output_text.delta", item_id: msgId(seq), output_index: 0, content_index: 0, delta: step.text })}\n\n`);
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
    emitted,
    close: () => new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve()))),
  };
}
