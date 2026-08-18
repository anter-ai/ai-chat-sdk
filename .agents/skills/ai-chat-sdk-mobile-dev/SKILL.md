---
name: ai-chat-sdk-mobile-dev
description: >
  This skill should be used when building, redesigning, or reviewing
  phone-usable UI in @anter/ai-chat-sdk so mobile is a first-class layout,
  not a squeezed desktop. Triggers: "mobile", "responsive", "phone layout",
  "iOS keyboard", "safe area", "command palette", "Search", "ChatSidebar",
  "visualViewport", "full-screen sheet", "home indicator", "touch target",
  or /ai-chat-sdk-mobile-dev. Also apply whenever a dialog, drawer, composer,
  widget, or side panel in this repo will be used on a phone.
---

# AI Chat SDK mobile development

Ship phone layouts that match the production bar already in this repo. Do not
squeeze a centered 640px dialog or a `100vh` card into a 375px viewport.

Read `AGENTS.md` first. The agnostic contract and `ais-` CSS-only styling
outrank this skill.

## First actions

1. Classify the surface (sheet, overlay drawer, in-flow chrome, widget).
2. Reuse `useIsMobile` and `useVisualViewport` / `overlayHeight` from
   `src/headless/hooks/`. Do not add a second breakpoint hook or a new
   viewport-tracking file.
3. Wire the mobile branch in the **render**. Unused `isMobile` state is a defect.
4. Run the verification checklist. A desktop screenshot is not verification.

Implementation recipes: [references/patterns.md](references/patterns.md).

## Breakpoints

Default phone cutoff is **`< 768px`** (`useIsMobile()`, `max-width: 767px`).

| Surface                                           | Cutoff | Why                                                          |
| ------------------------------------------------- | ------ | ------------------------------------------------------------ |
| Sheets, command palette, confirm, composer chrome | 768    | Phone vs desktop dialog                                      |
| `ChatSidebar` / `ChatSidepanelLayout` overlay     | 1024   | Existing dock/overlay contract — do not invent a third value |

Tablet at 768 gets the desktop branch. Do not add another number in a file
that already has one of these.

## Choose chrome

| Surface                  | Mobile                                                       | Desktop          | Canonical                                       |
| ------------------------ | ------------------------------------------------------------ | ---------------- | ----------------------------------------------- |
| Search / command palette | Full-viewport **sheet** pinned to `visualViewport`           | Centered dialog  | `src/ui/command-palette/command-palette.tsx`    |
| Chat sidebar             | `position: fixed` drawer, one inset owner per edge           | Persistent rail  | `src/ui/sidebar/chat-sidebar.tsx` + overlay CSS |
| Host-docked Ask panel    | Overlay ≤1024, dock above — given                            | Split pane       | `src/ui/sidepanel/chat-sidepanel-layout.tsx`    |
| Confirm / short dialog   | Centered card, `width: min(Npx, 100%)`, no `minWidth` > ~320 | Same             | `src/ui/shared/confirm-dialog.tsx`              |
| Composer                 | Sticky above keyboard; 16px input                            | Desktop composer | `.ais-composer`                                 |

Never leave desktop chrome unchanged below 768.

## Production bar

| Concern    | Treatment                                                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Viewport   | Tall overlays are full-screen sheets. No 24px gutter eating a phone.                                                                                                                                                                                                              |
| Keyboard   | Pin `position: fixed` overlays to `useVisualViewport()` (`top: offsetTop`, `height: overlayHeight()`). CSS `dvh`/`vh` do **not** shrink with the iOS keyboard.                                                                                                                    |
| Portal     | Portal overlays to `document.documentElement`. Re-apply `data-chat-provider="ai-chat-sdk"` (and `data-theme`) on the portaled root so `--chat-*` tokens still resolve. Portaling into the in-tree provider traps `position: fixed` inside `.ais-chat-shell { overflow: hidden }`. |
| Inputs     | `font-size: 16px` on `<input>` / `<textarea>` (iOS zooms below 16). Search may autofocus **only** inside a visualViewport-pinned sheet.                                                                                                                                           |
| Touch      | Hit targets ≥ 44×44. List rows ≥ 48px. Close is 44px on mobile.                                                                                                                                                                                                                   |
| Safe areas | **Paint** the shell into the unsafe zone; **pad** header / footer / composer. One owner per edge. Drop the bottom inset while the soft keyboard is open. Never apply `env(safe-area-inset-top)` on both the overlay box **and** its header.                                       |
| Scroll     | `overscroll-behavior: contain` and `min-height: 0` on every flex child that must shrink.                                                                                                                                                                                          |
| Classes    | `ais-` prefixed CSS in `src/styles/styles-no-base.css` only. No Tailwind utilities.                                                                                                                                                                                               |

## Do not

- Size a `position: fixed` overlay with `inset: 0` / `100vh` / `100dvh` when it contains a text field.
- Portal a dialog into `[data-chat-provider]` when that node sits under `overflow: hidden`.
- Double-pad `safe-area-inset-top` on `.ais-sidebar` and `.ais-sidebar-header`.
- Subtract `env(safe-area-inset-bottom)` from a `100dvh` shell height.
- Autofocus a field on mobile unless the overlay is visualViewport-pinned.
- Ship `font-size` < 16 on a phone input.
- Introduce a third mobile breakpoint.
- Put domain-specific copy (`anter`, legal, finance) in core `src/`.

## Verification

1. **375×812** and **430×932**. Landscape once.
2. Open Search: header + field stay on screen; results scroll above the keyboard; close dismisses.
3. Open the sidebar drawer: brand sits just under the status bar; last chrome sits on the home-indicator pad.
4. Desktop ≥768: centered palette / persistent sidebar unchanged.
5. Light and dark (`data-theme` / host `.dark`).
6. **Home indicator:** assert the wired `env()` string, not computed pixels. Headless Chromium resolves `env(safe-area-inset-*)` to `0`.

No device: say so, and verify with Jest (style / class / hook contracts) plus `pnpm check-all`. Do not claim mobile is done from type-check alone.

## Additional resources

- [references/patterns.md](references/patterns.md) — sheet pin, portal + theme, sidebar insets, keyboard
