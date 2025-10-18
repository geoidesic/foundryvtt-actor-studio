# Feat Selector False Positive Fix

## Problem

The custom feat selector was incorrectly intercepting browse buttons for **all** advancements that contained the word "feat" anywhere in their configuration, including:

- **Fighting Style** choices (ItemChoice advancement)
- **Maneuvers** selections (ItemChoice advancement)
- **Infusions** (ItemChoice advancement)
- Any other ItemChoice advancement that might have "feat" in descriptions

This caused the custom feat selector to appear when users clicked browse buttons for these non-feat selections, breaking the intended workflow.

## Root Cause

The original `isFeatAdvancementFlow()` function used a broad `containsFeat()` check that searched for the string "feat" in many different paths within the advancement configuration:

```javascript
const ADVANCEMENT_FEAT_PATHS = [
  ['type'], ['slug'], ['identifier'], ['itemType'],
  ['configuration', 'type'], ['configuration', 'itemType'],
  ['configuration', 'types'], ['configuration', 'choices'],
  ['configuration', 'filters'], // ... etc
];
```

This approach had false positives because:
1. **Fighting Style** is an `ItemChoice` with items that might be described as features
2. The word "feat" could appear in hints, descriptions, or other metadata
3. No distinction was made between "feat selection" and "item selection that includes feats"

## Solution

Implemented a more precise detection strategy that checks advancement **type** first:

### 1. Primary Check: `AbilityScoreImprovement`
This is the **definitive** feat advancement type in D&D 5e, appearing at levels 4/8/12/16 where players choose between ASI or a feat.

```javascript
if (advancement.type === 'AbilityScoreImprovement') {
  return true; // This is always a feat choice
}
```

### 2. Secondary Check: `ItemChoice` with Feat Restriction
Some campaigns/homebrew might use `ItemChoice` specifically restricted to feats. We check if the `restriction.type` is explicitly "feat":

```javascript
if (advancement.type === 'ItemChoice') {
  const restrictionType = advancement.configuration?.restriction?.type 
                       || advancement.restriction?.type;
  return restrictionType === 'feat';
}
```

### 3. Legacy Compatibility
For backwards compatibility with older advancement structures, check specific paths but **only for non-ItemChoice/ItemGrant types**:

```javascript
if (advancement.type !== 'ItemChoice' && advancement.type !== 'ItemGrant') {
  // Check type/slug/identifier only
  return ADVANCEMENT_FEAT_PATHS.some((path) => containsFeat(readPath(advancement, path)));
}
```

## D&D 5e Advancement Types Reference

| Advancement Type | Purpose | Feat Selector? |
|-----------------|---------|---------------|
| `AbilityScoreImprovement` | ASI or Feat choice at levels 4/8/12/16 | ✅ YES |
| `ItemChoice` (restriction.type="feat") | Custom feat selection | ✅ YES |
| `ItemChoice` (Fighting Style) | Choose from class features | ❌ NO |
| `ItemChoice` (Maneuvers) | Choose battle maneuvers | ❌ NO |
| `ItemGrant` | Automatically grant items | ❌ NO |
| `ScaleValue` | Scaling class features | ❌ NO |
| `HitPoints` | HP increases | ❌ NO |

## Testing

All 207 tests pass, including:
- ✅ Feat selector integration tests
- ✅ Advancement capture tests
- ✅ Spell selection tests
- ✅ Equipment selection tests

## Impact

### Before Fix:
- User clicks "Browse" on Fighting Style → Custom feat selector appears (WRONG)
- User clicks "Browse" on Maneuvers → Custom feat selector appears (WRONG)
- User clicks browse on ASI/Feat choice → Custom feat selector appears (CORRECT)

### After Fix:
- User clicks "Browse" on Fighting Style → Standard FoundryVTT browser (CORRECT)
- User clicks "Browse" on Maneuvers → Standard FoundryVTT browser (CORRECT)
- User clicks browse on ASI/Feat choice → Custom feat selector appears (CORRECT)

## Files Modified

- `src/hooks/captureAdvancement2.js` - Updated `isFeatAdvancementFlow()` logic

## Debug Logging Added

The fix includes comprehensive debug logging to help diagnose advancement type detection:

```javascript
window.GAS.log.d('[isFeatAdvancementFlow] Detected AbilityScoreImprovement (ASI/Feat choice)');
window.GAS.log.d('[isFeatAdvancementFlow] ItemChoice advancement:', {
  restrictionType,
  isFeatRestriction,
  title: advancement.title,
  hint: advancement.hint
});
```

Look for these logs in the browser console (F12) when leveling up to see which detection path is being used.
