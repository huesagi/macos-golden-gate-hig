---
name: macos-golden-gate-hig
description: Design native Mac app screens that follow Apple's Human Interface Guidelines for macOS 27 "Golden Gate" — Liquid Glass control layer, unified toolbar, flush sidebars, one window radius, 13 pt SF Pro, semantic colours, menu-bar-first commands. Use for any macOS app window, settings pane, sheet, alert, popover or menu design, and for auditing an existing Mac UI against the HIG.
triggers:
  - macos app design
  - mac native app
  - golden gate
  - macos 27
  - apple hig mac
  - liquid glass mac
---

# macOS Golden Gate — native app design

You design Mac apps the way Apple's own apps look and behave on **macOS 27 "Golden Gate"**.
The canonical rules live in `references/golden-gate-hig.md` — read it in full before the first
build in a session. `assets/golden-gate-tokens.css` turns those rules into tokens and base
components for HTML mockups; `assets/checklist.md` is the gate before delivery;
`assets/gg-window-drag.js` makes windows movable by their frame; `examples/index.html` is a working reference window (sidebar · list · detail).

If the user says "macOS 28 Golden Gate", tell them in one line that Golden Gate is macOS 27
(released 14 Sep 2026) and that macOS 28 has no published design guidance yet, then continue.

## Visual direction is locked

This plugin *is* the design system. Don't pick a direction, don't ask about palette, fonts or
style, and don't import a marketing look (no hero gradients, no 44 px touch targets, no
display fonts, no card-grid dashboards dressed as apps). The only brand lever is the **app
accent colour**, and it only shows when the user's accent setting is Multicolor.

## Workflow

### 1. Understand the app (discovery)
From the brief and plugin inputs, settle:
- **App concept** and its primary object (document, message, photo, task, track…).
- **Screens** to design. Default: the main window plus one secondary surface (settings, sheet or popover).
- **Window pattern** (input `windowPattern`, or infer):
  - `sidebar-content` — sidebar + content (Music, Photos)
  - `sidebar-list-detail` — three columns (Mail, Notes)
  - `document-inspector` — document canvas + trailing inspector (Pages, Freeform)
  - `utility` — single pane, compact window (Calculator-style tools)
  - `settings` — Settings window with pane toolbar
- **Appearance**: light, dark, or both (default both via `prefers-color-scheme`).

Ask with a `<question-form>` only if the app concept itself is missing. Everything else has a default.

### 2. Plan
Write a todo list: one item per screen, plus "menu bar map", plus "checklist pass".
State the window pattern and the accent colour in one sentence.

### 3. Build each screen
- Make one HTML file per screen with a semantic name (`mail-main-window.html`,
  `settings-general.html`). Use `index.html` only as a launcher when there are several screens.
- Copy `assets/golden-gate-tokens.css` into the project (e.g. `assets/golden-gate-tokens.css`)
  and link it. Extend it; don't rewrite it. Override `--gg-accent` for the app accent colour.
  Appearance follows the OS by default; set `data-appearance="light"` or `"dark"` on `<html>`
  to force one. When showing both, add a Light / Dark / Auto switch on the desktop backdrop,
  outside the app window (see `examples/index.html`), never inside the app's own chrome.
  Offer an optional **Desktop** switch beside it that wraps the window in a simulated
  Golden Gate desktop: a menu bar whose text-only menus list every app command with its
  shortcut (the menu bar map, made clickable) and a Dock with the app icon. Off by default.
- Windows move like real Mac windows: also copy `assets/gg-window-drag.js` and link it after
  the markup. Every `.gg-window` then drags from its `.gg-toolbar` / `.gg-titlebar` and from
  any `[data-gg-drag-region]` (mark the sidebar's traffic-light strip with it). Controls inside
  the frame keep working; the window stays below the menu bar and can't be lost off-screen.
  Add `data-gg-drag-persist="<key>"` to remember the position. Never make content areas drag
  the window.
- Desktop wallpaper: also copy `assets/gg-wallpaper.js` and `assets/wallpapers/` (keep
  `wallpapers/CREDITS.md`), link the script, and add a `Wallpaper` button with
  `[data-gg-wallpaper-trigger]` to the desktop control pill. It offers solid colours, gradients,
  custom colour / gradient, bundled Unsplash photos (credited on the desktop), an Unsplash link
  field and Upload Image…; right-clicking the empty desktop opens it too. Test the design over a
  bright photo and a dark solid — glass must stay legible on both.
- Render the window on a quiet desktop backdrop (`.gg-desktop`). Build the anatomy in this order:
  1. `.gg-window`: one radius, traffic lights top-leading.
  2. Sidebar (if any): `.gg-glass`, flush to the edges, traffic lights inside its top strip,
     `.gg-section` headers, `.gg-row` items with accent-coloured glyphs, two levels max.
  3. Unified toolbar: `.gg-group.gg-glass` capsules holding borderless `.gg-icon-btn` glyphs;
     title (`.gg-title`) leading; search and at most one `.gg-button.is-primary` trailing.
  4. Content layer: opaque `--gg-content-bg`, list rows, documents, media. No glass here.
  5. Inspector / detail on the trailing side when the object has properties.
- Type: only the macOS text styles (`--gg-body` 13 px for UI and body copy; `--gg-title1` for
  object titles; `--gg-headline` for list titles; `--gg-subheadline` / `--gg-callout` for metadata).
- Glyphs: inline SVG drawn in the SF Symbols idiom (1.5–1.8 px strokes or simple fills, 16 px
  in toolbars and sidebars). Never emoji. Never icon fonts from other ecosystems.
- Copy: title case on buttons and menu items, verb-first, ellipsis when more input follows,
  "No Selection" style empty states, real sample content (real books, places, people's public
  works) — never lorem ipsum.
- Make it work: sidebar selection filters, list selection drives detail, search filters, toggles
  toggle, Return triggers the primary button, arrow keys move selection, ⌘F focuses search.
  Persist selection in `localStorage`.
- Secondary surfaces:
  - **Sheet**: attached to the top of the parent window, dims nothing else; Cancel + primary trailing.
  - **Alert**: centred over its window, app icon, bold one-line title, buttons naming the action.
  - **Popover**: regular glass, arrow to its control, closes on outside click / Escape.
  - **Settings**: toolbar of pane icons with labels, no OK/Apply — changes apply instantly.

### 4. Menu bar map
Produce `hig-review.md` with:
- The app's menu bar (App, File, Edit, Format, View, …, Window, Help) listing every command the
  screens expose, with shortcuts, separators, and ellipses. Text-only (Golden Gate default).
- The checklist from `assets/checklist.md` with each item marked pass / fix / n.a. and a one-line note.
- Any `[approx]` values used and what to replace them with in native code (semantic colour or
  control size names).

Don't put this checklist or any designer controls inside the app window itself.

### 5. Verify
Run every P0 item in `assets/checklist.md`. In particular: no glass in the content layer,
one prominent button, contrast at glass 0 and 1, light and dark both work, focus rings visible,
nothing clipped when the window narrows. Fix before delivery.

## Auditing an existing Mac design
When given a screenshot, Figma frame or HTML of a Mac app, skip building. Write `hig-review.md`:
P0/P1 findings grouped by window anatomy, each with the HIG rule, what's wrong, and the fix.
Then offer to produce a corrected screen.

## Boundaries
- Native **app UI** only. For Apple-style *marketing websites* use a web design system instead.
- Never reproduce Apple's own app icons or hardware renders; design the user's app.
- Don't claim pixel values as Apple specs: values tagged `[approx]` are mockup approximations.
- In native code, name the real API (`NSColor.labelColor`, `.buttonStyle(.borderedProminent)`,
  `NavigationSplitView`, `.glassEffect()`), not hex values.
