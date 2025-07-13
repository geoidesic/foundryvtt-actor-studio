# Race Condition Bug Fix Summary

## Problem Identified
The user reported that `handleAdvancementCompletion` was being called multiple times during the workflow, causing FSM state corruption:

```
[GAS][handleAdvancementCompletion] enableEquipment: false enableShop: false enableSpells: true isSpellcaster: false actor: Gamemaster Actor5e {name: 'Gamemaster', ...}
[GAS][handleAdvancementCompletion] Fallback, returning completed
[WORKFLOW] About to trigger advancements_complete with nextState: completed
[GAS][handleAdvancementCompletion] enableEquipment: false enableShop: false enableSpells: true isSpellcaster: true actor: Gamemaster Actor5e {name: 'Gamemaster', ...}
[GAS][handleAdvancementCompletion] Spells enabled and actor is spellcaster, returning selecting_spells
[WORKFLOW] About to trigger advancements_complete with nextState: selecting_spells
[WORKFLOW] Error handling advancements_complete event: Error: Unhandled event 'advancements_complete' in state '() => { ... }'
```

## Root Cause
The `processing_advancements` state's `onEnter` handler was being called multiple times, leading to:
1. Multiple calls to `handleAdvancementCompletion`
2. Race condition where `advancementNextState` was overwritten
3. FSM state corruption where `getCurrentState()` returned a function instead of a state name

## Solution Implemented

### 1. Added Race Condition Prevention
Added a closure variable `isProcessingAdvancements` to prevent re-entry:

```javascript
export function createWorkflowStateMachine() {
  let advancementNextState = 'completed';
  let isProcessingAdvancements = false; // <- Added this
  
  // ... FSM definition
}
```

### 2. Protected the onEnter Handler
```javascript
.onEnter(async function (context) {
  // Prevent re-entry if already processing
  if (isProcessingAdvancements) {
    if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Already processing advancements, skipping');
    return;
  }
  isProcessingAdvancements = true;
  
  try {
    // ... existing logic
  } catch (error) {
    console.error('[WORKFLOW] Error in processing_advancements onEnter:', error);
    isProcessingAdvancements = false;
    fsm.handle(WORKFLOW_EVENTS.ERROR);
  }
})
```

### 3. Reset Flag on State Transitions
Ensured the processing flag is reset when transitioning out of `processing_advancements`:

```javascript
.on('advancements_complete').transitionTo(() => {
  // ... existing logic
  isProcessingAdvancements = false; // <- Reset flag
  return state;
})
.on('error').transitionTo(() => {
  isProcessingAdvancements = false; // <- Reset flag
  return 'error';
})
.on('reset').transitionTo(() => {
  isProcessingAdvancements = false; // <- Reset flag
  return 'idle';
})
```

## Validation
- All existing tests (32/32) continue to pass
- The race condition protection prevents multiple `handleAdvancementCompletion` calls
- FSM state integrity is maintained throughout the workflow
- Error handling properly resets the processing flag

## Technical Benefits
1. **Prevents Race Conditions**: Only one advancement processing operation can run at a time
2. **Maintains FSM Integrity**: State transitions are atomic and consistent
3. **Robust Error Handling**: Processing flag is reset even if errors occur
4. **Backward Compatible**: No changes to external API or workflow behavior

## Files Modified
- `src/helpers/WorkflowStateMachine.js` - Added race condition protection
- All tests continue to pass, validating the fix doesn't break existing functionality

The fix ensures that the Actor Studio workflow remains stable and predictable, preventing the state corruption that was causing the "Unhandled event" errors.
