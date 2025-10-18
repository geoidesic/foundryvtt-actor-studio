# Ranger 2014 Cantrip Display Fix

## Issue Summary
Rangers in D&D 2014 rules were incorrectly shown cantrips for selection during level-up, even though Rangers get 0 cantrips at all levels (2014 rules).

## Problem Description

### Observed Behavior
1. **Level 2 Ranger**: Worked correctly - showed only 1st level spells for selection
2. **Level 2 → 3 Ranger**: Showed cantrips in the spell list with "Cantrips: 0/0" limit
3. User confusion: Why are cantrips shown if I can't select them?

### Root Cause
The spell filtering logic in `Spells.svelte` always allowed cantrips:

```javascript
// OLD LOGIC (BROKEN)
const withinCharacterLevel = spellLevel === 0 ||  // ❌ Always shows cantrips!
  spellLevel <= effectiveMaxSpellLevel || 
  (spellLevel === 1 && $spellLimits.spells > 0);
```

This meant:
- **All classes saw cantrips**, regardless of whether they could learn them
- **Rangers 2014**: Get `"0 / 2"` spells at level 2, `"0 / 3"` at level 3
- The `0` cantrips limit meant they couldn't *select* cantrips, but they were still *shown*

## Solution

### Code Change
Updated the spell filtering logic to **only show cantrips when the character can learn them**:

```javascript
// NEW LOGIC (FIXED)
const withinCharacterLevel = 
  (spellLevel === 0 && $spellLimits.cantrips > 0) ||  // ✅ Only show if cantrip limit > 0
  (spellLevel > 0 && spellLevel <= effectiveMaxSpellLevel) || 
  (spellLevel === 1 && $spellLimits.spells > 0);
```

**File**: `src/components/organisms/dnd5e/Tabs/Spells.svelte`  
**Lines**: 286-297

### Test Coverage
Created comprehensive test: `test-ranger-2014-cantrip-fix.test.js`

**Test Cases**:
1. ✅ Rangers 2014 should NOT see cantrips (cantrip limit = 0)
2. ✅ Classes with cantrips (like Bards) should still see them

**Test Output**:
```
Level 2→3 Ranger spell limits:
- Old level: 2 "0 / 2"
- New level: 3 "0 / 3"
- Cantrip difference: 0 (should be 0)
- Spell difference: 1 (should be 1)

OLD filtering logic (BROKEN):
- Filtered spells: 5
  - Light (level 0)         ❌ Should not show
  - Mage Hand (level 0)     ❌ Should not show
  - Cure Wounds (level 1)   ✅ Correct
  - Hunter's Mark (level 1) ✅ Correct
  - Entangle (level 1)      ✅ Correct

NEW filtering logic (FIXED):
- Filtered spells: 3
  - Cure Wounds (level 1)   ✅ Correct
  - Hunter's Mark (level 1) ✅ Correct
  - Entangle (level 1)      ✅ Correct
```

## Impact

### Fixed Scenarios
- **Rangers 2014**: No longer see cantrips (all levels)
- **Paladins 2014 Level 1**: No longer see cantrips (they get spells at level 2+)
- **Any half-caster with 0 cantrips**: Will now correctly hide cantrip section

### Unchanged Scenarios
- **Full casters** (Bard, Cleric, Druid, etc.): Still see cantrips normally
- **Rangers 2024**: Get 0 cantrips but 2 spells at level 1 - correctly shows only level 1 spells
- **All other spellcasters**: No change to their spell selection

## Related Files
- `src/components/organisms/dnd5e/Tabs/Spells.svelte` - **Main fix**
- `src/stores/spellsKnown.json` - Spell limit data source
- `src/tests/test-ranger-2014-cantrip-fix.test.js` - **Test coverage**

## Verification
All 205 tests pass, including:
- ✅ `test-ranger-2014-cantrip-fix.test.js` (2 tests)
- ✅ `test-ranger-spell-issue.test.js` (1 test) 
- ✅ All existing spell selection tests

## Notes
- This fix applies to **spell filtering only** - the spell limits calculation was already correct
- The underlying data (`spellsKnown.json`) was already accurate
- The issue was purely a display/filtering problem in the UI
