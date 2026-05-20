# Foundry v12 / dnd5e 3.x theming (aura branch)

How Actor Studio handles light/dark UI on **Foundry v12 + dnd5e 3.x** with TJS **0.2.0** (`aura`), without changing **Foundry 13+** behavior on `main`.

## Foundry v12 client theme

From **Foundry 12.320** onward, core provides a **client** setting (Configure Settings → Client): **System**, **Light**, or **Dark**. Foundry applies that to the DOM, typically as `theme-dark` or `theme-light` on `document.body` (and follows `prefers-color-scheme` when set to System).

Actor Studio does **not** add a separate “force theme” module setting. On v12 it **mirrors Foundry’s choice** onto its own app roots.

## v12 policy (implemented)

[`src/helpers/syncAppThemeFromFoundryBody.js`](../../src/helpers/syncAppThemeFromFoundryBody.js):

- **`resolveFoundryTheme()`** — `body.theme-dark` → dark; `body.theme-light` → light; else `prefers-color-scheme`.
- **`applyAppTheme(elementRoot, theme)`** — sets `theme-dark` / `theme-light` on the app shell element.
- **`observeFoundryBodyTheme(elementRoot)`** — sync on mount, re-sync when `body` / `documentElement` `class` changes. **Runs on all Foundry versions while on TJS 0.2** (runtime does not set theme on app shells for v13+).

Wired in:

- [`src/app/PCAppShell.svelte`](../../src/app/PCAppShell.svelte)
- [`src/app/WelcomeAppShell.svelte`](../../src/app/WelcomeAppShell.svelte)
- Feat selector container in [`captureAdvancement.js`](../../src/hooks/captureAdvancement.js) / [`captureAdvancement2.js`](../../src/hooks/captureAdvancement2.js) (one-shot `applyAppTheme` on v12)

## Foundry 13+ on TJS 0.2 (main until TJS 0.3 upgrade)

Same **`observeFoundryBodyTheme`** as v12 — TJS **0.2** does not copy theme onto app roots. CSS also targets **`.themed.theme-dark`** (Foundry 14 application chrome). When upgrading to TJS **0.3**, re-evaluate whether JS mirroring can be reduced to a no-op.

## CSS architecture

Actor Studio styles target:

1. **`#foundryvtt-actor-studio-pc-sheet`** (and welcome / feat selector) — variables in `styles/Variables.sass`.
2. **`.GAS.theme-dark`** — rules in `styles/init.sass`.

| Mechanism | Selector | v12 | v13+ |
|-----------|----------|-----|------|
| **A. App-local** | `#id.theme-dark` (`&.theme-dark` under `#id`) | Yes — set by `observeFoundryBodyTheme` | Optional; body usually enough |
| **B. Ancestor** | `.theme-dark #id` | Yes when `body` is dark | Primary |

Light variable overrides are declared **after** dark blocks so `#id.theme-light` and `body:not(.theme-dark) #id` win when appropriate.

Dark list rows use `--li-background-color: var(--dnd5e-color-sc-1, #abaabc)` for dnd5e 3.x when system tokens are missing.

## TJS version behavior

| | TJS 0.2.0 (`aura`) | TJS 0.3.0-next.x (`main`) |
|--|-------------------|---------------------------|
| Auto theme on app shell | **No** — Actor Studio `observeFoundryBodyTheme` on v12 only | **Yes** — follows `body` |
| `ThemeObserver` / `body` theme | Not in TJS 0.2 | Present |

## Dev: empty `dist/style.css`

Foundry loads **`module.json` → `dist/style.css`**. If that file is 0 bytes, global Sass never applies and the UI looks broken regardless of theme classes.

**Fix:** Global Sass is imported from `src/index.js` (`styles/init.sass`). Vite bundles it to `dist/style.css` on build and tracks it for HMR in dev via the JS module graph. Restart `bun run dev` after pull if styles stop updating.

## Diagnostic checklist (Foundry v12 devtools)

```js
const el = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
({
  appClasses: el?.className,
  bodyClasses: document.body.className,
  bg: getComputedStyle(el).getPropertyValue('--background-color'),
  liBg: getComputedStyle(el).getPropertyValue('--li-background-color'),
});
```

App `theme-*` should match `body` after sync. If variables are wrong but classes match, check `dist/style.css` size and dnd5e token fallbacks.

## Dark mode CSS (v12)

Do **not** use `body:not(.theme-dark) #id` for light overrides — it beats `#id.theme-dark` when Foundry has not yet set `theme-dark` on `body`. Light overrides are `#id.theme-light` only; dark wins via `#id.theme-dark` after the light block in [`styles/Variables.sass`](../../styles/Variables.sass).

Tab labels, enriched HTML, and window chrome use theme variables and [`.GAS.theme-dark` rules in `init.sass`](../../styles/init.sass).

**CSS tokens:** Use `--gas-*` custom properties in `styles/Variables.sass` only on app root IDs. Do not redefine Foundry names (`--background-color`, `--button-background`, `--button-color`) — that polluted core UI. `styles/Mixins.sass` reads `--gas-*` tokens only.

**Window background:** Foundry sets `parchment.jpg` on `.window-app > .window-content`. `background-color` alone does not remove it. Use `@mixin gas-app-dark-window-shell` in `styles/gas-app-scope.sass` (included from `gas-dark-theme.sass`) so only app root IDs get `background-image: none` on `.window-content`. Never use bare `.theme-dark.window-app` without an app `#id` — that broke core windows (e.g. Configure Game Settings).

## See also

- [Aura branch](./aura_branch.md)
- Unit tests: [`src/tests/test-sync-app-theme-from-foundry-body.test.js`](../../src/tests/test-sync-app-theme-from-foundry-body.test.js)
