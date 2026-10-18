# 实验 01：Mem0 API smoke test

## 假设

Mem0 提供 HTTP API（自托管或 Cloud），Piko 通过调用 API 实现 `mem0_client.search()` / `mem0_client.add()`。V0.1 spec §4.1 的接口签名基于此假设。

## 步骤

### 计划做的

1. 装 Mem0（`pip install mem0ai` 或 `npm install mem0ai`）
2. 启动 Mem0 server（本地或 Cloud）
3. 用 curl 调 `POST /v1/memories/` 写入测试数据
4. 用 curl 调 `POST /v1/memories/search/` 查询
5. 验证 request/response shape、错误码、metadata 保留

### 实际做的

❌ **无法在沙箱里做这个实验**：
- `pip install mem0ai` 失败（network 403 / proxy 拒绝）
- `npm install mem0ai` 失败（registry 403）
- 没有 docker，没法自托管
- 没有运行中的 Mem0 实例
- `docs.mem0.ai` 不在 network allowlist，没法读官方文档

## 结论

### 从公开 API 文档（截至 2026-01）得出的接口契约

**Base URL**：
- Cloud：`https://api.mem0.ai`
- 自托管：`<your-mem0-host>:<port>`（默认 8000 或 8080）

**Auth**：
- `Authorization: Bearer <api_key>` header

**主要 endpoints**：

| Endpoint | Method | 用途 |
|---|---|---|
| `/v1/memories/` | POST | 写入记忆（自动 fact 抽取） |
| `/v1/memories/search/` | POST | 语义搜索 |
| `/v1/memories/` | GET | 列出某 user 的所有记忆 |
| `/v1/memories/{id}/` | GET | 取单条记忆 |
| `/v1/memories/{id}/` | DELETE | 删单条 |
| `/v1/memories/delete-all/` | DELETE | 删某 user 所有记忆 |

**POST /v1/memories/ 请求**：
```json
{
  "messages": [
    {"role": "user", "content": "tester 在 X 模块踩坑：happy path 和边界值合并到一个 case..."}
  ],
  "user_id": "tester:piko",
  "metadata": {
    "type": "skill_experience",
    "role": "tester",
    "task_id": "task-123",
    "recorded_at": "2026-10-18T...",
    "tags": ["async", "auth"]
  },
  "infer": true,
  "output_format": "v1.0"
}
```

**响应**：
```json
{
  "results": [
    {
      "id": "mem-uuid-here",
      "memory": "extracted fact text",
      "event": "ADD"
    }
  ]
}
```

**POST /v1/memories/search/ 请求**：
```json
{
  "query": "X 模块边界值测试",
  "user_id": "tester:piko",
  "limit": 5,
  "filters": {"AND": [{"metadata.type": "skill_experience"}]}
}
```

**响应**：
```json
{
  "results": [
    {
      "id": "mem-uuid",
      "memory": "extracted fact",
      "score": 0.87,
      "metadata": {"role": "tester", "type": "skill_experience", "tags": [...]},
      "created_at": "2026-10-17T..."
    }
  ]
}
```

### 影响设计

✅ V0.1 spec §4.1 的 `Mem0Adapter` 接口签名基本对，可以直接用：

```typescript
class Mem0Adapter {
  search(query: string, user_id: string, max_results?: number, filters?: object): Promise<MemoryResult[]>;
  add(messages: Message[], user_id: string, metadata?: Record<string, any>): Promise<{ ids: string[] }>;
}
```

⚠️ **未验证的不确定项**（要在 V0.1 真实环境验）：

| 不确定项 | 影响 |
|---|---|
| `user_id` 真的隔离吗？tester:piko 写入的 memory，developer:piko 能不能 search 到？| **V0.1 per-role 隔离的核心假设** — 没验证不能上线 |
| `metadata` 写入后 search 返回时完整保留吗？| `mem0_record` 写入 role / type / tags 的实现依赖这个 |
| `filters` 字段能精确按 metadata 过滤吗？| 影响将来按 type / role 二次过滤的能力 |
| `infer: true` 自动 fact 抽取的行为稳定吗？| `mem0_record` content 应该发原样还是结构化 |
| Mem0 自托管需要的依赖（Qdrant? OpenAI?）| 部署成本 |

### 下一步

**到真实有 Mem0 的环境再验**（V0.1 实施环境，不是这个沙箱）。把上面 5 个不确定项做成一个真实测试脚本，列入 V0.1 实施的 day-1 验证。

V0.1 spec §6.1 集成点里的 `src/mem0-client.ts` 实现参考本实验的接口形状，但**真实集成前必须**重跑这 5 个验证。

## 实验状态

**未完成 — 沙箱限制**。实验 04（Pi tool）已完成，是 Piko 集成侧的更关键实验。Mem0 集成侧的实验 1/2/3/6 推迟到 V0.1 真实环境验证。