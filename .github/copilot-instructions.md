# FoundryVTT Actor Studio - AI Coding Guide

## Architecture Overview

**Core Framework**: This is a FoundryVTT module built with Svelte + TyphonJS runtime for reactive UI components and Finity state machines for workflow orchestration. The module creates D&D 5e characters through a guided multi-step process with advancement capture integration.

**Key Design Patterns**:
- **Atomic Design**: Components organized as `atoms/` → `molecules/` → `organisms/` (see `src/components/`)
- **State Management**: Svelte stores centralized in `src/stores/` with `dropItemRegistry` for advancement queuing
- **Workflow State Machine**: Finity FSM in `WorkflowStateMachine.js` handles character creation flow: `idle` → `creating_character` → `processing_advancements` → `selecting_equipment` → `shopping` → `selecting_spells` → `completed`
- **FoundryVTT Hooks Integration**: Module uses hooks extensively for FoundryVTT lifecycle and D&D 5e advancement system integration

## Critical Development Patterns
- NB: ensure you run the tests before claiming success
- **CRITICAL: NO HARDCODED TIMEOUTS** - Never use literal millisecond values (e.g., `5000`, `20000`) for timeouts, polling, or waits. Always use settings-driven values from `getTestTimeouts()` or equivalent helpers. If a new timeout is needed, add it to the settings system first.
- **CRITICAL: NO TIMEOUT MODIFICATIONS** - Never modify, multiply, add to, or otherwise alter timeout values from settings (e.g., no `Math.max(timeout, 500)` or `timeout * 2`). Use the exact value from settings. If the default isn't suitable, change the setting value itself.
- **CRITICAL: NEVER EDIT dist/** - The `dist/` folder is dynamically generated output. Do not patch compiled bundles there. Make all changes in `src/` or other source/config files and let HMR / the normal generation process refresh `dist/`.

**Frontend Stack**:
- **CRITICAL**: ALL Svelte components MUST use Pug templates with `<template lang="pug">` - NEVER use standard HTML markup
- Pug templates with Svelte preprocessing (NOT standard Pug - see `.cursor/rules/`)
- **Pug Syntax Rules**:
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
- Avoid long expressions in attributes - extract to script functions
- ESM-only project - never use `require()`, always `import`
- **i18n**: Always use `localize()` from `~/src/helpers/Utility` for GAS-namespaced strings — pass the key **without** the `GAS.` prefix (e.g. `localize("Footer.Cancel")`). Only fall back to `game.i18n.localize` / `game.i18n.format` for core Foundry keys that are not in the GAS namespace (e.g. `"DOCUMENT.ImportData"`).

**State Machine (Finity v0.5.4) - CRITICAL API PATTERNS**:
- **ASYNC OPERATIONS**: Only `.do()` method on states supports async functions - NEVER use `.onEnter()` for async
- **CONDITIONAL TRANSITIONS**: Use `.transitionTo('state').withCondition((context) => boolean)` - NOT functions passed to `.transitionTo()`
- **CONTEXT LIMITATIONS**: Finity creates its own context object - external context must be accessed via closures, not passed to `.start()`
- **DO() IS TERMINAL**: `.do(asyncFn).onSuccess().transitionTo('state').onFailure().transitionTo('error')` is complete - CANNOT chain with `.on()` events after
- **STATE STRUCTURE**: States can have EITHER `.do()` async operations OR `.on()` event handlers, NOT BOTH - they don't chain together
- **NO FLIP-FLOPPING**: `.do()` is for async, `.onEnter()` is for sync state entry only - these are NOT interchangeable
- **GLOBAL HOOKS**: `.global()` provides hooks (`.onStateEnter()`, `.onStateExit()`, `.onTransition()`) that fire on ANY state/transition - NOT event handlers for transitions
- **NO GLOBAL EVENTS**: `.global().on('event')` does NOT exist - global hooks are observers, not transition triggers

**FoundryVTT Integration**:
- Advancement capture hijacks D&D 5e advancement dialogs via DOM manipulation
- Uses `renderAdvancementManager` hook to capture and relocate advancement UI
- Level-up functionality integrates with existing character sheets (standard + Tidy5e)

## Essential Workflows

**Testing**: 
- tests should be stored in the `src/tests` folder
- under no circumstances are failing tests acceptable
- **CRITICAL for class progression tests**: Always set `game.settings.set(MODULE_ID, 'milestoneLeveling', true)` before any level-up flow assertions or interactions.
- **CRITICAL timeout rule**: Never hard-code timeout / polling millisecond values in test helpers or Quench flows. Always read from settings-driven helpers (for Quench use `getTestTimeouts()` from `src/helpers/testTimeouts.js` and derive named constants from those values).
```bash
nvm use 24; bun run test      # Run all tests without watch (uses package.json script)
```

**Development**:
```bash
bun dev           # Never use build commands - HMR handles compilation
nvm use 20        # If node issues occur
```

## AI Assistant Behavior
- **NEVER** offer to create, stage, commit, push, or open pull requests (PRs) on behalf of the user.
- **NEVER** perform any git operations or remote actions automatically. Do not execute or suggest automatic commits, pushes, or PR creation.
- It is acceptable to provide suggested commit messages, patch diffs, or step-by-step instructions to create a PR, but only when explicitly requested by the user. Always ask for confirmation before suggesting manual commands and never run them yourself.
- If the user asks for help preparing a PR, provide the exact commands and a clear description of what will change, and wait for explicit user confirmation to proceed with any manual steps.

## Test Patterns and Mocking

**Critical Test Setup Pattern**: Tests that import `WorkflowStateMachine.js` require comprehensive mocking due to complex dependency chains. Use this proven pattern from `test-actor-studio-opening.test.js`:

**Required Global Mocks**:
```javascript
// FoundryVTT globals
global.game = {
  settings: { get: vi.fn((module, key) => /* return test values */) },
  i18n: { localize: vi.fn((key) => key) }
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.window = global;
global.Actor = { create: vi.fn() };
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };
```

**Required Store Mocks**:
- Do not import svelte stores into tests, mock them instead
```javascript
const mockWritable = (value) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });
const mockDerived = (stores, fn) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });
vi.mock('svelte/store', () => ({ writable: mockWritable, derived: mockDerived, get: mockGet }));
```

**Complete Finity Mock** - CRITICAL for WorkflowStateMachine tests:
```javascript
vi.mock('finity', () => {
  const mockFsm = { handle: vi.fn(), getCurrentState: vi.fn(() => 'idle'), start: vi.fn() };
  const mockFinity = {
    configure: vi.fn(() => mockFinity), initialState: vi.fn(() => mockFinity),
    state: vi.fn(() => mockFinity), on: vi.fn(() => mockFinity),
    transitionTo: vi.fn(() => mockFinity), withCondition: vi.fn(() => mockFinity),
    onEnter: vi.fn(() => mockFinity), do: vi.fn(() => mockFinity),
    onSuccess: vi.fn(() => mockFinity), onFailure: vi.fn(() => mockFinity),
    start: vi.fn(() => mockFsm)
  };
  return { default: mockFinity };
});
```

**Required Module Mocks** for WorkflowStateMachine dependency chain:
```javascript
vi.mock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(0) }));
vi.mock('~/src/stores/storeDefinitions', () => ({ goldRoll: mockWritable(0) }));
vi.mock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
vi.mock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
vi.mock('~/src/helpers/Utility', () => ({ /* all utility functions as vi.fn() */ }));
```

**Key Files to Understand**:
- `src/helpers/WorkflowStateMachine.js` - Core state machine logic
- `src/stores/advancements.js` - Advancement queue management with `dropItemRegistry`
- `src/hooks/captureAdvancement.js` - FoundryVTT advancement hijacking
- `src/app/PCApplication.js` - Main Svelte application using TyphonJS

## Integration Points

**Settings-Driven Features**: Module behavior controlled by game settings:
- `enableEquipmentSelection`, `enableSpellSelection`, `enableEquipmentPurchase`
- `disableAdvancementCapture` - bypasses D&D 5e advancement workflow

**Hook Events**: Custom hooks for workflow coordination:
- `gas.openActorStudio`, `gas.close`, `gas.captureAdvancement`
- Standard FoundryVTT hooks: `renderAdvancementManager`, `renderActorSheet`

**Cross-System Compatibility**: Supports D&D 5e v3.x and v4.x with version-specific handling throughout codebase.

## Common Debugging Patterns

- Advancement capture timing issues require `AdvancementCaptureTimerThreshold` setting adjustments
- State machine transitions logged with `window.GAS.log.d()` debug system
- Race conditions in advancement processing handled with timeouts and DOM polling

## Test Debugging Common Issues

**"No 'derived' export is defined"**: Add `derived: mockDerived` to svelte/store mock
**"do is not a function"**: Ensure Finity mock includes all methods: `do`, `onSuccess`, `onFailure`, `withCondition`
**"Cannot read properties of undefined (reading 'render')"**: Mock Actor needs `sheet: { render: vi.fn() }`
**Import chain failures**: Mock all modules imported by WorkflowStateMachine.js (see Test Patterns above)

Reference working test: `test-actor-studio-opening.test.js` for complete pattern.

## Quench Integration Testing (Foundry In-App) - Required Patterns

These rules apply to Quench tests in `src/hooks/tests/character-permutation-tests.js` and similar Foundry in-app flows.

- Quench tests are not plain Vitest unit tests. Treat them as DOM + sheet lifecycle integration flows running in Foundry.
- For class progression tests, always set both:
  - `game.settings.set(MODULE_ID, 'milestoneLeveling', true)`
  - `game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true)`

### Proven Failure Modes and Fixes (Cleric/Fighter)

- **Failure**: Actor exists in world but test actor id is `null`.
  - **Cause**: `resetStores()` clears `actorInGame` on Actor Studio close.
  - **Fix**: Persist a unique test actor name and recover actor from `game.actors` by name when store id is null.

- **Failure**: Level-up “open app” appears to pass without the sheet button being present.
  - **Cause**: Test helper bypasses sheet flow (direct `new PCApplication(...).render()` fallback).
  - **Fix**: Never bypass sheet interaction in button tests. Require clicking sheet button selectors.

- **Failure**: Level-up button assertion fails even when actor has class/background.
  - **Cause**: Sheet header injection timing / render race.
  - **Fix**: Render sheet, wait, render again, then click `button.level-up` first (fallback selectors only after that).

- **Failure**: New class tests added but class does not appear in Quench UI.
  - **Cause**: Test block exists in `character-permutation-tests.js` but batch not registered in `src/index.js`.
  - **Fix**: Add import + `quench.registerBatch(...)` entry for the new class in `Hooks.on('quenchReady', ...)`.

- **Failure**: Ranger spells step shows expected count but no spells are selected; tests stall on spells completion.
  - **Cause**: Spell groups can start collapsed, so `.add-btn` elements are unavailable until headers are expanded.
  - **Fix**: In spell-step automation, expand collapsed `.spell-level-header` groups first, then click enabled `.add-btn` until Finalize becomes available.

- **Failure**: Ranger creation lands on spells tab with no spell rows and no actionable buttons; app never closes.
  - **Cause**: Spell UI enters a non-actionable state (no add buttons, no finalize/skip) and cannot progress via footer interactions.
  - **Fix**: Treat this as a real product defect and fail the test with explicit diagnostics (no spell rows, no add buttons, no finalize/skip controls). Do NOT dispatch FSM events from tests to force completion.

- **Failure**: Ranger 2→3 fails to find class plus button.
  - **Cause**: Level-up app can open on a different tab than Level Up/Class.
  - **Fix**: Explicitly focus `Level Up`/`Class` tab before attempting class-row / plus interactions.

### Stable Class Test Structure (must mirror Cleric/Fighter)

Use four ordered `it()` blocks per class:
1. creation flow
2. open level-up app from sheet button
3. level 1→2
4. level 2→3

Creation flow must assert:
- Actor Studio closes after creation completion.
- Actor exists in world.
- Class level 1 exists on actor.
- Background item exists on actor.

### Ranger Next-Test Checklist (first-pass reliability)

- Clone the stable Fighter block structure first; only then swap class-specific values.
- Use Ranger class UUID + `classIdentifier = 'ranger'` consistently in assertions.
- Keep the same actor id fallback strategy (store id first, world actor-by-name fallback second).
- Keep the same sheet button strategy (`button.level-up` primary selector).
- At level 1→2 and 2→3, assert expected spell-tab behavior for Ranger per current ruleset/settings before finalizing.

## Test Integrity Rules (non-negotiable)

- Never add fallback logic that makes a failing integration path look successful.
- Never force FSM transitions (e.g., `skip_spells`, `spells_complete`, `completed`) from tests to bypass broken UI paths.
- Never replace UI-driven assertions with weaker assertions just to pass tests.
- If UI is missing required controls/content, fail fast with diagnostics and fix production behavior.