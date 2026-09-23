#!/usr/bin/env bash
# Piko ↔ LLMTier 联调失败定位器。
# usage: scripts/joint-diagnose.sh <run_id>
# 拉取五层证据并给出"问题在哪一层"的启发式结论：
#   1 Piko run/result   2 Piko prompt(会话JSONL)   3 LLMTier logs(窗口)
#   4 LLMTier usage     5 oMLX 直连                6 结论
set -u
cd /Users/ben/work/piko
RID="${1:?usage: joint-diagnose.sh <run_id>}"
DB="${PIKO_SQLITE_PATH:-$PWD/var/piko-llmtier-joint.sqlite}"
SESSIONS="${PIKO_SESSION_ROOT:-$PWD/var/pi-sessions-llmtier-joint}"
BEARER=$(cat "$HOME/piko-secrets/piko-api-bearer")
DATA=$(cat "$HOME/piko-secrets/llmtier-joint-data-token")
ADMIN=$(cat "$HOME/piko-secrets/llmtier-joint-admin-token")
OMLX_KEY=$(cat "$HOME/piko-secrets/piko-llm-key")
PIKO="${PIKO_URL:-http://127.0.0.1:8788}"
TIER="${TIER_URL:-http://192.168.1.8:8180}"

echo "== 1. Piko run/result =="
VIEW=$(curl -s -m 5 "$PIKO/runs/$RID" -H "Authorization: Bearer $BEARER")
echo "$VIEW" | jq -c '{state,accepted_at,finished_at,progress,failure}'
RESULT=$(curl -s -m 5 "$PIKO/runs/$RID/result" -H "Authorization: Bearer $BEARER")
echo "$RESULT" | jq -c '{state,failure,usage:{quality:.usage.quality,attempts:.usage.model_attempts,observed:.usage.usage_observed_tokens},tools:([.known_actions[]|select(.kind=="ToolCall")|{tool:.description,status}]})' 2>/dev/null \
  || echo "$RESULT" | jq -c '{state,failure,usage}'
CODE=$(echo "$RESULT" | jq -r '.failure.code // "none"')
MSG=$(echo "$RESULT" | jq -r '.failure.message // ""')
ACCEPTED=$(echo "$VIEW" | jq -r '.accepted_at // empty')

echo "== 2. Piko prompt（Pi 会话 JSONL：最后 2 条 assistant/错误）=="
F=$(grep -rl "$RID" "$SESSIONS" 2>/dev/null | head -1)
if [ -n "$F" ]; then
  echo "session=$F"
  python3 - "$F" <<'EOF'
import json,sys
rows=[]
for line in open(sys.argv[1],errors="replace"):
    if '"role":"assistant"' in line or '"role":"toolResult"' in line or 'isError":true' in line:
        try: rows.append(json.loads(line))
        except Exception: pass
for o in rows[-2:]:
    s=json.dumps(o,ensure_ascii=False)
    print(("..." if len(s)>600 else "")+s[-600:])
EOF
else
  echo "(未找到会话文件)"
fi

echo "== 3. LLMTier logs（run 窗口 ±2min，状态非 200 的会标出）=="
if [ -n "$ACCEPTED" ]; then
  W=$(python3 - "$ACCEPTED" <<'EOF'
import sys,datetime,urllib.parse
t=datetime.datetime.fromisoformat(sys.argv[1].replace("Z","+00:00"))
f=(t-datetime.timedelta(minutes=2)).isoformat().replace("+00:00","Z")
to=(t+datetime.timedelta(minutes=10)).isoformat().replace("+00:00","Z")
print(urllib.parse.quote(f)+"&to="+urllib.parse.quote(to))
EOF
)
  curl -s -m 5 -H "Authorization: Bearer $ADMIN" "$TIER/v1/logs?from=$W" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin).get('data',[])
bad=[x for x in d if ' 5' in x.get('message','')[-7:-4] or ' 4' in x.get('message','')[-7:-4]]
print(f'窗口内日志 {len(d)} 条；非2xx {len(bad)} 条')
for x in bad[-5:]: print(' ', x['created_at'][11:19], x['message'][:120])"
fi

echo "== 4. LLMTier usage（窗口内记录）=="
if [ -n "$ACCEPTED" ]; then
  curl -s -m 5 -H "Authorization: Bearer $DATA" "$TIER/tier/v1/usage?from=$W" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin).get('data',[])
print(f'窗口内 usage 记录 {len(d)} 条')
for x in d[-5:]: print(' ', x['request_id'][:18], x['model'], x['measurement_status'], f\"in={x['input_tokens']} out={x['output_tokens']}\")"
fi

echo "== 4.5 provider_calls（Piko 持久化的出站调用，含 x-request-id）=="
sqlite3 "${PIKO_SQLITE_PATH:-$DB}" "SELECT ts,status,coalesce(request_id,'-'),coalesce(latency_ms,'-')||'ms' FROM provider_calls WHERE run_id='$RID' ORDER BY ts;" 2>/dev/null || true

echo "== 5. oMLX 直连 =="
echo "models -> $(curl -s -m 3 -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $OMLX_KEY" http://127.0.0.1:9000/v1/models)"
echo "LLMTier healthz -> $(curl -s -m 3 -o /dev/null -w '%{http_code}' "$TIER/healthz")"

echo "== 6. 结论启发 =="
case "$CODE" in
  ModelUnavailable)
    echo "层：依赖可用性。看 §3：窗口内有 5xx/provider_unavailable → LLMTier 收到请求、上游(oMLX)失败；"
    echo "    窗口内无任何日志行 → 请求未到 LLMTier（LLMTier 进程挂/网络）；§5 healthz/models 可直接区分。";;
  ModelResponseInvalid|ModelProtocol)
    echo "层：二选一——对照 §2 的 prompt 历史：若 Piko 组装的请求形状明显违规 → Piko prompt/装配问题；"
    echo "    若请求形状正常而响应体异常（4xx 校验/截断/协议错）→ LLMTier 内部。§3 的状态码可再分。";;
  ToolFailure)
    echo "层：Piko 工具/权限（read/write 越界或 ENOENT），与 LLMTier/oMLX 无关。";;
  BudgetExceeded|DeadlineExceeded)
    echo "层：Piko 任务限额（预算/超时），非对端问题。";;
  UnsafeRetryBlocked|ExecutionStateUnknown)
    echo "层：Piko 恢复语义（never-replay 命中），非对端问题。";;
  none|"") echo "run 无 failure（Completed/Cancelled 或未终态）。";;
  *) echo "未知码 $CODE：优先比对 §1 message 与 §3 状态码。";;
esac