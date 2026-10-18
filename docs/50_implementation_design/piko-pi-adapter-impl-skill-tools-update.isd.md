<!--
DRAFT — STD cover not generated.
Update to piko-pi-adapter-impl.isd.md for V0.1 skill-tools.
Real env: regenerate full ISD with new-design, incorporating these changes.
-->

# Piko 实现规格：pi-adapter — V0.1 Skill Tools 更新

> **⚠️ DRAFT — STD cover 未生成 + 是 update**。原 ISD 完整，本文件标 V0.1 集成的**精确代码改动**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-pi-adapter-impl-skill-tools-update` |
| Document Version | `0.1.0-draft` |
| Last Modified Date | `2026-10-18` |

---

## 1. 改动文件清单

| 文件 | 改动类型 | 行数预估 |
|---|---|---|
| `src/pi-runtime.ts` | 修改（导入 + 构造函数 + buildSystemPrompt + execute()）| ~50 行新增 / 修改 |
| `src/types.ts` | 修改（`RuntimeConfig.identity` 类型）| ~15 行修改 |
| `src/exec-process.ts` | 修改（启动时 resolve Mem0 api_key + 传给 PiRuntime 构造函数）| ~5 行新增 |
| `config/runtime.example.json` | 修改（加 `identity.memory` 示例块）| ~10 行新增 |

无新文件。

## 2. `src/pi-runtime.ts` 改动

### 2.1 新增 imports

```typescript
// 在文件顶部现有 import 之后加：
import { Mem0Adapter } from "./mem0-client.js";
import { createMem0LookupTool, createMem0RecordTool, type SkillToolDeps } from "./skill-tools.js";
// 注：resolveSecret 不在 pi-runtime 里调 —— 见 §2.b（exec-process.ts）
```

### 2.a `PiRuntime` 构造函数扩展

**位置**：`src/pi-runtime.ts:62`

**当前**：
```typescript
constructor(private config: RuntimeConfig, private registry: ToolRegistry, private store: TaskStore, private channel: Channel, apiKey: string) {
  process.env.PIKO_LLM_API_KEY = apiKey;
  // ...
}
```

**改动**：加 `mem0ApiKey?: string` 参数。在构造时校验 identity 配置 + 缓存 Mem0Adapter 实例。

**新代码**：
```typescript
export class PiRuntime {
  private readonly mem0Adapter: Mem0Adapter | undefined;
  
  constructor(
    private config: RuntimeConfig,
    private registry: ToolRegistry,
    private store: TaskStore,
    private channel: Channel,
    apiKey: string,
    mem0ApiKey?: string,  // V0.1: optional; undefined if config.identity.memory absent
  ) {
    process.env.PIKO_LLM_API_KEY = apiKey;
    
    // V0.1: 构造 Mem0Adapter（启动时一次性）
    if (config.identity?.memory && mem0ApiKey) {
      const baseUrl = config.identity.memory.base_url ?? "https://api.mem0.ai";
      this.mem0Adapter = new Mem0Adapter(baseUrl, mem0ApiKey);
    } else {
      this.mem0Adapter = undefined;
    }
    
    const root = Object.values(config.workspace.roots)[0] ?? process.cwd();
    this.repo = new JsonlSessionRepo({
      fileSystem: new DurableNodeExecutionEnv({ cwd: root }),
      sessionsRoot: config.pi.session_root,
    });
  }
  
  // ... 后续代码
}
```

**关键设计决定**：
- `mem0Adapter` 是 **class 字段**，构造时一次性创建
- 不在 `execute()` 里每任务新建（避免重复创建 + 资源浪费）
- `apiKey` 是必需的 Piko LLM key；`mem0ApiKey` 是可选的 V0.1 skill tools key
- 如果 `config.identity.memory` 配置了但 `mem0ApiKey` 缺失 → fail-fast（构造时即报错）

### 2.b `exec-process.ts` 改动（启动时 resolve Mem0 secret）

**位置**：`src/exec-process.ts:17-37`

**当前**：
```typescript
export async function runExecutionProcess(configPath: string, root: string) {
  const { config, tools } = await loadConfig(configPath, root);
  const store = new TaskStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const llmKey = await resolveSecret(config.llmtier.api_key_secret_ref);
  // ... matrix token resolution ...
  const pi = new PiRuntime(config, tools, store, channel, llmKey);
  // ...
}
```

**改动**：在 LLM key 解析之后，加 Mem0 key 解析 + 传给 PiRuntime 构造函数。

**新代码**：
```typescript
export async function runExecutionProcess(configPath: string, root: string) {
  const { config, tools } = await loadConfig(configPath, root);
  const store = new TaskStore(config.task_store.sqlite_path, config.task_store.busy_timeout_ms);
  const llmKey = await resolveSecret(config.llmtier.api_key_secret_ref);
  
  // V0.1: resolve Mem0 api key at startup (matches existing pattern)
  let mem0ApiKey: string | undefined;
  if (config.identity?.memory) {
    mem0ApiKey = await resolveSecret(config.identity.memory.api_key_secret_ref);
  }
  
  // ... matrix token resolution ...
  const pi = new PiRuntime(config, tools, store, channel, llmKey, mem0ApiKey);
  // ...
}
```

**为什么在启动时 resolve**：
- 与 LLM key、Matrix token 一致（`exec-process.ts:20, 26`）
- 启动失败早暴露（key 配错不会等到任务执行时才报）
- 不在 `execute()` 里每任务 resolve（避免重复 IO + 失败延迟）

### 2.c `buildSystemPrompt` 改动

**位置**：`src/pi-runtime.ts:40-48`

**改动**：
- 参数类型：`identity?: { role, name, memory_root?: string }` → `identity?: { role, name, memory?: MemoryConfig }`
- 实现：`memory_root` 字符串 → `memory` 工具提示

**新代码**（替换 `buildSystemPrompt` 整个函数）：
```typescript
import type { MemoryConfig } from "./types.js";

export function buildSystemPrompt(
  task: TaskRequest,
  identity?: { role: string; name: string; memory?: MemoryConfig },
): string {
  const base =
    "You are Piko, executing one durable task. Work only inside the configured workspace " +
    "and pass workspace-relative paths to tools. Produce requested outputs and finish with " +
    "a concise result summary.\n";
  if (!identity) return base;

  const parts: string[] = [
    `\n\nYou are acting as **${identity.role}**.`,
    `\nYour identity: ${identity.name}.`,
  ];

  if (identity.memory) {
    parts.push(
      `\nYou have access to two skill-experience tools (role-scoped external memory):\n` +
      `  - mem0_lookup(query): search past experience for this role in this project\n` +
      `  - mem0_record(content, tags?): record a lesson when you encounter a pitfall, ` +
      `surprising behavior, or repeated mistake\n` +
      `Use mem0_lookup when starting work that might have known pitfalls. ` +
      `Use mem0_record when you discover something worth remembering for next time. ` +
      `Skip routine successes.`,
    );
  }

  return base + parts.join("") + "\n";
}
```

### 2.3 `available` map 扩展

**位置**：`src/pi-runtime.ts:78`

**当前**：
```typescript
const available: any = {
  read: createReadTool(),
  write: createWriteTool(),
  edit: createEditTool(),
  bash: createBashTool(),
};
```

**改动**：不变（available map 本身不动）。Skill tools 在 `execute()` 内部 per-task 构造，**不在 `available` 顶层**。

原因：skill tools 依赖 `task.workspace_ref` 和 `task.task_id`，这两个是 per-task 的。

### 2.4 `execute()` 加 skillDeps 构造

**位置**：`src/pi-runtime.ts:72` `execute()` 方法开头

**改动**：在 `available` 之前，加 per-task skillDeps 构造：

```typescript
async execute(runId, epoch, task, workspace, isCancelled, onDiscussionReply?) {
  const fileSystem = new DurableNodeExecutionEnv({ cwd: workspace });
  
  // V0.1: per-task skillDeps construction (Mem0Adapter 已在构造时创建，见 §2.a)
  let skillDeps: SkillToolDeps | undefined;
  if (this.config.identity?.memory && this.mem0Adapter) {
    skillDeps = {
      mem0: this.mem0Adapter,
      context: {
        role: this.config.identity.role,
        projectName: task.workspace_ref,
        taskId: task.task_id,
      },
    };
  }
  
  const existing = (await this.repo.list({ cwd: workspace }, BACKGROUND_CONTEXT)).find(x => x.id === runId);
  // ... 后续代码
}
```

**关键改动**：
- **不再调 `resolveSecret`**（已在 §2.b 启动时 resolve 并缓存到 `this.mem0Adapter`）
- **不再新建 `Mem0Adapter`**（复用 `this.mem0Adapter`）
- `skillDeps.context` per-task 构造（`workspace_ref` 和 `task_id` 是 per-task 的）

### 2.d `available` map 扩展

**位置**：`src/pi-runtime.ts:78`

**当前**：
```typescript
const available: any = {
  read: createReadTool(),
  write: createWriteTool(),
  edit: createEditTool(),
  bash: createBashTool(),
};
```

**改动**：不变（available map 本身不动）。Skill tools 在 `execute()` 内部 per-task 构造，**不在 `available` 顶层**。

原因：skill tools 依赖 `task.workspace_ref` 和 `task.task_id`，这两个是 per-task 的。

### 2.e `execute()` 加 skillDeps 构造

**位置**：`src/pi-runtime.ts:72` `execute()` 方法开头

**改动**：在 `available` 之前，加 per-task skillDeps 构造（**复用** `this.mem0Adapter`，不新建）：

```typescript
async execute(runId, epoch, task, workspace, isCancelled, onDiscussionReply?) {
  const fileSystem = new DurableNodeExecutionEnv({ cwd: workspace });
  
  // V0.1: per-task skillDeps construction (Mem0Adapter 已在构造时创建，见 §2.a)
  let skillDeps: SkillToolDeps | undefined;
  if (this.config.identity?.memory && this.mem0Adapter) {
    skillDeps = {
      mem0: this.mem0Adapter,
      context: {
        role: this.config.identity.role,
        projectName: task.workspace_ref,
        taskId: task.task_id,
      },
    };
  }
  
  const existing = (await this.repo.list({ cwd: workspace }, BACKGROUND_CONTEXT)).find(x => x.id === runId);
  // ... 后续代码
}
```

**关键改动**：
- **不再调 `resolveSecret`**（已在 §2.b 启动时 resolve 并缓存到 `this.mem0Adapter`）
- **不再新建 `Mem0Adapter`**（复用 `this.mem0Adapter`）
- `skillDeps.context` per-task 构造（`workspace_ref` 和 `task_id` 是 per-task 的）

### 2.f `available` 加 skill tools

**位置**：`src/pi-runtime.ts:78` 之后，`tools` map 之前

**改动**：
```typescript
const available: Record<string, AgentHarnessTool<any, any, any>> = {
  read: createReadTool(),
  write: createWriteTool(),
  edit: createEditTool(),
  bash: createBashTool(),
};

// V0.1: 注册 skill experience tools
if (skillDeps) {
  available.mem0_lookup = createMem0LookupTool(skillDeps);
  available.mem0_record = createMem0RecordTool(skillDeps);
}

const tools = Object.entries(profile.tools)
  .map(([name, policy]) => available[name] && applyToolRecoveryPolicy(available[name], policy, this.registry))
  .filter(Boolean);
```

### 2.g identity 构造改动

**位置**：`src/pi-runtime.ts:81-83`

**当前**：
```typescript
const identity = this.config.identity ? {
  role: this.config.identity.role,
  name: this.config.identity.name,
  memory_root: this.config.identity.memory_root,
} : undefined;
```

**改动**：
```typescript
const identity = this.config.identity ? {
  role: this.config.identity.role,
  name: this.config.identity.name,
  memory: this.config.identity.memory,
} : undefined;
```

## 3. `src/types.ts` 改动

### 3.1 `MemoryConfig` 类型定义

**位置**：`src/types.ts` 文件底部（在 `PikoError` 之前）

**新增**：
```typescript
export interface MemoryConfig {
  /** V0.1: hard-code "mem0" */
  provider: "mem0";
  /** Secret ref: env:XXX or file:XXX; resolved at startup via config.resolveSecret */
  api_key_secret_ref: string;
  /** Self-hosted base URL; omitted = Cloud (https://api.mem0.ai) */
  base_url?: string;
  /** User ID template; default "${role}:${project_name}" (resolved at runtime) */
  user_id_template?: string;
}
```

### 3.2 `RuntimeConfig.identity` 类型修改

**位置**：`src/types.ts:171-188`

**当前**：
```typescript
identity?: {
  role: string;
  name: string;
  memory_root: string;
  graphrag?: {...};
  gitnexus?: {...};
};
```

**改动**：
```typescript
identity?: {
  role: string;
  name: string;
  /** V0.1: external memory backend config (Mem0) */
  memory: MemoryConfig;
};
```

`graphrag` / `gitnexus` 字段删除（V2+ 再说）。

## 4. `config/runtime.example.json` 改动

**位置**：`config/runtime.example.json`（在文件末尾加 `identity` 块，作为示例）

**当前**：没有 `identity` 字段。

**改动**：在文件末尾的 `}` 之前加 `identity` 块（V0.1 示例，可选）。完整 diff 是把这段 JSON 加进去：

```json
{
  "identity": {
    "role": "developer",
    "name": "alice:developer",
    "memory": {
      "provider": "mem0",
      "api_key_secret_ref": "env:MEM0_API_KEY"
    }
  }
}
```

完整合并示例（基于现有 `runtime.example.json` 结构 + 加 identity 字段）。现有所有顶层字段保持不变。`identity` 是 schema 标记为 optional 的字段，不需要时整块删掉即可。

**Json schema 校验**：用 Ajv 跑 sample config（包含 identity 块）应该 pass；不包含 identity 也 pass。
- 推荐写法：用独立字段 `identity`（不带 `//`），作为可选示例
- 实际启动时如果用户不想用 skill tools，**整块删掉** `identity` 即可（schema 标记 optional）
- `user_id_template` 字段不填时用默认值 `${role}:${project_name}`

**Json schema 校验**：`Ajv` 跑 sample config（包含 identity + memory）应该 pass。

## 5. 不动的部分

- `available` map 不在 PiRuntime 构造时初始化（保持现在的 lazy 模式）
- AgentHarness.create 调用方式不变
- hooks 注册不变
- discussion turn 处理不变
- `toolContext` 不变（skill tools 通过闭包 deps 拿 context，不用 toolContext）

## 6. 受影响的原 ISD 章节

合并回主 ISD 时：

| 主 ISD 章节 | 变更 |
|---|---|
| §X 工具注册 | 按 §2.d-f 加 skill tools |
| §Y system prompt | 按 §2.c |
| §Z 任务入口（execute）| 按 §2.e |
| §W 类型 | 按 §3 |
| §V 配置示例 | 按 §4 |

## 7. 验证

### 7.1 单元测试

- `buildSystemPrompt` 加测试：有 memory 字段 → 输出含 mem0_lookup / mem0_record 提示
- 现有 `buildSystemPrompt` 测试（如果有）继续通过

### 7.2 集成验证（V0.1 day-1）

- per-role 隔离：两个不同 role 实例，互不可见
- 任务执行期间 `mem0_lookup` / `mem0_record` 能正常调
- Mem0 不可达时 agent 任务仍能完成（fallback content）
- `resolveSecret` 失败 → 启动 fail-fast（不进 S5 之后）

---

## 8. 函数规格（详细）

### 8.1 `PiRuntime.constructor`（V0.1 修改后）

**签名**（V0.1 后）：
```typescript
constructor(
  config: RuntimeConfig,
  registry: ToolRegistry,
  store: TaskStore,
  channel: Channel,
  apiKey: string,
  mem0ApiKey?: string
)
```

**参数**：

| 名 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `config` | `RuntimeConfig` | 是 | 完整 runtime config（含 identity） |
| `registry` | `ToolRegistry` | 是 | 工具 profile 注册表 |
| `store` | `TaskStore` | 是 | 任务存储（run 状态） |
| `channel` | `Channel` | 是 | 与 P0 通信的 IPC channel |
| `apiKey` | `string` | 是 | LLM API key（由 caller resolve，**Piko LLM API key**） |
| `mem0ApiKey` | `string` \| undefined | 否 | Mem0 API key（由 exec-process.ts resolve） |

**副作用**：
1. `process.env.PIKO_LLM_API_KEY = apiKey`（现有逻辑）
2. 创建 `this.mem0Adapter`（V0.1 新增，详见下方）
3. 创建 `this.repo = new JsonlSessionRepo(...)`（现有逻辑）

**V0.1 新逻辑 — `mem0Adapter` 构造**：

```typescript
if (config.identity?.memory && mem0ApiKey) {
  const baseUrl = config.identity.memory.base_url ?? "https://api.mem0.ai";
  this.mem0Adapter = new Mem0Adapter(baseUrl, mem0ApiKey);
} else {
  this.mem0Adapter = undefined;
}
```

**判断逻辑**：

| `config.identity?.memory` | `mem0ApiKey` 参数 | `mem0Adapter` 结果 |
|---|---|---|
| undefined | *（忽略）* | `undefined`（skill tools 不挂载） |
| 有 | undefined | **启动 fail**：`config.identity.memory` 已配置但 `mem0ApiKey` 缺失 → `throw new Error("mem0ApiKey required when identity.memory configured")` |
| 有 | 非空字符串 | `new Mem0Adapter(baseUrl, mem0ApiKey)` |
| 有 | 空字符串 `""` | 同上 fail（空串视为缺失） |

**fail-fast 行为**：构造时抛 `Error("mem0ApiKey required when identity.memory configured")`，进程非零退出。**这是故意的**：配了 memory 但缺 key 应该是配置错误，不应该静默禁用 skill tools。

**异常**：上述 fail-fast 错误。`apiKey` 缺失也由调用方保证（exec-process.ts:20 resolve 失败会先抛）。

**线程安全**：N/A（构造同步）。

### 8.2 `PiRuntime.execute`（V0.1 修改后）

**签名**（V0.1 新增的部分）：
```typescript
async execute(
  runId: string,
  epoch: number,
  task: TaskRequest,
  workspace: string,
  isCancelled: () => boolean,
  onDiscussionReply?: (event: string, turn: number, body: string) => Promise<void>
): Promise<PiExecution>
```

**V0.1 新增 block**（在 `execute()` 开头）：

```typescript
let skillDeps: SkillToolDeps | undefined;
if (this.config.identity?.memory && this.mem0Adapter) {
  skillDeps = {
    mem0: this.mem0Adapter,
    context: {
      role: this.config.identity.role,
      projectName: task.workspace_ref,
      taskId: task.task_id,
    },
  };
}
```

**`skillDeps` 各字段来源**：

| 字段 | 来源 | 备注 |
|---|---|---|
| `mem0` | `this.mem0Adapter` | 复用构造时缓存的实例（per-task 不新建） |
| `context.role` | `this.config.identity.role` | 实例级 role |
| `context.projectName` | `task.workspace_ref` | **per-task**（来自 task） |
| `context.taskId` | `task.task_id` | **per-task**（来自 task） |

**约束**：
- `task.workspace_ref` 必须非空且匹配 `^[A-Za-z0-9._-]+$`（skill-tools 工厂会 fail-fast）
- 如果 `task.workspace_ref` 含 `:`，skill-tools 工厂抛 `Error`，**整任务执行失败**

**返回**：`skillDeps` 供后续 `available` map 构造 skill tools 用。

### 8.3 `buildSystemPrompt`（V0.1 修改后）

**签名**：
```typescript
export function buildSystemPrompt(
  task: TaskRequest,
  identity?: { role: string; name: string; memory?: MemoryConfig }
): string
```

**参数**：

| 名 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `task` | `TaskRequest` | 是 | 当前任务（V0.1 不读其字段，但保留以备将来） |
| `identity` | `IdentityParams` \| undefined | 否 | agent identity（见下） |

**`identity` 字段**：

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `role` | `string` | 是 | agent 角色 |
| `name` | `string` | 是 | agent human-readable identity |
| `memory` | `MemoryConfig` \| undefined | 否 | 如果有，注入 skill tools 提示 |

**返回值**：`string`（最终拼好的 system prompt）。

**输出结构**（`identity.memory` 存在时）：
```
You are Piko, executing one durable task. Work only inside the configured workspace
and pass workspace-relative paths to tools. Produce requested outputs and finish with
a concise result summary.

You are acting as **${role}**.

Your identity: ${name}.

You have access to two skill-experience tools (role-scoped external memory):
  - mem0_lookup(query): search past experience for this role in this project
  - mem0_record(content, tags?): record a lesson when you encounter a pitfall,
surprising behavior, or repeated mistake
Use mem0_lookup when starting work that might have known pitfalls.
Use mem0_record when you discover something worth remembering for next time.
Skip routine successes.
```

**输出结构**（`identity.memory` 不存在时）：
```
You are Piko, executing one durable task. Work only inside the configured workspace
and pass workspace-relative paths to tools. Produce requested outputs and finish with
a concise result summary.

You are acting as **${role}**.

Your identity: ${name}.
```

**输出结构**（`identity` undefined）：只返回 base（无 role/identity 行）。

**内部流程**：
1. 构造 `base` 字符串（task instruction 前缀）
2. 如果 `!identity` → 返回 `base`
3. 构造 `parts: string[]`：
   - `\n\nYou are acting as **${identity.role}**.`
   - `\nYour identity: ${identity.name}.`
4. 如果 `identity.memory` 存在 → push skill tools 提示
5. 返回 `base + parts.join("") + "\n"`

**副作用**：无（pure function）。

**线程安全**：✅ N/A。

**示例**：
```typescript
// 有 memory
buildSystemPrompt(task, {
  role: "tester",
  name: "alice:tester",
  memory: { provider: "mem0", api_key_secret_ref: "env:MEM0" },
});
// 输出含 mem0_lookup / mem0_record 提示

// 无 memory
buildSystemPrompt(task, {
  role: "tester",
  name: "alice:tester",
});
// 输出无 skill tools 提示（即使 config.identity 有，但 buildSystemPrompt 不直接看 config）
```

### 8.4 `exec-process.ts:runExecutionProcess`（V0.1 修改后）

**改动**：`mem0ApiKey` 解析 + 传给 PiRuntime。

**新增逻辑**（在 `llmKey` 解析之后）：

```typescript
let mem0ApiKey: string | undefined;
if (config.identity?.memory) {
  mem0ApiKey = await resolveSecret(config.identity.memory.api_key_secret_ref);
}
```

**`resolveSecret` 行为**：
- 输入：`api_key_secret_ref: string`（格式 `"env:VAR_NAME"` 或 `"file:/path"`）
- 输出：`Promise<string>`（已解析的 secret）
- 异常：找不到时抛 `Error("missing env secret VAR_NAME")` 或 `Error("...")`
- 失败时进程非零退出（exec-process.ts:17 启动失败）

**传给 PiRuntime**：
```typescript
const pi = new PiRuntime(config, tools, store, channel, llmKey, mem0ApiKey);
```

**位置**：`src/exec-process.ts:20`（`llmKey` 解析）之后，`matrix` 解析之前。

### 8.5 数据结构字段详情

**`MemoryConfig`**（V0.1 新增类型）：

| 字段 | 类型 | 必现 | 含义 | 约束 |
|---|---|---|---|---|
| `provider` | `"mem0"` | ✅ | V0.1 hard-code | enum 限制 `"mem0"` |
| `api_key_secret_ref` | `string` | ✅ | Secret ref | 格式 `"env:XXX"` 或 `"file:XXX"` |
| `base_url` | `string` \| undefined | ❌ | 自托管 URL | 必须以 `http://` 或 `https://` 开头；缺省 → Cloud |
| `user_id_template` | `string` \| undefined | ❌ | 模板 | V0.1 不解析；保留供将来 |

**`RuntimeConfig.identity`**（V0.1 修改后）：

| 字段 | 类型 | 必现 | 含义 |
|---|---|---|---|
| `role` | `string` | ✅ | agent role |
| `name` | `string` | ✅ | human-readable identity |
| `memory` | `MemoryConfig` | ✅ | V0.1 必须有 memory（如配 identity） |

**删除**（V0.1）：`memory_root` / `graphrag` / `gitnexus`。

### 8.6 PiRuntime 实例字段

**V0.1 新增字段**：

```typescript
private readonly mem0Adapter: Mem0Adapter | undefined;
```

**含义**：
- `undefined` → skill tools 不挂载（无 identity 配置）
- `Mem0Adapter` 实例 → skill tools 挂载（identity 配置且 mem0ApiKey 有效）

**生命周期**：与 PiRuntime 实例同。构造时初始化，关闭时不显式释放（无 mutable state）。