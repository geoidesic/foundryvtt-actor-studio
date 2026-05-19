# Foundry v12 / dnd5e 3.x theming (aura branch)

Analysis of “dark mode” / black-panel issues on **Foundry v12 + dnd5e 3.3.1** with the **aura** dependency line (TJS **0.2.0**). Applies to unstaged work in `PCAppShell.svelte` and `styles/Variables.sass` as of 2026-05.

## Symptoms (reported)

- Actor Studio windows look like **dark mode**: near-black backgrounds, poor contrast.
- Often tied to **OS dark preference** or “no Foundry dark mode on v12” assumptions.
- Recent mitigations (force `theme-light`, extra CSS variables) **did not change** the UI in testing.

## Architecture: where theme classes matter

### Application DOM

`ApplicationShell` (TJS) sets `elementRoot` to the outer window:

```html
<div id="foundryvtt-actor-studio-pc-sheet"
     class="app window-app GAS …">
```

Actor Studio styles target:

1. **`#foundryvtt-actor-studio-pc-sheet`** (and welcome / feat selector) — CSS variables in `styles/Variables.sass`.
2. **`.GAS.theme-dark`** — rules in `styles/init.sass` (selects, tabs, inputs, etc.).

### Two different dark-variable mechanisms

| Mechanism | Selector | When it applies |
|-----------|----------|-----------------|
| **A. App-local** (older) | `#foundryvtt-actor-studio-pc-sheet.theme-dark` (was `&.theme-dark` under `#id`) | `theme-dark` on the **same element** as the id |
| **B. Ancestor** (current) | `.theme-dark #foundryvtt-actor-studio-pc-sheet` | `theme-dark` on **any ancestor** (e.g. `body` on Foundry 13+) |

Commit `0d8896be` moved mechanism **A → B** for Foundry 13 `body.theme-dark` support. On v12, mechanism **B** often never runs; mechanism **A** no longer exists in `Variables.sass` but **`.GAS.theme-dark` in `init.sass` still does**.

Dark variables include:

```sass
--background-color: #000000
--li-background-color: var(--dnd5e-color-sc-1)  // may be undefined on dnd5e 3.3.x
```

If `--dnd5e-color-sc-1` is missing, list rows can fall back to transparent/black.

## TJS version behavior (critical for aura)

| | TJS 0.2.0 (`aura`) | TJS 0.3.0-next.x (`main`) |
|--|-------------------|---------------------------|
| `ThemeObserver` / `body` theme | **Not present** | Watches `body.theme-light` / `body.theme-dark` |
| `FVTTAppTheme.appClasses()` on shell | **Not present** | Adds `themed` + `theme-*` to app `class` reactively |
| OS `prefers-color-scheme` in TJS | **Not found** | **Not found** (theme follows **Foundry body class**, not OS directly) |

**Conclusion:** The comment in `PCAppShell.svelte` that “TJS detects OS dark preference” describes **main / TJS 0.3 + Foundry 13+ body theme**, not **aura / TJS 0.2.0 on Foundry 12**. On aura, something else must add `theme-dark` to `.GAS` or the problem is not theme-class-driven.

## Why the unstaged mitigations likely fail

### 1. `PCAppShell` `onMount` class toggles

```js
if (Number(game.version) < 13) {
  elementRoot?.classList.remove('theme-dark');
  elementRoot?.classList.add('theme-light');
}
```

- Only runs **once** on mount.
- On TJS 0.2.0, nothing re-applies `theme-dark` to `elementRoot` afterward — so this is a **no-op** if the class was never there.
- Does **not** remove `theme-dark` from `document.body` (relevant on v13, not typical on v12).
- Does **not** affect `.GAS.theme-dark` rules if `theme-dark` is re-added by a future TJS upgrade without removing the override.

### 2. `#id.theme-light` block in `Variables.sass`

```sass
#foundryvtt-actor-studio-pc-sheet.theme-light, …
  --background-color: #cccccc
  …
.theme-dark #foundryvtt-actor-studio-pc-sheet, …
  --background-color: #000000
  …
```

**Specificity:** both selectors are **one ID + one class** → **tie**.

**Cascade:** `.theme-dark #id` comes **after** `#id.theme-light` → **dark wins** whenever any ancestor has `theme-dark`, even if the app also has `theme-light`.

The comment claiming `#id.theme-light` “beats parent-class+ID” is **incorrect** for equal-specificity rules; order decides.

### 3. `init.sass` still keys off `.GAS.theme-dark`

Even if `Variables.sass` variables were fixed, component rules under `.GAS.theme-dark` (selects, backdrop-filter, icon-select, etc.) still apply when that class pair exists.

### 4. Empty `dist/style.css` during dev (primary cause of “all dark / layout mess”)

Foundry always loads **`module.json` → `dist/style.css`**. The old dev script ran `> dist/style.css` before Vite, leaving a **0-byte** file; the Vite proxy serves that file from disk, so **no global** `Variables.sass` / `init.sass` rules applied. The UI looked like a broken dark theme (black panels, missing tab labels, half the ability rows invisible) while only scattered HMR-injected component CSS remained.

**Fix:** `vite-foundry-style-css.mjs` emits `dist/style.css` on dev server start and on sass/css HMR; dev scripts no longer truncate the file. After pulling, restart `bun run dev` and confirm `dist/style.css` is non-zero (e.g. `wc -c dist/style.css`).

## Diagnostic checklist (run in Foundry v12 devtools)

With Actor Studio open, in the console:

```js
const el = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
({
  appClasses: el?.className,
  bodyClasses: document.body.className,
  htmlClasses: document.documentElement.className,
  bg: getComputedStyle(el).getPropertyValue('--background-color'),
  liBg: getComputedStyle(el).getPropertyValue('--li-background-color'),
  dnd5eSc1: getComputedStyle(document.documentElement).getPropertyValue('--dnd5e-color-sc-1'),
});
```

Interpretation:

| Observation | Likely cause |
|-------------|----------------|
| `theme-dark` on `#foundryvtt-actor-studio-pc-sheet` or `.GAS` | Mechanism A + `init.sass`; JS remove may have run too early or been overwritten |
| `theme-dark` only on `body` (unusual on v12) | Mechanism B; `#id.theme-light` loses cascade tie |
| No `theme-dark` anywhere but `--background-color` black | Missing/empty CSS bundle or another rule setting background |
| `--li-background-color` empty/invalid | `--dnd5e-color-sc-1` unset on dnd5e 3.3.x |

## Recommended fix directions (not implemented here)

1. **Restore dual selectors in `Variables.sass`**
   - Keep `.theme-dark #id` for Foundry 13+.
   - Re-add `#id.theme-dark { … }` (or `&.theme-dark` under `#id`) for app-local dark on v12.
2. **Fix force-light override**
   - Move light overrides **below** the dark block, **or** use higher specificity, e.g. `#foundryvtt-actor-studio-pc-sheet.theme-light` with `!important` on critical vars (sparingly), **or** `html:not(.theme-dark) #id` for v12-only paths.
3. **dnd5e 3.x fallbacks**  
   `--li-background-color: var(--dnd5e-color-sc-1, #abaabc)` (historical v12 value from git history).
4. **v12-only gate in Sass or JS**  
   `game.version < 13` → never apply dark variable block; document that v12 has no supported dark theme until dnd5e exposes stable tokens.
5. **Correct the PCAppShell comment**  
   Point to Foundry 13 `body` theme + TJS 0.3 `FVTTAppTheme`, not OS detection on aura.
6. **Welcome app**  
   Apply the same v12 policy in `WelcomeAppShell.svelte` if welcome is affected.

## Relation to other unstaged changes

- **Ability entry spinner CSS** — unrelated to theme.
- **`illuminatedDescription` / `enrichHTML`** — v12 enrichment; unrelated to panel background.
- **Do not edit `dist/`** — fix source Sass/JS; let HMR rebuild `dist/style.css`.

## See also

- [Aura branch](./aura_branch.md)
