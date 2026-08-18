# Mobile implementation patterns

Production bar and chrome table live in `SKILL.md` — do not duplicate them here.

## Full-viewport sheet (command palette)

```tsx
const isMobile = useIsMobile();
const viewport = useVisualViewport();

<Dialog.Portal container={document.documentElement}>
  <div data-chat-provider="ai-chat-sdk" data-theme={config.theme}>
    <Dialog.Overlay className="ais-dialog-overlay" />
    <Dialog.Content
      className={isMobile ? "ais-command-palette is-mobile" : "ais-command-palette"}
      style={
        isMobile
          ? {
              top: viewport?.offsetTop ?? 0,
              left: 0,
              right: 0,
              width: "100%",
              height: overlayHeight(viewport),
              maxHeight: "none",
              transform: "none",
              borderRadius: 0,
            }
          : undefined
      }
    >
      {/* sticky header + 16px input */}
      <div className="ais-command-body">{/* scroll */}</div>
    </Dialog.Content>
  </div>
</Dialog.Portal>;
```

Canonical: `src/ui/command-palette/command-palette.tsx`.
Hooks: `src/headless/hooks/use-visual-viewport.ts`, `use-is-mobile.ts`.

`overlayHeight()` extends by `env(safe-area-inset-bottom)` when the keyboard
is closed (iOS `visualViewport` often stops above the home indicator) and
uses the raw VV height when it is open.

Do not wrap a mobile sheet in a dimmed overlay with 24px padding.

## Keyboard

Safari's default `interactive-widget=resizes-visual` leaves the layout
viewport (and `dvh`) unchanged. Only `window.visualViewport` shrinks.

A `100vh` / `inset: 0` panel plus `autoFocus` is how Search broke: iOS
scrolled the oversized fixed dialog off-screen, so the field sat behind the
keyboard accessory and recents painted under the status bar.

Detect the keyboard with `isKeyboardOpen(rect)` from the same hook file.
When it is open, do not stack `env(safe-area-inset-bottom)` on a footer.

## Sidebar overlay insets

`@media (max-width: 1024px)` `.ais-sidebar` is `top: 0; bottom: 0` (paints
into the unsafe zone).

| Edge   | Owner                                                                        |
| ------ | ---------------------------------------------------------------------------- |
| Top    | `.ais-sidebar-header { padding-top: calc(14px + env(safe-area-inset-top)) }` |
| Bottom | `.ais-sidebar { padding-bottom: env(safe-area-inset-bottom) }`               |
| Left   | `.ais-sidebar { padding-left: env(safe-area-inset-left) }`                   |

Do not also put `safe-area-inset-top` on `.ais-sidebar`. Contract test:
`src/styles/mobile-sidebar-insets.spec.ts`.

## Portal + theme

`--chat-*` tokens are scoped to `[data-chat-provider]`. A portal to
`document.documentElement` must re-apply that attribute (and `data-theme`)
or the sheet falls back to unthemed defaults.

Do not portal into the in-tree provider to "keep tokens": that node is a
sibling of `.ais-chat-shell { overflow: hidden; position: relative }`, so
`position: fixed` + iOS keyboard scroll traps the dialog.

## Review findings that mean "not done"

- Overlay with a text field sized `inset: 0` / `100vh` / `100dvh`
- Dialog portaled into `[data-chat-provider]` under the shell
- `safe-area-inset-top` on both the overlay box and its header
- Phone input `font-size` < 16
- `isMobile` computed and unused in JSX
- Tailwind class on an SDK element (hosts do not compile `node_modules`)
- New breakpoint next to an existing 768 or 1024 in the same file
