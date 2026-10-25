#!/usr/bin/env node
// Pushes the specified local orphan branch to origin.
// Only accepts "dist-beta" — production "dist" is pushed by publish:dist only.
//
// Usage: node ./scripts/push-git-dist.mjs <branch>
//   branch: must be "dist-beta"
//   Any other value (including "dist", "main", "HEAD", empty string) exits non-zero
//   without running git push.

import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_BRANCH = "dist-beta";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

// Parse and validate branch argument
const branch = process.argv[2];

if (branch !== ALLOWED_BRANCH) {
  console.error(`Invalid branch: "${branch}". This script only accepts "${ALLOWED_BRANCH}".`);
  console.error(
    "Production dist is pushed by publish:dist. This script must not move dist, main, or tags.",
  );
  process.exit(1);
}

const runGit = (args, cwd = packageRoot) => {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
};

try {
  // 1. Get the local dist-beta SHA
  const localSha = runGit(["rev-parse", branch]);

  // 2. Get the commit subject to extract the source short SHA
  const commitSubject = runGit(["log", "-1", "--format=%s", branch]);
  const sourceMatch = commitSubject.match(/dist: ai-chat-sdk @ ([a-f0-9]+)/);
  const sourceSha = sourceMatch ? sourceMatch[1] : "unknown";

  // 3. Check if remote ref exists
  let remoteExists = false;
  try {
    const remoteRef = runGit(["ls-remote", "origin", `refs/heads/${branch}`]);
    remoteExists = remoteRef.length > 0;
  } catch {
    // Remote ref does not exist
    remoteExists = false;
  }

  // 4. Push with appropriate strategy
  if (remoteExists) {
    // Update existing remote branch with force-with-lease
    runGit(["push", "--force-with-lease", "origin", `${branch}:${branch}`]);
    console.log(`Updated origin/${branch} to ${localSha.substring(0, 7)} (source @ ${sourceSha})`);
  } else {
    // Create new remote branch (no --force, no --force-with-lease)
    runGit(["push", "-u", "origin", `${branch}:${branch}`]);
    console.log(`Created origin/${branch} at ${localSha.substring(0, 7)} (source @ ${sourceSha})`);
  }

  console.log(`Local ${branch} SHA: ${localSha}`);
  console.log(`Source revision: ${sourceSha}`);
} catch (error) {
  console.error(`Error pushing ${branch}:`);
  if (error.stderr) {
    console.error(error.stderr.toString());
  } else {
    console.error(error.message);
  }
  process.exit(1);
}
