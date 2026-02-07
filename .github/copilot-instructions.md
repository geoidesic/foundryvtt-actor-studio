# FoundryVTT Actor Studio - AI Coding Guide

## Architecture Overview

**Core Framework**: This is a FoundryVTT module built with Svelte + TyphonJS runtime for reactive UI components and Finity state machines for workflow orchestration. The module creates D&D 5e characters through a guided multi-step process with advancement capture integration.

**Key Design Patterns**:
- **Atomic Design**: Components organized as `atoms/` → `molecules/` → `organisms/` (see `src/components/`)
- **State Management**: Svelte stores centralized in `src/stores/` with `dropItemRegistry` for advancement queuing
- **Workflow State Machine**: Finity FSM in `WorkflowStateMachine.js` handles character creation flow: `idle` → `creating_character` → `processing_advancements` → `selecting_equipment` → `shopping` → `selecting_spells` → `completed`
- **FoundryVTT Hooks Integration**: Module uses hooks extensively for FoundryVTT lifecycle and D&D 5e advancement system integration

## Critical Development Patterns

**Testing Strategy - Two Test Systems**

This project uses TWO distinct testing systems:

1. **vitest** (Node.js unit tests) - 88+ test files in `src/tests/`
   - Tests pure logic, helpers, store behavior, and mocked FoundryVTT APIs
   - Run via: `npx vitest run` (fast, no FoundryVTT needed)
   - **Use vitest for**: function logic, data transformations, utility methods
   
2. **Quench** (FoundryVTT E2E integration tests) - 3 test files in `src/module/quench-tests/`
   - Tests actual FoundryVTT UI, game objects, and module integration
   - Runs INSIDE FoundryVTT client (not Node.js)
   - **Use Quench for**: UI workflows, advancement capture, character creation flows

**CRITICAL: AI Autonomous Testing Workflow**

As an AI assistant, you CANNOT see FoundryVTT's browser UI. To verify your changes work in the actual game environment, you MUST use Quench automation:

**Step 1: Run Automated Quench Tests**
```bash
# Set environment variables (adjust paths as needed)
FOUNDY_DIR=/path/to/FoundryVTT-Node-13.341 WORLD_NAME=test npm run quench:run
```

**Step 2: Read Test Results**
After `npm run quench:run` completes, test results are written to:
- `reports/quench-report-{timestamp}.json` (timestamped copy)
- `FoundryVTT-Node-13.341/Data/quench-report.json` (original)

**Step 3: Parse Results and Iterate**
```javascript
// Use list_dir to find latest report
// Use read_file to read the JSON report
// Parse the structure to identify:
//   - totalTests, passed, failed
//   - Individual test results with failure messages
//   - Stack traces for debugging
```

**Step 4: Fix Failures and Re-run**
If tests fail:
1. Read the failure messages and stack traces from the JSON report
2. Identify the root cause (DOM elements missing, API calls failing, timing issues, etc.)
3. Fix the code
4. Re-run `npm run quench:run`
5. Verify all tests pass

**Quench JSON Report Structure**
```json
{
  "testResults": [
    {
      "title": "Actor Studio Sanity",
      "fullTitle": "ACTOR-STUDIO: Sanity tests > Actor Studio Sanity > has a sane environment",
      "state": "passed" | "failed",
      "err": { "message": "...", "stack": "..." }
    }
  ],
  "stats": { "passes": 2, "failures": 0, "tests": 2 }
}
```

**When to Run Quench vs vitest**
- **vitest**: After every code change to catch logic bugs (fast feedback loop)
- **Quench**: After UI changes, hook modifications, or FoundryVTT API integration (slower but essential for E2E verification)

**NB**: You MUST run tests after every generation and fix failures before completing a task. Do not leave broken tests for the user to debug.


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
  - Text content: Inline with elements, e.g., `button(type="button") Text`
- Avoid long expressions in attributes - extract to script functions
- ESM-only project - never use `require()`, always `import`

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

## Settings Index & Guidelines ✅
Keep a single authoritative index of module settings here when adding new settings. ALWAYS update this index when you add a setting in code so contributors and the Copilot assistant can reference it and avoid invented keys.

- Current AI / LLM related settings (update as you add more):
  - `llmApiKey` (string) — API key used for LLM & image generation flows
  - `llmProvider` (string) — 'openai' | 'claude' | 'openrouter'
  - `openrouterModel` (string) — model id for OpenRouter (e.g., `stability/SDXL`)
  - `openrouterApiKey` (string) — dedicated API key for OpenRouter (optional, falls back to llmApiKey)
  - `openrouterImageModel` (string) — model for image generation (e.g., 'bytedance-seed/seedream-4.5')
  - `enableAiTokens` (boolean) — toggle to enable the Phase‑1 AI portrait UI
  - `enableTokenCreation` (boolean) — toggle to show Token Customization tab after Bio tab (enables ring subject scale and Tokenizer integration)
  - `aiImagesUsePlaceholderOnFailure` (boolean) — use placeholder image when generation fails
  - Note: When `package.json` has `"debug": true`, image generation returns a static test image instead of calling APIs (saves credits during development)

Guidelines (MANDATORY):
- Always register settings using `game.settings.register(MODULE_ID, ... )` (use the `MODULE_ID` constant, not a literal string).
- When reading settings, use `safeGetSetting(MODULE_ID, 'key', default)` from `src/helpers/Utility` (this avoids calling unregistered keys and keeps tests stable).
- Do NOT call `game.settings.get('actor-studio', ...)` or hardcode module ids; use `MODULE_ID` and `safeGetSetting` instead.
- When adding a new setting:
  1. Register it in `src/settings/*` (follow existing patterns).
  2. Add its key and short description to this `Settings Index` section.
  3. Add localization strings to `lang/en.json` (and other locales as needed).
  4. Add tests/mocks that reference the setting (use the test patterns above and mock `safeGetSetting`).
  5. Run `npx vitest run` and ensure no regressions.

Example (read a setting safely):
```js
import { safeGetSetting } from '~/src/helpers/Utility';
const apiKey = safeGetSetting(MODULE_ID, 'llmApiKey', '');
```

> Rationale: keeping a single source-of-truth for settings prevents mismatched keys and runtime errors that throw when a setting is missing; using `safeGetSetting` ensures older/legacy settings are handled gracefully and that tests can mock behaviour reliably.

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