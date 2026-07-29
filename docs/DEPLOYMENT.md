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

## Package Publishing

1. **Update Version**:
   Update `version` in `package.json` following [Semantic Versioning](https://semver.org/).

2. **Publish Package**:
   ```bash
   pnpm publish --access public
   ```
