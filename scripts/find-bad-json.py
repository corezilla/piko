#!/usr/bin/env python3
"""Locate the bad JSON blocks."""
import re
import json
from pathlib import Path

base = Path("/Users/ben/work/piko") if Path("/Users/ben/work/piko").exists() else Path(__file__).resolve().parent.parent
paths = [
    "docs/60_interfaces/contracts/piko-skill-tools-identity-contract-v0.1.md",
    "docs/40_module_design/piko-mem0-client-design.md",
    "docs/40_module_design/piko-skill-tools-design.md",
    "docs/40_module_design/piko-pi-adapter-design-skill-tools-update.md",
    "docs/40_module_design/piko-policy-design-skill-tools-update.md",
    "docs/50_implementation_design/piko-mem0-client-impl.isd.md",
    "docs/50_implementation_design/piko-skill-tools-impl.isd.md",
    "docs/50_implementation_design/piko-pi-adapter-impl-skill-tools-update.isd.md",
    "docs/50_implementation_design/piko-policy-impl-skill-tools-update.isd.md",
]

for rel in paths:
    path = base / rel
    if not path.exists():
        continue
    content = path.read_text()
    blocks = re.findall(r"```(json|typescript|ts)\n(.*?)\n```", content, re.DOTALL)
    for i, (lang, body) in enumerate(blocks):
        if lang != "json":
            continue
        try:
            json.loads(body)
        except Exception as e:
            print(f"{rel} block {i+1}: {e}")
            print(f"  Body: {body[:200]}")
            print(f"  --")