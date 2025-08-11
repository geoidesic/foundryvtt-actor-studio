# FoundryVTT Actor Studio - AI Coding Guide

NB: don't ask for permission to code, just do it.

## Architecture Overview

**Core Framework**: This is a FoundryVTT module built with Svelte + TyphonJS runtime for reactive UI components and Finity state machines for workflow orchestration. The module creates D&D 5e characters through a guided multi-step process with advancement capture integration.

**Key Design Patterns**:
- **Atomic Design**: Components organized as `atoms/` → `molecules/` → `organisms/` (see `src/components/`)
- **State Management**: Svelte stores centralized in `src/stores/` with `dropItemRegistry` for advancement queuing
- **Workflow State Machine**: Finity FSM in `WorkflowStateMachine.js` handles character creation flow: `idle` → `creating_character` → `processing_advancements` → `selecting_equipment` → `shopping` → `selecting_spells` → `completed`
- **FoundryVTT Hooks Integration**: Module uses hooks extensively for FoundryVTT lifecycle and D&D 5e advancement system integration

## Critical Development Patterns
- NB: ensure you run the tests before claiming success

**Frontend Stack**:
- **CRITICAL**: ALL Svelte components MUST use Pug templates with `<template lang="pug">` - NEVER use standard HTML markup
- Pug templates with Svelte preprocessing (NOT standard Pug - see `.cursor/rules/`)
- Conditional logic must be properly nested: `+else()` indented one level deeper than `+if()`
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

**Testing**: 
- tests should be stored in the `src/tests` folder
- under no circumstances are failing tests acceptable
```bash
npx vitest run    # Run all tests without watch
```

**Development**:
```bash
bun dev           # Never use build commands - HMR handles compilation
nvm use 20        # If node issues occur
```

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