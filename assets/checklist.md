# Golden Gate conformance checklist

Run this against every screen before delivery. P0 = must pass; P1 = fix unless the brief says otherwise.

## P0 — structure
- [ ] Window uses the single Golden Gate corner radius (`--gg-window-radius`); no per-window variation.
- [ ] Traffic lights at the leading top corner, 12 px, 8 px gap; grey when the window is inactive.
- [ ] Unified top toolbar: leading = sidebar/back + title, centre = common actions, trailing = search / inspector / one prominent action.
- [ ] Window title is useful, under 15 characters, and is not the app name.
- [ ] Sidebar (if any) is flush to the top, bottom and leading edges; at most two hierarchy levels; no critical action at its bottom.
- [ ] Liquid Glass only on the control layer (toolbar groups, sidebar, popovers, sheets chrome). Never on content cards, rows or backgrounds.
- [ ] Toolbar separated from content by the scroll edge effect, not a solid or tinted fill.
- [ ] At most one accent-filled (prominent) button per view; destructive actions never primary.
- [ ] Every command shown in the UI is also listed in the menu bar map (`hig-review.md`) with its shortcut.

## P0 — type & colour
- [ ] Body and control text 13 px SF Pro (system stack); styles from the macOS text-style table only.
- [ ] Colours come from semantic tokens (`--gg-label*`, `--gg-separator`, `--gg-content-bg`, `--gg-accent`…); no stray hex values.
- [ ] Sidebar glyphs use the accent colour unless a fixed colour carries meaning.
- [ ] Contrast ≥ 4.5:1 for text and ≥ 3:1 for glyphs, on glass at `--gg-glass: 0` and `1`.
- [ ] Light and Dark appearances both render correctly.

## P0 — interaction
- [ ] Hover, pressed (scale-down spring), selected, disabled and `:focus-visible` states defined for every control.
- [ ] Full keyboard path: arrow keys in lists/sidebars, Return triggers the primary button, Escape cancels, ⌘F focuses search.
- [ ] Pointer controls are Mac-sized (≈24 px regular); `cursor: pointer` only on true links.
- [ ] Window drags from its toolbar / title area (empty frame space), not from content or controls; it stays reachable below the menu bar.

## P1 — polish
- [ ] Menus text-only by default; any icons are purposeful and all-or-none within a group.
- [ ] Buttons and menu items: title case, verb first, ellipsis when more input follows.
- [ ] Standard SF-Symbol-style glyphs, borderless inside glass groups; no outlined-circle icons.
- [ ] Empty, loading, and no-results states written as plain sentences ("No Selection", "No books match …").
- [ ] Reduce Transparency, Increase Contrast and Reduce Motion media queries respected.
- [ ] Non-key window selection uses the unemphasized (grey) selection colour.
- [ ] Layout survives a narrow window: sidebar auto-collapses, toolbar items fold into the system overflow menu.
