# Piko Doc Search System — V0.1 Spec

Version: V0.1
Status: Draft
Project: piko
Last Modified Date: 2026-10-18

---

## 1. 目标与系统定位

### 1.1 V0.1 目标

Piko agent 通过对接外部文档语料检索系统（GraphRAG-style HTTP 后端），获得**项目级设计文档 / STD 语料**的语义检索能力。**任何 role**（developer / tester / PM / architect）都能搜索跨角色的项目文档，让 agent 在做改动前先 recall 设计意图与历史决策。

**Doc Search ≠ Skill Experience**：
- **Skill Experience**（V0.1，Mem0）：per-role 工作中的短教训，按 `${role}:${project}` 隔离
- **Doc Search**（V0.1，GraphRAG-style）：**项目级**设计 / STD 文档语料，**跨角色共享**

两者作用域天然不同，**sibling 不是 provider-switch**——V0.1 都可独立启用。

### 1.2 V0.1 与 Skill System 的关系

完整 Skill System 包含三类组件：
- **Skill Experience（经验累积）**——V0.1 实现（Mem0）
- **Skill Behavior（角色行为）**——V2+
- **Skill Evolution（技能进化）**——V2+ 之后

V0.1 Doc Search **不**是 Skill System 的子组件——它**独立于** Skill System，服务于"agent 跑任务时需要查项目文档"这一目的。Skill Experience 与 Doc Search 在 Piko runtime 中是**两个并列的能力**，互不依赖。

---

## 2. 范围

### 2.1 V0.1 做

- **项目级文档语料检索**：跨角色共享（虽然 `identity.role` 也注入 context，但**不参与 scope 解析**）
- **GraphRAG-style HTTP 后端**：操作员自部署或自费商用
- **一个 agent 工具**：`graphrag_search`（query / scope / max_results）
- **失败 fallback**：HTTP 错映射成 `doc search unavailable: <code>`，让 agent 优雅处理
- **schema-driven 配置**：`identity.doc_search` 字段，`tool-profiles.json` 的 `network_hosts` 权限

### 2.2 V0.1 不做

- 实体抽取 / 知识图谱构建（V0.2 增量）
- runtime index 工具（`graphrag_index`）—— indexing 是离线运维动作
- 跨项目迁移 / corpus federation（V1.x）
- 实时增量更新（V1.x 增量，由 operator 负责 ETL）
- 全文 vs vector 混排（V0.2 增量；现仅透传 `score` 给 agent）
- 任何中间结果缓存 / agent 侧去重（让后端做）

---

## 3. 核心概念

### 3.1 Doc Corpus = 项目级共享

Doc Search 的语料是 **piko 项目的设计文档 + STD 模板 / 工具脚本 / 评审记录**，跨角色共享：

| 角色 | 用 doc search 查什么 |
|---|---|
| developer | "incident-reporting-is 的 reporting 字段在哪一节定义"、"std-templates 的 50_implementation_design 模板要求什么 section" |
| tester | "tools 里有 mem0_lookup 但是有没有 mem0_record 的测试"、"skill-memory 的 retry 策略在哪份里" |
| PM | "V0.1 立项否决条件"、"STD lockfile 的 evidence 要求" |
| architect | "3-layer scope 字段在 V0.1 是 deferred 还是有保留" |

不是 each role 隔离——任何 role 都能看。

### 3.2 与 Mem0 的作用域对照

| | Mem0 (V0.1) | GraphRAG (V0.1) |
|---|---|---|
| 隔离单位 | `${role}:${project}` | 全项目共享 |
| 数据规模 | KB 级（短教训）| MB-GB 级（设计文档语料）|
| 写入频率 | 任务级（mm-mh） | 月级（运维 ETL） |
| 读出频率 | 任务级 | 任务级 |
| 工具面 | `mem0_lookup` / `mem0_record` | `graphrag_search`（V0.1 单一）|
| Backend | Mem0 Cloud / 自托管 | 操作员自部署后端 |
| Piko runtime 责任 | 无（外部系统）| 无（外部系统；只 HTTP 封装）|

### 3.3 Scope 语义

GraphRAG 后端的 `scope` 是语料子集标识，**由后端定义**。V0.1 不假设具体 scope 名（除非操作员文档化了），常见候选：
- `"all"` —— 默认，全部语料
- `"piko-design-docs"` —— 仅 piko 项目设计文档
- `"std-templates"` —— 仅 STD 模板
- `"reviews"` —— 评审/历史决策记录

后端返 404（如 typo scope）映射到 `GraphRAGApiError code="not_found"`，agent 端 fallback 显式告诉它"scope 不存在"。

### 3.4 Index 是离线运维动作

为什么不在 runtime 暴露 `graphrag_index`：
- 知识图谱 / 向量索引需要实体抽取，**LLM 调用** 成本高
- 索引应一次性批处理、随设计变更 operator 触发
- agent 在跑任务期间不需要实时重建索引

操作员工作流（V0.1 推荐）：
1. 设计文档变更 → commit
2. Operator 跑离线 indexing pipeline（自定义实现或 vendor SDK）
3. Piko runtime 看到的是已索引的语料，只读

---

## 4. V0.1 交付物

### 4.1 HTTP 客户端

`GraphRAGAdapter` 类：`src/graphrag-client.ts`。

```typescript
class GraphRAGAdapter {
  search(query: string, options?: {
    scope?: string,
    filters?: object,
    max_results?: number,
  }): Promise<GraphRAGSearchResult[]>;
}
```

- `baseUrl` + `apiKey` 构造时冻结（来自 `resolveSecret`）
- HTTP 调用走 `POST {baseUrl}/v1/search`
- 响应 `{ results: [{id, content, score, metadata, created_at}] }`

### 4.2 Agent 工具

**graphrag_search**
```typescript
function graphrag_search(args: {
  query: string,
  scope?: string,
  max_results?: number,  // 默认 5
}): Promise<SearchResult[]>
```

行为：
1. 取当前 context（role + project_name，仅用于 Piko 侧 binding 校验，**不传给后端**）
2. 取 `default_scope`（如配置）或用 `"all"`
3. 调 `GraphRAGAdapter.search(query, { scope, max_results })`
4. 透传返回结果，**不做二次处理**

agent 调工具时只传 query / scope / max_results，**不传 role / project / base_url / api_key**（Piko 侧注入）。

### 4.3 触发机制

V0.1 与 Skill Experience 一致：
- **方式 A：Agent 主动调用**（主）
  - agent 接到涉及设计 / STD 的问题前先调 `graphrag_search`
  - system prompt 告知有这个能力

**方式 B / C**：与 Skill Experience 一样，V0.1 不自动检测（人工 / dashboard / 规则触发延后）。

---

## 5. 接口

### 5.1 Tool 接口（agent 侧）

```typescript
interface SearchResult {
  id: string,
  content: string,        // chunk text
  score: number,
  metadata: object,       // {source, section, indexed_at, ...}
  created_at: string,
}

interface GraphragSearchArgs {
  query: string,
  scope?: string,
  max_results?: number,
}
```

### 5.2 GraphRAGAdapter 接口

```typescript
interface GraphRAGApiError extends Error {
  status: number,
  code: "auth_invalid" | "auth_forbidden" | "not_found" | "rate_limited" | "server_error" | "network",
}

interface GraphRAGSearchOptions {
  scope?: string,
  filters?: Record<string, any>,
  max_results?: number,
}

interface GraphRAGSearchResult {
  id: string,
  content: string,
  score: number,
  metadata: Record<string, any>,
  created_at: string,
}

class GraphRAGAdapter {
  constructor(baseUrl: string, apiKey: string);
  search(query: string, options?: GraphRAGSearchOptions): Promise<GraphRAGSearchResult[]>;
}
```

### 5.3 HTTP 契约（V0.1.2 / OpenSearch `_search`）

Piko 端**采用**业界主流的 OpenSearch / Elasticsearch `_search` JSON-over-HTTP 协议，
不再自定义 contract。这覆盖 Elasticsearch、OpenSearch、Bonsai、Elastic Cloud、
AWS OpenSearch Service 和自托管部署——vendor 中性、迁移成本最低。

```
POST {base_url}/{index}/_search
Headers:
  Authorization: Bearer {api_key}   (OpenSearch 2.x 也接受 ApiKey)
  Content-Type: application/json
Body:
  {
    "size":  N,                       // 1..20
    "query": {
      "multi_match": {
        "query":  "<text>",
        "fields": ["content^2", "title"],
        "type":   "best_fields"
      },
      "bool": {                       // 可选，存在 iff piko 调用方传了 `filters`
        "filter": [ { "term": { "<k>": "<v>" } }, ... ]
      }
    }
  }
Response (200):
  {
    "took": <ms>,
    "hits": {
      "total": { "value": N, "relation": "eq" },
      "max_score": <number>,
      "hits": [
        {
          "_index":   "<index>",
          "_id":      "<id>",
          "_score":   <number>,
          "_source": {
            "content":    "<text>",
            "metadata":   { ... },
            "created_at": "<iso>"
          }
        },
        ...
      ]
    }
  }
```

**Path resolution**:
- `index` 来自 `options.scope`（per-call）> adapter `defaultScope`（ctor 注入 `IdentityConfig.doc_search.default_scope`）> `"all"`
- `all` 是 piko 的 sentinel；mock 把 `all` 当 `_all` 处理。真实 OpenSearch 部署请用 `*` 或显式索引名
- `Authorization: Bearer <key>` 是常用做法；如 operator 用 OpenSearch 安全插件配 JWT 也 work

**Filter translation**:
piko client API `filters: { foo: "bar", baz: 42 }` → OpenSearch
`query.bool.filter: [{ term: { foo: "bar" } }, { term: { baz: 42 } }]`。
Nested `metadata.section: "x"` 平铺为 `metadata: { section: "x" }` 的嵌套 term 形式。

**Why this contract** (V0.1.2 决策):
- 已有 `scripts/mock-graphrag.ts` 用 80 行 Node stdlib 完整复现 piko 端契约——验证通过 (`/tmp/cc-piko-debug.log` LOCAL_STACK=1 模式 5/5)
- 真实 vendor 端不需要 wrapper：deploy 一个 OpenSearch / ES / Bonsai 实例，piko client `base_url` 指向它即可
- 旧契约 (V0.1 / V0.1.1 的 `POST /v1/search` 自定义 shape) 在 `2cf1466` 之前的 commit 已被弃用——现 §5.3 是规范。

Response (200):
  {
    "results": [
      {
        "id": string,
        "content": string,
        "score": number,
        "metadata": object,
        "created_at": string          // ISO 8601
      }
    ]
  }
Response (4xx/5xx):
  { "message": "human readable error" }
```

**Why this contract** (V0.1.2 决策):
- 已有 `scripts/mock-graphrag.ts` 用 80 行 Node stdlib 完整复现——验证通过 (`/tmp/cc-piko-debug.log` LOCAL_STACK=1 模式 5/5)
- 真实 vendor 端不需要 wrapper：deploy 一个 OpenSearch / ES / Bonsai 实例，piko client `base_url` 指向它即可

### 5.4 工具命名

采用带后端的命名：`graphrag_search`（沿用 `piko-skill-memory.md` §6.4 的约定）。

---

## 6. 集成点

V0.1 修改 Piko 以下文件：

| 文件 | 改动 |
|---|---|
| `src/types.ts` | 加 `DocSearchConfig` interface；扩展 `RuntimeConfigIdentity.doc_search?` |
| `src/graphrag-client.ts`（新建） | `GraphRAGAdapter` 类，含 search 方法 |
| `src/graphrag-tools.ts`（新建） | `createGraphragSearchTool` 工厂；`GraphragSearchSchema` TypeBox |
| `src/graphrag-client.test.ts`（新建） | ~12 个 test case |
| `src/graphrag-tools.test.ts`（新建） | ~14 个 test case |
| `src/pi-runtime.ts` | ① 构造函数加 `graphragApiKey?` 参；② 构造 `GraphRAGAdapter`（同 Mem0 fail-fast）；③ `available` map 加 `graphrag_search`；④ `buildSystemPrompt` 加 doc-search 段 |
| `src/exec-process.ts` | resolve `graphragApiKey` at startup；传给 PiRuntime |
| `src/config.ts` | `knownTools` Set 加 `"graphrag_search"` |
| `interfaces/schemas/piko-runtime-config-v0.3.schema.json` | `identity` 加 `doc_search` 子属性（与 `memory` 对称） |
| `config/tool-profiles.json` | 两个 profile 都加 `graphrag_search` 工具条目（`effect: external`，`replay: never`，`permissions.network_hosts` 操作员改） |
| `config/runtime.example.json` | identity 块加 `doc_search` 示例 |

### 6.1 context 注入（关键）

`role / projectName / taskId` 由 **Piko 侧**注入 context（与 Mem0 同原则），agent 不可控：

```typescript
// 在 src/graphrag-tools.ts 里
const tool = createGraphragSearchTool({
  graphrag,
  context: { role, projectName: task.workspace_ref, taskId: task.task_id },
});
```

为什么 graphrag 注入 role/projectName，**即使 scope 不按 role 隔离**：
- 与 Mem0 binding 校验对齐（fail-fast 一致性）
- 未来 V0.2 想做按 role 限 scope 时无需改工具

### 6.2 buildSystemPrompt 调整（V0.1.3：prefetch + 工具）

V0.1 / V0.1.1 / V0.1.2 假设"agent 主动调"，但 slinky 派任务过来时只给 raw 描述——V0.1.3 起改成"prefetch at task start + 工具保留"。详见 `docs/91_reviews/piko-skill-auto-prefetch-decision.md`。

简言之：
- 任务入口（`pi-runtime.ts:execute()` 在 `harness.create` 之前）**自动**跑 `mem0.search(task.instruction, ...)` 和 `graphrag.search(task.instruction, ...)`
- 结果**注入** `buildSystemPrompt` 的 `=== Context ===` 段，agent 一开始就有相关 past experience 和 design docs 摘要，**不用**主动调
- 工具（`graphrag_search`）**仍**在 `available` map，agent 任务进行中可补查

```
You have access to a document search tool (project-wide corpus):
  - graphrag_search(query, scope?, max_results?): search the project's 
    design docs / STD corpus for relevant content
Use graphrag_search when you need to recall what the project's specs say 
before making changes, when verifying a design choice against the existing 
docs, or when asked about a topic that may be documented.
```

**V0.1.3 新加：`=== Context ===` 段**（prefetch 注入，agent 任务开始时就看到）：

```
=== Prior experience for role "tester" (3 most recent) ===
- "Prefer hermetic tmpdir for test fixtures" (2026-10-12, tags: tests, fixtures)
- "Mock fetch at the global level, not in adapter" (2026-10-08, tags: tests, mock)
- ...

=== Relevant project docs (top 3) ===
- docs/91_reviews/v0.1-coding-notes §0.7: 端到端 piko 跑通 mlx-serve qwen3-8b-flash; piko tool profiles use workspace-exec + mem0_lookup/record/graphrag_search
- docs/20_system_design/mechanisms/piko-skill-memory.md §3.2: per-role 隔离用 ${role}:${project} 形式 user_id
- ...
```

---

## 7. 配置

`RuntimeConfig.identity.doc_search`：

```typescript
interface DocSearchConfig {
  provider: "graphrag",              // V0.1 hard-code
  api_key_secret_ref: string,        // env:XXX or file:XXX
  base_url: string,                  // 必填，无 default（无 GraphRAG Cloud）
  default_scope?: string,            // 默认 "all"
}
```

`api_key_secret_ref` 用现有 `resolveSecret`（`src/config.ts:128`）。

**tool-profile network_hosts 操作员必须改**：`config/tool-profiles.json` 的占位 host `graphrag.example.com` 与 `runtime.json` 的 `base_url` 必须由 operator 对齐，否则 `before_tool` hook 会拦截。 

---

## 8. 验收

V0.1：

| 指标 | 目标 |
|---|---|
| `graphrag_search` 工具调用次数 / 任务数 | ≥ 0.4（设计密集型任务高频查文档）|
| `graphrag_search` 调用后实际影响决策的比例 | ≥ 50% |
| Scope 错误（typo scope）率 | < 5%（操作员配置正确后）|
| 单任务耗时增加 | < 5%（检索是 O(网络 roundtrip) 不做客户端处理）|

V0.1 day-1 验证清单（**默认在真实环境跑**，沙箱没有 GraphRAG 后端）：

| # | 项 | 期望 |
|---|---|---|
| 1 | `scope="piko-design-docs"` 搜索 "skill memory" 相关段 | 命中 ≥ 1 结果 |
| 2 | scope 隔离（两个 scope 互不可见）| 测试 scope 不通不返对方结果 |
| 3 | `filters` 字段透传 | 后端收到原 filters |
| 4 | network 错误 fallback | `content: "doc search unavailable: network"`，agent 优雅处理 |
| 5 | PiRuntime 配置 doc_search 后 ctor 不报错 | 启动 OK |

---

## 9. V2+ 组件

不在本文档展开，作为未来展望：

- V0.2：实体抽取 / 知识图谱构建 pipeline / runtime 端的 `graphrag_index` 工具
- V1.x：跨项目迁移 / corpus federation / 实时增量 ETL
- V1.x：与 Mem0 联合查询（跨两种 corpus 的 hybrid retrieval）

V0.1 不为这些预留接口、不做扩展点设计。

---

## 10. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 没有公认 GraphRAG Cloud 供应商（2026 现状） | 我们定义 HTTP 契约，操作员自部署；本契约是 V0.1 设计自定，V0.2 根据 operator 反馈迭代 |
| GraphRAG 后端不可用 | agent 任务仍可执行（`doc search unavailable: <code>` 不阻塞工具调用，agent 可继续用 grep） |
| 工具 profile `network_hosts` 占位 host 未替换 | runtime 时 `before_tool` hook 拦截，操作员必须改 host。V0.1 用 `graphrag.example.com` 提示替换 |
| corpus 与代码不同步（index 漂移） | V0.1 不引入；V0.2 加 indexed_at / operator 自己定 expiry |
| 后端响应字段缺失 | 客户端默认填充（id="", content="", score=0）；不 throw |
| scope 是后端定义，Piko 不校验 | typo scope 后端返 404，工具 fallback `not_found`，agent 收到后自纠正（"scope 'foo' 不存在"）|
| Tool profile 同时允许 `mem0_*` 和 `graphrag_search`？ | 是。两个能力独立；operator 可单独开关 |
| `runtime.example.json` 的 `doc_search.base_url` 占位 | 操作员部署后必须替换为真 host |
| Agent 过度调用 `graphrag_search` | 与 Mem0 同：依赖训练 + review checklist；V0.1 不限制速率 |
| `graphrag` provider 字段 hard-code | V0.1 接受；V0.2 可加 discriminator（"graphrag" \| "..."）|

---

## 11. 与现有代码的关系

V0.1 Doc Search 是 V0.1 Skill Experience 的**并列能力**，**不**复用 skill-tools.ts 内部 helper（`validateContext` 复制为 `validateDocSearchContext` 保持独立）。

### 与 Mem0 模块的对应

| Mem0 | GraphRAG |
|---|---|
| `src/mem0-client.ts` | `src/graphrag-client.ts` |
| `Mem0Adapter` (search + add) | `GraphRAGAdapter` (search only) |
| `Mem0ApiError` | `GraphRAGApiError` |
| `src/skill-tools.ts` | `src/graphrag-tools.ts` |
| `createMem0LookupTool` | `createGraphragSearchTool` |
| `memory: MemoryConfig` | `doc_search?: DocSearchConfig` |
| `mem0ApiKey` | `graphragApiKey` |

**为什么不复用**：
- provider-switch 会让 Mem0 和 GraphRAG 共用 `SkillToolDeps` 类型，混入 `mem0` / `graphrag` 字段，运行时"if (mem0) ..." 链式调用，复杂
- 真正 sibling 模型（同 `identity` 下两个 optional 字段）更直接
- 测试可以独立 mock，独立失败诊断

### V0.1 与 V0 skill-tools 设计的对比

V0.1 把"skill memory" 一词按文档瘦化为"Skill Experience"（per-role 短经验）。本文档里"DOC Search"对应"design / STD corpus retrieval"——是 peer，不是 skill。

---

## 12. 决策记录

| 日期 | 决策 | 理由 |
|---|---|---|
| 2026-10-18 | 加 GraphRAG 到 V0.1（用户 revert 之前"全不做"决策）| 删除 graphrag 字段后没有跨文档语料检索能力，V0.1 设计缺一块 |
| 2026-10-18 | GraphRAG 走 HTTP-as-a-Service 模式 | 沿用 Mem0 的"对接外部系统"原则；操作员灵活选 backend |
| 2026-10-18 | GraphRAG 与 Mem0 是 **sibling**（`identity.memory` + `identity.doc_search`） | 两者作用域不同（per-role 短经验 vs 项目级语料）；provider-switch 强制二选一会让全功能运维痛苦 |
| 2026-10-18 | V0.1 只暴露 `graphrag_search`（不暴露 `graphrag_index`） | indexing 是 LLM 成本的离线运维动作；不适合 agent 触发 |
| 2026-10-18 | `base_url` 必填，无 Cloud default | 没有公认 GraphRAG Cloud；强制操作员明确填 host |
| 2026-10-18 | HTTP 契约由 Piko 端定义（不是 GraphRAG 官方协议） | 2026 现状没有 off-the-shelf；V0.2 根据 operator 反馈迭代 |
| 2026-10-18 | Tool profile `network_hosts` 用占位 `graphrag.example.com` + 文档提示替换 | 不能 schema 加 wildcard；占位便于 operator grep 替换 |

---

## 13. 下一步

### 13.1 V0.1 完整实施（与 Skill Experience 同步）

| 任务 | 状态 |
|---|---|
| ✅ `src/graphrag-client.ts` | done |
| ✅ `src/graphrag-tools.ts` | done |
| ✅ `src/graphrag-client.test.ts` | done |
| ✅ `src/graphrag-tools.test.ts` | done |
| ✅ `src/types.ts` 加 `DocSearchConfig` | done |
| ✅ `src/pi-runtime.ts` 注册 `graphrag_search` | done |
| ✅ `src/exec-process.ts` resolve `graphragApiKey` | done |
| ✅ `src/config.ts` `knownTools` 加 `graphrag_search` | done |
| ✅ Schema / tool-profiles / runtime.example 同步 | done |
| ✅ 设计文档（机制 + ISD） | done |
| ⏳ Code review + design validation 脚本（沙箱可跑） | pending |
| ⏳ Real env STD cover（9 份文档 + 本文档） | pending（你跑）|
| ⏳ V0.1 day-1 真接口验证（5 项） | pending（你跑）|

### 13.2 验收

跑完（13.1）后，按 §8 清单验。**任何一项失败 → V0.1 立项否决**（与 Mem0 同语义）。

### 13.3 Operator 部署参考

V0.1 后端可以是：
1. **自部署 Microsoft GraphRAG** + 自写 thin HTTP wrapper（最贴近上游；3.3.0 已装 sandbox 装不上因为 cryptography Rust 编译）
2. **第三方 SaaS GraphRAG**（按本契约 `POST /v1/search` 实现即可对接）
3. **自实现简化版 doc-RAG**（vector + BM25 混合；不强制用 graph 抽取）

**契约是约束，不是实现**：operator 怎么实现后端自由。

---

## 附录 A：与其他机制的关系

| 机制 | 关系 |
|---|---|
| `piko-skill-memory.md` | peer；`graphrag_search` ≠ `mem0_lookup/record`（不同作用域） |
| `piko-agent-runtime-v0.3.md` | 上层；Doc Search 是 agent 的工具子集 |
| `piko-pi-adapter-skill-tools-update.md` | 工具注册入口；本机制在 PiRuntime 注册 `graphrag_search` |

---

## 附录 B：HTTP 契约示例（cURL）

```bash
# 工作搜索
curl -X POST 'https://graphrag.example.com/v1/search' \
  -H 'Authorization: Bearer my-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "skill memory design decision",
    "scope": "piko-design-docs",
    "filters": {},
    "max_results": 5
  }'

# 期望响应
# {
#   "results": [
#     {
#       "id": "doc-uuid-1",
#       "content": "...matched chunk text...",
#       "score": 0.92,
#       "metadata": { "section": "4.1" },
#       "created_at": "2026-10-18T00:00:00Z"
#     },
#     ...
#   ]
# }
```
