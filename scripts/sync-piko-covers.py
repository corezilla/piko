#!/usr/bin/env python3
"""Repair piko's document covers where they disagree with STD's shape.

Surgical by construction: it edits a cover only where something is
actually wrong, and it edits the minimum that fixes it. Formatting that
STD's validator accepts (backticks around a value, the document's own
title, the project's relative link depth) is left alone.

Three defects this repairs, all reported by STD's validate-design:

  cover.missing    a document has the compact 8-field front cover but no
                   end-of-document control block, so the other 9 fields
                   are absent altogether.
  cover.mismatch   a cover value disagrees with the metadata sidecar.
  stray field     a front block carries a field that is not one of the 8
                   compact ones -- STD requires those in the control
                   block.

Values come from the metadata sidecar, never from the cover, so a cover
can only ever be made to agree with its sidecar, not with itself.

Usage:
    scripts/sync-piko-covers.py [--check] [--json] [paths...]

    --check   report what would change, change nothing, exit 1 if any
              document is out of shape.
    --json    machine-readable result on stdout.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

BEGIN = "<!-- STD_DOCUMENT_COVER_BEGIN -->"
END = "<!-- STD_DOCUMENT_COVER_END -->"
CONTROL_BEGIN = "<!-- STD_DOCUMENT_CONTROL_BEGIN -->"
CONTROL_END = "<!-- STD_DOCUMENT_CONTROL_END -->"

# The 8 fields that belong in the FRONT block (STD sync-template-covers
# COMPACT_FIELDS). Everything else lives in the control block.
COMPACT_FIELDS = [
    "Document ID", "Document Version", "Status", "Project",
    "Document Owner", "Last Modified Date", "Template ID", "Template Version",
]

# metadata key -> cover field
FIELD_SOURCE = {
    "Document ID": "document_id",
    "Document Version": "document_version",
    "Status": "status",
    "Project": "project",
    "Authority": "authority",
    "Document Owner": "document_owner",
    "Authors": "authors",
    "Created Date": "created_at",
    "Last Modified Date": "last_modified_at",
    "Template ID": "template_id",
    "Template Version": "template_version",
    "Template Conformance": "template_conformance",
    "Tailoring Reference": "tailoring_ref",
    "Migration Map Reference": "migration_map_ref",
    "Repository": "source_repository",
    "Canonical Path": "source_path",
    "Supersedes": "supersedes",
}

# STD renders a null metadata value as the literal word "none" for EVERY
# field (validate-design expected_cover_value), not only for a few.
NONE_IS_NULL = True

# STD renders the metadata's status through this label map (validate-design
# STATUS_LABELS); the cover carries the label, the metadata carries the key.
STATUS_LABELS = {
    "draft": "Draft", "review": "In Review", "accepted": "Approved",
    "released": "Released", "superseded": "Superseded", "retired": "Retired",
}

REVIEWER_NOTE = (
    "> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是\n"
    "> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。"
)

COVER = re.compile(re.escape(BEGIN) + r"(?P<body>.*?)" + re.escape(END), re.DOTALL)
CONTROL = re.compile(re.escape(CONTROL_BEGIN) + r"(?P<body>.*?)" + re.escape(CONTROL_END), re.DOTALL)
ROW = re.compile(r"^\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|\s*$", re.MULTILINE)


def strip_cover_value(value: str) -> str:
    """STD compares cover values with the backticks stripped."""
    return value.strip().strip("`").strip()


def expected_value(field: str, metadata: dict) -> str:
    key = FIELD_SOURCE[field]
    value = metadata.get(key)
    if field == "Status":
        return STATUS_LABELS.get(value, str(value))
    if value is None:
        return "none"
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)


def rows_of(body: str) -> list[tuple[str, str]]:
    """The field rows of a cover or control block, in order."""
    seen: set[str] = set()
    rows: list[tuple[str, str]] = []
    for line in body.splitlines():
        match = ROW.match(line)
        if match is None:
            continue
        field = match.group(1)
        if field == "文档字段" or field in seen:
            continue
        if set(field) <= {"-", " "}:  # the | --- | --- | separator
            continue
        seen.add(field)
        rows.append((field, match.group(2)))
    return rows


def fix_row(field: str, current: str, metadata: dict) -> str | None:
    """The corrected cell value, or None if the current one is already right.

    The current value's own quoting style is preserved: a value written
    with backticks stays that way, so a cover that is already correct is
    left byte-identical. A field that is not one of STD's 17 (a project
    field) is kept as it is -- it only moves, never changes.
    """
    if field not in FIELD_SOURCE:
        return None
    expected = expected_value(field, metadata)
    if strip_cover_value(current) == expected:
        return None
    if current.strip().startswith("`") and current.strip().endswith("`"):
        return f"`{expected}`"
    return expected


# Fields where the cover is the authority, not the sidecar.
#
# Document Version and Last Modified Date record what the DOCUMENT says
# about itself; a sidecar that was not updated alongside an edit is the
# stale one. Reverting the cover to it would undo a real change, so these
# are reported for the owner to reconcile instead of being rewritten.
COVER_IS_AUTHORITY = {"Document Version", "Last Modified Date"}


def repair_cover(text: str, metadata: dict) -> tuple[str, list[str]]:
    """Return (repaired text, list of repairs made)."""
    repairs: list[str] = []
    cover = COVER.search(text)
    if cover is None:
        return text, repairs

    front_rows = rows_of(cover.group("body"))
    control = CONTROL.search(text)
    control_rows = rows_of(control.group("body")) if control else []

    # A document with a control block uses the compact front (8 fields);
    # one without carries all 17 in the front.
    has_control = control is not None

    # 1. Fix the values that disagree with the metadata.
    new_front_rows = []
    for field, current in front_rows:
        fixed = fix_row(field, current, metadata)
        if fixed is not None:
            if field in COVER_IS_AUTHORITY:
                repairs.append(
                    f"cover: {field} is {strip_cover_value(current)!r} but the sidecar says "
                    f"{strip_cover_value(fixed)!r} -- the cover wins; update the sidecar"
                )
            else:
                repairs.append(f"cover: {field} {strip_cover_value(current)!r} -> {strip_cover_value(fixed)!r}")
                current = fixed
        new_front_rows.append((field, current))

    new_control_rows = []
    for field, current in control_rows:
        fixed = fix_row(field, current, metadata)
        if fixed is not None:
            if field in COVER_IS_AUTHORITY:
                repairs.append(
                    f"control: {field} is {strip_cover_value(current)!r} but the sidecar says "
                    f"{strip_cover_value(fixed)!r} -- the cover wins; update the sidecar"
                )
            else:
                repairs.append(f"control: {field} {strip_cover_value(current)!r} -> {strip_cover_value(fixed)!r}")
                current = fixed
        new_control_rows.append((field, current))

    front_fields = {field for field, _ in new_front_rows}
    control_fields = {field for field, _ in new_control_rows}

    # A FULL cover (all 17 in the front, no control block) is valid STD
    # shape -- validate-design accepts it. Only the COMPACT shape (front 8
    # + control block) restricts the front to those 8, so only there is a
    # stray field out of place.
    if has_control:
        strays = [row for row in new_front_rows if row[0] not in COMPACT_FIELDS]
        if strays:
            for field, value in strays:
                repairs.append(f"moved {field} from the front cover to the control block")
            new_front_rows = [row for row in new_front_rows if row[0] in COMPACT_FIELDS]
            new_control_rows = new_control_rows + strays

    # 3. Missing fields.
    if has_control:
        missing_front = [f for f in COMPACT_FIELDS if f not in front_fields]
        missing_control = [f for f in FIELD_SOURCE if f not in control_fields and f not in COMPACT_FIELDS]
    else:
        missing_front = [f for f in FIELD_SOURCE if f not in front_fields]
        missing_control = []

    for field in missing_front:
        repairs.append(f"added {field} to the front cover")
        new_front_rows.append((field, expected_value(field, metadata)))
    for field in missing_control:
        repairs.append(f"added {field} to the control block")
        new_control_rows.append((field, expected_value(field, metadata)))

    if not repairs:
        return text, repairs

    # A repair that only reports a disagreement (the cover is right, the
    # sidecar is stale) is not an edit -- the file must stay byte-identical.
    if all("update the sidecar" in line for line in repairs):
        return text, repairs

    # Rebuild the front block BODY, preserving its heading and navigation
    # lines. The BEGIN/END markers live outside the body, so they are left
    # in place: only the body is replaced.
    body = cover.group("body")
    head = []
    for line in body.splitlines():
        if line.startswith("|"):
            break
        head.append(line)
    while head and not head[-1].strip():
        head.pop()

    front_body = "\n".join([
        *head,
        "",
        "| 文档字段 | 值 |",
        "|---|---|",
        *[f"| {field} | {value} |" for field, value in new_front_rows],
        "",
    ])

    updated = text[: cover.start("body")] + front_body + text[cover.end("body"):]

    # Rebuild or add the control block. Its body convention is a leading and
    # trailing newline (the markers sit on their own lines).
    if new_control_rows:
        control_body = "\n".join([
            "",
            "| 文档字段 | 值 |",
            "|---|---|",
            *[f"| {field} | {value} |" for field, value in new_control_rows],
            "",
            REVIEWER_NOTE,
            "",
        ])
        existing = CONTROL.search(updated)
        if existing is None:
            updated = updated.rstrip("\n") + "\n\n" + CONTROL_BEGIN + "\n" + control_body + CONTROL_END + "\n"
        else:
            updated = updated[: existing.start("body")] + control_body + updated[existing.end("body"):]

    return updated, repairs


def sidecar_for(markdown: Path) -> Path | None:
    for candidate in (
        markdown.with_suffix("").with_suffix(".metadata.json"),
        markdown.parent / (markdown.stem + ".metadata.json"),
    ):
        if candidate.exists():
            return candidate
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    targets: list[Path] = []
    for given in (args.paths or [Path("docs")]):
        if given.is_dir():
            targets.extend(sorted(given.rglob("*.md")))
        elif given.is_file():
            targets.append(given)

    changed: list[str] = []
    repairs: dict[str, list[str]] = {}
    skipped: list[str] = []
    for markdown in targets:
        sidecar = sidecar_for(markdown)
        if sidecar is None:
            if "<!-- STD_DOCUMENT_COVER_BEGIN -->" in markdown.read_text(encoding="utf-8"):
                skipped.append(str(markdown))
            continue
        metadata = json.loads(sidecar.read_text(encoding="utf-8"))
        text = markdown.read_text(encoding="utf-8")
        updated, what = repair_cover(text, metadata)
        if not what:
            continue
        changed.append(str(markdown))
        repairs[str(markdown)] = what
        if not args.check:
            markdown.write_text(updated, encoding="utf-8")

    result = {
        "mode": "check" if args.check else "apply",
        "updated": changed,
        "repairs": repairs,
        "skipped_no_metadata": skipped,
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['mode']}: {len(changed)} cover(s) repaired, "
              f"{len(skipped)} skipped (no metadata sidecar)")
        for name in changed:
            print(f"  {name}")
            for line in repairs[name]:
                print(f"      {line}")
    return 1 if (args.check and changed) else 0


if __name__ == "__main__":
    raise SystemExit(main())
