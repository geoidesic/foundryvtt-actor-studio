# Feat Prerequisite Filtering

## Overview
Implemented comprehensive prerequisite checking for feat selection during character creation and level-up, filtering out feats that the character doesn't qualify for based on level, ability scores, and required features.

## Features Implemented

### 1. Level Requirement Checking
- Validates `system.prerequisites.level` against character's current level
- Automatically filters out feats requiring higher levels
- Shows required level in prerequisite display

### 2. Ability Score Requirement Checking
- Validates `system.prerequisites.abilities` array
- Checks each required ability score against character's current scores
- Supports both `ability`/`value` and `key`/`minimum` property names
- Defaults to 13 if no specific value is provided

### 3. Feature Requirement Checking
- Validates `system.prerequisites.features` array
- Checks if character has required features/items by name (case-insensitive)
- Supports both string feature names and objects with `name`/`identifier` properties

### 4. UI Enhancements

#### Compact Feat List Design
- Feats displayed as enriched HTML links (like features)
- Hovering over feat name shows Foundry's built-in tooltip with full details
- Minimal row height for better list scanning
- Only ineligibility warnings shown inline when applicable

#### Feat Filtering
- By default, only shows feats the character qualifies for
- Optional "Show ineligible feats" toggle to display all feats
- Ineligible feats are visually distinct with:
  - Reduced opacity (0.6)
  - Red/brown border color
  - Cursor changed to `not-allowed`
  - Cannot be selected

#### Ineligibility Reasons
- Shows compact human-readable reasons why a feat is ineligible:
  - "Requires level X (you are level Y)"
  - "Requires feature(s): Feature Name"
  - "Requires: STR 13, DEX 15"
- Displayed with warning icon on the right side of the row

### 5. Data Loading
Updated `getFilteredFeats()` to load prerequisite data:
```javascript
const nonIndexKeys = [
  "system.prerequisites.level",
  "system.prerequisites.abilities",
  "system.prerequisites.features",
  "system.description.value"
];
```

## Code Changes

### Files Modified

1. **src/components/molecules/dnd5e/Feats/FeatSelector.svelte**
   - Added `actor` and `characterLevel` props
   - Added `showIneligible` toggle state
   - Added `enrichedFeatLinks` to store pre-enriched HTML links
   - Implemented prerequisite checking functions:
     - `meetsLevelRequirement(feat)`
     - `meetsFeatureRequirements(feat)`
     - `meetsAbilityRequirements(feat)`
     - `meetsAllPrerequisites(feat)`
     - `getIneligibilityReason(feat)`
   - Updated reactive filtering to include prerequisite checks
   - Changed display from thick cards to compact enriched HTML links
   - Added ineligibility reason display inline on the right
   - Pre-enriches feat links on mount for tooltip support
   - CSS updated for compact, scannable list design

2. **src/hooks/captureAdvancement.js**
   - Modified `showFeatSelector()` to extract actor and level from advancement manager
   - Passes `actor` and `characterLevel` props to FeatSelector component

3. **src/helpers/Utility.js**
   - Updated `getFilteredFeats()` to load prerequisite data:
     - `system.prerequisites.abilities`
     - `system.prerequisites.features`

4. **src/tests/test-feat-selector-integration.test.js**
   - Added mock actor with abilities and level to test
   - Verified prerequisite checking doesn't break flow selection

5. **lang/en.json**
   - Added `FeatSelector.ShowIneligible` localization string

## Usage

### During Level-Up
When a character advances and encounters a feat selection:
1. The feat selector opens with only eligible feats shown
2. Each feat displays as a clickable enriched HTML link
3. Hovering over a feat name shows Foundry's tooltip with full details and description
4. Character's level and abilities are automatically checked
5. Feats with unmet prerequisites are hidden by default
6. Users can toggle "Show ineligible feats" to see all feats
7. Ineligible feats show compact reasons on the right (e.g., "Requires level 4")
8. Ineligible feats cannot be selected (grayed out, cursor shows not-allowed)

### Example Prerequisites Checked

**Level Requirement:**
```json
{
  "system": {
    "prerequisites": {
      "level": 4
    }
  }
}
```

**Ability Score Requirement:**
```json
{
  "system": {
    "prerequisites": {
      "abilities": [
        { "ability": "str", "value": 13 },
        { "ability": "con", "value": 13 }
      ]
    }
  }
}
```

**Feature Requirement:**
```json
{
  "system": {
    "prerequisites": {
      "features": [
        "Rage",
        "Reckless Attack"
      ]
    }
  }
}
```

## Testing
All existing tests pass. The implementation includes:
- Prerequisite data loading from compendiums
- Filtering logic for each prerequisite type
- UI toggle functionality
- Visual distinction for ineligible feats
- Integration with advancement flow

## Notes
- If no actor is provided (shouldn't happen in normal flow), prerequisites are skipped and all feats are shown
- Feature name matching is case-insensitive for better compatibility
- The system supports D&D 5e's feat prerequisite structure as defined in the system documentation
- Ineligible feats cannot be selected even when visible with the toggle enabled
