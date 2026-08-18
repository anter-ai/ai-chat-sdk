# Changelog

All notable changes to `@anter/ai-chat-sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Mobile overlay sidebar insets**: the phone drawer applied `env(safe-area-inset-top)`
  on both `.ais-sidebar` and `.ais-sidebar-header`, and a padded
  `safe-area-inset-bottom` on the container, which pushed the brand / back control
  down and floated the collapse toggle above a large empty band. The header now
  owns the top inset once; the drawer owns a single bottom inset.
- **Chats / Recents search**: the in-flow Recents page stacked another
  `safe-area-inset-top` under the shell header and used a 14px search field, so
  focusing it on iOS zoomed and scrolled the 100dvh shell off-screen. The shell
  now shrinks to `visualViewport` while the keyboard is open; Recents keeps a
  sticky 16px field and no second top inset.
- **Composer placement**: empty-state greeting + composer stay vertically
  centered. With messages, the composer sits on a single `safe-area-inset-bottom`
  (no stacked `--ais-corner-clearance` / footer / host pad).
- **Mobile Search / command palette**: opening Search on a phone autofocused a
  `100vh` dialog portaled inside the overflow-hidden shell. iOS then scrolled that
  oversized panel off-screen, leaving recents under the status bar and the system
  keyboard accessory with no search field. The palette is now a visualViewport-
  pinned full-screen sheet, portaled to `document.documentElement`, with a 16px
  input and no desktop shortcut footer.
- **Reasoning block layout**: the expanded reasoning tree was laid out with Tailwind
  utilities that the SDK does not ship, so hosts that do not compile Tailwind over
  `node_modules` (the Tailwind v4 default) rendered skill/step rows with the UA button
  default — centered labels and no indentation. Every element now carries an `ais-`
  prefixed class backed by real CSS in `styles-no-base.css`.

## [0.1.0] - 2026-07-29

### Added

- **Core UI Components**: `ChatShell`, `ChatView`, `ChatWidget`, `RecordPanel`, `ChatEmptyState`.
- **Headless Hooks**: `useChatSession`, `useChatMessages`, `useArtifacts`, `useSlashCommands`.
- **Adapter Infrastructure**: `ChatAdapter` contract and standard `AnterAdapter` implementation.
- **SSE Streaming Support**: Real-time event parsing for tokens, tool calls, context requests, and artifacts.
- **Community & Governance Docs**: Standardized `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `AGENTS.md`, GitHub issue/PR templates, and technical architecture docs.
