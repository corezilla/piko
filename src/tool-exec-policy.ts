/**
 * MECH-TESTEXEC §3 — executable allowlist enforcement.
 *
 * `tool-profiles.json` declares `permissions.executables` for `process` tools
 * (e.g. bash: ["python3","pytest","node",...]) and the tool-profile schema
 * declares its type, but until now no runtime code consumed either. The
 * allowlist was therefore decorative: an agent could execute any binary.
 *
 * This module resolves the set of executables a shell command would run and
 * checks them against the profile allowlist. Enforcement happens in PiRuntime's
 * `before_tool` hook, i.e. before `env.exec`, so a rejected command has no
 * side effects.
 *
 * Granularity: the allowlist is per-executable-file, NOT per-command-content.
 * `python3 -c "..."` is allowed because the executable is `python3`; parsing
 * command *content* reliably is not possible (interpreters, eval, aliases,
 * scripts). See docs/20_system_design/mechanisms/piko-test-execution.md §3.4.
 */

export class ExecPolicyViolationError extends Error {
  constructor(readonly code: "executable_not_allowed", message: string, readonly executable?: string) {
    super(message);
    this.name = "ExecPolicyViolationError";
  }
}

/** Shell metacharacters that separate one command from the next. */
const COMMAND_SEPARATORS = /(?:\|\||&&|[;|\n])/;

/**
 * Prefixes that wrap the real executable rather than being it.
 * `env FOO=1 python3` runs python3; `sudo rm` runs rm.
 */
const WRAPPER_COMMANDS = new Set(["env", "sudo", "nice", "nohup", "time", "command", "exec"]);

/** Leading `NAME=value` assignments are environment setup, not the executable. */
const ENV_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

/**
 * Split a shell command string into the individual commands it would run.
 * `python3; rm -rf /` yields ["python3", "rm -rf /"].
 */
export function splitCommands(command: string): string[] {
  return command
    .split(COMMAND_SEPARATORS)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Extract the executable name from one command segment.
 *
 * Strips environment assignments, wrapper commands, and path prefixes, then
 * returns the basename. Returns undefined when no executable can be identified.
 */
export function parseExecutable(segment: string): string | undefined {
  let tokens = segment.split(/\s+/).filter((token) => token.length > 0);

  // Skip leading environment assignments (FOO=bar cmd).
  while (tokens.length > 0 && ENV_ASSIGNMENT.test(tokens[0]!)) {
    tokens = tokens.slice(1);
  }

  // Skip wrapper commands (and, for `env`, its assignments again).
  while (tokens.length > 0 && WRAPPER_COMMANDS.has(stripQuotes(tokens[0]!).toLowerCase())) {
    tokens = tokens.slice(1);
    while (tokens.length > 0 && ENV_ASSIGNMENT.test(tokens[0]!)) {
      tokens = tokens.slice(1);
    }
  }

  const first = tokens[0];
  if (!first) return undefined;

  // Basename: /usr/bin/python3 -> python3. Take the last path segment.
  const withoutPath = first.split("/").pop() ?? first;
  const name = stripQuotes(withoutPath);
  return name.length > 0 ? name : undefined;
}

/**
 * Collect every executable a command string would run.
 *
 * Only the first token of each segment is considered. Shell metacharacters
 * inside a segment (redirections, subshells) are not parsed further: the
 * allowlist bounds which binaries may be launched, and a redirect cannot
 * introduce a new binary.
 */
export function parseExecutables(command: string): string[] {
  const found: string[] = [];
  for (const segment of splitCommands(command)) {
    const executable = parseExecutable(segment);
    if (executable && !found.includes(executable)) found.push(executable);
  }
  return found;
}

/**
 * Assert that every executable in `command` is allowed.
 *
 * An empty allowlist means "no restriction" — mirroring the `network_hosts`
 * semantics in tool-host-policy.ts (empty allowlist = passthrough).
 *
 * Throws ExecPolicyViolationError on the first disallowed executable.
 */
export function assertExecutablesAllowed(command: string, allowlist: readonly string[]): void {
  if (allowlist.length === 0) return;

  const allowed = new Set(allowlist.map((entry) => stripQuotes(entry).split("/").pop() ?? entry));
  for (const executable of parseExecutables(command)) {
    if (!allowed.has(executable)) {
      throw new ExecPolicyViolationError(
        "executable_not_allowed",
        `executable not allowed: ${executable} (allowed: ${[...allowed].join(", ")})`,
        executable,
      );
    }
  }
}

/**
 * Assert that a remote argv's executable is allowed.
 *
 * Remote argv is already an array (no shell parsing), so only argv[0] matters.
 */
export function assertRemoteExecutableAllowed(argv: readonly string[], allowlist: readonly string[]): void {
  if (allowlist.length === 0) return;
  const first = argv[0];
  if (!first) return;

  const name = stripQuotes(first.split("/").pop() ?? first);
  const allowed = new Set(allowlist.map((entry) => stripQuotes(entry).split("/").pop() ?? entry));
  if (!allowed.has(name)) {
    throw new ExecPolicyViolationError(
      "executable_not_allowed",
      `executable not allowed: ${name} (allowed: ${[...allowed].join(", ")})`,
      name,
    );
  }
}

function stripQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}
