<!--
DRAFT — STD cover not generated.
Real env: regenerate with new-design --template design.implementation.
-->

# Piko 实现规格：mem0-client

> **⚠️ DRAFT — STD cover 未生成**。本文件由 Claude 在 `/Users/ben/work/STD` 不可用的沙箱中撰写，未走 `new-design` 流程。**提交前必须在能访问 STD 脚本的环境补 STD cover + metadata + 跑 validate-design**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-mem0-client-impl` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Template ID | `design.implementation` |
| Last Modified Date | `2026-10-18` |

---

## 1. 实现目标与输入基线

实现 `piko-mem0-client` 模块的 TypeScript 代码：`Mem0Adapter` 类 + `Mem0ApiError` 类型 + 单元测试。

输入基线：`piko-mem0-client-design.md`（模块设计）+ Mem0 公开 HTTP API（V0.1 实验 01 沙箱阻塞，HTTP 形状基于公开文档）。

### 1.1 实现对象

- 模块：`mem0-client`（V0.1 新模块）
- 上级设计：`piko-skill-memory.md`（system design mechanism）+ `piko-mem0-client-design.md`（模块设计）
- 实现范围：`src/mem0-client.ts` + `src/mem0-client.test.ts`
- 非目标：retry / cache / streaming / 多租户（V1.x 增量）

### 1.2 接口（来自模块设计 §3.1）

```typescript
export class Mem0ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly cause?: unknown,
  );
}

export interface Mem0SearchResult {
  id: string;
  memory: string;
  score: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Mem0AddResult {
  ids: string[];
}

export interface Mem0SearchOptions {
  max_results?: number;
  filters?: Record<string, any>;
}

export class Mem0Adapter {
  constructor(baseUrl: string, apiKey: string);
  search(query: string, user_id: string, options?: Mem0SearchOptions): Promise<Mem0SearchResult[]>;
  add(messages: Array<{role:"user"|"assistant"; content:string}>, user_id: string, metadata?: Record<string,any>): Promise<Mem0AddResult>;
}
```

## 2. 文件 / symbol 列表

### 2.1 `src/mem0-client.ts`（新建）

| Symbol | 类型 | 说明 |
|---|---|---|
| `Mem0ApiError` | class | 错误类型，带 status / code |
| `Mem0SearchResult` | interface | search 返回元素类型 |
| `Mem0AddResult` | interface | add 返回类型 |
| `Mem0SearchOptions` | interface | search 选项 |
| `Mem0Adapter` | class | 主体实现 |

**预计行数**：~120 行 TS（含注释 + 类型导出）

### 2.2 `src/mem0-client.test.ts`（新建）

| Test | 说明 |
|---|---|
| `search 200 OK → 返回正确 shape` | mock fetch 返回 200 + 标准 JSON |
| `search 401 → 抛 Mem0ApiError code="auth_invalid"` | mock 401 |
| `search 500 → 抛 Mem0ApiError code="server_error"` | mock 500 |
| `search 网络错误 → 抛 Mem0ApiError code="network"` | mock fetch reject |
| `search user_id 空 → 抛 Error` | 直接调，无 mock |
| `add 200 OK → 返回 ids 数组` | mock 200 + `{"results":[{"id":"..."}]}` |
| `add 429 → 抛 Mem0ApiError code="rate_limited"` | mock 429 |
| `add messages 空 → 抛 Error` | 直接调 |

**预计行数**：~150 行 TS

## 3. 私有表示

`Mem0Adapter` 内部只持有：
- `baseUrl: string`（构造时冻结）
- `apiKey: string`（构造时冻结）

无内部状态机、无缓存、无连接池。

## 4. 调用步骤

### 4.1 `search` 调用链

```
caller.search(query, user_id, options)
  → 检查 user_id 非空（空抛 Error）
  → 检查 options.max_results 默认 5
  → 构造 fetch Request:
      URL: `${baseUrl}/v1/memories/search/`
      method: POST
      headers: { Authorization: `Bearer ${apiKey}`, Content-Type: application/json }
      body: { query, user_id, limit: max_results, filters: options.filters ?? {} }
  → fetch()  → 解析 response
  → 2xx: 解析 { results: [...] } → 映射成 Mem0SearchResult[] → 返回
  → 4xx/5xx: 读 body 提取 code/message → 抛 Mem0ApiError
  → fetch reject / network error: 抛 Mem0ApiError(status=0, code="network")
```

### 4.2 `add` 调用链

```
caller.add(messages, user_id, metadata)
  → 检查 user_id 非空
  → 检查 messages 非空
  → 构造 fetch Request:
      URL: `${baseUrl}/v1/memories/`
      method: POST
      headers: { Authorization: `Bearer ${apiKey}`, Content-Type: application/json }
      body: { messages, user_id, metadata, infer: true }
  → fetch()  → 解析 response
  → 2xx: 解析 { results: [{id, ...}] } → 返回 { ids: [...] }
  → 4xx/5xx: 抛 Mem0ApiError
  → network error: 抛 Mem0ApiError(code="network")
```

## 5. 错误码映射表

| HTTP status | code |
|---|---|
| 401 | `auth_invalid` |
| 403 | `auth_forbidden` |
| 404 | `not_found` |
| 429 | `rate_limited` |
| 5xx | `server_error` |
| 网络错误 / timeout | `network`（status=0） |

## 6. 依赖

- **运行时**：node `fetch`（Node 18+，项目已用）
- **测试**：`node:test`（项目已用）+ 内置 mock
- 无新 npm 依赖

## 7. 测试入口

```bash
# 在 Piko 根目录
node --test src/mem0-client.test.ts
# 或
/sessions/amazing-stoic-goldberg/mnt/piko/node_modules/.bin/vitest run src/mem0-client.test.ts
```

集成测试（V0.1 day-1）：见 `piko-mem0-client-design.md` §8.2。

## 8. 私有约定

- API key 不进 log、error message、stack trace
- `Mem0ApiError.toString()` 只输出 `code` 和 `status`，不输出 message（含敏感信息可能）
- `user_id` 在错误信息里可以打印（不是敏感）

## 9. 与其他模块的边界

- **不持有** config（baseUrl / apiKey 由调用方注入）
- **不持有** task_id / project_name（user_id 由调用方构造后传入）
- **不发起** retry（V0.1 不重试）
- **不缓存** 响应

## 10. 风险

| 风险 | 缓解 |
|---|---|
| Mem0 API 响应字段变化 | 类型用 interface 限定；测试覆盖标准 shape；不严格用 `any` |
| node `fetch` 行为差异（vs undici / node-fetch）| 用项目已用的 node fetch，不引入新依赖 |
| 测试 mock 不覆盖所有错误码 | §2.2 列出 8 个 case；integration test 在 V0.1 day-1 补 |

---

## 11. 函数规格（详细）

> 本节供编码者按规格直接实现。每个函数列出：签名、参数、返回值、异常、内部流程。

### 11.1 `Mem0ApiError.constructor`

**签名**：
```typescript
constructor(status: number, code: string, message: string, cause?: unknown)
```

**描述**：构造 Mem0 API 错误实例。继承 `Error`，附加 HTTP 状态码和语义化错误码字段。

**参数**：

| 名 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `status` | `number` | 是 | HTTP 状态码。`0` 表示网络层错误（fetch reject / timeout），其他表示真实 HTTP 响应状态 |
| `code` | `string` | 是 | 语义化错误码（见 §5 映射表）：`auth_invalid` / `auth_forbidden` / `not_found` / `rate_limited` / `server_error` / `network` |
| `message` | `string` | 是 | 人类可读描述。**禁止包含 API key**；可以包含 `user_id` 和 `code`/`status` |
| `cause` | `unknown` | 否 | 原始错误对象（fetch reject 的 reason）。Node 18+ 的 `Error.cause` 字段 |

**返回值**：无（构造副作用）。

**设置实例字段**（用 `readonly`）：
- `this.status: number`
- `this.code: string`
- `this.cause?: unknown`
- `this.name = "Mem0ApiError"`（覆盖 Error 默认 `"Error"`）

**内部流程**：
1. `super(message)` — 调用 Error 构造
2. 设置 `this.name = "Mem0ApiError"`
3. 设置 `this.status = status`
4. 设置 `this.code = code`
5. 如果 `cause !== undefined`，设置 `this.cause = cause`

**线程安全**：N/A（构造同步）。

**示例**：
```typescript
throw new Mem0ApiError(401, "auth_invalid", "API key invalid");
throw new Mem0ApiError(0, "network", "fetch failed", err);  // err 是 TypeError 等
```

### 11.2 `Mem0Adapter.constructor`

**签名**：
```typescript
constructor(baseUrl: string, apiKey: string)
```

**描述**：构造 Mem0 HTTP 客户端实例。无状态（除了 baseUrl 和 apiKey 两个 readonly 字段）。

**参数**：

| 名 | 类型 | 必填 | 含义 | 约束 |
|---|---|---|---|---|
| `baseUrl` | `string` | 是 | Mem0 API 根 URL | 必须以 `http://` 或 `https://` 开头；不含尾部 `/`；末尾不接 `/v1/memories/...`（自动拼）|
| `apiKey` | `string` | 是 | Mem0 API key | 非空；来自 `resolveSecret`；**禁止进 log / error message / 序列化输出**|

**返回值**：无。

**设置实例字段**（用 `private readonly`）：
- `this.baseUrl: string` — 等于传入参数
- `this.apiKey: string` — 等于传入参数

**前置条件**：
- `baseUrl` 已通过 `new URL(baseUrl)` 解析（如果想严格校验）；V0.1 简单校验非空
- `apiKey` 非空字符串

**异常**：无（构造不抛；如果参数无效由调用方负责）

**内部流程**：
1. `this.baseUrl = baseUrl`（保留原值，不 normalize）
2. `this.apiKey = apiKey`

**线程安全**：N/A（构造同步，字段只读）。

**示例**：
```typescript
const adapter = new Mem0Adapter("https://api.mem0.ai", apiKey);
const selfHosted = new Mem0Adapter("https://my-mem0.internal:8000", apiKey);
```

### 11.3 `Mem0Adapter.search`

**签名**：
```typescript
async search(
  query: string,
  user_id: string,
  options?: Mem0SearchOptions
): Promise<Mem0SearchResult[]>
```

**描述**：调 Mem0 `POST /v1/memories/search/`，返回按相关度排序的记忆列表。

**参数**：

| 名 | 类型 | 必填 | 含义 | 约束 |
|---|---|---|---|---|
| `query` | `string` | 是 | 搜索 query 文本 | 非空字符串；最长 500 字符（schema 限，调用方保证）|
| `user_id` | `string` | 是 | Mem0 用户 ID（role:project 形式）| 非空字符串；不含 `:`（skill-tools 工厂保证）|
| `options` | `Mem0SearchOptions` \| undefined | 否 | 搜索选项 | 见下 |

**`options` 字段**：

| 字段 | 类型 | 默认 | 含义 |
|---|---|---|---|
| `max_results` | `number` \| undefined | `5`（代码默认） | 返回结果数上限。V0.1 范围 [1, 20]；调用方 schema 限制 |
| `filters` | `Record<string, any>` \| undefined | `{}`（代码默认） | Mem0 metadata 过滤表达式。V0.1 实验阻塞未验证具体语法；按 Mem0 文档透传 |

**返回值**：`Promise<Mem0SearchResult[]>`

`Mem0SearchResult` 结构：

| 字段 | 类型 | 含义 |
|---|---|---|
| `id` | `string` | Mem0 memory UUID |
| `memory` | `string` | Mem0 抽取后的 fact 文本（V0.1 不在客户端做后处理）|
| `score` | `number` | 相关度分数 [0, 1]；按降序排序 |
| `metadata` | `Record<string, any>` | Mem0 返回的 metadata。V0.1 期望含 `type: "skill_experience"` 等字段（来自 record 写入）|
| `created_at` | `string` | ISO 8601 时间戳 |

**0 结果行为**：返回 `[]`（不抛，不视为错误）。

**异常**：

| 类型 | 触发条件 |
|---|---|
| `Error("user_id required")` | `user_id` 为空字符串 |
| `Mem0ApiError(status, code, ...)` | HTTP 4xx/5xx（详见 §5）|
| `Mem0ApiError(0, "network", ..., cause)` | fetch reject / DNS 错误 / 连接拒绝 |

**前置条件**：
- Mem0Adapter 已被正确构造
- `query` 是 UTF-8 字符串

**后置条件**：
- 返回数组按 Mem0 score 降序（Mem0 端已排序）
- 调用方拿到的数组可能是空 `[]`

**副作用**：一次 HTTP 请求到 `${baseUrl}/v1/memories/search/`。

**内部流程**（按顺序）：
1. **校验 `user_id`**：
   - 如果 `user_id.trim() === ""`，抛 `Error("user_id required")`
2. **计算 `maxResults`**：
   - `const maxResults = options?.max_results ?? 5`
   - V0.1 不二次 bounds check；schema 在 caller 保证 1..20
4. **构造请求体**：
   ```typescript
   const body = {
     query,
     user_id,
     limit: maxResults,
     filters: options?.filters ?? {},
   };
   ```
5. **构造 fetch 参数**：
   ```typescript
   const url = `${this.baseUrl}/v1/memories/search/`;
   const init: RequestInit = {
     method: "POST",
     headers: {
       Authorization: `Bearer ${this.apiKey}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify(body),
   };
   ```
6. **发起 fetch**：
   ```typescript
   let response: Response;
   try {
     response = await fetch(url, init);
   } catch (err) {
     throw new Mem0ApiError(0, "network", `search failed: ${err}`, err);
   }
   ```
7. **处理响应**：
   - 如果 `response.ok`（2xx）：
     - 解析 `await response.json()` 为 `{ results?: Array<...> }`
     - 映射 `results` 数组每个元素到 `Mem0SearchResult`：
       - `{ id: r.id, memory: r.memory, score: r.score, metadata: r.metadata ?? {}, created_at: r.created_at }`
     - 返回映射后的数组
   - 如果 `!response.ok`：
     - 读 body：`const errBody = await response.json().catch(() => ({}))`
     - `const code = mapStatusToCode(response.status)`（见 §5 映射）
     - 抛：`throw new Mem0ApiError(response.status, code, errBody.message ?? response.statusText)`

**线程安全**：✅ 安全（无 mutable state；每个调用独立 HTTP 请求）。多个并发任务可共享同一个 `Mem0Adapter` 实例。

**示例**：
```typescript
// 基本查询
const results = await mem0.search("X 模块边界值测试", "tester:piko");
// 期望返回：Mem0SearchResult[]，按 score 降序

// 带过滤
const results = await mem0.search(
  "async race condition",
  "tester:piko",
  { max_results: 10, filters: { "metadata.type": "skill_experience" } }
);

// 0 结果
const empty = await mem0.search("very specific nonexistent", "tester:piko");
// 期望：[]，不抛
```

### 11.4 `Mem0Adapter.add`

**签名**：
```typescript
async add(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  user_id: string,
  metadata?: Record<string, any>
): Promise<Mem0AddResult>
```

**描述**：调 Mem0 `POST /v1/memories/`，让 Mem0 自动抽取 facts 并存储。返回新创建 memory 的 ID 列表。

**参数**：

| 名 | 类型 | 必填 | 含义 | 约束 |
|---|---|---|---|---|
| `messages` | `Array<{role, content}>` | 是 | 输入消息数组 | 长度 ≥ 1；每个元素 `role` 是 `"user"` 或 `"assistant"`；`content` 非空字符串 |
| `user_id` | `string` | 是 | Mem0 用户 ID | 同 `search` 的 user_id 约束 |
| `metadata` | `Record<string, any>` \| undefined | 否 | 附加到 memory 的 metadata | V0.1 期望含 `type` / `role` / `task_id` / `tags` 等（调用方负责填充）|

**`messages` 元素结构**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `role` | `"user"` \| `"assistant"` | 是 | 消息角色 |
| `content` | `string` | 是 | 消息内容。Markdown / 纯文本均可；Mem0 自动抽取 |

**返回值**：`Promise<Mem0AddResult>`，结构 `{ ids: string[] }`

| 字段 | 类型 | 含义 |
|---|---|---|
| `ids` | `string[]` | 新创建 memory 的 UUID 列表。V0.1 通常长度 1（单条 message 抽取出一条 fact）；多 message 可能多条 |

**异常**：同 `search`（`user_id` 空抛 `Error`；HTTP 错误抛 `Mem0ApiError`；网络错误抛 `Mem0ApiError(0, "network")`）。

**副作用**：一次 HTTP 请求 + Mem0 服务端可能有 fact 抽取的延迟（一般 < 1s）。

**内部流程**：
1. **校验 `user_id`**：
   - 空抛 `Error("user_id required")`
2. **校验 `messages`**：
   - `messages.length === 0` → 抛 `Error("messages must be non-empty")`
3. **构造请求体**：
   ```typescript
   const body = {
     messages,
     user_id,
     metadata: metadata ?? {},
     infer: true,  // V0.1 总是让 Mem0 自动抽取
   };
   ```
4. **构造 fetch 参数**：同 `search` 但 URL 为 `${this.baseUrl}/v1/memories/`
5. **发起 fetch**：同 `search`（含 try/catch 转 `Mem0ApiError(0, "network")`）
6. **处理响应**：
   - 如果 `response.ok`：
     - 解析 `await response.json()` 为 `{ results?: Array<{id: string, ...}> }`
     - 映射：`{ ids: results.map(r => r.id) }`
     - 返回
   - 如果 `!response.ok`：同 `search` 错误映射

**线程安全**：✅ 同 `search`。

**示例**：
```typescript
// 简单添加
const result = await mem0.add(
  [{ role: "user", content: "## Situation\n...\n## Lesson\n..." }],
  "tester:piko",
  { type: "skill_experience", role: "tester", task_id: "task-123" }
);
// 期望：result = { ids: ["mem-uuid-here"] }
```

### 11.5 数据结构字段详情

**`Mem0SearchResult`**：

| 字段 | 类型 | 来源（Mem0 响应）| 必现？|
|---|---|---|---|
| `id` | `string` | `results[].id` | ✅ |
| `memory` | `string` | `results[].memory` | ✅（抽取后的 fact 文本）|
| `score` | `number` | `results[].score` | ✅（[0, 1]）|
| `metadata` | `Record<string, any>` | `results[].metadata` | ⚠️ 可缺失，默认 `{}` |
| `created_at` | `string` | `results[].created_at` | ⚠️ 可缺失；ISO 8601 格式 |

**`Mem0AddResult`**：

| 字段 | 类型 | 来源 | 必现？|
|---|---|---|---|
| `ids` | `string[]` | `results.map(r => r.id)` | ✅（V0.1 期望非空，失败时抛）|

**`Mem0SearchOptions`**：

| 字段 | 类型 | 默认 | 含义 |
|---|---|---|---|
| `max_results` | `number` \| undefined | `5` | 调用方应保证 [1, 20] |
| `filters` | `Record<string, any>` \| undefined | `{}` | Mem0 metadata filter 表达式 |

### 11.6 内部数据结构（私有）

`Mem0Adapter` 内部**无 mutable state**。每个 `search`/`add` 调用是 stateless 的 HTTP 请求。

---

## 附录 A：与模块设计的对应

| 模块设计章节 | ISD 章节 |
|---|---|
| §3.1 接口 | §1.2 接口 |
| §3.2 HTTP 映射 | §4 调用步骤 |
| §3.3 错误映射 | §5 错误码映射 |
| §5 失败语义 | §5 + §8 |
| §7 实现位置 | §2 文件列表 |
| §8 验证 | §7 测试入口 |