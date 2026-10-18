<!--
DRAFT — STD cover not generated.
Real env: regenerate with new-design --template design.implementation.
-->

# Piko 实现规格：skill-tools

> **⚠️ DRAFT — STD cover 未生成**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-skill-tools-impl` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Template ID | `design.implementation` |
| Last Modified Date | `2026-10-18` |

---

## 1. 实现目标

实现 `piko-skill-tools` 模块的 TypeScript 代码：两个工厂函数 `createMem0LookupTool` 和 `createMem0RecordTool`，返回 Pi `AgentHarnessTool` 对象。**user_id 在工具 `execute()` 内部从 `SkillToolContext` 构造，agent 不可控**。

输入基线：`piko-skill-tools-design.md`（模块设计）。

## 2. 文件 / symbol 列表

### 2.1 `src/skill-tools.ts`（新建）

| Symbol | 类型 | 说明 |
|---|---|---|
| `Mem0LookupSchema` | const (TSchema) | TypeBox schema for lookup params |
| `Mem0RecordSchema` | const (TSchema) | TypeBox schema for record params |
| `SkillToolContext` | interface | `{ role, projectName, taskId? }` |
| `SkillToolDeps` | interface | `{ mem0: Mem0Adapter, context: SkillToolContext }` |
| `Mem0LookupDetails` | interface | `{ count, error?, ids? }` |
| `Mem0RecordDetails` | interface | `{ ids, error? }` |
| `createMem0LookupTool` | function | 返回 AgentHarnessTool |
| `createMem0RecordTool` | function | 返回 AgentHarnessTool |

**预计行数**：~180 行 TS

### 2.2 `src/skill-tools.test.ts`（新建）

| Test | 说明 |
|---|---|
| `mem0_lookup schema 校验：合法 query` | 通过 |
| `mem0_lookup schema 校验：query 缺失` | 失败 |
| `mem0_lookup schema 校验：max_results 越界（>20）` | 失败 |
| `mem0_record schema 校验：content 太短` | 失败 |
| `createMem0LookupTool 工厂：role 空抛` | 直接调 |
| `createMem0LookupTool 工厂：projectName 空抛` | 直接调 |
| `createMem0LookupTool 工厂：projectName 含 ":" 抛` | 直接调，验证 `^[A-Za-z0-9._-]+$` |
| `工具 execute：user_id 内部构造为 "${role}:${project}"` | mock Mem0，检查入参 |
| `Mem0 抛 Mem0ApiError → 工具返回 fallback content` | mock 抛错 |
| `Mem0 抛未知错误 → 工具向上抛` | mock throw non-Mem0ApiError |
| `tools.description 非空 + 提到 lookup/record` | 字符串断言 |

**预计行数**：~150 行 TS

## 3. 私有表示

无持久状态。`SkillToolDeps` 是简单的 dependency injection 容器，工具内部闭包持有。

## 4. 调用步骤

### 4.1 `createMem0LookupTool(deps)` 调用链

```
factory(deps)
  → 校验 deps.context.role 非空（空抛 Error）
  → 校验 deps.context.projectName 非空（空抛 Error）
  → 校验 deps.context.projectName 匹配 ^[A-Za-z0-9._-]+$（避免 user_id 模板歧义）
  → 返回 { name:"mem0_lookup", label, description, parameters: Mem0LookupSchema, execute }
```

### 4.2 `mem0_lookup.execute()` 运行时

```
execute(toolCallId, params, onUpdate, toolContext, invocation, context)
  → 构造 userId = `${deps.context.role}:${deps.context.projectName}`  // Piko 侧
  → try {
      results = await deps.mem0.search(params.query, userId, { max_results: params.max_results ?? 5 })
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
        details: { count: results.length },
      }
    } catch (e) {
      if (e instanceof Mem0ApiError) {
        return {
          content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
          details: { error: e.code, status: e.status },
        }
      }
      throw e  // 未预期错误向上
    }
```

### 4.3 `mem0_record.execute()` 运行时

```
execute(...)
  → 构造 userId
  → metadata = {
      type: "skill_experience",
      role: deps.context.role,
      task_id: deps.context.taskId,  // 可能 undefined
      recorded_at: new Date().toISOString(),
      tags: params.tags ?? [],
    }
  → try {
      result = await deps.mem0.add(
        [{ role: "user", content: params.content }],
        userId,
        metadata,
      )
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        details: { ids: result.ids },
      }
    } catch (e) {
      if (e instanceof Mem0ApiError) {
        return {
          content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
          details: { error: e.code },
        }
      }
      throw e
    }
```

## 5. schema 详细定义

### 5.1 `Mem0LookupSchema`

```typescript
Mem0LookupSchema = Type.Object({
  query: Type.String({
    description: "Natural language search query for past skill experience. Be specific: include module name, scenario, or failure pattern.",
    minLength: 1,
    maxLength: 500,
  }),
  max_results: Type.Optional(Type.Number({
    description: "Maximum number of experiences to return. Default 5, max 20.",
    default: 5,
    minimum: 1,
    maximum: 20,
  })),
});
```

### 5.2 `Mem0RecordSchema`

```typescript
Mem0RecordSchema = Type.Object({
  content: Type.String({
    description: "Markdown text describing the lesson learned. Recommended structure: ## Situation (when this applies), ## Failure (what went wrong), ## Lesson (what to do instead). Skip if not worth recording.",
    minLength: 10,
    maxLength: 5000,
  }),
  tags: Type.Optional(Type.Array(Type.String(), {
    description: "Optional tags for filtering (e.g., ['async', 'auth', 'race-condition'])",
    maxItems: 10,
  })),
});
```

## 6. 工具 description（精确文本）

```typescript
// mem0_lookup
description: "Search past skill experience for the current role in this project. " +
  "Use this when you want to know what has been learned before — e.g., test pitfalls, " +
  "code conventions, project-specific quirks, repeated failures. " +
  "Returns up to N relevant experiences with their original situation / failure / lesson."

// mem0_record
description: "Record a new lesson learned this task. " +
  "Use when you encountered a pitfall, surprising behavior, or repeated mistake " +
  "worth remembering for next time. Skip routine successes. " +
  "Recommended structure: ## Situation / ## Failure / ## Lesson."
```

## 7. 依赖

- `piko-mem0-client`：`Mem0Adapter`、`Mem0ApiError`
- Pi 上游：`AgentHarnessTool`、`ExecutionToolContext`
- `typebox`：`Type`、`Static`

## 8. 测试入口

```bash
node --test src/skill-tools.test.ts
```

集成测试（V0.1 day-1）：
- per-role 隔离：tester agent 调 record → developer agent 调 lookup 看不到
- metadata 保留：写入 type/role/tags → 读回一致

## 9. 与其他模块的边界

- **不持有** runtime config（`SkillToolDeps` 注入）
- **不持有** task_id / project_name 解析逻辑（调用方注入）
- **不发起** fallback to file system（V0.1 不做）

## 10. 风险

| 风险 | 缓解 |
|---|---|
| TypeBox schema 与 Pi 不兼容 | 实验 04 已验证模板可编译 |
| description 写得不够清楚 → agent 不调 | V0.1 跑 4 周看命中率；description 反复迭代 |
| Mem0 失败阻塞 agent | §4.2 / §4.3 已 catch Mem0ApiError 转 fallback |
| user_id 模板错误（agent 误传 user_id）| user_id 不在 schema 里，agent 物理上无法传 |

---

## 11. 函数规格（详细）

### 11.1 `createMem0LookupTool`

**签名**：
```typescript
function createMem0LookupTool(
  deps: SkillToolDeps
): AgentHarnessTool<
  ExecutionToolContext,
  typeof Mem0LookupSchema,
  Mem0LookupDetails | undefined
>
```

**描述**：工厂函数。返回 Pi 风格的工具对象，agent 可调用以搜索 skill experience。

**参数 `deps`**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `deps.mem0` | `Mem0Adapter` | 是 | 已构造好的 Mem0 客户端（baseUrl + apiKey） |
| `deps.context.role` | `string` | 是 | 当前 agent 实例的 role（如 `"tester"`） |
| `deps.context.projectName` | `string` | 是 | 当前任务的项目名（来自 `task.workspace_ref`） |
| `deps.context.taskId` | `string` \| undefined | 否 | 当前任务的 task_id；V0.1 不在 metadata 中用，但保留供将来 |

**返回值**：`AgentHarnessTool<ExecutionToolContext, typeof Mem0LookupSchema, Mem0LookupDetails | undefined>`

**异常**（构造时）：

| 类型 | 触发条件 | 错误消息 |
|---|---|---|
| `Error("role required")` | `deps.context.role.trim() === ""` | role 非空字符串 |
| `Error("projectName required")` | `deps.context.projectName.trim() === ""` | projectName 非空字符串 |
| `Error("projectName must match ^[A-Za-z0-9._-]+$")` | `projectName` 含非法字符（`:` 等）| 防止 user_id 模板歧义 |

**校验顺序**：role → projectName 非空 → projectName 格式。前一步失败不执行后一步。

**返回对象字段**：

| 字段 | 类型 | 值 |
|---|---|---|
| `name` | `"mem0_lookup"` | 固定 |
| `label` | `"Mem0 lookup"` | 固定（人类可读） |
| `description` | `string` | 见 §6 文本 |
| `parameters` | `typeof Mem0LookupSchema` | 见 §5.1 |
| `execute` | function | 见 §11.2 |

**内部流程**：
1. `if (!deps.context.role || deps.context.role.trim() === "") throw new Error("role required")`
2. `if (!deps.context.projectName || deps.context.projectName.trim() === "") throw new Error("projectName required")`
3. `if (!/^[A-Za-z0-9._-]+$/.test(deps.context.projectName)) throw new Error("projectName must match ^[A-Za-z0-9._-]+$")`
4. 返回 `{ name, label, description, parameters: Mem0LookupSchema, execute }`

**线程安全**：✅ 安全。返回的工具对象是只读的（闭包持有 deps，无 mutable state）。

### 11.2 `mem0_lookup` 工具的 `execute` 回调

**签名**：
```typescript
async execute(
  toolCallId: string,
  params: Mem0LookupParams,
  onUpdate: AgentHarnessToolUpdateCallback<Mem0LookupDetails | undefined>,
  toolContext: ExecutionToolContext,
  invocation: AgentHarnessToolInvocation,
  context: Context
): Promise<AgentToolResult<Mem0LookupDetails | undefined>>
```

**描述**：实际执行 lookup。**agent 完全无法控制 user_id**——它在执行体内部从闭包里的 `deps.context` 拼。

**参数（来自 Pi 框架 + agent 传 params）**：

| 名 | 类型 | 含义 |
|---|---|---|
| `toolCallId` | `string` | Pi 框架生成；本次不读 |
| `params.query` | `string` | Agent 传的搜索词（1–500 字符）|
| `params.max_results` | `number` \| undefined | 上限 1–20；缺省 5 |
| `onUpdate` | function | Pi 流式更新回调；本次不调 |
| `toolContext` | `ExecutionToolContext` | Pi 的工具上下文；本次不读 |
| `invocation` | `AgentHarnessToolInvocation` | Pi 调用上下文；本次不读 |
| `context` | `Context` | Pi 完整上下文；本次不读 |

**返回值**：`Promise<AgentToolResult<Mem0LookupDetails | undefined>>`

**成功返回**（`Mem0SearchResult[]` 非空或空都算）：
```typescript
{
  content: [{ type: "text", text: JSON.stringify(results) }],
  details: { count: results.length },  // 0 也合法
}
```

- `content[0].text`：JSON 序列化的结果数组。即使 0 结果也是 `"[]"`。
- `details.count`：结果数量。

**Mem0ApiError fallback 返回**：
```typescript
{
  content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
  details: { error: e.code, status: e.status },
}
```

- `content[0].text`：固定格式 `"memory unavailable: <code>"`（不含 apiKey，不含内部 stack）。
- `details.error`：Mem0 错误码（`auth_invalid` / `server_error` / `network` 等）。
- `details.status`：HTTP 状态码（网络错误为 0）。

**未知错误**：向上抛（programmer error，不应到达此路径）。

**内部流程**：
1. **构造 userId**（Piko 侧，agent 不可控）：
   ```typescript
   const userId = `${deps.context.role}:${deps.context.projectName}`;
   ```
2. **try 块**：
   ```typescript
   try {
     const results = await deps.mem0.search(params.query, userId, {
       max_results: params.max_results ?? 5,
     });
     return {
       content: [{ type: "text", text: JSON.stringify(results) }],
       details: { count: results.length },
     };
   }
   ```
3. **catch Mem0ApiError**：
   ```typescript
   catch (e) {
     if (e instanceof Mem0ApiError) {
       return {
         content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
         details: { error: e.code, status: e.status },
       };
     }
     throw e;
   }
   ```

**前置条件**：
- `deps.mem0.search` 已实现并可用
- `params` 通过 TypeBox schema 校验（`query` 非空、`max_results` 在范围内）

**副作用**：一次 HTTP 请求到 Mem0。

**线程安全**：✅ 安全。

### 11.3 `createMem0RecordTool`

**签名**：
```typescript
function createMem0RecordTool(
  deps: SkillToolDeps
): AgentHarnessTool<
  ExecutionToolContext,
  typeof Mem0RecordSchema,
  Mem0RecordDetails | undefined
>
```

**描述**：工厂函数。返回 agent 可调用的 record 工具对象。

**参数 `deps`**：同 §11.1。

**返回值**：`AgentHarnessTool<ExecutionToolContext, typeof Mem0RecordSchema, Mem0RecordDetails | undefined>`。

**异常**：同 §11.1（构造时校验 role/projectName）。

**返回对象字段**：

| 字段 | 类型 | 值 |
|---|---|---|
| `name` | `"mem0_record"` | 固定 |
| `label` | `"Mem0 record"` | 固定 |
| `description` | `string` | 见 §6 |
| `parameters` | `typeof Mem0RecordSchema` | 见 §5.2 |
| `execute` | function | 见 §11.4 |

**内部流程**：同 §11.1（同一套校验）。

### 11.4 `mem0_record` 工具的 `execute` 回调

**签名**：
```typescript
async execute(
  toolCallId: string,
  params: Mem0RecordParams,
  onUpdate: AgentHarnessToolUpdateCallback<Mem0RecordDetails | undefined>,
  toolContext: ExecutionToolContext,
  invocation: AgentHarnessToolInvocation,
  context: Context
): Promise<AgentToolResult<Mem0RecordDetails | undefined>>
```

**参数**：

| 名 | 类型 | 含义 |
|---|---|---|
| `toolCallId` | `string` | 不读 |
| `params.content` | `string` | Agent 写的经验（10–5000 字符 Markdown）|
| `params.tags` | `string[]` \| undefined | Agent 选的标签（≤ 10 个）|
| 其余 | 同 §11.2 | 不读 |

**返回值**：

**成功返回**：
```typescript
{
  content: [{ type: "text", text: JSON.stringify(result) }],  // result = { ids: [...] }
  details: { ids: result.ids },
}
```

- `content[0].text`：JSON 序列化的 `{ ids: [...] }`。
- `details.ids`：新创建的 memory UUID 数组。

**Mem0ApiError fallback**：
```typescript
{
  content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
  details: { error: e.code },  // 不含 status（record 是 mutation，少看）
}
```

**未知错误**：向上抛。

**内部流程**：
1. **构造 userId**：`const userId = `${deps.context.role}:${deps.context.projectName}``
2. **构造 metadata**：
   ```typescript
   const metadata = {
     type: "skill_experience",                    // 固定
     role: deps.context.role,                     // 注入
     task_id: deps.context.taskId,                // 可能 undefined
     recorded_at: new Date().toISOString(),       // 当前 UTC ISO 8601
     tags: params.tags ?? [],                     // 注入或空
   };
   ```
3. **try 块**：
   ```typescript
   try {
     const result = await deps.mem0.add(
       [{ role: "user", content: params.content }],
       userId,
       metadata,
     );
     return {
       content: [{ type: "text", text: JSON.stringify(result) }],
       details: { ids: result.ids },
     };
   }
   ```
4. **catch Mem0ApiError**：
   ```typescript
   catch (e) {
     if (e instanceof Mem0ApiError) {
       return {
         content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
         details: { error: e.code },
       };
     }
     throw e;
   }
   ```

**前置条件**：同 §11.2。

**副作用**：一次 HTTP POST 到 Mem0 + 服务端 fact 抽取。

**线程安全**：✅ 安全。

### 11.5 数据结构字段详情

**`SkillToolContext`**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `role` | `string` | 是 | 当前 Piko 实例的角色（如 `"tester"`、`"developer"`）。V0.1 来自 `RuntimeConfig.identity.role` |
| `projectName` | `string` | 是 | 项目名（来自 `TaskRequest.workspace_ref`）。V0.1 必须匹配 `^[A-Za-z0-9._-]+$` |
| `taskId` | `string` \| undefined | 否 | 任务 ID。V0.1 不强使用，保留供将来 metadata 增强 |

**`SkillToolDeps`**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `mem0` | `Mem0Adapter` | 是 | 已构造的 Mem0 客户端（构造时拿到 apiKey） |
| `context` | `SkillToolContext` | 是 | 见上 |

**`Mem0LookupDetails`**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `count` | `number` \| undefined | 返回结果数（0 也合法） |
| `error` | `string` \| undefined | Mem0 错误码（fallback 返回时有） |
| `status` | `number` \| undefined | HTTP 状态码（fallback 返回时有，0 表示网络错） |

**`Mem0RecordDetails`**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `ids` | `string[]` \| undefined | 新创建的 memory UUID 数组（成功返回时有） |
| `error` | `string` \| undefined | Mem0 错误码（fallback 返回时有） |

**`Mem0LookupParams`（TypeBox `Static<typeof Mem0LookupSchema>`）**：

| 字段 | 类型 | 必现 | 约束 |
|---|---|---|---|
| `query` | `string` | ✅ | minLength: 1, maxLength: 500 |
| `max_results` | `number` \| undefined | ❌ | min: 1, max: 20, default: 5 |

**`Mem0RecordParams`（TypeBox `Static<typeof Mem0RecordSchema>`）**：

| 字段 | 类型 | 必现 | 约束 |
|---|---|---|---|
| `content` | `string` | ✅ | minLength: 10, maxLength: 5000 |
| `tags` | `string[]` \| undefined | ❌ | maxItems: 10 |

---

## 附录 A：与模块设计的对应

| 模块设计章节 | ISD 章节 |
|---|---|
| §3.1 公开接口 | §2 文件列表 |
| §3.2 TypeBox schema | §5 schema 详细 |
| §4.1 user_id 构造 | §11.2 / §11.4 |
| §4.2 Mem0 失败处理 | §11.2 / §11.4 (catch Mem0ApiError) |
| §4.3 metadata 注入 | §11.4 |
| §5 失败语义 | §11 + §9 |