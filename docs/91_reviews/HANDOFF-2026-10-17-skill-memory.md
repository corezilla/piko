# Session Handoff — Piko 技能与记忆系统设计

日期: 2026-10-17
状态: 设计完成（draft），实现未开始
Git HEAD: `5a3eed4 docs(types): add skill-memory mechanism document and update config`

---

## 本会话完成了

1. **修订核心设计** — `docs/20_system_design/mechanisms/piko-skill-memory.md` 升到 **v0.3.0-draft.1**，解决 13 之前 review 出的问题（冲突解决规则、top-K 不全量加载、全文 API、填写准则、冲突合并策略、审核 SLA、安全/版本/维护）。
2. **新增架构图** — `piko-skill-memory-arch.svg` + `.png`（PNG 已生成，OpenCode 对话框不支持内嵌图片，手动打开看）。
3. **改动量评估** — 中等改动，约 615 行新/改代码，1 新建工具（~20% 增长现 3067 行 src/ 项目里），约 1-2 周开发时间。

---

## 核心设计定（不重新讨论）

### 三层信息分工
- **STD 模板** = 任务规范（Slinky 给，`TaskRequest.std_templates`），约束输出格式
- **岗位技能** = "怎么做"（agent 内置查 `skills/{role}/{skill}.md`），通用能力模板
- **记忆** = "做过什么"（agent 内置查 `lessons/{scope}/{project}/`），项目相关经验

### 冲突解决规则（§2.4）
优先级从高到低：**模板 > 记忆 > 技能**；记忆里 scope 越越具体越越优先。

### 岗位 = 模板，记忆 = 实例
技能预设（人维护），记忆动态积累（agent 填 + 人审核）。

### P0/P1 责任边界（不变）
- P0（控制进程）：加载索引，提供查询接口，不执行外部 IO
- P1（执行进程）：查技能/记忆、执行、填写经验报告
- 外部后端调用（GraphRAG/GitNexus）只能在 P1

### 写入流程（8.4-8.6）
- P1 任务完成后按填写准则（新否/重要≥5/通用否，三 yes 才填）
- 写候选 → `pending_review/` → 人 Slinky 审核 → `lessons/` 生效
- 冲突合并：同内容跳过 / 不重叠 append / 重叠章节 manual
- 审核 SLA：每日扫描，超期 7 天自动归档，3 天提醒

### 8 步接到任务流程（§3）
解析 → 加载模板 → 查技能 → 查记忆（打分 top-K）→ 组装 prompt → 按技能执行（全文按需）→ 自检 checklist → 经验报告

---

## 下一步会话要做（没动）

代码改动全不动（仅设计文档已改）。按实施路径 §12 的 5 phase 开始：

### Phase 1（基础机制，先做）
- [ ] 写岗位技能文档：`skills/developer/{code,test,doc}.md`、`skills/tester/*`、`skills/project_manager/*`
- [ ] 定义 `index.json` 格式 + 写 schema
- [ ] 实现 `scripts/memory-indexer.ts`（扫描 + 生成索引 + tmp 写完 rename 版本控制）
- [ ] 实现 P0 `query_skills()` / `query_memories()` / `get_*_content()`
- [ ] 扩展 `ipc.ts` 增加 memory 命令种类（预计 60 行）
- [ ] 改 `buildSystemPrompt()` 变成 async、调 P0 查记忆/技能注入（预计 80 行改，最大风险）
- [ ] 改 `worker.ts` 任务前取 context 步骤（预计 40 行）

### Phase 2（记忆写入）
- [ ] 经验报告模板 + 填写准则
- [ ] `write_memory()` 候选 + 冲突合并
- [ ] Slinky Dashboard 集成人审核
- [ ] 超期自动归档 cron

### Phase 3-5（增强）
打分增强（embedding/时间衰减/引用计数）→ 多模态（截图分析）→ GraphRAG/GitNexus 后端

### 最大风险点（提前测试）
1. `buildSystemPrompt` 改成 async 影响 `pi-runtime.ts:81` 调用链（AgentHarness.create 前取）
2. IPC 命令种类翻倍，消息协议复杂度上升

---

## 关键文件位置

| 文件 | 状态 | 说明 |
|---|---|---|
| `docs/20_system_design/mechanisms/piko-skill-memory.md` | v0.3.0-draft.1 修改未 commit | 核心机制设计，13 章节全完成 |
| `docs/20_system_design/mechanisms/piko-skill-memory-arch.svg` | 新未 commit | 架构图（980×980，三层+8步+冲突+审核+安全） |
| `docs/20_system_design/mechanisms/piko-skill-memory-arch.png` | 新未 commit | 架构图 PNG 1960px |
| `src/types.ts` | 已 commit `beef36e` | `RuntimeConfig.identity` 预留字段（role/memory_root/graphrag/gitnexus）未消费 |
| `src/pi-runtime.ts` | 已 commit `bc43d79` | `buildSystemPrompt(task, identity)` task 参数没用，插入点 |
| `interfaces/schemas/agent-runtime-v0.3.schema.json` | 已 commit | StdTemplates 加，旧 memory 字段已删 |

---

## 注意事项

### 工作流约定
- **改文档必须 STD `new-design` 生成**（AGENTS.md §6），本方案是 hand-authored 后加 STD cover 要补
- **commit 之前运行 `validate-design`** 和 `gitnexus detect_changes`（AGENTS.md 硬规则）
- 当前文档里没 STD cover，commit 时 validator 会 `[new]` issue，先确认怎么处理（生成新版 vs 标 pre-STD inherited）

### 工具限制（本会话发现）
- OpenCode 对话框不支持图片内嵌展示（只能手动打开 PNG）
- 这个模型（Qwen3.8-Flash-Next）不支持图片输入（read 图片失败）
- 上下文限制配置 `~/.config/opencode/opencode.jsonc`：Qwen3.6-35B-A3B 256K（omlx + m5mac），Qwen3.8-Flash 1M/32K

### 设计哲学（本会话确认）
- 人 = 决策 + 给资源（Dashboard 上多项目管理），AI = 执行
- Piko = AI 员工团队，岗位技能 + 记忆 = agent 自主能力
- 视觉表达先于文字表达
- OpenCode 不支持图片内嵌，这是平台限制，需要社区推动

---

## 快速开始下一会话

```bash
# 看设计
open docs/20_system_design/mechanisms/piko-skill-memory.md

# 看架构图（PNG）
open docs/20_system_design/mechanisms/piko-skill-memory-arch.png

# 开始 Phase 1：写岗位技能文档
# 用 new-design 或直接编辑 skills/developer/test.md（需先定 STD cover 怎么处理）
```

**建议先做的事**：决定本设计文档要不要重新过 STD `new-design`（v0.3.0-draft.1 里没 cover），还是标 pre-STD inherited 直接 commit 改。
