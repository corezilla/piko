#!/usr/bin/env python3
"""Extract TypeScript code blocks from design drafts and run tsc on them.

Each block is treated as an isolated file. Imports use paths relative to
the design doc location; we resolve them by copying blocks into a sandbox
directory structure.
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

base = Path("/Users/ben/work/piko") if Path("/Users/ben/work/piko").exists() else Path("/sessions/amazing-stoic-goldberg/mnt/piko")
sandbox = base / "var" / "ts-validation-sandbox"

docs = [
    "docs/40_module_design/piko-mem0-client-design.md",
    "docs/40_module_design/piko-skill-tools-design.md",
    "docs/40_module_design/piko-pi-adapter-design-skill-tools-update.md",
    "docs/40_module_design/piko-policy-design-skill-tools-update.md",
    "docs/50_implementation_design/piko-mem0-client-impl.isd.md",
    "docs/50_implementation_design/piko-skill-tools-impl.isd.md",
    "docs/50_implementation_design/piko-pi-adapter-impl-skill-tools-update.isd.md",
    "docs/50_implementation_design/piko-policy-impl-skill-tools-update.isd.md",
    "docs/60_interfaces/contracts/piko-skill-tools-identity-contract-v0.1.md",
]

# Setup sandbox
sandbox.mkdir(parents=True, exist_ok=True)
(sandbox / "tsconfig.json").write_text("""{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"],
    "baseUrl": "../..",
    "paths": {
      "typebox": ["upstream/pi/node_modules/typebox/build/index.d.mts"],
      "@earendil-works/chord": ["upstream/pi/packages/chord/src/index.ts"],
      "@earendil-works/chord/context": ["upstream/pi/packages/chord/src/context/index.ts"],
      "@earendil-works/chord/*": ["upstream/pi/packages/chord/src/*"],
      "@earendil-works/pi-telemetry": ["upstream/pi/packages/telemetry/src/index.ts"],
      "@earendil-works/pi-telemetry/*": ["upstream/pi/packages/telemetry/src/*"],
      "@earendil-works/pi-ai": ["upstream/pi/packages/ai/src/index.ts"],
      "@earendil-works/pi-ai/*": ["upstream/pi/packages/ai/src/*.ts", "upstream/pi/packages/ai/src/providers/*.ts"]
    }
  },
  "include": ["./blocks/*.ts"]
}""")

# Extract TS blocks
tsc_bin = base / "node_modules" / ".bin" / "tsc"
all_errors = []

for rel in docs:
    path = base / rel
    if not path.exists():
        print(f"MISSING: {rel}")
        continue
    content = path.read_text()
    blocks = re.findall(r"```(?:typescript|ts)\n(.*?)\n```", content, re.DOTALL)
    for i, body in enumerate(blocks):
        if not body.strip():
            continue
        # 跳过显然是 import / 简短片段的（< 30 字符 且 没有 type/interface/function/class 关键字）
        if len(body.strip()) < 30 and not any(kw in body for kw in ['type ', 'interface ', 'function ', 'class ', 'export ', 'import ']):
            continue
        # 跳过纯注释块
        if all(line.strip().startswith('//') or not line.strip() for line in body.split('\n')):
            continue
        # 保存到 sandbox
        doc_name = rel.split('/')[-1].replace('.md', '').replace('.isd', '')
        out_file = sandbox / "blocks" / f"{doc_name}_{i+1}.ts"
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(body)

# 跑 tsc
result = subprocess.run(
    [str(tsc_bin), "--noEmit", "-p", "tsconfig.json"],
    cwd=sandbox,
    capture_output=True,
    text=True,
    timeout=120,
)

print(f"\n=== tsc result ===")
print(f"Return code: {result.returncode}")
if result.stdout:
    print(result.stdout)
if result.stderr:
    print(result.stderr)
sys.exit(result.returncode)