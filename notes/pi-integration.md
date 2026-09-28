# Pi 集成：补丁 vs 扩展点（结论）

结论先行：**Piko 不需要给 Pi 打补丁**。Pi 已原生暴露 Piko 需要的两个扩展面，
Piko 只需**注册**，`upstream/pi` 只锁 commit、不改源码。

## 背景

旧设计里有两个"adapter patch"（`pi.adapter_patches`，启动 S6 校验 manifest hash）：

| 补丁 | 旧设想作用 |
|---|---|
| `before_request_stepid` | 请求前给每次模型请求注入确定性 step/operation id（崩溃恢复对账用） |
| `on_raw_usage` | provider 响应归一化前，把原始 usage 回调给 Piko（PK-10 需要原始字段） |

## 核实结果（upstream/pi 源码）

**两个都是 Pi 的正式扩展点，不是补丁：**

- **`onRawUsage`**：`AgentHarnessOptions.onRawUsage?: (usage: unknown, context: Context) => void`
  - 定义：`packages/agent/src/harness/agent-harness.ts:539`、`execution/assistant.ts:57`
  - 透传链：`packages/ai/src/types.ts:186` → `api/openai-responses-shared.ts:561`
    （`options?.onRawUsage?.(response.usage)`，即**原始 usage**）→ 一路上抛到 Harness option。
- **`before_request` hook**：`lane.hooks.runWithGate("before_request", …, { stepId })`
  - 位置：`packages/agent/src/harness/runtime/drive/generation.ts:104`、`drive/deferred.ts:104`
  - 事件里带 **`stepId`**，可返回/改 `streamOptions` 等请求选项 → step id 注入与请求整形都能做。

**现有 Piko 代码已经在用**（`src/pi-runtime.ts`）：
- `:67` `AgentHarness.create({ …, onRawUsage: usage => store.observeUsage(...) })`
- `:69` `created.harness.hooks.on("before_request", event => …)`
- 另有 `before_payload` / `after_response` / `before_tool` / `after_tool` 均已注册。

## 结论与决定

1. **移除"打补丁"路线**：`pi.adapter_patches`（`tools/patches`）不再是"改 Pi 源码"，
   而是**对 Pi 扩展点（hook/callback）的注册绑定**；S6 校验改为校验**Pi commit/版本身份**
   （可选：校验 hook 名存在于该版本），而不是"某些文件含某些字符串"。
2. **skill 无法替代**：skill 是 agent 层（给 LLM 的说明/工具），碰不到 provider 请求构造与 usage 解析。
3. **tool 层也无法替代**这两点（不在工具面）。
4. **`upstream/pi` 管理**：只**锁 commit**（`9767ba275f3e9a5ee0f5c5342249b629ab1b2282`），
   当前以 vendored 目录存在（非 submodule）。若上游提供 hook 面即可长期不改 Pi。

## 待办（编码时）

- [ ] 把 `system-design` §8.2 / §9.1、`piko-config`、`piko-startup`（S6）里的
      `adapter_patches` 从"源码补丁 hash"改为"**hook 注册 + Pi 版本身份校验**"。
- [ ] `config.ts` 现有 `adapter_patches` 字符串检查逻辑（`grep` 某些源文件）**删除**或改为
      "校验该 Pi 版本导出了所需 hook 名"。
- [ ] 确认 `before_request` 的返回能否注入 Piko 需要的 step/operation id（当前用法在 `pi-runtime.ts:69`）。
