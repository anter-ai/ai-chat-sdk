#!/usr/bin/env node
// Creates a clean orphan commit in a temporary repository containing the prebuilt snapshot
// staged in .git-dist, then fetches it as the local `dist` branch.

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(packageRoot, ".git-dist");

if (!existsSync(distDir)) {
  console.error(
    `Staged distribution directory does not exist at ${distDir}.\n` +
      `Please run "pnpm prepare:git-dist" first.`,
  );
  process.exit(1);
}

const runGit = (args, cwd = packageRoot) => {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
};

try {
  // 1. Get short SHA of HEAD from the main repo
  const shortSha = runGit(["rev-parse", "--short", "HEAD"]);

  // 2. Get user config from the main repo to pass into the temp repo
  let userName = "";
  let userEmail = "";
  try {
    userName = runGit(["config", "user.name"]);
  } catch {
    // Ignore
  }
  try {
    userEmail = runGit(["config", "user.email"]);
  } catch {
    // Ignore
  }

  // 3. Create a temporary directory for the isolated repo
  const distTmp = mkdtempSync(join(tmpdir(), "ai-chat-sdk-dist-"));

  try {
    // 4. Copy the staged build contents to the temporary directory
    cpSync(distDir, distTmp, { recursive: true });

    // 5. Initialize temp git repo and configure it
    runGit(["init", "-b", "dist", "-q"], distTmp);
    if (userName) {
      runGit(["config", "user.name", userName], distTmp);
    }
    if (userEmail) {
      runGit(["config", "user.email", userEmail], distTmp);
    }

    // 6. Stage and commit
    runGit(["add", "-A"], distTmp);
    runGit(["commit", "-m", `dist: ai-chat-sdk @ ${shortSha}`, "-q"], distTmp);

    // 7. Fetch the orphan branch back to the main repository
    runGit(["fetch", distTmp, "+dist:dist"]);

    console.log(`Successfully updated local dist branch to commit @ ${shortSha}`);
  } finally {
    // 8. Clean up temporary directory
    rmSync(distTmp, { recursive: true, force: true });
  }
} catch (error) {
  console.error("Error deploying git-dist:");
  if (error.stderr) {
    console.error(error.stderr.toString());
  } else {
    console.error(error.message);
  }
  process.exit(1);
}
