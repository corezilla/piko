#!/usr/bin/env python3
"""按 JSON 清单批量生成 UT Case 脚本。

与 case_writer_pi.py 同样的原则：**只做标记替换，不参与花括号处理**。
区别在于这里不再逐个手写 HEADER，而是从用例文档 §3.1 的标题取「责任」，
从 case-index.json 取维度坐标——两处都是机器权威源，避免手抄漂移。

用法：
    python3 scripts/case_writer_generic.py <spec.json>

spec.json 形状：
    {
      "UT-PI-220": {
        "imports": "import { describe, expect, it } from \"vitest\";\n",
        "title": "carries the status and the code",
        "body": "    const e = ...;\n    expect(e).toBe(1);\n",
        "sync": false            // 可选；true 则 it() 不带 async
      }
    }
"""
import json
import re
import sys
from pathlib import Path

CASES = Path('tests/unit/cases')
DOCS = Path('docs/70_verification/unit/cases')
IDX = json.load(open('docs/70_verification/unit/case-index.json'))
BY = {c['case_id']: c for c in IDX['cases']}


def duty_of(cid):
    """从用例文档 §3.1 的标题取「责任」：去掉前缀的 `UT-XXX · `。"""
    text = (DOCS / f'{cid}.md').read_text()
    m = re.search(r'^#### 3\.1 (.+)$', text, re.M)
    if not m:
        raise SystemExit(f'{cid}: 用例文档里找不到 §3.1 标题')
    head = m.group(1).strip()
    prefix = f'{cid} · '
    return head[len(prefix):] if head.startswith(prefix) else head


def render(cid, item):
    c = BY[cid]
    head = f'''/**
 * Case ID: {cid}  ·  STATUS: real
 *
 * 责任：{duty_of(cid)}
 * 维度坐标：`{c['symbol']}` × `{c['type']}` × `{c['cell']}`（方案 §6.1A 分卷 `{c['module']}`）
 * 用例文档：docs/70_verification/unit/cases/{cid}.md（脚本的唯一依据）
 */
'''
    imports = item.get('imports', '')
    if imports and not imports.endswith('\n'):
        imports += '\n'
    title = item['title']
    body = item['body'].rstrip('\n')
    async_kw = '' if item.get('sync') else 'async '
    title_line = f'  it("{title}", {async_kw}() => {{'
    if not title.endswith(')'):
        title_line += f'  // {title}'
    return (head + imports + '\n'
            + f'describe("{cid} · {c["symbol"]} · {c["type"]} × {c["cell"]}", () => {{\n'
            + title_line + '\n'
            + body + '\n'
            + '  });\n'
            + '});\n')


def main():
    if len(sys.argv) < 2:
        raise SystemExit('用法：python3 scripts/case_writer_generic.py <spec.json>')
    spec = json.load(open(sys.argv[1]))
    for cid, item in spec.items():
        if cid not in BY:
            raise SystemExit(f'{cid}: 不在 case-index.json 里')
        (CASES / f'{cid}.test.ts').write_text(render(cid, item))
    print(f'写入 {len(spec)} 个 Case 脚本')


if __name__ == '__main__':
    main()
