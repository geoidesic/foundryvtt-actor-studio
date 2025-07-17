# Level-Up Error Fixes Summary

## Issues Fixed

This document summarizes the fixes applied to resolve the level-up errors reported by the user.

### Issue 1: State Machine Error

**Error Message:**
```
Uncaught (in promise) Error: Unhandled event 'start_level_up' in state 'completed'.
```

**Root Cause:**
- In `PCAppShell.svelte`, the code was calling `levelUpFSM.handle(LEVELUP_EVENTS.START_LEVEL_UP)` without checking the current state
- If the user had already completed a level-up (FSM in 'completed' state), attempting to handle the `start_level_up` event would fail because the 'completed' state doesn't have a handler for this event

**Fix Applied:**
Modified `PCAppShell.svelte` to check the FSM state before sending events:

```javascript
// Start the LevelUp state machine
const levelUpFSM = getLevelUpFSM();
const currentState = levelUpFSM.getCurrentState();
window.GAS.log.d('[PCAPP] Current LevelUp FSM state before starting:', currentState);

// Reset FSM to idle if it's in a terminal state (completed or error)
if (currentState === 'completed' || currentState === 'error') {
  window.GAS.log.d('[PCAPP] Resetting LevelUp FSM from terminal state:', currentState);
  levelUpFSM.handle(LEVELUP_EVENTS.RESET);
}

// Only send START_LEVEL_UP if we're in idle state
const finalState = levelUpFSM.getCurrentState();
if (finalState === 'idle') {
  levelUpFSM.handle(LEVELUP_EVENTS.START_LEVEL_UP);
  window.GAS.log.d('[PCAPP] Started LevelUp workflow from idle state');
} else {
  window.GAS.log.w('[PCAPP] LevelUp FSM not in idle state after reset:', finalState);
}
```

### Issue 2: Unknown Prop Warning

**Error Message:**
```
<LevelUp> was created with unknown prop 'sheet'
```

**Root Cause:**
- In `Tabs.svelte` line 61, the code passes a `sheet` prop to all tab components: `<svelte:component this={tabComponents[tab.component]} {sheet} />`
- The `LevelUp.svelte` component didn't expect this prop, causing the warning

**Fix Applied:**
Added the `sheet` prop to `LevelUp.svelte`:

```javascript
// Accept the sheet prop even though we don't use it, to avoid the warning
export let sheet = null;
```

## Test Coverage

Created comprehensive tests to verify both fixes:

1. **test-levelup-state-fix.test.js** - Verifies the state machine reset logic works correctly
2. **test-levelup-prop-fix.test.js** - Verifies the component prop warning is resolved

## Benefits

- **No More Crashes**: Users can now level up multiple times without encountering the state machine error
- **Clean Console**: Removed the annoying prop warning that appeared in the browser console
- **Better User Experience**: Level-up workflow now works smoothly even after completing previous level-ups
- **Maintainable Code**: Added proper state checking logic that prevents similar issues in the future

## Impact

These fixes ensure that the level-up functionality works reliably in FoundryVTT v13 with D&D 5e v5 (2024 rules), addressing the specific issues reported by the user.
