#!/usr/bin/env python3
"""Update piko's documents to the newly adopted STD template versions.

STD versioning §4: each template carries its own SemVer, and every
document records the template version AND the exact template bytes it
was built from (template_sha256). When a project adopts a new STD
revision, both must move together -- the version says which template
generation the document follows, the hash says which bytes.

Values come from the NEW side's catalog and the NEW side's template
files. The old side's values are reported so the change is reviewable.

Usage:
    scripts/update-piko-template-versions.py --std-root <path> [--check] [--json]
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--std-root", type=Path, required=True,
                        help="checkout of the newly adopted STD revision")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    catalog = json.loads((args.std_root / "templates/catalog.json").read_text(encoding="utf-8"))
    versions = catalog["template_versions"]
    templates = catalog["templates"]

    changed: list[str] = []
    report: dict[str, dict] = {}

    for sidecar in sorted(Path(".").rglob("*.metadata.json")):
        if ".git" in sidecar.parts or "node_modules" in sidecar.parts:
            continue
        try:
            data = json.loads(sidecar.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(data, dict):
            continue
        template_id = data.get("template_id")
        if not template_id or template_id not in templates:
            continue

        template_path = args.std_root / "templates" / templates[template_id]
        if not template_path.is_file():
            continue
        digest = hashlib.sha256(template_path.read_bytes()).hexdigest()

        new_version = versions.get(template_id)
        new_hash = digest
        old_version = data.get("template_version")
        old_hash = data.get("template_sha256")

        if old_version == new_version and old_hash == new_hash:
            continue

        report[str(sidecar)] = {
            "template_id": template_id,
            "old_version": old_version, "new_version": new_version,
            "old_sha256": old_hash, "new_sha256": new_hash,
        }
        changed.append(str(sidecar))
        if not args.check:
            data["template_version"] = new_version
            data["template_sha256"] = new_hash
            sidecar.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    by_template = collections.Counter(entry["template_id"] for entry in report.values())
    result = {
        "mode": "check" if args.check else "apply",
        "std_root": str(args.std_root),
        "updated": changed,
        "count": len(changed),
        "by_template": dict(sorted(by_template.items())),
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['mode']}: {len(changed)} sidecar(s) updated")
        for template_id, count in sorted(by_template.items()):
            entry = next(v for v in report.values() if v["template_id"] == template_id)
            print(f"  {template_id:34s} {entry['old_version']} → {entry['new_version']}  ({count} 份)")
    return 1 if (args.check and changed) else 0


if __name__ == "__main__":
    raise SystemExit(main())
