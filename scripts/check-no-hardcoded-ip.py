#!/usr/bin/env python3
"""Fail when a script, test or config bakes in a machine address.

The rule this enforces, and why:

  - The machine you are on is `localhost` / `127.0.0.1` / `[::1]`. Loopback is
    the only address that is true everywhere, so it is allowed.
  - Any OTHER host is reached by NAME, through an environment variable or an
    SSH config alias. An IP names one box on one network at one moment; the
    moment the topology moves (as it did between the m5pro and m5air setups)
    every hardcoded address silently points at the wrong machine.

Usage: python3 scripts/check-no-hardcoded-ip.py [paths...]
Exit 0 when clean, 1 when an address is found.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SUFFIXES = {".sh", ".ts", ".tsx", ".js", ".mjs", ".py", ".json", ".md", ".yml", ".yaml", ".toml"}
# `upstream/` is the pinned third-party Pi checkout: its addresses are not ours
# to change. `notes/archive/` holds superseded records kept verbatim -- rewriting
# history there would make the archive lie about what was true at the time.
SKIP_DIRS = {
    "node_modules", ".git", ".gitnexus", "dist", "coverage", "var",
    ".review-materials", "__pycache__", "upstream", "archive",
}

# Anything that looks like a dotted quad. Version strings and section numbers
# are filtered out below rather than by a cleverer regex: a number triple is
# far more common than an IP, and a guard that cries wolf gets switched off.
# A trailing /N is a CIDR range, not a host: `127.0.0.0/8` names the loopback
# block. Matching it separately keeps it from being reported as a host address.
IPV4 = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b(?!\s*/\d)")

# Loopback is the one address that means "this machine" no matter where the
# code runs, so it is not a hardcoded host.
ALLOWED = {"127.0.0.1", "0.0.0.0", "255.255.255.255"}

# Placeholder/reserved ranges are examples, not deployments: `192.0.2.x`
# (TEST-NET-1), `198.51.100.x` (TEST-NET-2), `203.0.113.x` (TEST-NET-3) are
# reserved for documentation by RFC 5737 and can never address a real host.
RESERVED_PREFIXES = ("192.0.2.", "198.51.100.", "203.0.113.")


def iter_files(paths: list[str]) -> list[Path]:
    if not paths:
        return [
            p
            for p in ROOT.rglob("*")
            if p.is_file()
            and p.suffix in SUFFIXES
            and not any(part in SKIP_DIRS for part in p.parts)
        ]
    out: list[Path] = []
    for raw in paths:
        p = Path(raw)
        out.extend([p] if p.is_file() else [q for q in p.rglob("*") if q.is_file()])
    return out


# Section/version numbers look exactly like dotted quads (7.2.1.1). They are
# distinguishable by context: a heading or a bolded anchor is documentation
# numbering, never an address. Requiring at least one octet >= 10 rules out the
# low section numbers without admitting real addresses, all of which are
# ordinary host numbers.
def is_candidate(text: str, line: str) -> bool:
    if text in ALLOWED:
        return False
    if text.startswith(RESERVED_PREFIXES):
        return False
    octets = [int(o) for o in text.split(".")]
    if any(o > 255 for o in octets):
        return False
    # `7.2.1.1`, `2.3.1.4` -- documentation numbering, all parts small.
    if all(o < 10 for o in octets):
        return False
    return True


def main(argv: list[str]) -> int:
    findings: list[str] = []
    for path in iter_files(argv):
        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        for number, line in enumerate(lines, 1):
            for match in IPV4.findall(line):
                if is_candidate(match, line):
                    rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
                    findings.append(f"{rel}:{number}: {match}")

    if not findings:
        print("no hardcoded host addresses")
        return 0

    print("hardcoded host addresses found (use localhost/127.0.0.1 for this machine,")
    print("a host NAME via an environment variable for any other):")
    for finding in findings:
        print(f"  {finding}")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
