# Development Guide

This guide covers local environment setup, project scripts, testing, and contribution workflows for `@anter/ai-chat-sdk`.

## Prerequisites

- **Node.js**: `^20.0.0` or higher
- **pnpm**: `^9.0.0` or higher

```bash
npm install -g pnpm
```

---

## Setup & Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/anter-ai/ai-chat-sdk.git
cd ai-chat-sdk
pnpm install
```

---

## Available Scripts

| Script            | Command                                                                  | Purpose                                          |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| `pnpm dev`        | `tsup --watch`                                                           | Build SDK in watch mode during local development |
| `pnpm build`      | `tsup && tsc -p tsconfig.build.json ...`                                 | Production build targeting `dist/`               |
| `pnpm test`       | `jest --config ./jest.config.cjs`                                        | Run Unit and Component test suites               |
| `pnpm test:watch` | `jest --config ./jest.config.cjs --watch`                                | Interactive Jest watcher                         |
| `pnpm type-check` | `tsc --noEmit`                                                           | Run TypeScript compiler type checking            |
| `pnpm lint`       | `eslint .`                                                               | Run ESLint check                                 |
| `pnpm format`     | `prettier --write .`                                                     | Format all source files with Prettier            |
| `pnpm check-all`  | `pnpm check-format && pnpm check-lint && pnpm check-types && pnpm build` | Complete CI verification suite                   |

---

## Testing Guidelines

- Unit tests are located alongside components or under `__tests__` directories.
- We use **Jest** and **React Testing Library** (`@testing-library/react`).
- Ensure all tests pass (`pnpm test`) before submitting a Pull Request.

---

## Code Quality Standards

Before committing, make sure your changes satisfy:

1. **Zero Lint Warnings**: `pnpm check-lint`
2. **Strict Typing**: `pnpm check-types`
3. **Format Alignment**: `pnpm check-format`
