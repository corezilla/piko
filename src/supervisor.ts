import { fork, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { attachChildToHandler, type Command, type FactHandler } from "./ipc.js";

/**
 * Key decision 7 — P0 control process supervises a P1 execution process.
 * P0 stays purely local (HTTP + store); P1 carries all blocking external IO
 * (Pi / LLM / tools / scp / Matrix). If P1 crashes, hangs or is killed, P0
 * keeps serving polling and cancel.
 */
export class ExecutionProcessSupervisor {
  private child: ChildProcess | null = null;
  private stopped = false;
  private restartDelay = 250;
  private lastHeartbeat = 0;
  private watchdog: NodeJS.Timeout | null = null;

  private channel?: { send: (cmd: Command) => void };
  constructor(
    private readonly env: NodeJS.ProcessEnv,
    private readonly onExit: (code: number | null, signal: NodeJS.Signals | null) => void,
    private readonly facts?: FactHandler,
  ) {}

  spawn() {
    if (this.stopped) return;
    const entry = fileURLToPath(new URL("./exec-process.ts", import.meta.url));
    this.child = fork(entry, [], { env: this.env, stdio: ["ignore", "inherit", "inherit", "ipc"] });
    this.lastHeartbeat = Date.now();
    if (this.facts) {
      this.channel = attachChildToHandler(this.child as any, this.facts);
    }
    this.child.on("message", (msg: any) => {
      if (msg?.type === "heartbeat" || msg?.fact?.kind === "heartbeat") {
        this.lastHeartbeat = Date.now();
        return;
      }
      if (msg?.type === "ready" || msg?.fact?.kind === "ready") this.restartDelay = 250;
    });
    this.child.on("exit", (code, signal) => {
      this.child = null;
      this.onExit(code, signal);
      if (!this.stopped) {
        const delay = this.restartDelay;
        this.restartDelay = Math.min(this.restartDelay * 2, 5000);
        setTimeout(() => this.spawn(), delay);
      }
    });
    this.startWatchdog();
  }

  /** A hung P1 (no heartbeat) is force-killed, which triggers restart on the exit handler. */
  private startWatchdog() {
    if (this.watchdog) return;
    this.watchdog = setInterval(() => {
      if (this.stopped || !this.child) return;
      if (this.unhealthy()) {
        console.error("[P0] execution process heartbeat lost; forcing restart");
        this.child.kill("SIGKILL");
      }
    }, 5000);
  }

  /** Kill P1 unconditionally (used by cancel timeouts / shutdown). */
  kill() {
    if (this.child) {
      this.child.kill("SIGKILL");
      this.child = null;
    }
  }

  /** True if P1 has not reported a heartbeat within the window. */
  unhealthy(windowMs = 30000): boolean {
    return this.child !== null && Date.now() - this.lastHeartbeat > windowMs;
  }

  alive(): boolean {
    return this.child !== null;
  }

  async stop() {
    this.stopped = true;
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = null;
    if (!this.child) return;
    const child = this.child;
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 5000);
      child.once("exit", () => {
        clearTimeout(t);
        resolve();
      });
      child.kill("SIGTERM");
    });
  }
}

/** Send a command to the running P1 (e.g. abort/shutdown). */
// (kept on the instance via this.channel)
