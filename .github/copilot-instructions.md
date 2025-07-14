# FoundryVTT Actor Studio - AI Coding Guide

## Architecture Overview

**Core Framework**: This is a FoundryVTT module built with Svelte + TyphonJS runtime for reactive UI components and Finity state machines for workflow orchestration. The module creates D&D 5e characters through a guided multi-step process with advancement capture integration.

**Key Design Patterns**:
- **Atomic Design**: Components organized as `atoms/` → `molecules/` → `organisms/` (see `src/components/`)
- **State Management**: Svelte stores centralized in `src/stores/` with `dropItemRegistry` for advancement queuing
- **Workflow State Machine**: Finity FSM in `WorkflowStateMachine.js` handles character creation flow: `idle` → `creating_character` → `processing_advancements` → `selecting_equipment` → `shopping` → `selecting_spells` → `completed`
- **FoundryVTT Hooks Integration**: Module uses hooks extensively for FoundryVTT lifecycle and D&D 5e advancement system integration

## Critical Development Patterns

**Frontend Stack**:
- Pug templates with Svelte preprocessing (NOT standard Pug - see `.cursor/rules/`)
- Conditional logic must be properly nested: `+else()` indented one level deeper than `+if()`
- Avoid long expressions in attributes - extract to script functions
- ESM-only project - never use `require()`, always `import`

**State Machine (Finity)**:
- Only `.do()` actions support async functions
- State transitions use context functions for dynamic routing
- Events like `equipment_complete` trigger conditional transitions based on settings

**FoundryVTT Integration**:
- Advancement capture hijacks D&D 5e advancement dialogs via DOM manipulation
- Uses `renderAdvancementManager` hook to capture and relocate advancement UI
- Level-up functionality integrates with existing character sheets (standard + Tidy5e)

## Essential Workflows

**Testing**: 
```bash
bun test          # Run all tests
npx vitest run        # Never use watch mode
bun test:ui       # UI test runner
```

**Development**:
```bash
bun dev           # Never use build commands - HMR handles compilation
nvm use 20        # If node issues occur
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