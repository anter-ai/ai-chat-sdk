# Deployment & Release Guide

This document describes how to build, verify, and publish `@anter/ai-chat-sdk` packages.

## Build Artifacts

The build system utilizes `tsup` and `tsc`:

```bash
pnpm build
```

This compiles:

- `dist/index.js` & `dist/index.d.ts` (Main entry)
- `dist/headless/` (Headless entry)
- `dist/ui/` (UI entry)
- `dist/styles/styles.css` & `styles-no-base.css` (Tailwind / CSS assets)

---

## Pre-release Verification

Run the full audit pipeline:

```bash
pnpm check-all
```

---

## Git `dist` snapshots (pre-npm)

Until the package is on npm, consumers install a prebuilt orphan branch:

```json
"@anter/ai-chat-sdk": "git+https://github.com/anter-ai/ai-chat-sdk.git#dist"
```

| Channel     | Purpose                         | How to publish                                                         |
| ----------- | ------------------------------- | ---------------------------------------------------------------------- |
| `dist`      | Production snapshot             | Actions → **Publish dist** → channel `dist` (or `pnpm publish:dist`)   |
| `dist-beta` | Trial snapshot before promotion | Actions → **Publish dist** → channel `dist-beta` (or `pnpm publish:dist-beta`) |

Both channels are **manual only** — [`.github/workflows/publish-dist.yml`](../.github/workflows/publish-dist.yml)
uses `workflow_dispatch` and does not run on push. `dist-beta` never updates `origin/dist`.

---

## Package Publishing (npm)

1. **Update Version**:
   Update `version` in `package.json` following [Semantic Versioning](https://semver.org/).

2. **Publish Package**:
   ```bash
   pnpm publish --access public
   ```
