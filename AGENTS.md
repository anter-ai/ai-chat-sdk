# Agent Instructions & Project Context (`@anter/ai-chat-sdk`)

This document provides instructions and quick reference context for AI coding assistants working in this repository.

---

## Core Philosophy: The Agnostic Contract

**This is the most critical constraint in this repository.**

- The core SDK (`src/`) is 100% industry-agnostic.
- Never introduce domain-specific concepts, variable names, or UI strings (such as `legal`, `finance`, `compliance`, `rfpMode`, `audit`, `vendor`) into core packages (`src/`).
- All domain-specific behaviors must be encapsulated within host application adapters implementing the `ChatAdapter` interface.

---

## Quick Reference Commands

| Purpose                                           | Command           |
| ------------------------------------------------- | ----------------- |
| **Install Dependencies**                          | `pnpm install`    |
| **Development Build (Watch Mode)**                | `pnpm dev`        |
| **Production Build**                              | `pnpm build`      |
| **Run Unit Tests**                                | `pnpm test`       |
| **Run Tests (Watch Mode)**                        | `pnpm test:watch` |
| **Type Check**                                    | `pnpm type-check` |
| **Linting**                                       | `pnpm check-lint` |
| **Format Code**                                   | `pnpm format`     |
| **Full CI Suite (Format + Lint + Types + Build)** | `pnpm check-all`  |

---

## Codebase Structure

- **`src/headless/`**: State management & pure React hooks (`ChatProvider`, `useChatStore`, `useChatMessages`, `useArtifacts`, `useSlashCommands`).
- **`src/ui/`**: Visual React UI components (`ChatShell`, `ChatView`, `ChatWidget`, `RecordPanel`, `ChatEmptyState`).
- **`src/extensions/`**: Registries for slash commands and dynamic artifact viewports.
- **`src/headless/types/`**: TypeScript contracts (`ChatAdapter`, `ChatMessage`, `Session`, `Artifact`, `Citation`).
- **`packages/anter-adapter/`**: Standard reference implementation of `ChatAdapter`.
- **`docs/`**: Technical documentation (`ARCHITECTURE.md`, `DEVELOPMENT.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, `QUICKSTART.md`).

---

## Verification Requirements

Before reporting completion on any code or feature change:

1. Ensure formatting is clean (`pnpm format`).
2. Run full CI verification: `pnpm check-all`.
3. Verify all unit test suites pass: `pnpm test`.
