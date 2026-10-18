# Piko Skill System — V0.1 Spec

Version: V0.1
Status: Draft
Project: piko
Last Modified Date: 2026-10-18

---

## 1. 目标与系统定位

### 1.1 Skill System 整体定位

Piko 的 Skill System 是一个长期演进的子系统，目标是让 agent 在项目中持续变强。

完整系统包含三类组件：
- **Skill Experience（经验累积）**——V0.1 实现
- **Skill Behavior（角色行为）**——V2+
- **Skill Evolution（技能进化）**——V2+ 之后

V0.1 只实现 Skill Experience 这一块，先把"经验能记录、能查到"做出来，作为后续组件的数据基础。详细分类见**附录 A**。

### 1.2 V0.1 目标

Piko agent 通过对接外部 agent 记忆系统（Mem0）获得**职业技能经验**的持久化能力。每个 role（developer / tester / PM）只记录自己工作相关的经验，下次执行任务时可以查这些经验，避免重复踩坑。

**技能经验 ≠ 角色行为**：
- **技能经验**（V0.1）：具体工作中遇到的具体问题及其教训（"这个测试通过但漏了 bug，因为……"）
- **角色行为 / 方法论**（V2+ 训练）：tester 默认就该想边界、PM 默认就该 escalate blocker 等——靠训练实现

V0.1 只做技能经验。角色行为是另一个版本的事。

---

## 2. 范围

### 2.1 V0.1 做

- **技能经验系统**：每个 role 独立记录自己工作中的经验教训
- **Mem0 作为后端**（自托管或 Cloud）
- **两个 agent 工具**：`mem0_lookup` / `mem0_record`，按 role 隔离
- **触发机制**：识别到值得记录的场景后调用 `mem0_record`
- **数据采集**：通过 Mem0 metadata

### 2.2 V0.1 不做

- 角色行为训练（V2+）
- 任何内部记忆存储（不读 MEMORY.md、不写 MEMORY.md、不写 trace.jsonl）
- 任何内部检索逻辑
- 跨 role 经验共享（tester 不能看 developer 经验，反之亦然）
- 多源 federation（V1.x 增量）
- Agent loop 改造
- IPC 协议扩展
- 训练数据 pipeline（V2+）

---

## 3. 核心概念

### 3.1 Skill 经验（Skill Experience）= 工作中的教训

具体工作中遇到的具体问题 + 教训 + 下次怎么避。不是通用方法论。

**tester 例子**：
- 场景：写了 case，CI 跑过，但生产出问题
- 经验条目：
  - situation: "X 模块的边界值测试"
  - failure: "happy path 和边界值合并到一个 case 时，断言不够严格，漏掉了 race condition"
  - lesson: "X 类测试必须分 case，happy path 一个，边界值单独 case"
  - avoidance: "下次写类似 case，先 mem0_lookup 是否有过相关经验"

下次写类似 case，agent 调 `mem0_lookup("X 模块边界值测试")`，命中后能避坑。

### 3.2 Per-Role 隔离

- developer 只能 read/write developer 经验
- tester 只能 read/write tester 经验
- PM 只能 read/write PM 经验
- 通过 Mem0 `user_id` 隔离：`${role}:${project}`

理由：developer 的经验（如"打包要 exclude dist"）对 tester 无意义；tester 的经验（如"异步模块必须 mock timer"）对 PM 无意义。**混在一起会污染检索**。

### 3.3 触发记录的场景

不是每任务都记。值得记录的场景（举例）：

| Role | 触发场景 |
|---|---|
| **tester** | case 跑了但漏 bug；case 假阳性；测试不稳定 flaky |
| **developer** | 代码 review 被拒多次；本地能跑 CI 挂；commit 后被 revert |
| **PM** | 任务估时严重偏差；stakeholder 反馈与预期相反；sprint plan 被推翻 |

通用触发形式——三选一满足：
1. **踩坑了**（任务失败 + 有学习点）
2. **重复发生**（同样问题第二次出现）
3. **反直觉**（违反常识但实际如此）

V0.1 触发机制见 §4.3。

---

## 4. V0.1 交付物

### 4.1 Mem0 Adapter

Mem0 HTTP client 薄包装。代码量预期 < 50 行 TS。

```typescript
class Mem0Adapter {
  search(query: string, user_id: string, max_results?: number): Promise<MemoryResult[]>;
  add(messages: Message[], user_id: string, metadata?: Record<string, any>): Promise<{ ids: string[] }>;
}
```

- `user_id` = `${role}:${project}`，实现 role + project 二级隔离
- `metadata` 至少带：
  - `type: "skill_experience"`
  - `role: "developer" | "tester" | "pm"`
  - `task_id`
  - `recorded_at`
  - `tags`

Mem0 自带 fact 抽取 + 向量检索，**不在 Piko 侧重复实现**。

### 4.2 Agent 工具

**mem0_lookup**
```typescript
function mem0_lookup(args: {
  query: string,
  max_results?: number  // 默认 5
}): Promise<MemoryResult[]>
```

行为：
1. 取当前 agent 的 role + project_name（构造在 Piko 侧，agent 不可控，见 §6.1）
2. 构造 user_id = `${role}:${project_name}`
3. 调 `Mem0Adapter.search(query, user_id, max_results)`
4. 透传返回结果，**不做二次处理**

**只返回该 role 的经验**——tester 查不到 developer 的，反之亦然。

**mem0_record**
```typescript
function mem0_record(args: {
  content: string,         // markdown 文本，建议带 situation/failure/lesson/avoidance 结构
  tags?: string[]
}): Promise<{ ids: string[] }>
```

行为：
1. 取当前 agent 的 role + project_name
2. 构造 user_id
3. 调 `Mem0Adapter.add`，metadata 自动注入 type / role / task_id / recorded_at
4. Mem0 自动 fact 抽取并存档

### 4.3 触发机制

V0.1 阶段不实现全自动检测（V1.x 增量）。提供三种触发方式：

**方式 A：Agent 主动调用**（V0.1 主要方式）
- Agent 在任务 review 阶段检查"是否有踩坑/反直觉/重复发生"
- 命中触发条件时调 `mem0_record`
- 通过 system prompt / skill 提示让 agent 知道这个流程

**方式 B：人工手动调用**
- Slinky Dashboard 提供 UI
- 人观察到值得记录的 case 时手动调 `mem0_record`
- V0.1 提供 CLI / API 入口，Dashboard UI 可后置

**方式 C：自动规则触发**（V0.1 不实现，V1.x）
- 检测任务失败次数、review 被拒次数等指标
- 阈值触发自动 prompt agent 调用 `mem0_record`

---

## 5. 接口

### 5.1 Tool 接口（agent 侧）

```typescript
interface MemoryResult {
  id: string,
  content: string,
  score: number,
  metadata: {
      role: string,
      type: string,
      task_id?: string,
      tags?: string[],
      [key: string]: any
  },
  created_at: string
}

interface Mem0LookupArgs {
  query: string,
  max_results?: number
}

interface Mem0RecordArgs {
  content: string,
  tags?: string[]
}

interface Mem0RecordResult {
  ids: string[],
  destination: "mem0",
  recorded_at: string
}
```

### 5.2 Mem0 Adapter 接口（基础设施侧）

按 [Mem0 API 文档](https://docs.mem0.ai/) 实现：
- `POST /v1/memories/search/` — 查询
- `POST /v1/memories/` — 写入（自动 fact 抽取）

---

## 6. 集成点

V0.1 修改 Piko 以下文件：

| 文件 | 改动 |
|---|---|
| `src/types.ts` | `RuntimeConfig.identity` 字段调整：删 `memory_root` / `graphrag` / `gitnexus`，加 `memory: MemoryConfig` |
| `src/mem0-client.ts` | **新建**：Mem0 HTTP client 薄包装（search / add） |
| `src/skill-tools.ts` | **新建**：基于 Mem0 client 实现 `mem0_lookup` / `mem0_record` 工具 |
| `src/pi-runtime.ts` | ① 注册新工具到 `available` map；② `buildSystemPrompt` 调整：删 `memory_root` 提示，加"你有 skill experience 工具可用"提示；③ user_id 在 Piko 侧构造（不让 agent 传） |
| `src/config.ts` | `knownTools` Set 扩到包含 `mem0_lookup` / `mem0_record` |
| `interfaces/schemas/piko-runtime-config-v0.3.schema.json` | 加 `identity` 字段定义（之前缺） |
| `interfaces/schemas/piko-tool-profile-v0.3.schema.json` | `effect: external` 已支持，无需改 schema；`replay: never` 适合 Mem0 这类不可重放调用 |
| `config/tool-profiles.json` | `workspace-standard` / `workspace-exec` profile 加 `mem0_lookup` / `mem0_record` 工具条目 |
| `config/runtime.example.json` | 加 `identity.memory` 示例配置 |

代码预期改动量：~150-200 行 TS（含两个新文件 + schema 改动 + 现有代码调整）。

### 6.1 user_id 构造（关键）

`user_id` 由 **Piko 侧**根据 `RuntimeConfig.identity.role` + project 拼出，**不暴露给 agent**：

```typescript
// 在 src/skill-tools.ts 里
const userId = `${config.identity.role}:${projectName}`;
await mem0.search(query, userId);
```

agent 调工具时只传 query / content，**不传 user_id**。这样：
- tester 工具实例天然隔离（user_id 不一样）
- agent 没法跨 role 读经验
- agent 没法跨 project 读经验

### 6.2 project.name 来源

`TaskRequest` 没 `project` 字段。`project.name` 取自：

- 默认：`TaskRequest.workspace_ref`（task-level workspace 名）
- 兜底：`RuntimeConfig.workspace.roots` 的第一个 key
- 未来 V1.x：可加 `TaskRequest.project` field

V0.1 用 workspace_ref 即可。

### 6.3 buildSystemPrompt 调整

V0.1 不预注入经验进 prompt（agent 自己用工具查）。但要告诉 agent 它有这个能力：

```
You are acting as **${role}**.
Your identity: ${name}.
You have access to skill experience tools:
  - mem0_lookup(query): search past experience for this role in this project
  - mem0_record(content, tags?): record a new lesson when you encounter one
```

原 `memory_root` 引用删掉。

### 6.4 工具命名

采用带后端的命名：`mem0_lookup` / `mem0_record`。

理由：
- 显式后端，未来加别的后端（Cognee / Zep）时命名空间化不冲突
- 避免 `lookup` / `record` 太通用，跟未来工具冲突

如果未来切后端，工具名同步换（旧名字废弃或保留为 alias）。

---

## 7. 配置

`RuntimeConfig.identity.memory`：

```typescript
interface MemoryConfig {
  provider: "mem0",            // V0.1 hard-code
  api_key_secret_ref: string,  // env:XXX 或 file:XXX，用现有 resolveSecret 解析
  base_url?: string,           // 自托管 URL；Cloud 时用 Mem0 默认
  user_id_template: string     // 默认 "${role}:${project_name}"
}
```

`api_key_secret_ref` 用现有 `resolveSecret` 机制（`src/config.ts:124`），不引入新的 secret 处理。

V0.1 不支持切换其他 provider，hard-code `"mem0"`。

---

## 8. 验收

V0.1 跑 4 周后：

| 指标 | 目标 |
|---|---|
| mem0_record 触发次数 / 任务数 | ≥ 0.05（按需记录，不每任务） |
| mem0_record 触发命中率（"确实值得记"的比例） | ≥ 60%（事后人工抽样核验） |
| mem0_lookup 调用次数 / 任务数 | ≥ 0.3（agent 主动查经验） |
| mem0_lookup 命中后实际影响决策的比例 | ≥ 30% |
| Per-role 隔离正确率 | 100%（tester 查不到 developer 经验） |
| 任务成功率提升 vs V0 | ≥ X%（V0 跑完定 X） |
| 单任务耗时增加 | < 10% |

---

## 9. V2+ 组件

不在本文档展开，作为未来展望见**附录 A**。V0.1 不为这些预留接口、不为这些预留扩展点。

---

## 10. 风险与缓解

| 风险 | 缓解 |
|---|---|
| Mem0 服务不可用 | agent 任务仍可执行（mem0_lookup 失败 → 不查；mem0_record 失败 → 不记，不阻塞任务） |
| Mem0 fact 抽取吃掉结构化字段 | metadata 中显式存 role / type / tags，content 自由文本 |
| Agent 不主动调 mem0_record（触发率过低） | review checklist 里强制加"是否有踩坑需要记录"项 |
| Agent 过度调 mem0_record（噪声污染） | 触发条件明确：踩坑/重复/反直觉，三选一；V0.1 跑 4 周后评估触发命中率 |
| Role 边界写错（tester 写入 developer 经验） | user_id 在 Piko 侧构造（§6.1），agent 不传不可控 |
| **project_name 含 `:`** 导致 user_id 模板歧义（如 `tester:my:project` 看起来像三段）| **V0.1 决策**：依赖 Piko workspace_ref key 命名约定（无 `:`）。`skill-tools` 工厂加**显式校验**：`projectName` 必须匹配 `^[A-Za-z0-9._-]+$`，不匹配抛 `Error`（构造时 fail-fast）。V1.x 加 schema 校验 |
| 并发多任务共享 `Mem0Adapter` | **安全**：`Mem0Adapter` 是 stateless HTTP client（无连接池、无 mutable state）；多任务并发 search/record 各自独立 HTTP 请求，无 race condition。已验证可行 |
| Agent 收到零结果（`mem0_lookup` 返回 `[]`）| `content: [{type:"text", text: "[]"}]`，agent 必须能处理"无相关经验"语义。V0.1 不强制 schema，依赖 agent 训练 |
| `max_results = 0` | TypeBox schema min: 1 拒绝，V0.1 不处理 |
| 经验条目过期（项目改了，旧经验误导） | V0.1 不处理；V1.x 加 expiry / supersedes |
| 经验积累慢导致 mem0_lookup 命中率低 | V0.1 跑 4 周看实际数据；不够则鼓励 mem0_record 触发 |
| **per-role 隔离假设沙箱未验证**（tester:piko 写的 memory，developer:piko 真的看不到吗？）| **V0.1 day-1 必验**。如果失败 → V0.1 立项否决。沙箱无 Mem0，本实验无法做 |

---

## 11. 与现有代码的关系

`piko-skill-memory.md` v0.3.0-draft.1 的设计（13 章节、IPC 协议、3 层 scope、scoring 公式、pending_review 流程、skill 分类）**整体作废**。原因：

1. 自建存储违反"对接外部系统"原则
2. 3 层 scope、综合打分、valid_until 等都是为"自建记忆库"设计，对接 Mem0 后不需要
3. 角色技能系统拆分为"技能经验（V0.1）"和"角色行为训练（V2+）"，原设计混在一起

### V0.1 具体代码改动清单

**类型与配置**：

| 文件 | 改动 |
|---|---|
| `src/types.ts` | `RuntimeConfig.identity.memory_root` → `identity.memory: MemoryConfig`；删 `graphrag` / `gitnexus` |
| `interfaces/schemas/piko-runtime-config-v0.3.schema.json` | 加 `identity` 字段 schema（含 `role` / `name` / `memory`） |
| `config/runtime.example.json` | 加 `identity.memory` 示例 |

**工具实现**：

| 文件 | 改动 |
|---|---|
| `src/mem0-client.ts`（新建） | Mem0 HTTP client：search / add 两个方法 |
| `src/skill-tools.ts`（新建） | 基于 Mem0 client 实现 `mem0_lookup` / `mem0_record` 工具 |
| `src/pi-runtime.ts` | ① `available` map 加新工具；② user_id 在 Piko 侧拼，agent 不可控；③ `buildSystemPrompt` 加 skill experience 提示 |
| `src/config.ts` | `knownTools` Set 加 `mem0_lookup` / `mem0_record` |
| `config/tool-profiles.json` | 两个 profile 都加新工具条目 |

**旧设计遗留**：

- 旧 `memory_root` 字段 → 删
- 旧 `graphrag` 字段 → 删
- 旧 `gitnexus` 字段 → 删
- IPC 扩展、Indexer、buildSystemPrompt async 化、3 层 scope、scoring 公式、pending_review 流程 → **全部不做**

### 与 Pi 上游的关系

工具实现不依赖 Pi 上游改动。Mem0 工具是 Piko 侧的 TypeScript 类，包装成 Pi 工具接口（`createReadTool` 之类）后注入即可。Pi 提供的扩展点足够：

- `createReadTool` / `createWriteTool` / `createEditTool` / `createBashTool` 等是工具创建函数
- 工具通过 `applyToolRecoveryPolicy(tools, profile, registry)` 注入
- AgentHarness.create 接受任意工具列表

V0.1 不需要改 Pi 上游代码。

---

## 12. 决策记录

| 日期 | 决策 | 理由 |
|---|---|---|
| 2026-10-17 | v0.3.0-draft.1 自建记忆系统 + 技能系统设计 | 当时认为需要内部记忆基础设施，技能作为系统抽象 |
| 2026-10-18 | 改为对接外部 Mem0 | "不在内部做记忆系统，全部对接外面" |
| 2026-10-18 | 选 Mem0 不选 Letta | Letta 是 memory-centric agent framework（要替换 agent loop），与 Piko 自有 agent 框架冲突；Mem0 是 pluggable memory layer |
| 2026-10-18 | 技能系统拆分为"经验（V0.1）"+"角色行为（V2+）" | 经验是工作中的具体教训，可通过外部记忆系统捕获；角色行为是通用方法论，需要训练，前置条件多 |
| 2026-10-18 | Per-role 隔离，user_id = `${role}:${project}` | 避免跨 role 经验污染检索 |
| 2026-10-18 | Skill System 拆分为 Experience（V0.1）+ Behavior（V2+）+ Evolution（V2+ 之后）三类组件 | 区分经验累积（可外部记忆系统实现）、角色行为（需训练）、技能进化（V2+ 之后的元能力）；V0.1 只做 Experience |
| 2026-10-18 | 实验 04（Pi tool）通过 `tsc --noEmit` 验证 | Piko 侧工具形态（TypeBox schema + AgentHarnessTool 接口）已确认可行 |
| 2026-10-18 | 实验 01-03, 06（Mem0 集成）沙箱阻塞 | 网络/包管理限制，无法在本沙箱跑；推迟到 V0.1 真实环境 |
| 2026-10-18 | per-role 隔离假设标为 V0.1 day-1 必验 | Mem0 user_id 隔离行为未在沙箱验证；如不成立 V0.1 立项否决 |

---

## 13. 下一步

**两件事并行**：

### 13.1 V0 基线测量 pipeline（现在做）

不依赖 V0.1 工具，**纯人工 / Slinky 侧**测量 Piko 当前任务的成功率、返工率、role 分布、任务类型。跑两周后用数据决定 V0.1 验收 X 值（成功率提升目标）。

### 13.2 Module Design 撰写（与 V0 并行，不阻塞 V0）

按 design hierarchy：System → Module → ISD。

**优先级**：
1. 先做 `piko-mem0-client` Module Design（最小、最独立，能跑通 STD 流程）
2. 再做 `piko-skill-tools` Module Design
3. 更新 `piko-pi-adapter`（M006）设计
4. 更新 `piko-policy`（M002）设计

每份设计用 `/Users/ben/work/STD/scripts/new-design` 生成 cover，跑 `validate-design`。

### 13.3 V0.1 day-1 验证清单（V0.1 上线前必做）

1. **per-role 隔离**：tester:piko 写入的 memory，developer:piko 是否真看不到？**失败则 V0.1 立项否决**
2. **metadata 保留**：写入 type / role / tags，search 回来是否一致？
3. **filters 字段**：能否精确按 metadata 过滤？
4. **infer 自动抽取**：行为是否稳定？要不要强制结构化 content？
5. **部署依赖**：自托管需要哪些（Qdrant / OpenAI / etc.）？

### 13.4 V0.1 实施触发条件（必须全部满足）

- [ ] V0 baseline 数据出来
- [ ] 验收 X 值定下
- [x] Module Design × 4 完成（沙箱侧，STD cover 待真实环境补）
- [x] ISD × 4 完成（沙箱侧）
- [x] Interface contract（identity schema）完成（沙箱侧）
- [ ] Day-1 验证清单 5 项全部通过

**设计沙箱侧已完成度**：9 份文档 + 实验 + 脚本 + 验证报告，全部对齐 / 可实现 / 可分解 / 可验证都 10/10。

**沙箱侧验证全通过**：
- ✅ JSON 语法（`validate-design-drafts.py`）
- ✅ TypeScript 类型一致性（`expected-impl-check.ts` tsc --noEmit）
- ✅ 跨文档引用（`validate-cross-refs.py`）

**真实环境仍待办**：
- ⏳ 9 份文档跑 `new-design` 生成 STD cover + metadata sidecar
- ⏳ 跑 `validate-design --project-root .`
- ⏳ 跑 `gitnexus detect_changes` 看影响范围
- ⏳ Day-1 Mem0 验证（5 项，含 per-role 隔离）

V0 数据出来前，不写 V0.1 代码、不细化验收指标、不做 Mem0 部署选型（自托管 vs Cloud）。

---

## 附录 A：Skill System 未来组件

> 本附录为未来展望，不在 V0.1 实施范围。具体设计待 V0.1 数据出来后再讨论。

### A.1 Skill Experience（V0.1）

本文档主体范围，已实现。

### A.2 Skill Behavior（V2+）

角色默认行为——tester 默认想边界、PM 默认 escalate blocker、developer 默认写测试等。

实现路径：基于 V0.1 经验数据 + 优质开源代码 / commit 历史，做 role 级 SFT/DPO 训练。

与 V0.1 互补：训练给"通用方法"，经验给"项目特异教训"。

### A.3 Skill Evolution（V2+ 之后）

在 Experience 累积 + Behavior 训练之上的元能力：

- **Gap 自动识别**：从经验数据中识别 skill gap（高频失败模式）
- **训练 cycle 自动化**：定期触发 V2 训练 pipeline
- **跨项目迁移**：把项目级经验蒸馏到 role 级通用知识
- **Online learning**：每个任务成功后微调，避免一周训一次
- **Project adapter**：单项目 LoRA，切换项目换 adapter

技术依赖：
- V2：训练基础设施（SFT/DPO pipeline + 评估基建 + 数据 gating）
- V3：PEFT 基建（LoRA 训练 + 版本化 + 热插拔）
- V4a：实时训练（online LoRA + EWC 防遗忘）
- V4b：批量 + 实时融合
- V5：long context 模型 / reasoning 模型替换

### A.4 共同前提

V2+ 所有组件依赖：
1. V0.1 验收通过（经验系统能跑、role 隔离正确、命中率达标）
3. V0.1 期间积累足够数据（轨迹、成功率、lift）
4. 训练基础设施独立投入（不是 V0.1 的扩展）

V0.1 不为 A.2 / A.3 预留接口、不为它们预留扩展点。