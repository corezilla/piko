<!--
DRAFT — STD cover not generated.
Update to piko-pi-adapter-design.md for V0.1 skill-tools integration.
-->

# Piko 模块设计：pi-adapter — V0.1 Skill Tools 更新

> **⚠️ DRAFT — STD cover 未生成 + 是 update 而非完整 design**。原 `piko-pi-adapter-design.md`（1645 行）覆盖 M006 全貌。本文件只标 V0.1 skill-tools 集成的**精确变更点**。真实环境：用 `new-design` 重新生成完整 pi-adapter design（带 skill-tools 章节），跑 validate-design。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-pi-adapter-skill-tools-update` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Project | `piko` |
| Parent Document ID | `piko-skill-memory`（system design mechanism） |
| Last Modified Date | `2026-10-18` |

---

## 1. 变更目标

V0.1 skill-tools 集成需要修改 4 处：

1. **`PiRuntime` 构造函数** — 接 `mem0ApiKey?` 参数，启动时一次性创建 `Mem0Adapter`（对齐现有 LLM/Matrix token 启动时 resolve 的模式）
2. **`buildSystemPrompt`** — 替换 `memory_root` 提示为 mem0 工具提示
3. **`execute()` 方法** — per-task 构造 `skillDeps.context`（不复用 Mem0Adapter）
4. **`exec-process.ts`** — 启动时 resolve Mem0 api_key + 传给 `PiRuntime` 构造函数
5. **`config/runtime.example.json`** — 加 `identity.memory` 示例块

## 2. `PiRuntime` 构造函数扩展

**位置**：`src/pi-runtime.ts:62`

**当前**：
```typescript
constructor(private config: RuntimeConfig, private registry: ToolRegistry, private store: TaskStore, private channel: Channel, apiKey: string) {
  process.env.PIKO_LLM_API_KEY = apiKey;
  // ...
}
```

**变更后**：
```typescript
export class PiRuntime {
  private readonly mem0Adapter: Mem0Adapter | undefined;
  
  constructor(
    private config: RuntimeConfig,
    private registry: ToolRegistry,
    private store: TaskStore,
    private channel: Channel,
    apiKey: string,
    mem0ApiKey?: string,  // V0.1: optional
  ) {
    process.env.PIKO_LLM_API_KEY = apiKey;
    
    // V0.1: 启动时一次性创建 Mem0Adapter（对齐 LLM/Matrix token 的 resolve 模式）
    if (config.identity?.memory && mem0ApiKey) {
      const baseUrl = config.identity.memory.base_url ?? "https://api.mem0.ai";
      this.mem0Adapter = new Mem0Adapter(baseUrl, mem0ApiKey);
    } else {
      this.mem0Adapter = undefined;
    }
    
    // ... 现有构造逻辑（sessionsRoot 等）
  }
}
```

**关键设计决定**：

- `mem0Adapter` 是 class 字段，**启动时一次性创建**
- 不在 `execute()` 里每任务新建（避免资源浪费）
- 如果 `config.identity.memory` 配置存在但 `mem0ApiKey` 缺失 → fail-fast（构造时就报错）
- 如果 `config.identity.memory` 不存在 → `mem0Adapter` 为 `undefined`，skill tools 不挂载（V0.1 graceful degradation）

## 3. `exec-process.ts` 改动（启动时 resolve Mem0 secret）

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

**变更**：在 LLM key 解析之后加 Mem0 key 解析，传给 `PiRuntime` 构造函数：

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

- 与 LLM key（`exec-process.ts:20`）、Matrix token（`exec-process.ts:26`）一致
- 启动失败早暴露：key 配错不会等到任务执行时才报
- 不在 `execute()` 里每任务 resolve：避免重复 IO + 失败延迟

## 4. `execute()` 加 per-task skillDeps

**位置**：`src/pi-runtime.ts:72` `execute()` 方法开头

**变更**：在 `available` 之前，加 per-task skillDeps 构造（**复用** `this.mem0Adapter`）：

```typescript
async execute(runId, epoch, task, workspace, isCancelled, onDiscussionReply?) {
  const fileSystem = new DurableNodeExecutionEnv({ cwd: workspace });
  
  // V0.1: per-task skillDeps (Mem0Adapter 已在构造时创建)
  let skillDeps: SkillToolDeps | undefined;
  if (this.config.identity?.memory && this.mem0Adapter) {
    skillDeps = {
      mem0: this.mem0Adapter,  // 复用，不是新建
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

**关键点**：

- **不调 `resolveSecret`**（已在启动时 resolve 并缓存到 `this.mem0Adapter`）
- **不复用 `Mem0Adapter`**（每次 execute 复用 `this.mem0Adapter`）
- `skillDeps.context` per-task 构造（`workspace_ref` 和 `task_id` 是 per-task 的）

## 5. `available` map 加 skill tools

**位置**：`src/pi-runtime.ts:78` 之后

**当前**：
```typescript
const available: any = {
  read: createReadTool(),
  write: createWriteTool(),
  edit: createEditTool(),
  bash: createBashTool(),
};
```

**变更**：类型收紧 + 加 skill tools：

```typescript
const available: Record<string, AgentHarnessTool<any, any, any>> = {
  read: createReadTool(),
  write: createWriteTool(),
  edit: createEditTool(),
  bash: createBashTool(),
};

// V0.1: 注册 skill experience tools（仅当 skillDeps 存在时）
if (skillDeps) {
  available.mem0_lookup = createMem0LookupTool(skillDeps);
  available.mem0_record = createMem0RecordTool(skillDeps);
}

const tools = Object.entries(profile.tools)
  .map(([name, policy]) => available[name] && applyToolRecoveryPolicy(available[name], policy, this.registry))
  .filter(Boolean);
```

## 6. `buildSystemPrompt` 改动

**当前**（`src/pi-runtime.ts:40-48`）：
```typescript
export function buildSystemPrompt(task: TaskRequest, identity?: { role: string; name: string; memory_root?: string }): string {
  const base = "You are Piko, executing one durable task. Work only inside the configured workspace and pass workspace-relative paths to tools. Produce requested outputs and finish with a concise result summary.\n";
  if (identity) {
    const parts = [`\n\nYou are acting as **${identity.role}**.`, `\nYour identity: ${identity.name}.`];
    if (identity.memory_root) parts.push(`\nYour memory directory: ${identity.memory_root}.`);
    return base + parts.join("") + "\n";
  }
  return base;
}
```

**变更后**：
```typescript
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

**关键变更**：

- 参数类型：`identity.memory_root` → `identity.memory: MemoryConfig`
- 实现：`memory_root` 提示字符串 → mem0 工具使用提示
- 强调 "role-scoped"——agent 知道经验是 per-role 隔离的

### 6.1 调用方改动

**位置**：`src/pi-runtime.ts:81-83`

```typescript
// 改后
const identity = this.config.identity ? {
  role: this.config.identity.role,
  name: this.config.identity.name,
  memory: this.config.identity.memory,  // 新字段
} : undefined;
```

## 7. `config/runtime.example.json` 改动

**位置**：`config/runtime.example.json`（在文件末尾加 `identity` 块）

**当前**：没有 `identity` 字段。

**变更**：在文件末尾的 `}` 之前加 `identity` 块（V0.1 示例，可选）。完整 diff 是把这段 JSON 加进去：

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

完整合并示例（基于现有 `runtime.example.json` 结构 + 加 identity 字段）。现有所有顶层字段（instance_id、listen、api_auth、task_store、pi、agent、workspace、tools、matrix、llmtier、queue、retention、observability、transfer）**保持不变**。

**说明**：

- `identity` 块是 V0.1 skill-tools 配置示例
- 用户不用 skill tools 时**整块删掉** `identity`（schema 标记 optional）
- `user_id_template` 字段不填时用默认值 `${role}:${project_name}`
- `api_key_secret_ref` 用现有 `env:XXX` / `file:XXX` 机制

## 8. 与现有模块的关系

| 模块 | 关系 |
|---|---|
| `piko-mem0-client`（新建）| 本更新依赖 |
| `piko-skill-tools`（新建）| 本更新依赖 |
| `piko-policy`（M002，更新）| 配套 — `tool-profiles.json` 加新工具条目 |
| `piko-bootstrap`（M000）| 不动 |
| `piko-task-repository`（M003）| 不动 |
| `piko-exec-process`（P1 entrypoint）| 本更新 §3 改动 |

## 9. 受影响的 §X（原 design 章节）

合并回主 design 时，更新这些章节：

| 主 design 章节 | 变更 |
|---|---|
| §X PiRuntime 构造 | 按 §2 替换 |
| §Y system prompt | 按 §6 替换 |
| §Z 任务执行入口（execute）| 按 §4 替换 |
| §W 配置 | 按 §7 + 接口契约文档 |
| §V P1 entrypoint | 按 §3 |

## 10. 风险

| 风险 | 缓解 |
|---|---|
| `resolveSecret` 失败 → 启动失败（fail-fast） | 已设计：跟现有 secret 解析一致 |
| Skill tools 不可用时 agent 仍能跑（fallback） | 已设计：Mem0 错误转 fallback content，不抛 |
| `task.workspace_ref` 缺失 / 为空 | buildSystemPrompt 仍跑；skill tools execute 时抛 "user_id required" |
| 多任务并发时 Mem0Adapter 共享 | 共享同一个 `this.mem0Adapter`（无状态，HTTP client 是 stateless）|

---

## 附录：完整任务清单（V0.1 实施时）

```bash
# 1. types.ts
# 添加 MemoryConfig 类型
# RuntimeConfig.identity: memory_root → memory: MemoryConfig

# 2. config.ts
# resolveSecret 已存在，无改动
# knownTools Set 加 mem0_lookup, mem0_record（详见 piko-policy-design-skill-tools-update.md）

# 3. pi-runtime.ts
# - import: Mem0Adapter, createMem0LookupTool, createMem0RecordTool, SkillToolDeps
# - constructor: 加 mem0ApiKey 参数 + mem0Adapter 字段初始化
# - execute(): 按 §4 加 per-task skillDeps
# - available map: 按 §5 加 skill tools + 类型收紧
# - buildSystemPrompt: 按 §6 改
# - identity 构造: 按 §6.1 改

# 4. exec-process.ts
# - resolve mem0ApiKey at startup
# - 传给 PiRuntime 构造函数

# 5. config/tool-profiles.json
# - workspace-standard / workspace-exec profile 各加 mem0_lookup / mem0_record 条目
# - effect: "external", replay: "never", permissions.network_hosts: ["api.mem0.ai"]

# 6. interfaces/schemas/piko-runtime-config-v0.3.schema.json
# - 加 identity 字段定义（详见 piko-skill-tools-identity-contract-v0.1.md）

# 7. config/runtime.example.json
# - 加 identity.memory 示例块
```

每条对应 `piko-skill-memory.md` §6 集成点 + `piko-policy-design-skill-tools-update.md` §3 + `piko-skill-tools-identity-contract-v0.1.md`。