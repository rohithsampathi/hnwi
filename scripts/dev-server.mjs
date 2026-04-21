import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { spawn } from "node:child_process";

const repoRoot = realpathSync(process.cwd());
const nextBin = path.join(repoRoot, "node_modules", ".bin", "next");
const turbo = process.argv.includes("--turbo");
const distDir = turbo ? ".next-turbo" : ".next-webpack";

function getAncestorPids() {
  const ancestors = new Set([process.pid]);
  let current = process.ppid;
  while (current && !ancestors.has(current)) {
    ancestors.add(current);
    current = getParentPid(current);
  }
  return ancestors;
}

function getParentPid(pid) {
  try {
    const output = execFileSync("ps", ["-o", "ppid=", "-p", String(pid)], {
      encoding: "utf8",
    }).trim();
    const parsed = Number.parseInt(output, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function getProcessList() {
  try {
    const output = execFileSync("ps", ["-axo", "pid=,command="], {
      encoding: "utf8",
    });
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\s+(.*)$/);
        if (!match) return null;
        return {
          pid: Number.parseInt(match[1], 10),
          command: match[2],
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getCwd(pid) {
  try {
    const output = execFileSync("lsof", ["-a", "-d", "cwd", "-p", String(pid), "-Fn"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const cwdLine = output
      .split("\n")
      .find((line) => line.startsWith("n/"));
    return cwdLine ? cwdLine.slice(1) : "";
  } catch {
    return "";
  }
}

function isRepoNextProcess(proc, excludedPids) {
  if (!proc || excludedPids.has(proc.pid)) return false;
  const cmd = proc.command;
  const looksLikeNext =
    cmd.includes("node_modules/.bin/next dev") ||
    cmd.includes("next/dist/server/lib/start-server.js");

  if (!looksLikeNext) return false;
  if (cmd.includes(repoRoot)) return true;

  const cwd = getCwd(proc.pid);
  return cwd === repoRoot;
}

async function killStaleNextProcesses() {
  const excludedPids = getAncestorPids();
  const candidates = getProcessList().filter((proc) =>
    isRepoNextProcess(proc, excludedPids)
  );

  if (candidates.length === 0) return;

  for (const proc of candidates) {
    try {
      process.kill(proc.pid, "SIGTERM");
    } catch {}
  }

  await delay(500);

  for (const proc of candidates) {
    try {
      process.kill(proc.pid, 0);
      process.kill(proc.pid, "SIGKILL");
    } catch {}
  }

  await delay(150);
}

await killStaleNextProcesses();

const child = spawn(
  nextBin,
  turbo ? ["dev", "--turbo"] : ["dev"],
  {
    cwd: repoRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
    },
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
