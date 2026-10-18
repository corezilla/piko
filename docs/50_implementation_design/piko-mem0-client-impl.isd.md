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

## 附录 A：与模块设计的对应

| 模块设计章节 | ISD 章节 |
|---|---|
| §3.1 接口 | §1.2 接口 |
| §3.2 HTTP 映射 | §4 调用步骤 |
| §3.3 错误映射 | §5 错误码映射 |
| §5 失败语义 | §5 + §8 |
| §7 实现位置 | §2 文件列表 |
| §8 验证 | §7 测试入口 |