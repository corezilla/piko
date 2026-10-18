# Skill Experience V0.1 — 实验目录

> 本目录的所有产物**不是正式代码**，不进 `src/`、不进 `tests/`、不进 release。
> 只用于在 System Design / Module Design / ISD 之前，验证设计里的不确定项。
> 实验结论写进 design 文档的决策记录，然后**这个目录可以删除**。

## 跟正式代码的边界

| 实验目录 | 正式代码 |
|---|---|
| 临时脚本 / docker-compose / API 调用测试 | `src/` 下的 production code |
| 假设 → 步骤 → 结论 → 影响哪个 design 决策 | STD cover + Module Design / ISD 流程 |
| 可以手写、可以 hardcode、可以 throw-away | 必须过 `validate-design`、必须有 STD cover |

## 实验清单

| 编号 | 主题 | 验证什么 | 设计影响 |
|---|---|---|---|
| 01 | Mem0 API smoke | API 契约（request/response shape、错误码） | `piko-mem0-client` 接口签名 |
| 02 | Mem0 fact 抽取 | 自由文本 vs 结构化文本的抽取行为 | `mem0_record` content 格式约束 |
| 03 | Mem0 user_id 隔离 | 不同 user_id 是否真的隔离 | V0.1 per-role 隔离方案可行性 |
| 04 | Pi tool 接口 | Pi 上游 tool signature、注册流程 | `piko-skill-tools` 实现细节 |
| 05 | prompt 工具提示效果 | agent 是否真的会调工具（待定） | system prompt 措辞 |
| 06 | Mem0 metadata 保留 | 写入带 metadata 的 memory，查回来是否一致 | `mem0_record` metadata 字段用法 |

## 实验模板

每个实验子目录里：

```
NN-topic/
  README.md       # 假设 / 步骤 / 结论 / 影响
  run.sh 或 *.ts  # 实际执行
  findings.md     # 结论 + 影响哪个 design 决策
```

## 状态

| 实验 | 状态 | 结论 |
|---|---|---|
| 01 Mem0 API smoke | **沙箱阻塞** | API 契约基于公开文档；5 个不确定项推到 V0.1 真实环境验 |
| 02 Mem0 fact 抽取 | **沙箱阻塞**（依赖 01） | 推迟 |
| 03 Mem0 user_id 隔离 | **沙箱阻塞**（依赖 01） | **per-role 隔离假设必须在 V0.1 day-1 验** |
| 04 Pi tool 接口 | ✅ 完成 | 模板见 `04-pi-tool-interface/mock-tool.ts` |
| 05 prompt 效果 | 待定（成本高） | 推迟到 V0.1 上线后用 trace 数据观察 |
| 06 Mem0 metadata | **沙箱阻塞**（依赖 01） | 推迟 |

## 沙箱限制

本沙箱无网络访问（pip/npm 403，无 docker，docs.mem0.ai 被 block）。
Mem0 相关实验无法在此环境跑。所有 Mem0 验证推迟到 V0.1 实施环境。

## 实验 04 是 Piko 集成侧的关键验证

即使没有 Mem0 验证，Piko 侧的工具接口（user_id 构造、Pi tool 形状、schema 设计）都已经验证可行。Mem0 是外部依赖，集成风险独立。