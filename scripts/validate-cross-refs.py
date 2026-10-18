#!/usr/bin/env python3
"""Cross-document reference checker for V0.1 design docs.

Detects references of form:
  - §N, §N.M, §N.M.K (just the section number)
  - "V0.1 spec §X" / "system design §X" / "piko-skill-memory §X"
  - "<doc-name> §X" patterns

Resolves to the appropriate doc and validates the section exists.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

base = Path("/Users/ben/work/piko") if Path("/Users/ben/work/piko").exists() else Path("/sessions/amazing-stoic-goldberg/mnt/piko")

docs = {
    "piko-skill-memory": "docs/20_system_design/mechanisms/piko-skill-memory.md",
    "piko-doc-search": "docs/20_system_design/mechanisms/piko-doc-search.md",
    "piko-mem0-client-design": "docs/40_module_design/piko-mem0-client-design.md",
    "piko-skill-tools-design": "docs/40_module_design/piko-skill-tools-design.md",
    "piko-pi-adapter-design-skill-tools-update": "docs/40_module_design/piko-pi-adapter-design-skill-tools-update.md",
    "piko-policy-design-skill-tools-update": "docs/40_module_design/piko-policy-design-skill-tools-update.md",
    "piko-mem0-client-impl": "docs/50_implementation_design/piko-mem0-client-impl.isd.md",
    "piko-skill-tools-impl": "docs/50_implementation_design/piko-skill-tools-impl.isd.md",
    "piko-graphrag-impl": "docs/50_implementation_design/piko-graphrag-impl.isd.md",
    "piko-pi-adapter-impl-skill-tools-update": "docs/50_implementation_design/piko-pi-adapter-impl-skill-tools-update.isd.md",
    "piko-policy-impl-skill-tools-update": "docs/50_implementation_design/piko-policy-impl-skill-tools-update.isd.md",
    "piko-skill-tools-identity-contract": "docs/60_interfaces/contracts/piko-skill-tools-identity-contract-v0.1.md",
}

# Aliases: short names → doc keys
aliases = {
    "V0.1 spec": "piko-skill-memory",
    "v0.1 spec": "piko-skill-memory",
    "system design": "piko-skill-memory",
    "skill-memory.md": "piko-skill-memory",
    "piko-skill-memory.md": "piko-skill-memory",
    "piko-doc-search.md": "piko-doc-search",
    "piko-doc-search": "piko-doc-search",
    "piko-mem0-client-design.md": "piko-mem0-client-design",
    "piko-mem0-client-design": "piko-mem0-client-design",
    "piko-skill-tools-design.md": "piko-skill-tools-design",
    "piko-skill-tools-design": "piko-skill-tools-design",
    "piko-pi-adapter-design": "piko-pi-adapter-design-skill-tools-update",
    "piko-policy-design": "piko-policy-design-skill-tools-update",
    "piko-mem0-client-impl.isd.md": "piko-mem0-client-impl",
    "piko-skill-tools-impl.isd.md": "piko-skill-tools-impl",
    "piko-graphrag-impl.isd.md": "piko-graphrag-impl",
    "piko-pi-adapter-impl": "piko-pi-adapter-impl-skill-tools-update",
    "piko-policy-impl": "piko-policy-impl-skill-tools-update",
    "piko-skill-tools-identity-contract-v0.1.md": "piko-skill-tools-identity-contract",
}

# Build section index per doc
def extract_sections(path: Path) -> set:
    if not path.exists():
        return set()
    content = path.read_text()
    headers = set()
    for m in re.finditer(r"^#{2,4}\s+(\d+(?:\.\d+){0,3})[\s.）]", content, re.MULTILINE):
        headers.add(m.group(1))
    return headers

doc_sections = {}
for key, rel in docs.items():
    doc_sections[key] = extract_sections(base / rel)

# Find references with prefix patterns
def find_refs(content: str) -> list:
    refs = []
    # Pattern 1: "<alias> §N.M" or "<alias> §N"
    for m in re.finditer(r"([A-Za-z][\w\-\. ]*?)\s*§(\d+(?:\.\d+){0,2})", content):
        alias = m.group(1).strip().lower().rstrip(",.;:")
        ref = m.group(2)
        # 排除不可能是 alias 的（如 "tool"、 "code"）
        if alias in ("tool", "code", "test", "see", "above", "below", "the", "a", "an"):
            continue
        # Match alias to doc
        target_doc = None
        for known_alias, doc_key in aliases.items():
            if known_alias.lower() == alias or alias.endswith(known_alias):
                target_doc = doc_key
                break
        if target_doc is None:
            target_doc = "piko-skill-memory"  # default to V0.1 spec
        refs.append((target_doc, ref, m.start()))
    return refs

errors = []
for rel_key, rel in docs.items():
    path = base / rel
    if not path.exists():
        continue
    content = path.read_text()
    refs = find_refs(content)
    for target_doc, ref_num, pos in refs:
        # Get line number
        line_no = content[:pos].count('\n') + 1
        if ref_num not in doc_sections.get(target_doc, set()):
            errors.append(f"{rel.split('/')[-1]}:{line_no}: §{ref_num} → '{target_doc}' not found")

print(f"=== Section index ===")
for key, secs in doc_sections.items():
    print(f"  {key}: {len(secs)} sections")

print(f"\n=== Reference validation ===")
if errors:
    print(f"Found {len(errors)} broken references:")
    for e in errors:
        print(f"  {e}")
else:
    print("All references resolve.")

sys.exit(1 if errors else 0)