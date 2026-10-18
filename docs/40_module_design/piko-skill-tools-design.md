<!--
DRAFT — STD cover not generated.
Before committing, run /Users/ben/work/STD/scripts/new-design and merge.
-->

# Piko 模块设计：skill-tools

> **⚠️ DRAFT — STD cover 未生成**：本文件由 Claude 在 `/Users/ben/work/STD` 不可用的沙箱中撰写，未走 `new-design` 流程。**提交前必须在能访问 STD 脚本的环境补 STD cover + metadata + 跑 validate-design**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-skill-tools` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Project | `piko` |
| Parent Document ID | `piko-skill-memory` |
| Last Modified Date | `2026-10-18` |

---

## 1. 单元摘要：为什么存在

skill-tools 解决一个问题：Pi 上游的 AgentHarness 需要接收一组 `AgentHarnessTool` 对象作为 agent 可用的工具集。Piko 的 Skill Experience 系统（V0.1）需要给 agent 提供 `mem0_lookup` 和 `mem0_record` 两个工具。

skill-tools 实现这两个工具，按 Pi 的 `AgentHarnessTool` 接口形态构造，并**在 Piko 侧完成 user_id 构造**（agent 不可控），实现 per-role 隔离。

依赖：

- `piko-mem0-client`（V0.1）— 提供 `Mem0Adapter`
- Pi 上游 `AgentHarnessTool` 类型（`upstream/pi/packages/agent/src/harness/types.ts`）
- TypeBox schema 库（已在 Piko 依赖里）

不做什么：

- ❌ 不构造 user_id 模板逻辑（由调用方传入 identity + project_name；user_id 模板 `${role}:${project}` 在本模块内）
- ❌ 不做 role / project 业务校验（只做格式：role 非空、project 非空）
- ❌ 不做 prompt 提示（`buildSystemPrompt` 由 pi-adapter 处理）

| 项目 | 内容 |
|---|---|
| 模块编号 / 正式英文名称 | 待定 / `skill-tools` |
| 运行进程 | P1（agent 进程内实例化） |
| 直属父对象 | `SW-P` / Piko Agent Runtime V0.3 |
| 父设计 | `system-design` + `piko-skill-memory.md` |
| 上级系统 / 父单元 | `piko-pi-adapter`（M006，本设计下游更新） |
| 解决的问题 | 把 Mem0 能力暴露为 Pi 工具；保证 per-role 隔离不可绕过 |
| 提供的能力 | 两个 `AgentHarnessTool` 实例 + 工厂函数 |
| 主要使用者 | `piko-pi-adapter`（在 AgentHarness.create 时注册） |
| 不负责 | Mem0 HTTP 细节（`piko-mem0-client`）；prompt 措辞（`piko-pi-adapter`） |

## 2. 范围

### 2.1 V0.1 做

- `mem0LookupTool` 工厂函数 → 返回 `AgentHarnessTool`
- `mem0RecordTool` 工厂函数 → 返回 `AgentHarnessTool`
- user_id 在工具 `execute()` 内部从 `toolContext` 构造（agent 看不到）
- TypeBox schema 定义参数
- 工具 `description` 精心写（agent 是否调用，**50% 看这个**）
- Mem0 失败时返回 `content: [{type:"text", text: "memory unavailable"}]`，不阻塞 agent
- 与 `Mem0Adapter` 集成（注入依赖）

### 2.2 V0.1 不做

- 自动触发检测（"是否值得记"由 agent 决定，V0.1 不自动判断）
- 多 Mem0 后端（V0.1 hard-code Mem0）
- 缓存 / dedup / retry（`piko-mem0-client` 范围内 V0.1 也不做）
- 工具 streaming（Mem0 不支持）

## 3. 接口

### 3.1 公开接口

```typescript
// src/skill-tools.ts

import type { AgentHarnessTool } from "<piko>/upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "<piko>/upstream/pi/packages/agent/src/harness/tools/tool-context.ts";
import type { Mem0Adapter, Mem0SearchResult, Mem0AddResult } from "./mem0-client.js";

export interface SkillToolContext {
  /** 当前 agent 实例的 role（来自 RuntimeConfig.identity.role） */
  role: string;
  /** 当前任务所属 project name（来自 TaskRequest.workspace_ref） */
  projectName: string;
  /** 当前任务 ID（用于 metadata 标注，可选） */
  taskId?: string;
}

export interface SkillToolDeps {
  mem0: Mem0Adapter;
  context: SkillToolContext;
}

export function createMem0LookupTool(deps: SkillToolDeps): AgentHarnessTool<
  ExecutionToolContext,
  typeof Mem0LookupSchema,
  Mem0LookupDetails | undefined
>;

export function createMem0RecordTool(deps: SkillToolDeps): AgentHarnessTool<
  ExecutionToolContext,
  typeof Mem0RecordSchema,
  Mem0RecordDetails | undefined
>;
```

### 3.2 工具签名（TypeBox）

```typescript
import { Type } from "typebox";

export const Mem0LookupSchema = Type.Object({
  query: Type.String({
    description:
      "Natural language search query for past skill experience. " +
      "Be specific: include module name, scenario, or failure pattern.",
  }),
  max_results: Type.Optional(
    Type.Number({
      description: "Maximum number of experiences to return. Default 5, max 20.",
      default: 5,
      minimum: 1,
      maximum: 20,
    }),
  ),
});

export const Mem0RecordSchema = Type.Object({
  content: Type.String({
    description:
      "Markdown text describing the lesson learned. Recommended structure: " +
      "## Situation (when this applies), ## Failure (what went wrong), " +
      "## Lesson (what to do instead). Skip if not worth recording.",
    minLength: 10,
  }),
  tags: Type.Optional(
    Type.Array(Type.String(), {
      description: "Optional tags for filtering (e.g., ['async', 'auth', 'race-condition'])",
    }),
  ),
});
```

### 3.3 工具 description（关键，影响调用率）

```typescript
description: "Search past skill experience for the current role in this project. " +
  "Use this when you want to know what has been learned before — e.g., test pitfalls, " +
  "code conventions, project-specific quirks, repeated failures. " +
  "Returns up to N relevant experiences with their original situation / failure / lesson.",
```

```typescript
description: "Record a new lesson learned this task. " +
  "Use when you encountered a pitfall, surprising behavior, or repeated mistake " +
  "worth remembering for next time. Skip routine successes. " +
  "Recommended structure: ## Situation / ## Failure / ## Lesson.",
```

## 4. 行为细节

### 4.1 user_id 构造（核心安全保证）

在工具 `execute()` 内部：

```typescript
async execute(toolCallId, params, onUpdate, toolContext, invocation, context) {
  const userId = `${deps.context.role}:${deps.context.projectName}`;
  // ... 调 mem0.search/add, userId 永远不可被 agent 覆盖
}
```

**agent 看不到 user_id**，无法跨 role / 跨 project 查询。

### 4.2 Mem0 失败处理（不阻塞任务）

```typescript
try {
  const results = await mem0.search(query, userId, options);
  return { content: [{ type: "text", text: JSON.stringify(results) }], details: {...} };
} catch (e) {
  if (e instanceof Mem0ApiError) {
    return {
      content: [{ type: "text", text: `memory unavailable: ${e.code}` }],
      details: { error: e.code, status: e.status },
    };
  }
  throw e;  // 未预期错误向上抛
}
```

agent 收到 "memory unavailable" 文本，决策照常进行——不会因为记忆系统挂了而失败。

### 4.3 metadata 注入（record 时）

```typescript
const metadata = {
  type: "skill_experience",
  role: deps.context.role,
  task_id: deps.context.taskId,
  recorded_at: new Date().toISOString(),
  tags: params.tags ?? [],
};
```

`type` 和 `role` 是固定字段；`task_id` 和 `tags` 来自任务上下文和参数。

## 5. 状态模型

无持久状态。`SkillToolDeps` 持有 Mem0Adapter 引用 + context，每次 `execute()` 重新构造 user_id。

## 6. 失败语义

| 场景 | 行为 |
|---|---|
| `deps.context.role` 为空 | 工厂函数构造时就抛（fail-fast） |
| `deps.context.projectName` 为空 | 同上 |
| `deps.context.projectName` 含 `:` 或其他 user_id 模板不合法字符 | 工厂函数构造时就抛：`Error("projectName must match ^[A-Za-z0-9._-]+$")`（避免 user_id 模板歧义）|
| Mem0 抛 `Mem0ApiError` | 工具返回 `content: [{text: "memory unavailable: <code>"}]`，不抛 |
| Mem0 抛其他错误 | 向上抛（programmer error） |
| query / content 格式错误 | TypeBox schema 校验拦下，agent 收到 schema 错误提示 |
| `mem0_lookup` 返回 0 结果 | 工具返回 `content: [{text: "[]"}]`；agent 必须能处理"无相关经验"语义 |

## 7. 配置 / 依赖注入

skill-tools 不直接读 `RuntimeConfig`。`SkillToolDeps` 由 `piko-pi-adapter`（M006）构造时注入：

```typescript
// 在 pi-runtime.ts 里（更新后的代码）
const skillDeps: SkillToolDeps = {
  mem0: new Mem0Adapter(
    config.identity.memory.base_url ?? "https://api.mem0.ai",
    await resolveSecret(config.identity.memory.api_key_secret_ref),
  ),
  context: {
    role: config.identity.role,
    projectName: task.workspace_ref,
    taskId: task.task_id,
  },
};

const skillTools = [
  createMem0LookupTool(skillDeps),
  createMem0RecordTool(skillDeps),
];
```

`pi-runtime.ts` 已经知道怎么从 `TaskRequest` 拿 `workspace_ref` 和 `task_id`（已有逻辑），不需要新加。

## 8. 实现位置

```
src/skill-tools.ts             # 工具实现
src/skill-tools.test.ts        # 单元测试
```

## 9. 验证

### 9.1 单元测试

- 两个工具的 TypeBox schema 校验（合法 / 非法 input）
- user_id 构造正确（`${role}:${project}`）
- Mem0 失败时不抛，返回 fallback content
- description 字段非空
- parameters schema 与 Pi 兼容（实验 04 已验证模板）

### 9.2 集成测试（V0.1 day-1，必做）

- per-role 隔离：tester agent 调 `mem0_record`，developer agent 调 `mem0_lookup` 看不到
- metadata 保留：写入的 `type` / `role` / `tags` 在 search 回来时一致

## 10. 与现有代码关系

- `piko-mem0-client`（新建）：本设计依赖它
- `piko-pi-adapter`（M006，更新）：本设计上游，要在 `AgentHarness.create` 时注册本工具
- `piko-policy`（M002，更新）：本设计的工具条目要加进 `tool-profiles.json`

## 11. 风险与缓解

| 风险 | 缓解 |
|---|---|
| Agent 不主动调 `mem0_lookup` | description + system prompt 都强调；review checklist 检查 |
| Agent 过度调 `mem0_record` | 描述里强调 "skip routine successes"；V0.1 跑 4 周评估触发命中率 |
| Mem0 失败阻塞 agent | 工具内部 try/catch 转 fallback content（§4.2） |
| user_id 模板泄漏到 agent | user_id 在 execute 内部构造，不出现在 parameters schema |

---

## 附录 A：与 V0.1 spec 的对应

| V0.1 spec 章节 | 本设计对应 |
|---|---|
| §3.1 Skill Experience 定义 | §1 单元摘要 |
| §4.2 Agent 工具 | §3 接口、§4 行为细节 |
| §4.3 触发机制（方式 A agent 主动） | §1 范围（V0.1 agent 自决） |
| §6 集成点 - `src/skill-tools.ts` | §8 实现位置 |
| §6.1 user_id 在 Piko 侧构造 | §4.1 |

## 附录 B：实验结论引用

实验 04（Pi tool 接口）通过 `tsc --noEmit` 验证模板可编译。详见 `experiments/skill-v0.1/04-pi-tool-interface/README.md`。