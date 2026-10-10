# macOS Golden Gate (27) — native app design guideline

Digest of Apple's Human Interface Guidelines as they stand for **macOS 27 "Golden Gate"**
(announced WWDC, 8 June 2026; released 14 September 2026; current build 27.0.1).
Golden Gate is a *refinement* of the Liquid Glass language introduced in macOS 26 Tahoe —
not a new design language. Everything in Tahoe's HIG still applies unless a rule below
overrides it.

> Naming note: "Golden Gate" is macOS **27**. macOS 28 (expected fall 2027) has no announced
> codename; Apple has only said it drops Rosetta for Intel-only apps.

Confidence legend used below:
- **[HIG]** — quoted or paraphrased from developer.apple.com/design/human-interface-guidelines (fetched Oct 2026).
- **[GG]** — Golden Gate change reported from the WWDC 2026 keynote / release coverage.
- **[approx]** — a pixel value Apple does not publish; use it for mockups only, never as a spec claim.

---

## 1. What changed in Golden Gate (vs. Tahoe 26)

| Area | Golden Gate behaviour | Design consequence |
|---|---|---|
| Liquid Glass rendering | Less default transparency; diffusion no longer fights legibility; edges darker; icons sharper. **[GG]** | Glass bars read as solid enough to hold text. Never add your own extra blur or tint to compensate. |
| Glass intensity setting | New user slider from *clear* to *heavily tinted* glass in System Settings. **[GG]** | Design must survive both ends. Test with `--gg-glass` at 0 and 1 (see tokens). |
| Floating bars over content | When content scrolls beneath a floating bar, the bar raises its own contrast. **[GG]** | Rely on the scroll edge effect; don't paint a solid toolbar background. |
| Window corners | "Every window on macOS now has the same tighter corner radius… even if they haven't been updated." **[GG]** | One window radius for every window type. Don't vary radius by toolbar style. |
| Sidebars | Sidebars that were inset (e.g. Photos) now run **flush to the window edges**. **[GG]** | Sidebar touches top, bottom and leading edge of the window; no inset floating card. |
| Unified top bar | Apps get a unified toolbar at the top, iPadOS-like. **[GG]** | Title + navigation + actions share one bar with the traffic lights. |
| Menu item icons | Menus no longer show icons by default (Tahoe's icon-everywhere reversed). HIG updated 8 Jun 2026: icons "sparingly and with purpose"; all-or-none within a group. **[GG][HIG]** | Text-only menus by default. Add icons only for files, locations, devices, visual transforms. |
| Window controls | Traffic lights get an Aqua-like glossy Liquid Glass finish. **[GG]** | Render them with a subtle top highlight; keep 12 pt diameter, standard spacing. |
| Pointer | Link hover returns to a (redrawn) pointing-hand glove. **[GG]** | Use `cursor: pointer` only on real links; controls keep the arrow. |
| Motion | Buttons animate like iOS/iPadOS (press-scale + spring). **[GG]** | Press state = slight scale-down + highlight, spring back on release. |
| App icons | Icons revamped "to be more recognizable"; Liquid Glass refined across system icons. HIG app-icon page refined 8 Jun 2026. **[GG][HIG]** | Layered icon, simple filled shapes, no baked-in shadows/gloss; supports default / dark / clear / tinted. |
| Sidebar icon colour | HIG updated 8 Jun 2026: sidebar icons follow the user's accent colour; fixed colours only when meaningful (e.g. Mail VIP yellow). **[HIG]** | Default sidebar glyphs = accent colour. |

## 2. Platform posture **[HIG]**

- Large, high-resolution displays viewed from 1–3 ft; sessions from minutes to hours; many apps open at once.
- Use the space: **more content, fewer nested levels, less modality**, at a comfortable density.
- Let people resize, hide, show and move windows; support full screen.
- **Every command lives in the menu bar.** Toolbars and context menus are shortcuts, not the only path.
- Support high-precision pointer input and **keyboard shortcuts for everything frequent**.
- Support personalisation: customisable toolbar, sidebar contents, accent colour, fonts.
- macOS **does not support Dynamic Type**; text sizes are fixed points (see §5).
- Pointer UI: controls are smaller than touch targets. Don't inflate controls to 44 pt.

## 3. Two layers: content and Liquid Glass **[HIG]**

1. **Content layer** — documents, lists, media, canvases. Uses *standard materials*
   (`NSVisualEffectView` materials) or opaque backgrounds. **Never Liquid Glass.**
   Exception: transient controls (sliders, toggles) adopt glass only *while being manipulated*.
2. **Glass layer** — toolbar, sidebar, inspectors, popovers, menus, sheets' chrome. Floats above
   content; content scrolls and peeks underneath.

Rules:
- Use glass **sparingly** on custom controls; system components get it automatically.
- **Regular** glass (blur + luminosity adjust) for anything with text: sidebars, popovers, alerts.
- **Clear** glass only over visually rich media (photos, video). Over bright media add a 35% black dimming layer.
- Don't tint toolbars or sidebars with backgrounds. Let content colour the glass; separate bars from content with the **scroll edge effect**, not a solid fill.
- Extend full-bleed content beneath sidebars/toolbars; use a *background extension effect* (mirror + blur) when a sidebar would cover the important part of an image.
- Inactive windows lose material/vibrancy and appear subdued; traffic lights go grey.

## 4. Window anatomy

```
┌───────────────────────────────────────────────────────────────┐  ← one radius, all windows
│ ● ● ●  ‹ ›  Title        [ group ][ group ]   🔍 Search  [Done]│  ← unified toolbar (glass)
├────────────┬──────────────────────────────────┬───────────────┤
│ Sidebar    │ Content (scrolls under toolbar,   │ Inspector     │
│ (glass,    │ scroll-edge effect at the top)    │ (optional,    │
│ flush to   │                                   │ trailing)     │
│ edges)     │                                   │               │
└────────────┴──────────────────────────────────┴───────────────┘
```

- **Frame** = window controls + toolbar (+ rare bottom bar). **Body** = content.
- Window states: **main**, **key** (accepts input; coloured traffic lights), **inactive** (grey, no materials). Show the correct state in mockups. **[HIG]**
- Don't build custom window frames or imitate the system frame in a native app. **[HIG]**
- Don't put critical info/actions at the bottom of a window or sidebar — windows often hang off-screen. A bottom bar is only for small status info (like Finder's item count). **[HIG]**
- Don't place content behind the camera housing at the top edge. **[HIG]**
- Primary window = navigation + content; auxiliary window = one task, closes when done. Open new windows deliberately, offer "Open in New Window" via context/File menu. **[HIG]**
- Say "window" in UI copy — never "scene". **[HIG]**

### Toolbar **[HIG]**
- Three regions: **leading** (sidebar toggle, back/forward, title, document menu — not customisable), **centre** (common controls, customisable, collapses into the system overflow menu), **trailing** (search, inspector toggle, the one prominent action).
- **One** `.prominent` (accent-filled) action at most, on the trailing side (Done, Submit).
- Prefer borderless SF Symbols; the glass group is the container. No outlined-circle symbols.
- Window title: useful, < 15 characters, **never the app name**; leave empty when content is self-titling.
- Use standard Back and Close symbols, not the words "Back"/"Close".
- Don't hand-build an overflow menu; the system adds it.
- Custom components inside bars must use radii **concentric** with the bar's capsule.

### Sidebar **[HIG][GG]**
- Flush to window edges; floats in the glass layer; content can extend beneath it.
- Max **two levels** of hierarchy; deeper → sidebar + content list + detail (split view).
- Section headers short, no filler words. Disclosure triangles for large groups.
- SF Symbols for items; icons use the **accent colour** unless a fixed colour carries meaning.
- Row height / text / glyph follow the user's sidebar size (small, medium, large).
- Auto-collapse when the window gets narrow. Nothing critical at the bottom.

### Inspector
- Trailing pane for properties of the selection; toggled from the toolbar's trailing edge.

## 5. Typography **[HIG]**

System font **SF Pro** (via the system font API, never by name in native code). New York only for Mac Catalyst. No Dynamic Type on macOS.

| Style | Weight | Size pt | Line height pt | Emphasised |
|---|---|---|---|---|
| Large Title | Regular | 26 | 32 | Bold |
| Title 1 | Regular | 22 | 26 | Bold |
| Title 2 | Regular | 17 | 22 | Bold |
| Title 3 | Regular | 15 | 20 | Semibold |
| Headline | Bold | 13 | 16 | Heavy |
| **Body** | Regular | **13** | 16 | Semibold |
| Callout | Regular | 12 | 15 | Semibold |
| Subheadline | Regular | 11 | 14 | Semibold |
| Footnote | Regular | 10 | 13 | Semibold |
| Caption 1 | Regular | 10 | 13 | Medium |
| Caption 2 | Medium | 10 | 13 | Semibold |

Tracking (SF Pro, points): 10 → +0.12 · 11 → +0.06 · 12 → 0 · 13 → −0.08 · 15 → −0.23 · 17 → −0.43 · 22 → −0.26 · 26 → +0.22.

- Body copy and controls are **13 pt**. Anything larger than 26 pt is marketing, not app UI.
- Use dynamic font variants for control-matching text (control content, menu, title bar, tooltip, label).
- Hierarchy through weight and the label-colour ladder, not through many sizes.

## 6. Colour **[HIG]**

- Use **semantic dynamic colours**, never fixed values in native code: `labelColor`, `secondaryLabelColor`, `tertiaryLabelColor`, `quaternaryLabelColor`, `windowBackgroundColor`, `controlBackgroundColor`, `textBackgroundColor`, `underPageBackgroundColor`, `separatorColor`, `gridColor`, `selectedContentBackgroundColor`, `unemphasizedSelectedContentBackgroundColor`, `controlAccentColor`, `keyboardFocusIndicatorColor`, `linkColor`, `placeholderTextColor`, `alternatingContentBackgroundColors`.
- Every custom colour needs **light, dark, increased-contrast light and increased-contrast dark** variants — even for single-appearance apps (glass adapts to both).
- **App accent colour** applies only when the user's accent setting is *Multicolor*; otherwise the user's choice replaces it. Design so any of the eight accents works.
- On glass: colour **sparingly**. Emphasis goes in the **background** of the one prominent button, not in symbol/text colour. Don't colour backgrounds of multiple controls.
- Colourful content → monochrome toolbar labels. Monochrome content → brand colour may be the accent.
- Selection in a non-key window uses the *unemphasized* (grey) selection colour.
- Don't encode meaning in colour alone.

## 7. Controls **[HIG]**

- **Push button** is the standard macOS button. Sizes: mini, small, regular, large, extra large. Same size within a group; distinguish the preferred option by **style, not size**.
- Roles: normal, **primary** (default, accent fill, responds to Return), cancel (Escape), destructive (system red). Never make a destructive action the primary/default button.
- One or two prominent buttons per view, max.
- Every custom control needs a **press state**.
- Ellipsis (…) on any button or menu item that opens another window/view or needs more input.
- Labels: title-style capitalisation, start with a verb ("Add to Library").
- Use the right specialised control: pop-up button (choose one of a set), pull-down (menu of actions), segmented control, toggle/checkbox, stepper, slider, combo box, search field, token field, disclosure triangle, path control.
- Focus ring: system keyboard-focus colour around every focusable control; full keyboard navigation.

## 8. Menus **[HIG][GG]**

- Standard order: **App, File, Edit, Format, View, (app-specific), Window, Help**. Every command reachable here, with its shortcut.
- Labels: verbs, title case, no articles; ellipsis when more input follows; dim unavailable items but keep the menu openable.
- Group related commands with separators; most frequent first; submenus one level deep, ≤ ~5 items.
- **Icons off by default (Golden Gate).** When used: purposeful, standard symbols, all-or-none per group.
- Toggled items: checkmark, or paired Show/Hide labels.
- Context menus: small set of the most relevant actions, every one also available elsewhere.

## 9. Sheets, alerts, popovers, panels

- **Sheet**: modal to one window, attached to its top; for focused tasks that need a decision. Primary button trailing, Cancel to its left.
- **Alert**: rare; short title as a question/statement, informative text only if needed, buttons that name the action ("Delete", not "OK"), destructive never default.
- **Popover**: transient, anchored to its control, regular glass; closes on outside click.
- **Panel**: floating utility (Fonts, Colors); becomes key only when needed.
- **Settings window**: opened with ⌘, ; toolbar of panes; changes apply immediately, no OK/Apply.

## 10. Icons and symbols **[HIG]**

- Interface icons: **SF Symbols**, matching the adjacent text weight and scale; custom glyphs as custom symbols, not bitmaps.
- App icon: layered (Icon Composer), simple filled overlapping shapes, crisp edges, opaque full-bleed background (solid or gradient). No baked shadows, bevels, gloss or photos; no replicas of Apple hardware; don't reproduce UI screenshots.
- Provide or accept generated **default, dark, clear, tinted** appearances; keep core features identical across them; keep a safe zone.

## 11. Layout, spacing, motion

- Order by importance top → bottom, leading → trailing; align to a common leading edge; indent for hierarchy; group with space before lines.
- Progressive disclosure via disclosure triangles, menus, inspectors.
- Respect right-to-left mirroring; let windows resize gracefully with min/max sizes.
- Spacing on a 4 pt sub-grid / 8 pt rhythm, 20 pt window content margins **[approx]**.
- Motion: quick, physical, interruptible; respect **Reduce Motion** (cross-fade instead) and **Reduce Transparency** (opaque glass) and **Increase Contrast** (stronger borders).

## 12. Accessibility and personalisation (non-negotiable)

- Full keyboard access, visible focus ring, VoiceOver labels on icon-only controls.
- Test: Light, Dark, Increase Contrast, Reduce Transparency, glass slider *clear* and *tinted*, every accent colour, small and large sidebar size, inactive window.
- 4.5:1 for body text, 3:1 for large text and glyphs — on the glass *and* on what may scroll beneath it.

## Sources

- Apple HIG — Designing for macOS, Materials, Windows, Toolbars, Sidebars, Menus, Buttons, Typography, Color, Layout, App icons: https://developer.apple.com/design/human-interface-guidelines/ (change logs: menus, sidebars, app icons 8 Jun 2026; layout 9 Sep 2026)
- Wikipedia, "macOS Golden Gate": https://en.wikipedia.org/wiki/MacOS_Golden_Gate
- Six Colors, "WWDC 2026: No, Tahoe—yes, Golden Gate": https://sixcolors.com/post/2026/06/wwdc-2026-no-tahoe-yes-golden-gate/
- 9to5Mac, "Apple announces macOS Golden Gate 27": https://9to5mac.com/2026/06/08/apple-announces-macos-golden-gate-27/
- MacRumors, "What's Gone in macOS Golden Gate and What's Next in macOS 28": https://www.macrumors.com/2026/09/24/macos-golden-gate-features-removed/
