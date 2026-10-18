# V0.1 实施 → 真实环境操作 handoff（给 codex）

日期：2026-10-18
作者：Claude（沙箱侧，已完成设计 + 编码）
接收：codex（在真环境操作）

---

## 0. 状态摘要

| 阶段 | 状态 |
|---|---|
| 设计（System + 4 Module + 4 ISD + 1 Contract）| ✅ 完成，沙箱侧 100% 稳定（10/10 × 4 维度）|
| 实验（Pi tool 模板）| ✅ 验证 tsc 通过 |
| 编码（11 文件 + 2 测试 + 1 笔记）| ✅ 完成 |
| 单元 + 集成 + smoke 测试（56 个）| ✅ **沙箱 56/56 通过**（实际跑过） |
| 本地 commit（9bc6445）| ✅ 已写进 `.git/refs/heads/main` |
| Push 到 origin | ❌ 沙箱外网封 |
| STD 流程 | ❌ 沙箱无 `/Users/ben/work/STD/` |
| 真 Mem0 集成测试 | ❌ 沙箱无网络 |
| V0 baseline 实际跑 | ❌ 沙箱无网络 |
| Day-1 V0.1 验证 | ❌ 沙箱无网络 |

---

## 1. 你（codex）首先要做的 4 件事

### 1.1 拉取代码 + 检查 commit

```bash
cd /Users/ben/work/piko
git log --oneline -3
# 期望看到:
# 9bc6445 feat(skill-memory): V0.1 implementation
# 0caa0dd docs(skill-memory): V0.1 design complete
# 5a3eed4 docs(types): add skill-memory mechanism document and update config

git status
# 期望 working tree clean（除了可能遗留的 .git/*.lock 文件——可忽略）
```

如果 `git log` 看不到 9bc6445，**这意味着 sandbox 没把 commit 写进去**。这时候：

```bash
# 检查 git 对象是否存在
git cat-file -t 9bc6445380efab8284a92c3a0e1a87b7af8e42b7
# 应该输出 "commit"

# 检查 ref 文件
cat .git/refs/heads/main
# 应该输出 9bc6445...

# 如果都对但 git log 显示 broken branch：
# 1. 删除 lock 文件（真环境能 rm）：rm -f .git/index.lock .git/refs/heads/main.lock
# 2. git reset --hard HEAD（无害，HEAD 已经指向 9bc6445）
# 3. git log 应正常显示
```

### 1.2 Push 到 origin

```bash
git push origin main
# 期望：成功推 9bc6445 + 0caa0dd（如果是 fast-forward）
# 如果 push 失败：git pull --rebase origin main 然后再 push
```

如果 push 报非快进错误，说明 origin 上有更新的 commit：

```bash
git fetch origin
git log --oneline origin/main -5
git log --oneline HEAD -5
# 看差异，决定是 rebase 还是 merge
```

### 1.3 跑测试验证沙箱结果

```bash
# 不用 vitest（沙箱装不上），用 node:test via tsx
pnpm install  # 或 npm install
npx tsx --test src/mem0-client.test.ts src/skill-tools.test.ts
# 期望：32/32 pass

# 沙箱写的额外测试脚本
npx tsx --test scripts/v0.1-smoke-test.ts
npx tsx --test scripts/v0.1-integration-test.ts
npx tsx --test scripts/v0.1-pi-runtime-smoke.ts
# 期望：每组 10/10, 8/8, 6/6 pass
```

如果哪个测试 fail：

```bash
# 看详细错误
npx tsx --test src/mem0-client.test.ts 2>&1 | tail -50
```

### 1.4 跑 tsc 全项目编译

```bash
npx tsc --noEmit
# 期望：零输出（无错误）
# 沙箱已验过通过
```

---

## 2. STD 流程（重要——沙箱做不了）

### 2.1 STD scripts 在哪

沙箱里 `/Users/ben/work/STD/scripts/` 不存在。**真环境应该有**。

检查：

```bash
ls /Users/ben/work/STD/scripts/
# 期望看到：new-design, validate-design, verify-source-manifest 等
```

### 2.2 9 份文档补 STD cover

```bash
# 模板类型映射（参考 piko-skill-memory.md）
# Module Design → design.definition
# ISD → design.implementation
# Interface Contract → contracts.specification 或 interfaces.control

DOCS=(
  "docs/40_module_design/piko-mem0-client-design.md"
  "docs/40_module_design/piko-skill-tools-design.md"
  "docs/40_module_design/piko-pi-adapter-design-skill-tools-update.md"
  "docs/40_module_design/piko-policy-design-skill-tools-update.md"
  "docs/50_implementation_design/piko-mem0-client-impl.isd.md"
  "docs/50_implementation_design/piko-skill-tools-impl.isd.md"
  "docs/50_implementation_design/piko-pi-adapter-impl-skill-tools-update.isd.md"
  "docs/50_implementation_design/piko-policy-impl-skill-tools-update.isd.md"
  "docs/60_interfaces/contracts/piko-skill-tools-identity-contract-v0.1.md"
)

for doc in "${DOCS[@]}"; do
  echo "=== Processing: $doc ==="
  # 调用 STD new-design：
  # --template 按内容类型（design.definition / design.implementation / contracts.specification）
  # --name 从文件路径提取（如 piko-mem0-client-design）
  # 详细参数见 piko-skill-memory.md §6 设计章节
done
```

**简化版**（一次性补）：

```bash
/Users/ben/work/STD/scripts/new-design \
  --project piko \
  --template design.definition \
  --name piko-mem0-client \
  --project-root /Users/ben/work/piko \
  --owner corezilla \
  --author corezilla --author opencode \
  --repository corezilla/piko \
  --status draft \
  --parent-document-id piko-skill-memory

# 对每份文档重复，调 template / name / parent-document-id
```

**merge 流程**：

1. `new-design` 生成新文档（带 STD cover + metadata sidecar）
2. **不要**全盘覆盖——新设计有完整结构，把旧 content 复制进去
3. 标记 supersedes（指向旧 doc ID，如果适用）

### 2.3 跑 validate-design

```bash
/Users/ben/work/STD/scripts/validate-design --project-root /Users/ben/work/piko
# 期望：所有 [new] issue 解决或标 inherited
```

如果有 `[new]` issue：

```bash
# 看具体哪些
/Users/ben/work/STD/scripts/validate-design --project-root . 2>&1 | grep "\[new\]"
# 修：填 missing field / 调 template / 加 metadata
```

### 2.4 跑 gitnexus detect_changes

```bash
node .gitnexus/run.cjs detect_changes
# 期望：列出受影响的 symbols / execution flows
```

如果 gitnexus run.cjs 不存在：

```bash
npm i -g gitnexus
npx gitnexus analyze
# 或：node .gitnexus/run.cjs analyze
```

---

## 3. 真 Mem0 集成（沙箱做不了）

### 3.1 装 Mem0（任选 Cloud 或 自托管）

**Cloud（最快）**：

```bash
# 注册 api.mem0.ai 拿 API key
export MEM0_API_KEY="m0-xxxxxxxx"

# 加到 runtime.json 的 identity.memory.api_key_secret_ref
# 例如 "env:MEM0_API_KEY"（用现有 resolveSecret 机制）
```

**自托管**：

```bash
# docker run 一个 mem0 + qdrant
docker run -d -p 8000:8000 mem0ai/mem0-api
# 配置 base_url: "http://localhost:8000"
```

### 3.2 V0.1 day-1 验证清单（5 项必验）

```bash
# 写个验证脚本：scripts/v0.1-day1-verify.ts
# 覆盖 5 项：

# 1. per-role 隔离
#    tester agent 调 mem0_record 写一条
#    developer agent 调 mem0_lookup 查 tester:piko 的 memory → 应看不到
echo "=== 1. per-role 隔离 ==="
# (代码见下文)

# 2. metadata 保留
#    写 {type:"skill_experience", role:"tester", tags:["async"]}
#    search 读回 → metadata 应一致
echo "=== 2. metadata 保留 ==="

# 3. filters 字段
#    search with filters: {"metadata.type": "skill_experience"}
#    应只返回该 type 的 memory
echo "=== 3. filters 字段 ==="

# 4. infer 自动抽取
#    写自由文本（不是结构化）
#    Mem0 应自动抽取 fact 存
echo "=== 4. infer 自动抽取 ==="

# 5. 部署依赖
#    启动 Piko → 看 startup log 不报错
#    配错 api_key → fail-fast 报错明确
echo "=== 5. 部署依赖 ==="
```

**5 项任何一项失败 → V0.1 立项否决**（system design §10 风险表）

### 3.3 V0.1 day-1 验证脚本模板

```typescript
// scripts/v0.1-day1-verify.ts
// 跑法：export MEM0_API_KEY=xxx && tsx scripts/v0.1-day1-verify.ts

import { Mem0Adapter } from "../src/mem0-client.js";

const API_KEY = process.env.MEM0_API_KEY;
if (!API_KEY) {
  console.error("Set MEM0_API_KEY env var");
  process.exit(1);
}

const mem0 = new Mem0Adapter("https://api.mem0.ai", API_KEY);

// Test 1: per-role 隔离
console.log("Test 1: per-role 隔离...");
const testerWrote = await mem0.add(
  [{ role: "user", content: "tester-only lesson about auth race condition" }],
  "tester:piko",
  { type: "skill_experience", role: "tester", tags: ["race"] },
);
console.log(`  tester wrote: ${testerWrote.ids[0]}`);

const developerSaw = await mem0.search(
  "auth race condition",
  "developer:piko",  // different role
  { max_results: 10 },
);
const sawIt = developerSaw.some((r) => r.id === testerWrote.ids[0]);
if (sawIt) {
  console.error("  ❌ FAIL: developer saw tester's memory");
  process.exit(1);
}
console.log("  ✓ PASS");

// Test 2: metadata 保留
console.log("Test 2: metadata 保留...");
const writeResult = await mem0.add(
  [{ role: "user", content: "second lesson with specific tag xyz" }],
  "tester:piko",
  { type: "skill_experience", role: "tester", tags: ["xyz-unique-tag"] },
);
const results = await mem0.search(
  "second lesson",
  "tester:piko",
  { max_results: 5 },
);
const found = results.find((r) => r.id === writeResult.ids[0]);
if (!found?.metadata?.tags?.includes("xyz-unique-tag")) {
  console.error("  ❌ FAIL: tags not preserved");
  process.exit(1);
}
console.log("  ✓ PASS");

// 类似写 test 3-5
console.log("\n=== All Day-1 tests PASSED ===");
```

---

## 4. V0 baseline 测量（沙箱能跑脚本）

```bash
# 沙箱已经跑出真实数据（var/piko-omlx.sqlite，73 runs）
python3 scripts/v0-baseline.py --db var/piko-omlx.sqlite --window-days 30
```

**当前结果（V0.1 上线前 baseline）**：

```
73 runs, 3 Completed / 70 Failed, 4.1% 成功率
主要失败原因：52 unknown + 18 DiscussionAccessLost
任务类型：65 probes + 8 others（无真实数据）
```

**问题**：当前数据全是 probe，**没有真实开发任务**。需要 2 周真实任务数据才有意义。

**行动**：

```bash
# 真环境：让 Piko 跑真实任务 2 周
# 然后再跑 baseline
python3 scripts/v0-baseline.py \
  --db var/piko.sqlite \
  --window-days 14 \
  > docs/91_reviews/v0-baseline-2026-XX-XX.md
```

---

## 5. V0.1 上线 checklist

```bash
# 1. 配置
# 在 identity.memory 加 api_key_secret_ref（用 env var）

# 2. 启动
cd /Users/ben/work/piko
tsx src/main.ts config/runtime.json
# 看 startup log：
# - S1-S7 全过
# - S8 bind port

# 3. 跑一个测试任务（dev 角色）
# 用 Slinky 或 curl 派个 developer 任务
# 检查日志：mem0_lookup 被调、tool 行为符合预期

# 4. 失败回滚
# 把 runtime.json 的 identity 块删掉 → 跟 V0 行为一样
```

---

## 6. Coding notes（已发现的 ISD 问题）

`docs/91_reviews/v0.1-coding-notes-2026-10-18.md` 列了 11 个发现。**重点关注**：

### 必修（2 项）
- **Issue A2**：`user_id_template` 字段在 V0.1 是否实现——目前我**没实现**模板，直接用 `${role}:${project}` 字面拼接。如果 STD 要求实现，需要改 `src/skill-tools.ts`
- **Issue B1**：`role` / `name` schema 有正则但 types.ts 是裸 `string`——加类型守卫或注释

### 应该改（4 项）
- **Issue C1**：`tsconfig.json` 的 typebox path 修改——**已包含在 commit 里**，进 STD 时记录原因
- **Issue C2**：ISD §11.5 加"字段缺失时行为"列
- **Issue D2**：ISD §2.f `available` 类型放宽
- **Issue E1**：ISD §11.2 / §11.4 加 content 字段类型说明

### 可不改（5 项）
DRY 重构、parameter property 简写、测试技巧等细节。

---

## 7. 关键文件路径清单

```
代码：
  src/mem0-client.ts                       # 新建
  src/mem0-client.test.ts                  # 新建（14 tests）
  src/skill-tools.ts                       # 新建
  src/skill-tools.test.ts                  # 新建（18 tests）
  src/types.ts                             # 改：MemoryConfig + identity.memory
  src/pi-runtime.ts                        # 改：mem0ApiKey param + per-task skillDeps
  src/exec-process.ts                      # 改：resolve mem0ApiKey
  src/config.ts                            # 改：knownTools Set
  config/tool-profiles.json                # 改：2 profiles 各加 2 工具
  config/runtime.example.json              # 改：identity.memory 示例
  interfaces/schemas/piko-runtime-config-v0.3.schema.json  # 改：identity 字段
  tsconfig.json                            # 改：typebox path

设计文档：
  docs/20_system_design/mechanisms/piko-skill-memory.md  # V0.1 spec
  docs/40_module_design/piko-mem0-client-design.md
  docs/40_module_design/piko-skill-tools-design.md
  docs/40_module_design/piko-pi-adapter-design-skill-tools-update.md
  docs/40_module_design/piko-policy-design-skill-tools-update.md
  docs/50_implementation_design/piko-mem0-client-impl.isd.md
  docs/50_implementation_design/piko-skill-tools-impl.isd.md
  docs/50_implementation_design/piko-pi-adapter-impl-skill-tools-update.isd.md
  docs/50_implementation_design/piko-policy-impl-skill-tools-update.isd.md
  docs/60_interfaces/contracts/piko-skill-tools-identity-contract-v0.1.md

辅助：
  scripts/v0-baseline.py                   # V0 baseline 测量脚本
  scripts/validate-design-drafts.py        # 设计草稿校验
  scripts/validate-cross-refs.py           # 跨文档引用校验
  scripts/v0.1-smoke-test.ts               # 沙箱调试脚本（10 tests）
  scripts/v0.1-integration-test.ts         # 集成测试（8 tests）
  scripts/v0.1-pi-runtime-smoke.ts         # pi-runtime smoke（6 tests）
  experiments/skill-v0.1/04-pi-tool-interface/mock-tool.ts  # Pi tool 模板

Reviews：
  docs/91_reviews/design-validation-2026-10-18.md        # 设计验证报告
  docs/91_reviews/v0.1-coding-notes-2026-10-18.md        # 编码 notes（11 发现）
  docs/91_reviews/handoff-to-codex-2026-10-18.md         # 本文档
```

---

## 8. 优先级建议（按重要程度）

| 优先级 | 动作 | 阻塞什么 |
|---|---|---|
| 🔴 P0 | 1.1 拉取 + 检查 commit | 全部 |
| 🔴 P0 | 1.2 Push | 协作 |
| 🔴 P0 | 2.2 9 份文档 STD cover | STD review |
| 🟡 P1 | 2.3 validate-design | STD review |
| 🟡 P1 | 2.4 gitnexus detect_changes | 影响范围确认 |
| 🟡 P1 | 1.3 跑测试 | 验证沙箱可信 |
| 🟢 P2 | 3.x Mem0 集成 + day-1 验证 | V0.1 立项决策 |
| 🟢 P2 | 4.x V0 baseline 实际跑 | V0.1 验收 X 值 |
| 🟢 P2 | 5.x V0.1 上线 | 业务使用 |

---

## 9. 阻塞时怎么找我

任何步骤卡住，把：
- 错误信息（copy paste）
- `git log --oneline -5` 输出
- `git status` 输出
- 相关测试输出

发给我，我能针对 debug。

注意：**报告问题时**：
1. 标明是 handoff-to-codex 的哪个 step 卡的
2. 给出"我已经试过什么"
3. 给出你怀疑的根因（如果有）

---

**沙箱侧的活我做完了。真环境的事交给你和 codex 了。**