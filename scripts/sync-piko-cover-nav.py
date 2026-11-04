#!/usr/bin/env python3
"""Bring a project's document covers up to STD's current cover wording.

STD's shared cover (templates/_shared/document-cover.md) is the single
source for the cover text. A project instantiates it: the wording is
boilerplate, but the navigation link must stay project-relative.

This script rewrites the statement and the navigation wording, keeping
each document's own link target. It does NOT touch the field table --
that is scripts/sync-piko-covers.py's job (values come from the metadata
sidecar, never from the cover).

Usage:
    scripts/sync-piko-cover-nav.py [--check] [--json] [paths...]
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

BEGIN = "<!-- STD_DOCUMENT_COVER_BEGIN -->"
END = "<!-- STD_DOCUMENT_COVER_END -->"

STATEMENT = (
    "> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**"
)

# STD now points at the entry, and the entry carries the authoring index:
# an author is told where to look, and told that the index is a list of
# obligations rather than a manual to read.
NAVIGATION = (
    "> STD 入口：[{label}]({target})。入口的**编写索引**已列出本类文档的全部硬性义务："
    "不必通读规范，但**每一条都必须遵守**。"
)

COVER = re.compile(re.escape(BEGIN) + r"(?P<body>.*?)" + re.escape(END), re.DOTALL)
NAV_LINE = re.compile(r"^> STD (?:使用入口|入口)：.*$", re.MULTILINE)


def refresh(text: str) -> str | None:
    """Return the text with the current statement and navigation, or None
    if it is already current."""
    match = COVER.search(text)
    if match is None:
        return None
    body = match.group("body")
    navigation = NAV_LINE.search(body)
    if navigation is None:
        return None

    # Keep the project's own link: rewrite only the wording around it.
    link = re.search(r"\[([^\]]+)\]\(([^)]+)\)", navigation.group(0))
    if link is None:
        return None
    label, target = link.group(1), link.group(2)
    label = "项目采用说明与标准导航" if "项目采用" in label else "STD 主说明与执行流程"
    new_navigation = NAVIGATION.format(label=label, target=target)

    updated_body = body[: navigation.start()] + STATEMENT + "\n" + new_navigation + body[navigation.end():]
    # A document may carry the statement twice after an earlier partial
    # migration; keep exactly one.
    updated_body = updated_body.replace(STATEMENT + "\n" + STATEMENT, STATEMENT)
    return text[: match.start("body")] + updated_body + text[match.end("body"):]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    targets: list[Path] = []
    for given in (args.paths or [Path("docs"), Path("tests")]):
        if given.is_dir():
            targets.extend(sorted(given.rglob("*.md")))
        elif given.is_file():
            targets.append(given)

    changed: list[str] = []
    unchanged: list[str] = []
    for markdown in targets:
        text = markdown.read_text(encoding="utf-8")
        if BEGIN not in text:
            continue
        updated = refresh(text)
        if updated is None:
            unchanged.append(str(markdown))
            continue
        changed.append(str(markdown))
        if not args.check:
            markdown.write_text(updated, encoding="utf-8")

    result = {
        "mode": "check" if args.check else "apply",
        "updated": changed,
        "unchanged": len(unchanged),
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['mode']}: {len(changed)} cover(s) updated, {len(unchanged)} unchanged")
        for name in changed[:20]:
            print(f"  {name}")
        if len(changed) > 20:
            print(f"  ... and {len(changed) - 20} more")
    return 1 if (args.check and changed) else 0


if __name__ == "__main__":
    raise SystemExit(main())
