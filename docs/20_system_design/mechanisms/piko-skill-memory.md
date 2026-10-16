# Piko 职业技能与记忆系统草案

Version: v0.1.0-draft.1
Status: Draft
Project: piko
Last Modified Date: 2026-10-16

---

## 1. 目标

让 Piko 在执行任务时，能够**自主查询和调用职业技能与项目记忆**，而不需要 Slinky 预先把全部信息塞进 prompt。

核心约束：
- 上下文窗口有限，不能把全部设计文档塞进 prompt
- Slinky 只负责"任务边界"，Piko 自己决定"怎么执行"
- 记忆是持久化的文本文件，不是向量数据库，不需要额外基础设施

---

## 2. 架构

```
memory_root/
  skills/                    # 职业技能（"怎么做"）
    test_engineer/
      unit_test.md           # 如何写单元测试
      system_test.md         # 如何写系统集成测试
      debug.md               # 如何调试失败
    software_engineer/
      coding.md              # 编码流程
      review.md              # 代码审查流程
    architect/
      design.md              # 系统设计流程
  lessons/                   # 经验教训（"做过什么"）
    project_memory/          # 项目记忆（仅限本项目）
    role_project_memory/     # 角色+项目记忆
    generalized_role_memory/ # 跨项目通用经验
  index.json                 # 技能 + 记忆索引（快速查找）
  projects/<project_name>/   # 项目专属记忆
```

### 2.1 两层检索

| 层级 | 内容 | 查询方式 |
|---|---|---|
| **技能（Skills）** | 怎么执行各种任务（步骤、方法） | 按任务类型 + 角色查找 |
| **记忆（Memories）** | 项目事实、经验教训、历史决策 | 按项目 + 角色 + 关键词查找 |

**检索顺序**：
1. 读取 `index.json`，根据任务关键词找到相关技能和记忆文件
2. 按需读取这些文件的内容，放入上下文
3. Piko 根据读取到的信息，自己判断怎么执行

---

## 3. 索引格式（index.json）

```json
{
  "version": "1",
  "updated_at": "2026-10-16T00:00:00Z",
  "skills": [
    {
      "task_type": "unit_test",
      "roles": ["test_engineer"],
      "file": "skills/test_engineer/unit_test.md"
    },
    {
      "task_type": "system_test",
      "roles": ["test_engineer"],
      "file": "skills/test_engineer/system_test.md"
    }
  ],
  "memories": [
    {
      "project": "piko",
      "scope": "project_memory",
      "keywords": ["matrix", "homeserver", "connection"],
      "file": "lessons/project_memory/piko_matrix_notes.md"
    },
    {
      "project": "piko",
      "scope": "role_project_memory",
      "roles": ["test_engineer"],
      "keywords": ["test", "boundary", "data"],
      "file": "lessons/role_project_memory/test_engineer/piko_test_lessons.md"
    }
  ]
}
```

**查询规则**：
- 根据任务 `instruction` 中的关键词（模块名、功能名）匹配 `skills` 和 `memories`
- `skills` 按 `task_type` 和 `roles` 匹配
- `memories` 按 `project` 和 `scope` 匹配，优先项目内，后补跨项目

---

## 4. Piko 运行时行为

```
Piko 启动：
  1. 读取 memory_root/index.json 到内存
  2. 当接任务时：

接到任务：
  1. 从 instruction 提取关键词（模块名、功能名）
  2. 查询 index.json：
     a. 找到相关的技能文档（skills）
     b. 找到相关的记忆文档（memories）
  3. 按以下顺序读取并注入上下文：
     a. STD 模板（格式要求，来自 TaskRequest.std_templates）
     b. 项目特定知识（来自 lessons/project_memory/<project>/ ）
     c. 角色特定知识（来自 lessons/role_project_memory/<role>/ 或 skills/<role>/）
     d. 通用知识（来自 lessons/generalized_role_memory/ 或 skills/generalized/）
  4. 将读取到的内容放入 Pi 的 system prompt 或 conversation context
  5. 执行任务
  6. 任务完成后，如有新经验，写入 lessons 目录
```

---

## 5. 技能文档格式

每个技能文档是一个 STD 文档，包含：

```markdown
<!-- STD_DOCUMENT_COVER_BEGIN -->
# 技能：<技能名称>
## 角色：<test_engineer>
## 适用场景：<单元测试>
<!-- STD_DOCUMENT_COVER_END -->

### 1. 目标

本技能指导 test_engineer 如何执行 <场景>。

### 2. 前置条件

- 项目测试框架：pytest
- 源码目录：src/
- 测试目录：tests/unit/

### 3. 执行步骤

1. 读取被测试模块的源码和设计文档
2. 识别边界条件和异常路径
3. 编写测试用例，覆盖正常路径和异常路径
4. 运行测试，分析结果
5. 修复失败（如有）

### 4. 质量标准

- 覆盖率 >= 80%
- 包含负例测试
- 不修改源代码

### 5. 注意事项

- 外部依赖必须 mock
- 不修改项目配置
```

---

## 6. 记忆文档格式

每个记忆文档也是一个 STD 文档，包含：

```markdown
<!-- STD_DOCUMENT_COVER_BEGIN -->
# 记忆：<记忆主题>
## 类型：project_memory | role_project_memory | generalized_role_memory
## 项目：piko
## 角色：test_engineer（可选）
<!-- STD_DOCUMENT_COVER_END -->

### 1. 事实

项目 A 的 CI 快分支不跑 slow branch 的集成测试，容易漏测。

### 2. 证据

- ST-PROC-001 失败记录（2026-09-15）
- 系统测试发现 3 个边界场景问题

### 3. 教训

系统测试阶段必须覆盖 slow branch 场景。

### 4. 适用场景

项目集成阶段，涉及数据库和外部 API 的测试。

### 5. 预防规则

CI 配置中，集成测试脚本必须包含 slow branch 用例。
```

---

## 7. 写入记忆

```
任务完成 → Piko 分析任务结果：
  - 成功：是否学到了新的项目事实或有效方法？
  - 失败：是否发现了新的坑或边界情况？
  - 如果值得长期保存，生成 STD 格式的记忆文档，写入 memory_root/lessons/
  - 更新 index.json 索引
```

**写入条件**：
- 有明确证据
- 能给出预防规则
- 不是单次偶发问题

**不写入条件**：
- 根因不明确
- 明显绑定当前样例或一次性环境问题
- 与现有高置信记忆冲突且无法解释

---

## 8. 与 GraphRAG 和 GitNexus 的关系

| 系统 | 负责什么 | 本方案中的角色 |
|---|---|---|
| **GraphRAG** | 从文档中提取实体和关系，构建知识图谱 | 可选增强：用于处理"多跳推理"（A 依赖 B，B 调 C） |
| **GitNexus** | 实时代码关系（调用链、依赖关系） | 可选增强：用于处理实时代码查询（"改了 A 影响哪些模块"） |
| **本方案** | 技能 + 记忆的存储、索引、检索、写入 | 核心：Piko 通过文件 + 索引访问技能和记忆 |

**默认不启用 GraphRAG 和 GitNexus**。当需要处理复杂关系查询时，可以作为可选增强接入。

---

## 9. 配置（RuntimeConfig）

```typescript
identity?: {
  /** Role the Piko instance plays. */
  role: string;
  /** Human-readable identity (e.g. "alice:test_engineer"). */
  name: string;
  /** Workspace-relative directory for memory. */
  memory_root: string;
  /** Optional GraphRAG endpoint (if enabled). */
  graphrag?: {
    endpoint: string;
    collection: string;
  };
  /** Optional GitNexus endpoint (if enabled). */
  gitnexus?: {
    repository: string;
    commit?: string;
  };
};
```

当 `graphrag` 和 `gitnexus` 配置时，Piko 在执行中额外调用它们进行关系查询。

---

## 10. 与 TaskRequest 的关系

```typescript
TaskRequest = {
  task_id: string;
  instruction: string;
  workspace_ref: string;
  permissions: { read_paths, write_paths, tool_profile_ref };
  output_paths: string[];
  input_refs?: InputRef[];
  artifact_target?: ArtifactTarget;
  discussion?: { room_id, trigger_event_id };
  std_templates?: { scheme?: string; case?: string };
}
```

**TaskRequest 只传任务信息**。角色、身份、技能、记忆在启动配置（RuntimeConfig）中加载。

**TaskRequest.std_templates** 指定此任务应使用哪些 STD 模板（格式约束）。

**Piko 自己决定**：根据任务内容，从 `memory_root` 查询相关技能和记忆，决定如何执行。
