<!--
DRAFT — STD cover not generated.
This document was written in a sandbox without access to /Users/ben/work/STD/scripts/new-design.
Before committing, run:
  /Users/ben/work/STD/scripts/new-design \
    --project piko --template design.definition --name piko-mem0-client \
    --project-root /Users/ben/work/piko --owner corezilla \
    --author corezilla --author opencode --repository corezilla/piko \
    --status draft --parent-document-id piko-skill-memory

Then merge the body content from this file into the generated template,
update Document Version, and run validate-design.
-->

# Piko 模块设计：mem0-client

> **⚠️ DRAFT — STD cover 未生成**：本文件由 Claude 在 `/Users/ben/work/STD` 不可用的沙箱中撰写，未走 `new-design` 流程。**提交前必须在能访问 STD 脚本的环境补 STD cover + metadata + 跑 validate-design**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-mem0-client` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Project | `piko` |
| Parent Document ID | `piko-skill-memory`（system design mechanism） |
| Last Modified Date | `2026-10-18` |

---

## 1. 单元摘要：为什么存在

mem0-client 解决一个问题：Piko 的 Skill Experience 系统（V0.1）需要外部持久化存储来记录和检索 agent 的工作经验。Mem0 被选为该后端（system design §1.1 + 决策记录）。但 Piko 侧不应该把 Mem0 的 HTTP 细节（auth header、URL 构造、错误码）泄漏到上层模块——`skill-tools.ts` 应该只看 `Mem0Adapter` 接口。

`mem0-client` 是一个**纯包装层**，提供：

- `Mem0Adapter.search(query, user_id, max_results?, filters?)` — 语义检索
- `Mem0Adapter.add(messages, user_id, metadata?)` — 写入（带 Mem0 自动 fact 抽取）

不做什么：

- ❌ 不构造 `user_id`（由调用方传入，因为 user_id 模板 `${role}:${project}` 需要 identity + project_name 调用栈上下文，mem0-client 没有这些）
- ❌ 不做 role / project 隔离（这是调用方责任）
- ❌ 不做 fact 抽取后处理（Mem0 自带）
- ❌ 不做缓存 / retry 策略（V0.1 不做）
- ❌ 不暴露 HTTP 细节给上层

| 项目 | 内容 |
|---|---|
| 模块编号 / 正式英文名称 | 待定 / `mem0-client` |
| 运行进程 | P0 / P1（任意需要调 Mem0 的进程，主要是 P1 agent 上下文） |
| 直属父对象 | `SW-P` / Piko Agent Runtime V0.3 |
| 父设计 | `system-design` v0.11.2 + `piko-skill-memory.md`（机制层） |
| 上级系统 / 父单元 | `piko-skill-tools`（即将设计） |
| 解决的问题 | 隔离 Mem0 HTTP 细节；提供稳定 TypeScript 接口 |
| 提供的能力 | search / add 两个方法；错误 → 显式异常 |
| 主要使用者 | `piko-skill-tools`（V0.1）；将来可能 V2+ 训练数据导出 |
| 不负责 | user_id 构造、role 隔离、retry、缓存、fact 抽取 |

## 2. 范围

### 2.1 V0.1 做

- HTTP client（基于 `fetch` 或 `node-fetch`，避免新依赖）
- `search` 和 `add` 两个方法
- Bearer token auth（从 `RuntimeConfig.identity.memory.api_key_secret_ref` 解析）
- 自托管 / Cloud 两套 base URL
- 错误映射（4xx / 5xx / 网络错误 → 抛 typed exception）
- 单元测试 contract（mock HTTP server）

### 2.2 V0.1 不做

- Retry / backoff（V1.x 增量）
- 缓存 / dedup（V1.x 增量）
- 流式响应（Mem0 不支持，不适用）
- 多租户 / 跨实例（V0.1 单实例足够）
- 自定义 HTTP client（用 node 标准 `fetch`，不引入 axios / undici）

## 3. 接口

### 3.1 公开接口（TypeScript）

```typescript
// src/mem0-client.ts

export interface Mem0SearchResult {
  id: string;
  memory: string;          // Mem0 抽取后的 fact 文本
  score: number;           // 0-1
  metadata: Record<string, any>;
  created_at: string;      // ISO 8601
}

export interface Mem0AddResult {
  ids: string[];           // Mem0 返回的 memory id 列表
}

export interface Mem0SearchOptions {
  max_results?: number;    // 默认 5
  filters?: Record<string, any>;  // Mem0 metadata 过滤
}

export class Mem0ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "Mem0ApiError";
  }
}

export class Mem0Adapter {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  );

  search(
    query: string,
    user_id: string,
    options?: Mem0SearchOptions,
  ): Promise<Mem0SearchResult[]>;

  add(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    user_id: string,
    metadata?: Record<string, any>,
  ): Promise<Mem0AddResult>;
}
```

### 3.2 HTTP 映射

**`POST {baseUrl}/v1/memories/search/`**

Request:
```json
{
  "query": "auth 边界值测试",
  "user_id": "tester:piko",
  "limit": 5,
  "filters": {}
}
```

Response（成功）:
```json
{
  "results": [
    { "id": "mem-uuid", "memory": "...", "score": 0.87, "metadata": {}, "created_at": "..." }
  ]
}
```

**`POST {baseUrl}/v1/memories/`**

Request:
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "user_id": "tester:piko",
  "metadata": {"type": "skill_experience", "role": "tester", "task_id": "..."},
  "infer": true
}
```

Response（成功）:
```json
{
  "results": [{"id": "mem-uuid", "memory": "...", "event": "ADD"}]
}
```

### 3.3 错误映射

| HTTP 状态 | 行为 |
|---|---|
| 2xx | 正常返回 |
| 401 / 403 | 抛 `Mem0ApiError(status=401, code="auth_invalid", ...)` — 配置错误，V0.1 不重试 |
| 404 | 抛 `Mem0ApiError(status=404, code="not_found", ...)` |
| 429 | 抛 `Mem0ApiError(status=429, code="rate_limited", ...)` — V0.1 不重试，让上层决定 |
| 5xx | 抛 `Mem0ApiError(status=5xx, code="server_error", ...)` |
| 网络错误 / 超时 | 抛 `Mem0ApiError(status=0, code="network", ...)` |

V0.1 全部不重试。Retry 是 V1.x 增量。

## 4. 状态模型

无持久状态。每次调用 stateless。

`Mem0Adapter` 实例本身只持有 config（baseUrl + apiKey），不可变。

## 5. 失败语义

| 场景 | 行为 |
|---|---|
| Mem0 服务不可达 | 抛 `Mem0ApiError(code="network")` — 调用方（skill-tools）决定是否降级 |
| Mem0 返回 4xx/5xx | 抛带 status 的 `Mem0ApiError` — 调用方记录 + 不阻塞 agent 任务 |
| API key 缺失 / 解析失败 | 构造时就抛（fail-fast） |
| `user_id` 为空字符串 | 抛 `Error("user_id required")` |
| `messages` 为空 | 抛 `Error("messages must be non-empty")` |

调用方（`skill-tools`）的预期：Mem0 失败时 `mem0_lookup` / `mem0_record` 返回 `content: [{type:"text", text: "memory unavailable"}]` + 不阻塞任务（V0.1 spec §10 风险）。

## 6. 配置

来自 `RuntimeConfig.identity.memory`：

| 字段 | 用途 |
|---|---|
| `provider` | 必须是 `"mem0"`（V0.1 不支持其他） |
| `api_key_secret_ref` | 通过 `resolveSecret`（`src/config.ts:124`）解析出 API key |
| `base_url?` | 自托管时填；Cloud 时省略，默认 `https://api.mem0.ai` |
| `user_id_template` | **不在 mem0-client 范围**，由调用方处理 |

## 7. 实现位置

```
src/mem0-client.ts       # Mem0Adapter 类 + Mem0ApiError
src/mem0-client.test.ts  # 单元测试（contract）
```

## 8. 验证

### 8.1 单元测试（contract）

用 `node:test` + 内置 `fetch` mock（或 `msw` 如果已在 deps）：

- `search()` 成功响应 → 返回正确结构的 `Mem0SearchResult[]`
- `search()` 401 → 抛 `Mem0ApiError(code="auth_invalid")`
- `search()` 网络错误 → 抛 `Mem0ApiError(code="network")`
- `add()` 成功响应 → 返回 `Mem0AddResult`
- `add()` 缺 user_id → 抛
- `add()` 空 messages → 抛

### 8.2 集成测试（day-1 验证，必做）

V0.1 spec §13.3 列出的 5 个 day-1 验证项目里：

- **per-role 隔离**（tester:piko 写入 → developer:piko 看不到？）
- **metadata 保留**（type / role / tags 写入后 search 回来一致？）

这两项需要真实 Mem0 实例。沙箱无 Mem0，**V0.1 实施环境必做**。

如果 day-1 验证失败 → V0.1 立项否决。

## 9. 与现有代码关系

- `src/config.ts:124` `resolveSecret`：用现有 secret 解析机制，不引入新依赖
- node `fetch`（Node 18+）：原生，无新依赖
- TypeScript 严格模式（沿用项目现有 tsconfig）

## 10. 风险与缓解

| 风险 | 缓解 |
|---|---|
| Mem0 API 变动（破坏兼容） | 接口签名稳定；HTTP 实现集中在一个文件；测试覆盖所有响应形状 |
| API key 泄漏到日志 | 不在错误信息里包含 api_key；debug log 只打印 user_id |
| 大响应（>10MB）暂未处理 | V0.1 项目级经验库数据量小；V1.x 加 streaming / pagination |
| HTTP timeout 没设 | V0.1 用 node fetch 默认（无超时）；V1.x 加 AbortSignal + timeout |

---

## 附录 A：与 V0.1 spec 的对应

| V0.1 spec 章节 | 本设计对应 |
|---|---|
| §4.1 Mem0 Adapter | §3 接口 |
| §6 集成点 - `src/mem0-client.ts` 新建 | §7 实现位置 |
| §10 风险 - Mem0 服务不可用 | §5 失败语义 |

## 附录 B：实验结论引用

实验 01（Mem0 API smoke）沙箱阻塞，HTTP 形状基于公开文档（截至 2026-01）。详见 `experiments/skill-v0.1/01-mem0-api-smoke/README.md`。