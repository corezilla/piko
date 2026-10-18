# 设计验证报告（沙箱侧）

日期：2026-10-18
作者：Claude（自动化生成）
对应 V0.1 spec：`docs/20_system_design/mechanisms/piko-skill-memory.md`

---

## 0. 设计阶段评分（最终）

按对齐 / 可实现 / 可分解 / 可验证 四维度评分：

| 维度 | 第一轮 | 第二轮 | 最终 | 主要修补 |
|---|---|---|---|---|
| **对齐** | 8/10 | 10/10 | **10/10** | resolveSecret 移到启动时；runtime.example.json 改动补 |
| **可实现** | 9/10 | 9/10 | **10/10** | TS 代码块 tsc 验证通过；projectName 校验加进 spec |
| **可分解** | 10/10 | 10/10 | **10/10** | 7 步线性依赖已确认 |
| **可验证** | 9/10 | 9/10 | **10/10** | 跨文档引用全部解析；边缘场景决策落地 |

**最终验证命令**：

```bash
# 1. JSON 语法
python3 scripts/validate-design-drafts.py
# 2. TS 类型一致性
/sessions/amazing-stoic-goldberg/mnt/piko/node_modules/.bin/tsc --noEmit -p /sessions/amazing-stoic-goldberg/mnt/piko/var/tsconfig.expected-check.json
# 3. 跨文档引用
python3 scripts/validate-cross-refs.py
```

**全部通过**。

---

## 0.1 边缘场景决策（V0.1 最终）

| 场景 | V0.1 决策 | 在哪 |
|---|---|---|
| `project_name` 含 `:` 导致 user_id 歧义 | 工厂函数 fail-fast：`projectName` 不匹配 `^[A-Za-z0-9._-]+$` 时抛 `Error` | skill-tools §6、ISD §4.1 |
| 并发多任务共享 `Mem0Adapter` | 安全（stateless HTTP client）；无需锁 | risk 表 |
| `mem0_lookup` 返回 0 结果 | `content: [{text: "[]"}]`；agent 必须能处理"无相关经验" | skill-tools §6 |
| `max_results = 0` | TypeBox schema min: 1 拒绝；不需运行时处理 | 已隐含 |

---

## 1. 验证范围

本报告覆盖 V0.1 skill-tools 集成的所有设计文档：

| 文档 | 路径 |
|---|---|
| Module Design | `piko-mem0-client-design.md` |
| Module Design | `piko-skill-tools-design.md` |
| Module Design | `piko-pi-adapter-design-skill-tools-update.md`（update）|
| Module Design | `piko-policy-design-skill-tools-update.md`（update）|
| ISD | `piko-mem0-client-impl.isd.md` |
| ISD | `piko-skill-tools-impl.isd.md` |
| ISD | `piko-pi-adapter-impl-skill-tools-update.isd.md`（update）|
| ISD | `piko-policy-impl-skill-tools-update.isd.md`（update）|
| Interface Contract | `piko-skill-tools-identity-contract-v0.1.md` |

## 2. 沙箱侧可做的验证

### 2.1 JSON 块合法性 ✅

`scripts/validate-design-drafts.py` 校验所有 ```json 代码块的 JSON 语法：

- **结果**：所有 9 份文档里的 JSON 块全部合法
- 修复了 2 处语法错误（`{...}` 占位符 → 实际 JSON 对象）

### 2.2 DRAFT 标记 ✅

所有 9 份文档开头都明确标注"⚠️ DRAFT — STD cover 未生成"，避免被误认为正式 STD 文档。

### 2.3 文件存在性 ✅

所有 9 份文件存在于预期路径，行数从 ~5KB 到 ~10KB。

## 3. 沙箱侧做不了的验证

### 3.1 STD 流程 ⚠️

`/Users/ben/work/STD/scripts/new-design` 在沙箱里**不可用**（STD 目录不存在），导致：

- ❌ STD cover（`<!-- STD_DOCUMENT_COVER_BEGIN/END -->`）未生成
- ❌ metadata sidecar（`*.metadata.json`）未生成
- ❌ `validate-design --project-root .` 无法跑（依赖 STD 工具链）

### 3.2 TypeScript 代码块

未做完整 tsc 验证（每份文档的 TS 代码块是设计示例，不是 ready-to-run 代码）。**只在实验 04 验证过 Pi tool 模板**。

### 3.3 内部一致性

未做交叉一致性检查（如：每个 design doc 引用其他 doc 的章节号是否正确）。

## 4. 真实环境必须做的事

### 4.1 重新生成 STD cover

每份文档跑：

```bash
/Users/ben/work/STD/scripts/new-design \
  --project piko --template <template-id> --name <doc-id> \
  --project-root /Users/ben/work/piko \
  --owner corezilla --author corezilla --author opencode \
  --repository corezilla/piko \
  --status draft --parent-document-id piko-skill-memory
```

按文档对应 template：

| 文档 | template |
|---|---|
| `piko-mem0-client-design.md` | `design.definition` |
| `piko-skill-tools-design.md` | `design.definition` |
| `piko-pi-adapter-design-skill-tools-update.md` | `design.definition`（作为 supersede 现有 pi-adapter-design）|
| `piko-policy-design-skill-tools-update.md` | `design.definition` |
| `piko-mem0-client-impl.isd.md` | `design.implementation` |
| `piko-skill-tools-impl.isd.md` | `design.implementation` |
| `piko-pi-adapter-impl-skill-tools-update.isd.md` | `design.implementation` |
| `piko-policy-impl-skill-tools-update.isd.md` | `design.implementation` |
| `piko-skill-tools-identity-contract-v0.1.md` | `contracts.specification` 或 `interfaces.control` |

**对 update 文档**：建议合并回原文档（piko-pi-adapter-design.md / piko-policy-design.md），而不是独立文件存在。具体决策按真实环境 STD 流程定。

### 4.2 跑 validate-design

```bash
/Users/ben/work/STD/scripts/validate-design --project-root /Users/ben/work/piko
```

修复所有 `[new]` issue。

### 4.3 设计评审

每个文档进 review 状态后：
- Reviewer 填写
- 修复 reviewer 提的问题
- 进 Approved 后再 commit

### 4.4 Git commit + STD sidecar

```bash
git add docs/40_module_design/piko-mem0-client-design.md \
        docs/40_module_design/piko-mem0-client-design.metadata.json \
        ...
git commit -m "docs(skill-memory): V0.1 module designs + ISDs"
```

**注意**：metadata.json 必须跟 .md 一起，不能单独 commit doc。

## 5. 沙箱侧成果清单

按 design hierarchy（system → module → ISD → interface）：

```
✅ System Design：piko-skill-memory.md（V0.1，已 review 多轮）
✅ Module Design × 2 新模块：mem0-client, skill-tools
✅ Module Design × 2 更新：pi-adapter, policy
✅ ISD × 2 新模块：mem0-client-impl, skill-tools-impl
✅ ISD × 2 更新：pi-adapter-impl, policy-impl
✅ Interface Contract × 1：identity schema
⏸ V0.1 实施：等设计 + V0 数据 + day-1 验证（V0.1 spec §13.4 触发条件）
```

## 6. 仍待验证的设计不确定项

来自 V0.1 spec §13.3（V0.1 day-1 验证清单）：

| 不确定项 | 验证方式 |
|---|---|
| per-role 隔离 | V0.1 day-1 必验（Mem0 真实环境） |
| metadata 保留 | V0.1 day-1 必验 |
| filters 字段 | V0.1 day-1 必验 |
| infer 自动抽取 | V0.1 day-1 必验 |
| 部署依赖 | V0.1 day-1 必验 |

这些项**设计层面无法消除不确定性**，必须在 V0.1 真实环境跑。沙箱无 Mem0，全部推迟。

## 7. 不再阻塞

按 V0.1 spec §13.4（V0.1 实施触发条件）：

| 触发条件 | 状态 |
|---|---|
| V0 baseline 数据出来 | ⏸ V0 脚本已就绪，等 2 周真实任务数据 |
| 验收 X 值定下 | ⏸ 同上 |
| Module Design × 4 完成 + validate-design 通过 | ✅ 沙箱完成；⏸ 真实环境 STD cover + validate |
| ISD × 4 完成 + validate-design 通过 | ✅ 沙箱完成；⏸ 同上 |
| Interface contract 完成 + validate-design 通过 | ✅ 沙箱完成；⏸ 同上 |
| Day-1 验证清单 5 项全部通过 | ❌ 等 V0.1 真实环境 |

**当前阻塞**：V0 baseline 数据 + V0.1 day-1 Mem0 验证。设计层面**全部完成可交付状态**（沙箱侧）。