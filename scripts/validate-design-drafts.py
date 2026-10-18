#!/usr/bin/env python3
"""Sandbox-side pre-validation for design drafts. Not STD validate-design — that needs /Users/ben/work/STD."""
import json
import re
import sys
from pathlib import Path

design_paths = [
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

base = Path(__file__).parent.parent
errors = 0

for rel in design_paths:
    path = base / rel
    print(f"\n=== {rel.split('/')[-1]} ===")
    if not path.exists():
        print(f"  MISSING: {path}")
        errors += 1
        continue
    content = path.read_text()
    # 找出代码块
    blocks = re.findall(r"```(json|typescript|ts)\n(.*?)\n```", content, re.DOTALL)
    for i, (lang, body) in enumerate(blocks):
        if lang in ("json",):
            try:
                json.loads(body)
                print(f"  [{lang}] block {i+1}: OK ({len(body)} chars)")
            except Exception as e:
                print(f"  [{lang}] block {i+1}: ERROR - {e}")
                errors += 1
        else:
            print(f"  [{lang}] block {i+1}: {len(body)} chars (syntax not checked)")
    # 检查 STD cover 占位标记
    if "DRAFT" not in content[:500]:
        print(f"  WARNING: 没有 'DRAFT' 标记（应明确 STD cover 未生成）")
        errors += 1
    else:
        print(f"  ✓ DRAFT marker present")

print(f"\n=== Summary ===")
print(f"Errors: {errors}")
sys.exit(1 if errors else 0)