<!--
DRAFT — STD cover not generated.
Real env: regenerate with new-design --template design.implementation.
-->

# Piko 实现规格：graphrag

> **⚠️ DRAFT — STD cover 未生成**。本文件由 Claude 在 `/Users/ben/work/STD` 不可用的沙箱中撰写，未走 `new-design` 流程。**提交前必须在能访问 STD 脚本的环境补 STD cover + metadata + 跑 validate-design**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-graphrag-impl` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Template ID | `design.implementation` |
| Last Modified Date | `2026-10-18` |

---

## 1. 实现目标与输入基线

实现 `piko-graphrag` 模块的 TypeScript 代码：`GraphRAGAdapter` 类 + `GraphRAGApiError` 类型 + 单元测试。

输入基线：`piko-doc-search.md`（机制设计）+ `piko-graphrag-design.md`（模块设计）+ 操作员部署的 GraphRAG 后端（V0.1 无现成 Cloud，必须自部署或自费）。

### 1.1 实现对象

- 模块：`graphrag`（V0.1 新模块）
- 上级设计：`piko-doc-search.md`（system design mechanism）
- 实现范围：`src/graphrag-client.ts` + `src/graphrag-tools.ts` + `src/graphrag-client.test.ts` + `src/graphrag-tools.test.ts`
- 非目标：retry / cache / streaming / 写入（index 是离线运维动作）/ 多租户 / V1.x 增量

### 1.2 接口

#### 1.2.1 `src/graphrag-client.ts`

```typescript
export class GraphRAGApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly cause?: unknown,
  );
}

export interface GraphRAGSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface GraphRAGSearchOptions {
  scope?: string;
  filters?: Record<string, any>;
  max_results?: number;
}

export class GraphRAGAdapter {
  constructor(baseUrl: string, apiKey: string);
  search(query: string, options?: GraphRAGSearchOptions): Promise<GraphRAGSearchResult[]>;
}
```

#### 1.2.2 `src/graphrag-tools.ts`

```typescript
export interface DocSearchToolContext {
  role: string;
  projectName: string;
  taskId?: string;
}

export interface DocSearchToolDeps {
  graphrag: GraphRAGAdapter;
  context: DocSearchToolContext;
}

export interface GraphragSearchDetails {
  count?: number;
  error?: string;
  status?: number;
  scope?: string;
}

export const GraphragSearchSchema: TObject<...>;  // TypeBox schema

export function validateDocSearchContext(context: DocSearchToolContext): void;
export function createGraphragSearchTool(deps: DocSearchToolDeps):
  AgentHarnessTool<ExecutionToolContext, typeof GraphragSearchSchema, GraphragSearchDetails | undefined>;
```

**与 Mem0 的对称性**：
- `GraphRAGApiError` 镜像 `Mem0ApiError`
- `GraphRAGAdapter` 镜像 `Mem0Adapter` 但**只暴露 search**（不暴露 index）
- 工具工厂镜像 `createMem0LookupTool`

---

## 2. 文件 / symbol 列表

### 2.1 `src/graphrag-client.ts`（新建）

| Symbol | 类型 | 说明 |
|---|---|---|
| `GraphRAGApiError` | class | 错误类型，带 status / code |
| `GraphRAGSearchResult` | interface | search 返回元素类型 |
| `GraphRAGSearchOptions` | interface | search 选项 |
| `GraphRAGAdapter` | class | 主体实现（仅 search 方法） |

**预计行数**：~120 行 TS（含注释 + 类型导出）

### 2.2 `src/graphrag-tools.ts`（新建）

| Symbol | 类型 | 说明 |
|---|---|---|
| `DocSearchToolContext` | interface | 工具执行上下文（role / projectName / taskId） |
| `DocSearchToolDeps` | interface | 工厂依赖（含 graphrag adapter） |
| `GraphragSearchDetails` | interface | 工具返回详情 |
| `GraphragSearchSchema` | TObject | TypeBox 参数 schema |
| `GraphragSearchParams` | type | Static<GraphragSearchSchema> |
| `validateDocSearchContext` | function | 共享 context 校验 |
| `createGraphragSearchTool` | function | 工厂，返回 `graphrag_search` 工具 |

**预计行数**：~110 行 TS

### 2.3 `src/graphrag-client.test.ts`（新建）

| Test | 说明 |
|---|---|
| `search 200 OK → 返回正确 shape` | mock fetch 返回 200 + 标准 JSON |
| `search 转发 scope / filters / max_results` | 三个 option 各自一个 test |
| `search 401 → 抛 GraphRAGApiError code="auth_invalid"` | mock 401 |
| `search 404 → 抛 GraphRAGApiError code="not_found"` | mock 404（unknown scope）|
| `search 429 → 抛 GraphRAGApiError code="rate_limited"` | mock 429 |
| `search 500 → 抛 GraphRAGApiError code="server_error"` | mock 500 |
| `search 网络错误 → 抛 GraphRAGApiError code="network"` | mock fetch reject |
| `search query 空 → 抛 Error` | 直接调，无 mock |
| `search 0 结果 → 返回 []` | mock 200 + `{results:[]}` |
| `search 缺字段 → 用默认值填充` | mock 200 + 空对象 |

**预计行数**：~250 行 TS

### 2.4 `src/graphrag-tools.test.ts`（新建）

| Test | 说明 |
|---|---|
| `GraphragSearchSchema: 含 query/scope/max_results` | shape 检查 |
| `createGraphragSearchTool: role 空 → 抛` | 工厂校验 |
| `createGraphragSearchTool: projectName 空 → 抛` | 工厂校验 |
| `createGraphragSearchTool: projectName 含 ':' → 抛` | 工厂校验 |
| `工具 name/label/description` | 工具元数据 |
| `execute 转发 query + scope` | 工厂调用 adapter.search 时透传 |
| `execute 转发 max_results` | 同上 |
| `execute 返回 JSON-stringified content + count` | 成功路径 |
| `execute 0 结果 → content "[]"` | 边界 |
| `execute scope 缺省 → details.scope="all"` | 默认值 |
| `execute GraphRAGApiError → fallback content "doc search unavailable"` | 错误路径 |
| `execute 404 → fallback 含 scope` | 错误路径 |
| `execute 网络错 → fallback` | 错误路径 |
| `execute 未知异常 → 抛（不吞）` | 安全 |

**预计行数**：~250 行 TS

---

## 3. 私有表示

`GraphRAGAdapter` 内部只持有：
- `baseUrl: string`（构造时冻结）
- `apiKey: string`（构造时冻结）

无内部状态机、无缓存、无连接池、无重试。

---

## 4. 调用步骤

### 4.1 `search` 调用链

```
caller.search(query, options)
  → 检查 query 非空（空抛 Error）
  → options 字段归一化（scope 默认 "all"、filters 默认 {}、max_results 默认 5）
  → 构造 fetch Request:
      URL: `${baseUrl}/v1/search`
      method: POST
      headers: { Authorization: `Bearer ${apiKey}`, Content-Type: application/json }
      body: { query, scope, filters, max_results }
  → fetch()  → 解析 response
  → 2xx: 解析 { results: [...] } → 映射成 GraphRAGSearchResult[] → 返回
  → 4xx/5xx: 读 body 提取 message → 抛 GraphRAGApiError
  → fetch reject / network error: 抛 GraphRAGApiError(status=0, code="network")
```

### 4.2 工具工厂调用链（graphrag_search）

```
agent 调用工具 graphrag_search({query, scope?, max_results?})
  → 工具 execute 拦截从 context 取 role/projectName/taskId
  → 调 GraphRAGAdapter.search(query, {scope, max_results})
  → 成功：content = JSON.stringify(results), details = {count, scope}
  → 抛 GraphRAGApiError：
    - content = `doc search unavailable: ${code}`
    - details  = {error: code, status, scope}
  - 抛未知异常 → 上抛（不吞）
```

---

## 5. 错误码映射表

| HTTP status | code |
|---|---|
| 401 | `auth_invalid` |
| 403 | `auth_forbidden` |
| 404 | `not_found`（如 unknown scope）|
| 429 | `rate_limited` |
| 5xx | `server_error` |
| 网络错误 / timeout | `network`（status=0） |

**与 Mem0 的同形**：完全沿用 Mem0 客户端的语义码（保持 agent 端 fallback 文案一致）。

---

## 6. 依赖

- **运行时**：node `fetch`（Node 18+，项目已用）
- **测试**：`node:test`（项目已用）+ 内置 mock
- 无新 npm 依赖
- 后端：GraphRAG-style HTTP 服务（操作员自部署，见 §10 风险）

---

## 7. 测试入口

```bash
# V0.1：单元测试
npx tsx --test src/graphrag-client.test.ts
npx tsx --test src/graphrag-tools.test.ts

# V0.1 全套
npx tsx --test src/mem0-client.test.ts src/skill-tools.test.ts \
  src/graphrag-client.test.ts src/graphrag-tools.test.ts

# V0.1 day-1 真接口验证（脚本见 scripts/v0.1-graphrag-day1-verify.ts）
GRAPHRAG_API_KEY=... GRAPHRAG_BASE_URL=... \
  npx tsx scripts/v0.1-graphrag-day1-verify.ts
```

---

## 8. 私有约定

- API key 不进 log、error message、stack trace
- `GraphRAGApiError.toString()` 只输出 `code` 和 `status`，不输出 message（含敏感信息可能）
- 与 Mem0 对齐——同一个 `MemoryApiError` 模式（fallback 内容措辞改为 `doc search unavailable: <code>`，区别 Mem0 的 `memory unavailable: <code>`）

---

## 9. 与其他模块的边界

- **不持有** config（baseUrl / apiKey 由调用方注入）
- **不持有** task_id / project_name（context 由调用方构造）
- **不发起** retry（V0.1 不重试）
- **不缓存** 响应
- **不发起** index（index 是离线运维动作）

---

## 10. 风险

| 风险 | 缓解 |
|---|---|
| 没有公认 GraphRAG Cloud 供应商（2026 现状） | 我们定义 HTTP 契约（POST /v1/search），操作员自部署/自费商用 |
| 操作员部署的后端字段 shape 与本 ISD 不符 | 客户端对缺失字段用默认值（id="", content="", score=0, metadata={}, created_at=""）；不对错误字段硬性 throw。后续 V0.2 收紧 |
| `base_url` 不可达 / DNS 不对 | 走 fetch reject 路径 → `GraphRAGApiError(0, "network")` → 工具 fallback `doc search unavailable: network` → agent 优雅处理 |
| Scope 由后端定义，op 配置错（typo） | 后端返 404 → 工具 fallback `not_found`；schema 不在客户端校验 scope 由后端解析 |
| Indexing 漂移（corpus 与代码不同步） | V0.1 不引入 cross-checking；V0.2 加 indexed_at + operator 自己定 expiry |

---

## 11. 函数规格（详细）

> 本节供编码者按规格直接实现。每个函数列出：签名、参数、返回值、异常、内部流程。

### 11.1 `GraphRAGApiError.constructor`

**签名**：
```typescript
constructor(status: number, code: string, message: string, cause?: unknown)
```

**描述**：构造 GraphRAG HTTP API 错误实例。继承 `Error`，附加 HTTP 状态码与语义码。

**参数 / 行为**：完全镜像 `Mem0ApiError`，仅类名不同。详见 piko-mem0-client-impl.isd.md §11.1。

### 11.2 `GraphRAGAdapter.constructor`

**签名**：
```typescript
constructor(baseUrl: string, apiKey: string)
```

**描述**：构造 GraphRAG HTTP 客户端实例。无状态（除 baseUrl/apiKey 两个 readonly 字段）。

**参数**：

| 名 | 类型 | 必填 | 含义 | 约束 |
|---|---|---|---|---|
| `baseUrl` | `string` | 是 | GraphRAG 后端根 URL | 必须以 `http://` 或 `https://` 开头；不含尾部 `/`；不含 `/v1/search`（自动拼）|
| `apiKey` | `string` | 是 | 后端认证 token | 非空；来自 `resolveSecret(config.identity.doc_search.api_key_secret_ref)`；**禁止进 log / error message** |

**返回值 / 异常 / 线程安全**：同 Mem0。

### 11.3 `GraphRAGAdapter.search`

**签名**：
```typescript
async search(
  query: string,
  options?: GraphRAGSearchOptions
): Promise<GraphRAGSearchResult[]>
```

**描述**：调 GraphRAG `POST /v1/search`，返回按相关度排序的文档片段列表。

**参数**：

| 名 | 类型 | 必填 | 含义 | 约束 |
|---|---|---|---|---|
| `query` | `string` | 是 | 自然语言查询 | 非空；最长 500 字符（schema 限）|
| `options.scope` | `string` \| undefined | 否 | 后端定义的 scope 标识 | 默认 `"all"`（透传给后端）|
| `options.filters` | `Record<string,any>` \| undefined | 否 | 后端定义的过滤表达式 | 默认 `{}`，透传 |
| `options.max_results` | `number` \| undefined | 否 | 返回上限 | 默认 `5`；调用方 schema 限制 [1, 20] |

**返回值**：`Promise<GraphRAGSearchResult[]>`

`GraphRAGSearchResult`：

| 字段 | 类型 | 含义 |
|---|---|---|
| `id` | `string` | 文档片段 ID |
| `content` | `string` | 文本片段（不是 fact 而是 raw chunk）|
| `score` | `number` | 相关度 [0, 1] |
| `metadata` | `Record<string, any>` | 元数据（source / section / indexed_at 等）|
| `created_at` | `string` | ISO 8601 |

**0 结果行为**：返回 `[]`。

**异常**：
- `Error("query required")` — query 空
- `GraphRAGApiError(status, code, msg)` — HTTP 4xx/5xx
- `GraphRAGApiError(0, "network", msg, cause)` — 网络错

**内部流程**：
1. **校验 query**：`if (query.trim() === "") throw new Error("query required")`
2. **归一化 options**：`scope = options?.scope ?? "all"`，`filters = options?.filters ?? {}`，`max_results = options?.max_results ?? 5`
3. **构造 body**：`{ query, scope, filters, max_results }`
4. **构造 fetch init**：
   ```typescript
   const url = `${this.baseUrl}/v1/search`;
   const init: RequestInit = {
     method: "POST",
     headers: {
       Authorization: `Bearer ${this.apiKey}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify(body),
   };
   ```
5. **发起 fetch**：`try { response = await fetch(url, init); } catch { throw new GraphRAGApiError(0, "network", ...) }`
6. **处理响应**：
   - 2xx：`{ results: [...] }` → 映射为 `GraphRAGSearchResult[]`，缺失字段填默认
   - 非 2xx：映射 status → code，throw GraphRAGApiError

**线程安全**：✅ 与 Mem0 同。

### 11.4 `validateDocSearchContext`

**签名**：
```typescript
function validateDocSearchContext(context: DocSearchToolContext): void
```

**描述**：工厂前置校验，与 `validateContext` in skill-tools.ts 同形态。

**校验**：
- `role.trim() === ""` → `throw new Error("role required")`
- `projectName.trim() === ""` → `throw new Error("projectName required")`
- `/^[A-Za-z0-9._-]+$/.test(projectName) === false` → `throw new Error("projectName must match ^[A-Za-z0-9._-]+$")`

**Why these rules**：与 Mem0 同约束，便于统一诊断（即使 GraphRAG 不按 role 隔离，保持 Piko 侧 binding 一致性）。

### 11.5 `createGraphragSearchTool`

**签名**：
```typescript
function createGraphragSearchTool(
  deps: DocSearchToolDeps
): AgentHarnessTool<ExecutionToolContext, typeof GraphragSearchSchema, GraphragSearchDetails | undefined>
```

**描述**：工厂返回 `graphrag_search` 工具。

**`deps` 字段**：
- `graphrag: GraphRAGAdapter` — HTTP 客户端
- `context: DocSearchToolContext` — 工具执行上下文

**tool 字段**：
- `name`: `"graphrag_search"`
- `label`: `"GraphRAG search"`
- `description`: 描述搜索用法
- `parameters`: `GraphragSearchSchema`

**`parameters` 类型定义**（TypeBox）：
```typescript
GraphragSearchSchema = Type.Object({
  query: Type.String({ minLength: 1, maxLength: 500, description: "..." }),
  scope: Type.Optional(Type.String({ maxLength: 128, description: "..." })),
  max_results: Type.Optional(Type.Number({ minimum: 1, maximum: 20, default: 5, description: "..." })),
});
```

**`execute` 内部流程**：
1. `validateDocSearchContext(deps.context)` — fail-fast
2. `const scope = params.scope ?? "all"`
3. `try { const results = await deps.graphrag.search(params.query, { scope: params.scope, max_results: params.max_results }); return { content: [{ type: "text", text: JSON.stringify(results) }], details: { count: results.length, scope } }; }`
4. `catch (e) { if (e instanceof GraphRAGApiError) return { content: [{ type: "text", text: \`doc search unavailable: ${e.code}\` }], details: { error: e.code, status: e.status, scope } }; throw e; }`

**线程安全**：✅（工具实例构造一次；execute 是 stateless HTTP 调用）。

### 11.6 数据结构字段详情

**`GraphRAGSearchResult`**：

| 字段 | 类型 | 来源 | 必现？ |
|---|---|---|---|
| `id` | `string` | `results[].id` | ⚠️ 可缺失 → 默认 `""` |
| `content` | `string` | `results[].content` | ⚠️ 可缺失 → 默认 `""` |
| `score` | `number` | `results[].score` | ⚠️ 非数字 → 默认 `0` |
| `metadata` | `Record<string, any>` | `results[].metadata` | ⚠️ 可缺失 → 默认 `{}` |
| `created_at` | `string` | `results[].created_at` | ⚠️ 可缺失 → 默认 `""` |

**`GraphRAGSearchOptions`**：

| 字段 | 类型 | 默认 | 含义 |
|---|---|---|---|
| `scope` | `string` \| undefined | `"all"`（代码默认） | 后端定义的 scope |
| `filters` | `Record<string, any>` \| undefined | `{}` | 后端过滤表达式 |
| `max_results` | `number` \| undefined | `5`（代码默认） | [1, 20] 范围由 schema 限制 |

### 11.7 内部数据结构（私有）

`GraphRAGAdapter` 内部**无 mutable state**。每个 `search` 调用是 stateless HTTP 请求。

---

## 附录 A：与模块设计的对应

| 机制设计章节 | ISD 章节 |
|---|---|
| `piko-doc-search.md` §1 目标 | §1 实现目标 |
| `piko-doc-search.md` §3 集成点（HTTP 契约） | §1.2 / §4 / §11.3 |
| `piko-doc-search.md` §4 工具表 | §1.2.2 / §2.2 / §11.5 |
| `piko-doc-search.md` §5 验收 | §7 测试入口 |
| `piko-doc-search.md` §6 风险 | §10 风险 |
