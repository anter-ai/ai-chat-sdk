# Architecture Overview

This document outlines the architecture, package entry points, layer boundaries, and extension design of `@anter/ai-chat-sdk`.

## Core Philosophy: The Agnostic Contract

The SDK is **100% industry-agnostic**. The core UI (`src/ui`), state hooks (`src/headless`), and protocol contracts (`src/types`) must never contain domain-specific terms (such as `legal`, `finance`, `compliance`, `rfp`, `vendor`). Domain logic belongs solely in host application adapters or designated external adapters.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Host Application                     │
└────────────────────────────┬────────────────────────────┘
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
┌─────────────────────────┐             ┌─────────────────────────┐
│     UI Entry Point      │             │  Headless Entry Point   │
│ `@anter/ai-chat-sdk/ui` │             │`@anter/ai-chat-sdk/head`│
└────────────┬────────────┘             └────────────┬────────────┘
             │                                       │
             └───────────────────┬───────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │   `ChatProvider` &    │
                     │    `useChatStore`     │
                     └───────────┬───────────┘
                                 ▼
                     ┌───────────────────────┐
                     │     `ChatAdapter`     │
                     │   (Host / Custom)     │
                     └───────────┬───────────┘
                                 ▼
                     ┌───────────────────────┐
                     │  Backend SSE Server   │
                     └───────────────────────┘
```

---

## Key Subsystems

### 1. State Management & Hooks (`src/headless`)

- **`useChatStore`**: Main state store governing session state, message streams, pending approvals, context requirements, and UI active states.
- **`ChatProvider`**: React Context wrapper provisioning store instances down component trees.
- **Headless Hooks**: `useChatSession`, `useChatMessages`, `useArtifacts`, `useSlashCommands`.

### 2. UI Layer (`src/ui`)

- **`ChatShell`**: Full application container featuring collapsible sidebar, thread list, header, main chat area, and artifact drawer.
- **`ChatView`**: Standalone chat transcript and composer without top-level shell layout.
- **`ChatWidget`**: Floating or embedded popup widget ideal for landing pages or contextual help.
- **`RecordPanel`**: Side panel for viewing and searching linked records.

### 3. Extension Protocols

- **`ChatAdapter`**: Contract defining `sendMessage`, `stopRun`, `uploadFile`, `submitContext`, `approveTool`, etc.
- **Slash Commands**: Pluggable commands (`/search`, `/clear`, custom user commands).
- **Artifact Registry**: Custom renderers for dynamic artifact viewports (code, table, document, image).

---

## Build Entry Points

| Entry Point                   | Description                          | Output Files                                         |
| ----------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `@anter/ai-chat-sdk`          | Full package (UI + Headless + Types) | `dist/index.js`, `dist/index.d.ts`                   |
| `@anter/ai-chat-sdk/ui`       | React UI components                  | `dist/ui/index.js`, `dist/ui/index.d.ts`             |
| `@anter/ai-chat-sdk/headless` | Pure React state hooks & context     | `dist/headless/index.js`, `dist/headless/index.d.ts` |
| `@anter/ai-chat-sdk/types`    | TypeScript interfaces & types        | `dist/headless/types/index.d.ts`                     |
