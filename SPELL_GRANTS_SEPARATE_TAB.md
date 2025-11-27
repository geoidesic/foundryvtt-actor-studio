# Spell Grants - Separate Tab Implementation

## Summary

Implemented a separate "Feat Spells" tab for spell grants from feats and fighting styles (like Magic Initiate, Druidic Warrior, etc.) to avoid confusion with class spell selection.

## Changes Made

### 1. New SpellGrants Tab Component
**File**: `src/components/organisms/dnd5e/Tabs/SpellGrants.svelte`

- Dedicated tab for feat/fighting style spell selection
- Loads spells from all required spell lists (e.g., Cleric, Druid, Wizard for Magic Initiate)
- Shows completion status
- Validates all spell grants before allowing progression

**Key Features**:
- Automatically loads spells from multiple spell lists
- Shows loading state while fetching spells
- Displays each grant with its own SpellGrantSelector
- Visual feedback for completion status (green checkmark when done)

### 2. Updated Level-Up State Machine
**File**: `src/helpers/LevelUpStateMachine.js`

Modified the `selecting_spells` state entry to:
- Check for active spell grants
- Add "Feat Spells" tab BEFORE "Spells" tab if grants exist
- Set active tab to "spell-grants" if grants exist, otherwise "spells"

### 3. Updated Spell Filtering
**File**: `src/components/molecules/dnd5e/SpellGrantSelector.svelte`

Updated `filterAvailableSpells()` to handle:
- Single spell list: `spellList: 'druid'`
- Multiple spell lists: `spellList: ['cleric', 'druid', 'wizard']`

This allows Magic Initiate to show spells from all three eligible spell lists.

### 4. Magic Initiate Detection
**File**: `src/helpers/SpellGrantDetection.js`

Added description parsing for Magic Initiate:
- Detects `identifier: 'magic-initiate'` or name `'Magic Initiate'`
- Parses description to extract spell lists from `@UUID` links
- Creates spell grant with:
  - 2 cantrips (maxLevel: 0)
  - 1 level 1 spell (minLevel: 1, maxLevel: 1)
  - All three spell lists: `['cleric', 'druid', 'wizard']`

## Workflow

### Character Creation with Magic Initiate:
1. **Race/Background/Class** → Select race, background, class
2. **Advancements** → Choose Magic Initiate feat
3. **Feat Spells** ← NEW TAB!
   - Shows "Magic Initiate" section
   - Loads Cleric + Druid + Wizard spells
   - User selects 2 cantrips + 1 level 1 spell
   - Green checkmark when complete
4. **Spells** → Class spell selection (e.g., Eldritch Knight spells)
5. **Equipment** → Continue as normal

### Level-Up with Druidic Warrior:
1. **Advancements** → Ranger reaches level 2, chooses Druidic Warrior fighting style
2. **Feat Spells** ← Appears automatically
   - Shows "Druidic Warrior" section
   - Loads Druid spells
   - User selects 2 Druid cantrips
   - Green checkmark when complete
3. **Spells** → Ranger spell selection
4. **Complete**

## Testing

### Test Case 1: Eldritch Knight with Magic Initiate
- Create Fighter level 3
- Choose Magic Initiate (Wizard) as origin feat
- Level up to 4 (Eldritch Knight subclass)
- Expected: "Feat Spells" tab shows Magic Initiate (3 spells from Cleric/Druid/Wizard)
- Then: "Spells" tab shows Eldritch Knight spells (Wizard list, 1 spell)

### Test Case 2: Ranger with Druidic Warrior
- Create Ranger level 1
- Level up to 2, choose Druidic Warrior fighting style
- Expected: "Feat Spells" tab shows Druidic Warrior (2 Druid cantrips)
- Then: "Spells" tab shows Ranger spells

### Test Case 3: Character with No Spell Grants
- Create Barbarian level 1
- Level up to 2
- Expected: NO "Feat Spells" tab, go directly to regular workflow

## Known Limitations

1. **Spell Grants Tab Validation**: Currently, the tab shows completion status but the Footer "Next" button doesn't enforce completion yet. User can manually switch tabs.
   
2. **Synchronous Store Access**: Using `require()` to synchronously check spell grants. This works but isn't ideal - could be refactored to use async imports.

3. **No Auto-Progression**: User must manually click the "Spells" tab after completing feat spells. Could add auto-navigation in the future.

## Future Enhancements

1. **Footer Integration**: Update Footer to:
   - Disable "Next" if on spell-grants tab and selections incomplete
   - Auto-advance to "Spells" tab when spell grants complete

2. **Better Spell Grant Detection**: Add more patterns for other spell-granting items

3. **UI Polish**: 
   - Show spell count progress in tab label: "Feat Spells (2/3)"
   - Add "Skip" option for optional spell grants

4. **Testing**: Add automated tests for:
   - Tab insertion logic
   - Spell list loading
   - Validation

## Files Modified

- `src/components/organisms/dnd5e/Tabs/SpellGrants.svelte` (NEW)
- `src/helpers/LevelUpStateMachine.js`
- `src/components/molecules/dnd5e/SpellGrantSelector.svelte`
- `src/helpers/SpellGrantDetection.js`

## Files Unchanged (for reference)

- `src/components/organisms/dnd5e/SpellGrantsSection.svelte` - Can be deprecated/removed
- `src/components/organisms/dnd5e/Tabs/Spells.svelte` - Works as before
