# FoundryVTT Actor Studio - AI Coding Guide

## ESM and Module Import Rules

### ESM-Only Project
- This is an ESM-only project. Never use `require()` statements.
- Always use `import` statements for all module imports.
- All code must be written in ES Module syntax.

### Import Patterns
- Use modern ES module syntax for all imports
- Avoid CommonJS `require()` patterns
- All imports should be static and at the top of files

## Build and Development Workflow

### HMR Development
- Never use build commands like `yarn run build`, `bun run build`, or `npm run build`
- Always use HMR (Hot Module Replacement) for development
- Development is handled by `bun dev` command

### Build Process
- Build commands are forbidden during development
- Use HMR for all development workflows
- The `dist/` folder is dynamically generated and should never be manually edited

## Dist Folder Management

### Never Edit Generated Output
- Never edit anything under the `dist/` folder
- The `dist/` folder is dynamically generated output
- Manual changes to `dist/` are a waste of time
- Always make code changes in `src/` or relevant source/config files instead
- If runtime behavior must change, update the source and let HMR or the normal generation process refresh `dist/`

## Timeout and Polling Rules

### Settings-Driven Timing
- **ABSOLUTELY FORBIDDEN**: Never hard-code timeout or polling durations (for example `5000`, `20000`, `150`) in async waits, retries, or test assertions.
- Always source timing values from settings-backed helpers or stores.
- For Quench/integration tests, use `getTestTimeouts()` from `src/helpers/testTimeouts.js` and derive named constants from those settings.
- If you need a different timing behavior, add a new setting-backed timeout key instead of introducing a literal millisecond value.
- **NO EXCEPTIONS**: Even for "temporary" or "debug" code, use settings. Hardcoded values will be rejected in code review.
- **FORBIDDEN: NO MODIFICATIONS** - Never modify timeout values with math, conditionals, or transformations (e.g., no `Math.max(timeout, 500)`, `timeout * 2`, or `timeout > 1000 ? timeout : 1000`). Use the exact value from settings. Adjust the setting if needed.

## Pug Template Rules

### Syntax Requirements
- ALL Svelte components MUST use Pug templates with `<template lang="pug">` - NEVER use standard HTML markup
- Pug templates with Svelte preprocessing (NOT standard Pug)

### Pug Syntax Rules
- Conditionals: `+if("condition")` with condition in double quotes
- Else blocks: `+else()` or `+else` - **MUST be indented one level deeper than `+if`** (as a child block, not sibling)
- **CRITICAL**: `+else` indentation:
  ```pug
  +if("condition")
    p Content if true
    +else()
      p Content if false
  ```
  NOT:
  ```pug
  +if("condition")
    p Content if true
  +else()
    p Content if false
  ```
- Else-if logic: Use nested `+if`/`+else` blocks (no `+elseif`)
- Loops: `+each("array as item")` with expression in double quotes
- Attributes: Use `!=` for complex expressions, e.g., `class:selected!="{isSelected(item)}"`
- Svelte raw HTML in Pug: when rendering `{@html ...}` as a standalone line, **MUST** use a pipe prefix: `| {@html richHTML}` (do not place bare `{@html ...}` on its own line in Pug blocks)
- Text content: Inline with elements, e.g., `button(type="button") Text`

### Expression and Event Handling
- Avoid long expressions in attributes - extract to script functions
- Do not use compound expressions, instead wrap them as functions
- Event handlers must use the `!=` operator to prevent HTML encoding
- Avoid arrow functions and the `=` operator in event handlers

## i18n Localization Rules

### localize() Helper Usage
- Always use `localize()` from `~/src/helpers/Utility` for GAS-namespaced strings — pass the key **without** the `GAS.` prefix (e.g. `localize("Footer.Cancel")`).
- Only fall back to `game.i18n.localize` / `game.i18n.format` for core Foundry keys that are not in the GAS namespace (e.g. `"DOCUMENT.ImportData"`).
- Ensures consistent localization and avoids namespace issues.

## Testing Rules

### General Testing
- Tests should be stored in the `src/tests` folder
- Under no circumstances are failing tests acceptable
- All tests must pass before claiming success

### Class Progression Tests
- For any class progression / level-up tests, always set `game.settings.set(MODULE_ID, 'milestoneLeveling', true)` before attempting level-up actions.
- For class progression / level-up tests, also set `game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true)` before level-up interactions.
- Do not rely on default settings for level-up tests.
- If a test includes class level progression (e.g., 1->2, 2->3), assert this setting step is present in setup.

### Quench Integration Tests
- Treat Quench tests as integration tests with async UI / sheet lifecycle timing.
- Never assume `actorInGame` store survives Actor Studio close; recover actor by unique test name from `game.actors` when needed.
- In class permutation tests, use a unique actor name per run (e.g., with timestamp) to avoid collision and stale lookups.
- For level-up button interactions, click `button.level-up` first; use `#gas-levelup-btn` / `.gas-levelup` only as fallback selectors.
- Never bypass sheet button tests by directly opening `PCApplication` in test helpers.
- Creation tests must assert: actor exists, class level 1 embedded, background embedded, and Actor Studio closes.