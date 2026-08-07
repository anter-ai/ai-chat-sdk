#!/usr/bin/env node
// Stages a consumer-ready snapshot of @anter/ai-chat-sdk for the `dist` git branch:
// prebuilt dist/ (JS, .d.ts, and the stylesheets), LICENSE, README.md, and a package.json
// with devDependencies and scripts stripped out entirely.
// That branch has no build step and nothing to resolve outside this repo,
// so an external repo can depend on it via a plain git URL before this package is on npm:
//   "@anter/ai-chat-sdk": "git+https://github.com/anter-ai/ai-chat-sdk.git#dist"
//
// Dropping `scripts` is what makes the branch installable: the source package.json carries
// a `prepare` hook that rebuilds from src/, and pnpm runs `prepare` on every git dependency.
// On the dist branch there is no src/ and no devDependencies, so leaving it in would make
// every consumer install fail.
//
// This script only writes to an output directory — it does not touch git. See
// CONTRIBUTING.md for the branch commit/push steps.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = process.argv[2] ?? join(packageRoot, ".git-dist");

const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

// Every path the `exports` map can resolve to must exist before this is publishable.
// The stylesheets are copied by a trailing `cp` in the build script rather than emitted
// by tsup, so they are the ones that realistically go missing after a partial build.
const requiredFiles = new Set();
const collectTargets = (entry) => {
  if (typeof entry === "string") {
    requiredFiles.add(entry.replace(/^\.\//, ""));
  } else if (entry && typeof entry === "object") {
    for (const value of Object.values(entry)) collectTargets(value);
  }
};
collectTargets(pkg.exports);

const missing = [...requiredFiles].filter((file) => !existsSync(join(packageRoot, file)));
if (missing.length > 0) {
  console.error('dist/ is missing or incomplete. Run "pnpm build" first.\n');
  for (const file of missing) console.error(`  - ${file}`);
  process.exit(1);
}

const {
  name,
  version,
  description,
  keywords,
  license,
  author,
  homepage,
  bugs,
  repository,
  type,
  main,
  types,
  exports: pkgExports,
  files,
  sideEffects,
  peerDependencies,
  dependencies,
} = pkg;

// `sideEffects` and `peerDependencies` matter more here than they do for a server package:
// without the former a consumer's bundler tree-shakes the CSS imports away and the chat
// renders unstyled, and without the latter React resolves to a second copy and every hook
// throws. Both are easy to lose in a hand-written dist manifest.
const distPackage = {
  name,
  version,
  description,
  keywords,
  license,
  author,
  homepage,
  bugs,
  repository,
  type,
  main,
  types,
  exports: pkgExports,
  files,
  sideEffects,
  peerDependencies,
  dependencies,
};

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(packageRoot, "dist"), join(outDir, "dist"), { recursive: true });
cpSync(join(packageRoot, "LICENSE"), join(outDir, "LICENSE"));
cpSync(join(packageRoot, "README.md"), join(outDir, "README.md"));
writeFileSync(join(outDir, "package.json"), JSON.stringify(distPackage, null, 2) + "\n");

console.log(`Staged git-dist snapshot at ${outDir}`);
