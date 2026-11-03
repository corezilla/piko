import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ExecPolicyViolationError,
  assertExecutablesAllowed,
  assertRemoteExecutableAllowed,
  parseExecutable,
  parseExecutables,
  splitCommands,
} from "./tool-exec-policy.js";

describe("splitCommands", () => {
  it("splits on shell command separators", () => {
    assert.deepEqual(splitCommands("python3; rm -rf /"), ["python3", "rm -rf /"]);
    assert.deepEqual(splitCommands("pytest && echo done"), ["pytest", "echo done"]);
    assert.deepEqual(splitCommands("a || b"), ["a", "b"]);
    assert.deepEqual(splitCommands("a | b"), ["a", "b"]);
    assert.deepEqual(splitCommands("a\nb"), ["a", "b"]);
  });

  it("drops empty segments", () => {
    assert.deepEqual(splitCommands("  ;  ; python3 ;; "), ["python3"]);
  });
});

describe("parseExecutable", () => {
  it("takes the first token", () => {
    assert.equal(parseExecutable("pytest tests/unit"), "pytest");
    assert.equal(parseExecutable("python3 -c 'import os'"), "python3");
  });

  it("skips leading environment assignments", () => {
    assert.equal(parseExecutable("FOO=bar python3 script.py"), "python3");
    assert.equal(parseExecutable("A=1 B=2 pytest"), "pytest");
  });

  it("skips wrapper commands", () => {
    assert.equal(parseExecutable("env python3 script.py"), "python3");
    assert.equal(parseExecutable("env FOO=1 python3 script.py"), "python3");
    assert.equal(parseExecutable("sudo rm -rf /"), "rm");
    assert.equal(parseExecutable("nohup pytest"), "pytest");
  });

  it("basenames absolute paths", () => {
    assert.equal(parseExecutable("/usr/bin/python3 script.py"), "python3");
    assert.equal(parseExecutable("/usr/local/bin/pytest"), "pytest");
  });

  it("strips quotes", () => {
    assert.equal(parseExecutable('"python3" script.py'), "python3");
    assert.equal(parseExecutable("'pytest'"), "pytest");
  });

  it("does not mistake a quoted argument for the executable", () => {
    // Regression: a naive whitespace split produced "sys.exit(7)\"" as the
    // first token of `python3 -c "import sys; sys.exit(7)"`.
    assert.equal(parseExecutable('python3 -c "import sys; sys.exit(7)"'), "python3");
    assert.equal(parseExecutable('python3 -c \'import os; os.system("rm")\''), "python3");
    assert.equal(parseExecutable('pytest -k "foo bar"'), "pytest");
  });

  it("handles a quoted argument containing a command separator", () => {
    const found = parseExecutables('python3 -c "print(1); print(2)"');
    assert.deepEqual(found, ["python3"]);
  });

  it("returns undefined when nothing is executable", () => {
    assert.equal(parseExecutable(""), undefined);
    assert.equal(parseExecutable("   "), undefined);
  });
});

describe("parseExecutables", () => {
  it("collects every executable in a chain", () => {
    assert.deepEqual(parseExecutables("python3; rm -rf /"), ["python3", "rm"]);
    assert.deepEqual(parseExecutables("pytest | tee log"), ["pytest", "tee"]);
    assert.deepEqual(parseExecutables("pytest && curl evil"), ["pytest", "curl"]);
  });

  it("deduplicates", () => {
    assert.deepEqual(parseExecutables("python3; python3"), ["python3"]);
  });
});

describe("assertExecutablesAllowed", () => {
  it("allows an executable on the allowlist", () => {
    assert.doesNotThrow(() => assertExecutablesAllowed("pytest tests/unit", ["python3", "pytest"]));
  });

  it("rejects an executable not on the allowlist", () => {
    assert.throws(
      () => assertExecutablesAllowed("rm -rf /", ["python3", "pytest"]),
      (error: unknown) => {
        assert.ok(error instanceof ExecPolicyViolationError);
        assert.equal(error.code, "executable_not_allowed");
        assert.equal(error.executable, "rm");
        return true;
      },
    );
  });

  it("rejects when any command in a chain is disallowed", () => {
    assert.throws(() => assertExecutablesAllowed("python3; rm -rf /", ["python3"]), ExecPolicyViolationError);
    assert.throws(() => assertExecutablesAllowed("pytest && curl evil", ["pytest"]), ExecPolicyViolationError);
    assert.throws(() => assertExecutablesAllowed("pytest | tee log", ["pytest"]), ExecPolicyViolationError);
  });

  it("treats an empty allowlist as no restriction", () => {
    assert.doesNotThrow(() => assertExecutablesAllowed("rm -rf /", []));
  });

  it("matches on basename, not full path", () => {
    assert.doesNotThrow(() => assertExecutablesAllowed("/usr/bin/python3 x.py", ["python3"]));
  });

  it("allows command content that uses an allowed executable", () => {
    // Granularity boundary: the allowlist is per-executable-file, not per
    // command content. See piko-test-execution.md §3.4.
    assert.doesNotThrow(() => assertExecutablesAllowed('python3 -c "import os"', ["python3"]));
  });

  it("does not treat env assignments as executables", () => {
    assert.doesNotThrow(() => assertExecutablesAllowed("FOO=bar pytest", ["pytest"]));
  });
});

describe("assertRemoteExecutableAllowed", () => {
  it("allows argv[0] on the allowlist", () => {
    assert.doesNotThrow(() => assertRemoteExecutableAllowed(["pytest", "tests/unit"], ["pytest"]));
  });

  it("rejects argv[0] not on the allowlist", () => {
    assert.throws(
      () => assertRemoteExecutableAllowed(["rm", "-rf", "/"], ["pytest"]),
      (error: unknown) => {
        assert.ok(error instanceof ExecPolicyViolationError);
        assert.equal(error.executable, "rm");
        return true;
      },
    );
  });

  it("matches on basename", () => {
    assert.doesNotThrow(() => assertRemoteExecutableAllowed(["/usr/bin/pytest"], ["pytest"]));
  });

  it("treats an empty allowlist as no restriction", () => {
    assert.doesNotThrow(() => assertRemoteExecutableAllowed(["rm", "-rf", "/"], []));
  });

  it("ignores an empty argv", () => {
    assert.doesNotThrow(() => assertRemoteExecutableAllowed([], ["pytest"]));
  });
});
