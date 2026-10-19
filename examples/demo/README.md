# Chat demo

A private Vite app that renders `ChatShell` against an in-memory adapter. No API key and no server. The UI is the SDK. The answers are scripted.

```bash
pnpm --filter @anter/ai-chat-sdk-demo dev
```

Open http://localhost:5173.

The dev server aliases `@anter/ai-chat-sdk` to `src/`, so a shell change shows up on refresh without a library rebuild.

## Scenes

Settled URLs for screenshots. The artifact panel stays closed until the artifact chip is clicked.

| URL                | Screen                               |
| ------------------ | ------------------------------------ |
| `/?scene=empty`    | New chat and starter cards           |
| `/?scene=sources`  | Finished answer with source pills    |
| `/?scene=artifact` | Finished answer with an outline chip |
| `/?scene=approval` | Pending approval card                |
| `/`                | Interactive chat                     |

Starter cards and a few prompts pick the script:

| Prompt                                | What you get                               |
| ------------------------------------- | ------------------------------------------ |
| Summarize a note and cite the sources | Answer with citations                      |
| Draft an outline                      | Markdown artifact                          |
| Explain a tradeoff                    | Short answer                               |
| Approve the tool action               | Approval card, then the rest of the answer |
| `/summarize`                          | Local summary, no stream                   |

`pnpm --filter @anter/ai-chat-sdk-demo check` typechecks this package. Screenshot capture is not part of `pnpm check-all`.
