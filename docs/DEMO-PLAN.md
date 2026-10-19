# Demo App Plan

Add a private, generic Vite app at `examples/demo` so people can see the chat UI without installing the SDK, and so screenshots can be taken from stable URLs during development.

The README currently points at [anter.ai](https://anter.ai) and three checked-in images under `.github/assets/`. Those shots go stale as the shell changes. `examples/` today is copy-paste snippets (`standalone-chat-view.tsx`, `minimal-custom-chat.tsx`), not a page you can run. `packages/anter-adapter` talks to a real backend and needs credentials, so it is the wrong showcase.

## Goal

One command, no API key, no server:

```bash
pnpm --filter @anter/ai-chat-sdk-demo dev
```

The app renders `ChatShell` full viewport, with generic copy, an in-memory adapter, and `?scene=` URLs that paint a finished screen immediately.

## Constraints

- Keep the demo out of `src/`. The agnostic contract still applies to the SDK. Demo copy can name generic tasks (summarize a note, draft an outline). It must not use industry-specific language.
- Do not publish the demo. The package stays `private: true`. The SDK `files` list remains `dist` only.
- Do not add Next, Storybook, Tailwind, or a second UI kit. The SDK stylesheet is the styling.
- Do not call a model or the Anter backend.
- Do not add an SDK prop just to force the artifact panel open.
- Leave screenshot capture out of `pnpm check-all`.

## Layout

```
examples/demo/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  README.md
  src/
    main.tsx          ChatProvider, ChatShell, empty state, scene router
    adapter.ts        in-memory ChatAdapter and scripted SSE
    fixtures.ts       seeded sessions, messages, sources, artifacts
    scenes.ts         ?scene= parser
    empty-state.tsx   three starter cards
```

Add the package to the workspace:

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "examples/demo"
```

`package.json` name: `@anter/ai-chat-sdk-demo`. Dependencies: `react@^19`, `react-dom@^19`, `@anter/ai-chat-sdk` as `workspace:*`. Dev dependencies: `vite`, `@vitejs/plugin-react`, `typescript`.

## Dev server

`pnpm dev` at the repo root only rebuilds the library with tsup. The demo should not wait on `dist/`.

Alias the package to source in `vite.config.ts`:

| Import                          | Resolves to                   |
| ------------------------------- | ----------------------------- |
| `@anter/ai-chat-sdk`            | `../../src/index.ts`          |
| `@anter/ai-chat-sdk/styles.css` | `../../src/styles/styles.css` |

A shell change then shows up on refresh. That is the loop an agent uses while taking screenshots.

## What the page renders

`main.tsx` mounts `ChatProvider` and `ChatShell` in a `100vh` container and imports the SDK stylesheet once.

The empty state is three starter cards:

- Summarize a note
- Draft an outline
- Explain a tradeoff

Each card sends that prompt through the normal composer path.

## In-memory adapter

`adapter.ts` implements `ChatAdapter` in the browser. A few hundred lines. Sessions and messages stay in memory. Seed two or three past chats so the sidebar is not empty on the finished-thread scenes.

`sendMessage` returns a `ReadableStream<Uint8Array>` of SSE frames, built with `TextEncoder` and short delays, in the same shape the Jest stream tests use. A small prompt router picks the script:

| Prompt                               | Stream                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Default                              | Short markdown answer                                                            |
| Mentions sources or citations        | Answer plus `sources` on `done`                                                  |
| Mentions outline, draft, or artifact | An `<artifact>` markdown outline                                                 |
| Mentions approval or a tool action   | `tool_approval_request`, then the rest of the answer after `resolveToolApproval` |

`uploadFile`, `resolveToolApproval`, and `cancelRun` update local state only. They still exercise the real UI.

Slash commands, if registered, stay generic (`/summarize`). Skip anything that needs a backend.

## Scenes

`ChatShell` accepts `initialSessionId` and loads that session through the adapter. A seeded `loadSession` can paint a finished thread on first render. Two things cannot be painted that way:

- A mid-stream frame. Streaming state is created only while `sendMessage` is running.
- An open artifact panel. `registerArtifacts` stores the artifact and does not open the panel. The panel opens when the artifact chip calls `openArtifact`.

The demo reads `?scene=`:

| URL                | Screen                                                       | How                                                                                           |
| ------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `/?scene=empty`    | New chat, starter cards                                      | No session. Replaces `.github/assets/anter-ai-1.png`.                                         |
| `/?scene=sources`  | Finished answer with source pills                            | Seeded session. Replaces `.github/assets/anter-ai-2.png`.                                     |
| `/?scene=artifact` | Same kind of thread, with an outline artifact on the message | Seeded `<artifact>` tag in the message content. The screenshot step clicks the artifact chip. |
| `/?scene=approval` | Pending approval card                                        | `toolApprovals` on the loaded message.                                                        |
| `/`                | Interactive chat                                             | Typing runs the scripted stream.                                                              |

Stable scenes are the README images. Interactive mode is what a person clicks through.

## Screenshots

An agent, or a later Playwright script, does this:

1. Start `pnpm --filter @anter/ai-chat-sdk-demo dev`.
2. Open each `?scene=` URL at a desktop width.
3. On `?scene=artifact`, click the artifact chip, then capture.
4. Write the images to `examples/demo/screenshots/` and, when the README should update, replace `.github/assets/`.

Do not add that script to `pnpm check-all`. Timing-based captures of a live stream are a poor fit for the README. Use the settled scenes.

A `ChatWidget` route and a 390px phone shot can wait. The shell is the picture the README already shows.

## Verification

ESLint and Prettier already walk the repo, so new demo files are included once they exist. `vite.config.ts` matches the existing `**/*.config.ts` ignore.

The root `tsconfig.json` includes only `src/`. Give the demo its own `tsc --noEmit` and run it as `pnpm --filter @anter/ai-chat-sdk-demo check`. Wire that into `check-all` so the demo cannot rot. Do not make `check-all` build the Vite app or launch a browser.

Before calling the work done:

1. `pnpm format`
2. `pnpm check-all` (including the demo typecheck)
3. `pnpm test`
4. Open the demo and exercise `/`, `?scene=empty`, `?scene=sources`, `?scene=artifact` (click the chip), and `?scene=approval`.

## README follow-up

After the first screenshot pass, point the "See it live" line at the demo (`pnpm --filter @anter/ai-chat-sdk-demo dev`) and swap the three images for shots taken from the scenes. Keep the anter.ai link only if it is still a separate product demo.

## Out of scope

- A real LLM or `AnterAdapter` wiring
- Publishing the demo
- Storybook or a component catalog
- A new SDK API for opening the artifact panel
- Mobile screenshots and a `ChatWidget` route in the first slice
- Running Playwright in CI
