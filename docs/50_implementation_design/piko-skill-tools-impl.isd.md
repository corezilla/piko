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

## 附录 A：与模块设计的对应

| 模块设计章节 | ISD 章节 |
|---|---|
| §3.1 公开接口 | §2 文件列表 |
| §3.2 TypeBox schema | §5 schema 详细 |
| §4.1 user_id 构造 | §4.2 / §4.3 |
| §4.2 Mem0 失败处理 | §4.2 / §4.3 (catch Mem0ApiError) |
| §4.3 metadata 注入 | §4.3 |
| §5 失败语义 | §4 + §9 |