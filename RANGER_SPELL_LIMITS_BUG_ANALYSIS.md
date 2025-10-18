# Ranger Spell Limits Bug - Complete Analysis

## The Real Problem

The bug shows:
- **UI Display**: Cantrips: 0/2, Spells: 0/0
- **Expected**: Cantrips: 0/0, Spells: 0/1

## Root Cause

There are **TWO code paths** for calculating spell limits:

### Path 1: Base Class Calculation (✅ CORRECT)
```javascript
// In spellLimits derived store (lines 443-486)
const oldLevel = 2, newLevel = 3;
const oldClassData = "0 / 2"; // Level 2
const newClassData = "0 / 3"; // Level 3
const cantripDifference = 0 - 0 = 0; // ✅ Correct
const spellDifference = 3 - 2 = 1;   // ✅ Correct
return { cantrips: 0, spells: 1 };   // ✅ Correct
```

### Path 2: Subclass Advancement Parsing (❌ BROKEN)
```javascript
// In parseSpellLimitsFromAdvancement (lines 255-370)
// This runs FIRST, before the base class calculation!
if (subclassLimits) {
  return subclassLimits; // Returns early, skipping base class path
}

// The problem: parseSpellLimitsFromAdvancement returns TOTAL for the level
//              NOT the difference from previous level
const spells = advancement.levels[levelIndex]; // e.g., 2 for level 3
return { cantrips: 0, spells: 2 };  // ❌ Wrong! Should be 1
```

## Why It Happens

1. **Ranger** has a subclass (Hunter, Beastmaster, etc.)
2. The subclass has advancement data with spell progressions
3. `getSpellLimitsFromSubclassAdvancement()` is called FIRST (line 438)
4. It finds the subclass and calls `parseSpellLimitsFromAdvancement()`
5. That function returns the TOTAL spell count for level 3 (which is 2)
6. The code returns early with `{ cantrips: 0, spells: 2 }`
7. The correct base class calculation is NEVER REACHED

## The Fix

We need to make `getSpellLimitsFromSubclassAdvancement()` **calculate differences** when it's a level-up scenario, just like the base class path does.

### Option 1: Pass isLevelUp flag and calculate difference in parseSpellLimitsFromAdvancement
### Option 2: Make parseSpellLimitsFromAdvancement always return totals, and calculate difference in getSpellLimitsFromSubclassAdvancement
### Option 3: Don't use subclass advancement for Rangers - force them to use base class path

Option 2 is cleanest and most consistent with the existing architecture.

## Files Affected
- `src/stores/spellSelection.js`
  - `getSpellLimitsFromSubclassAdvancement()` (lines 163-252)
  - `parseSpellLimitsFromAdvancement()` (lines 255-410)
  - `spellLimits` derived store (lines 415-510)
