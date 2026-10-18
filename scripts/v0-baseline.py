#!/usr/bin/env python3
"""
V0 baseline measurement — 读 Piko TaskStore SQLite，跑统计。

这是测量工具，不是 V0.1 系统的一部分。
V0.1 实施前要先跑这个脚本拿基线数据。

Usage:
  python3 scripts/v0-baseline.py [--db <path>] [--window-days 14]

默认读 var/piko.sqlite；不存在则扫 var/*.sqlite 选最大的。
"""
import argparse
import json
import sqlite3
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from statistics import median


def find_largest_db(var_dir: Path) -> Path | None:
    """Find the largest .sqlite file in var/."""
    dbs = list(var_dir.glob("*.sqlite"))
    if not dbs:
        return None
    return max(dbs, key=lambda p: p.stat().st_size)


def parse_dt(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def load_runs_and_tasks(db: Path):
    """Load runs joined with their task_json for richer stats."""
    conn = sqlite3.connect(str(db))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 跑 + 结果 + task
    rows = cur.execute("""
        SELECT r.task_id, r.state, r.generation, r.accepted_at, r.started_at, r.finished_at,
               r.model_calls, r.tool_calls,
               res.result_json,
               t.task_json, t.identity_state
        FROM runs r
        LEFT JOIN results res ON r.task_id = res.task_id AND r.generation = res.generation
        LEFT JOIN tasks t ON r.task_id = t.task_id
        WHERE r.accepted_at IS NOT NULL
    """).fetchall()

    out = []
    for row in rows:
        rec = dict(row)
        # 解析 result_json
        if rec.get("result_json"):
            try:
                rec["result"] = json.loads(rec["result_json"])
            except Exception:
                rec["result"] = None
        else:
            rec["result"] = None
        # 解析 task_json
        if rec.get("task_json"):
            try:
                rec["task"] = json.loads(rec["task_json"])
            except Exception:
                rec["task"] = None
        else:
            rec["task"] = None
        # 解析 identity_state
        if rec.get("identity_state"):
            try:
                rec["identity"] = json.loads(rec["identity_state"])
            except Exception:
                rec["identity"] = None
        else:
            rec["identity"] = None
        out.append(rec)

    conn.close()
    return out


def classify_instruction(text: str) -> str:
    """Classify task type by simple keyword rules. Manual override recommended."""
    if not text:
        return "unknown"
    low = text.lower()
    rules = [
        ("test", ["test", "spec", "case", "coverage"]),
        ("implement", ["implement", "code", "function", "fix bug", "refactor"]),
        ("doc", ["doc", "explain", "summarize", "document"]),
        ("review", ["review", "audit"]),
        ("plan", ["plan", "estimate", "risk"]),
        ("probe", ["probe", "ack"]),
    ]
    for label, kws in rules:
        if any(k in low for k in kws):
            return label
    return "other"


def summarize(db: Path, window_days: int) -> dict:
    records = load_runs_and_tasks(db)
    cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)

    in_window = []
    for r in records:
        a = parse_dt(r.get("accepted_at"))
        if a and a >= cutoff:
            in_window.append(r)

    total = len(in_window)
    by_state = Counter(r["state"] for r in in_window)
    success = by_state.get("Completed", 0)
    failed = by_state.get("Failed", 0)
    cancelled = by_state.get("Cancelled", 0)
    success_rate = success / total if total else 0

    # 失败原因
    failure_breakdown = Counter()
    for r in in_window:
        if r["state"] != "Failed":
            continue
        res = r.get("result") or {}
        f = res.get("failure") or {}
        code = f.get("code") or "unknown"
        cause = f.get("cause_class") or "unknown"
        failure_breakdown[(code, cause)] += 1

    # role 分布（identity_state 里的 role）
    role_dist = Counter()
    for r in in_window:
        ident = r.get("identity") or {}
        role_dist[ident.get("role", "unspecified")] += 1

    # task type 分布
    task_type_dist = Counter()
    for r in in_window:
        t = r.get("task") or {}
        instr = t.get("instruction", "")
        task_type_dist[classify_instruction(instr)] += 1

    # tool_profile 分布（看哪个 role / 哪个 profile）
    profile_dist = Counter()
    for r in in_window:
        t = r.get("task") or {}
        p = (t.get("permissions") or {}).get("tool_profile_ref", "unknown")
        profile_dist[p] += 1

    # 耗时
    durations = []
    for r in in_window:
        s, f = parse_dt(r.get("started_at")), parse_dt(r.get("finished_at"))
        if s and f:
            durations.append((f - s).total_seconds() * 1000)
    duration_stats = {}
    if durations:
        sorted_d = sorted(durations)
        duration_stats = {
            "count": len(sorted_d),
            "min_ms": int(min(sorted_d)),
            "median_ms": int(median(sorted_d)),
            "p90_ms": int(sorted_d[int(len(sorted_d) * 0.9)] if len(sorted_d) >= 2 else sorted_d[-1]),
            "max_ms": int(max(sorted_d)),
        }

    return {
        "db": str(db),
        "window_days": window_days,
        "total_records_all_time": len(records),
        "runs_in_window": total,
        "by_state": dict(by_state),
        "success_rate": round(success_rate, 4),
        "failure_breakdown": [
            {"code": k[0], "cause_class": k[1], "count": v}
            for k, v in failure_breakdown.most_common()
        ],
        "role_distribution": dict(role_dist),
        "task_type_distribution": dict(task_type_dist),
        "tool_profile_distribution": dict(profile_dist),
        "duration_ms": duration_stats,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", type=Path, help="Path to Piko SQLite db (default: largest var/*.sqlite)")
    ap.add_argument("--window-days", type=int, default=14)
    ap.add_argument("--json", action="store_true", help="Output JSON instead of human-readable")
    args = ap.parse_args()

    var_dir = Path(__file__).parent.parent / "var"
    db = args.db
    if not db:
        db = find_largest_db(var_dir)
    if not db or not db.exists():
        print(f"No SQLite db found in {var_dir}", file=sys.stderr)
        sys.exit(1)

    summary = summarize(db, args.window_days)
    if args.json:
        print(json.dumps(summary, indent=2))
    else:
        print(f"# V0 Baseline Report")
        print(f"DB: {summary['db']}")
        print(f"Window: last {summary['window_days']} days")
        print()
        print(f"## Volume")
        print(f"Records (all time): {summary['total_records_all_time']}")
        print(f"Runs in window: {summary['runs_in_window']}")
        print()
        print(f"## Outcomes")
        print(f"By state: {summary['by_state']}")
        print(f"Success rate: {summary['success_rate'] * 100:.1f}%")
        print()
        print(f"## Failure breakdown (top 10)")
        for f in summary["failure_breakdown"][:10]:
            print(f"  {f['code']} ({f['cause_class']}): {f['count']}")
        print()
        print(f"## Role distribution")
        for k, v in sorted(summary["role_distribution"].items(), key=lambda x: -x[1]):
            print(f"  {k}: {v}")
        if not summary["role_distribution"]:
            print("  (no identity data in this db)")
        print()
        print(f"## Task type distribution")
        for k, v in sorted(summary["task_type_distribution"].items(), key=lambda x: -x[1]):
            print(f"  {k}: {v}")
        print()
        print(f"## Tool profile distribution")
        for k, v in sorted(summary["tool_profile_distribution"].items(), key=lambda x: -x[1]):
            print(f"  {k}: {v}")
        print()
        print(f"## Duration")
        d = summary["duration_ms"]
        if d:
            print(f"  count={d['count']} median={d['median_ms']}ms p90={d['p90_ms']}ms max={d['max_ms']}ms")
        else:
            print("  (no duration data)")


if __name__ == "__main__":
    main()