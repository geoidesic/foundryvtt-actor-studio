# Artificer Starting Equipment Display Fix

## Summary

Fixed four critical issues with starting equipment display in the Actor Studio Equipment tab, specifically affecting classes like Artificer with complex equipment structures.

## Problems Identified

### 1. Missing Labels for Weapon Type Entries
**Screenshot Evidence**: Black box showing no text where "2× simple weapon" should appear

**Root Cause**: 
- FoundryVTT's raw `startingEquipment` data doesn't include pre-generated labels
- Labels are generated on-demand by DND5e's `EquipmentEntryData#generateLabel()` method
- Actor Studio was displaying raw entries without calling label generation

**Data Structure Example**:
```javascript
{
  type: "weapon",
  count: 2,
  key: "sim",        // 'sim' = simple weapons
  _id: "ojcxdMjvk0hVfV5y",
  // NO label property!
}
```

### 2. "Undefined" Display in Equipment Lists
**Screenshot Evidence**: Second equipment group showing "undefined" as label

**Root Cause**:
- Artificer has nested AND container structure: `AND > AND > items`
- Outer AND container with `_id: "9ACYqIxQtaMv9Zw9"` has no label property
- It exists only as a wrapper around a single child AND container
- This is a data modeling artifact - the outer wrapper serves no purpose

**Data Structure Example**:
```javascript
[
  { type: "AND", _id: "topAND", group: "" },           // Outer wrapper (meaningless)
  { type: "AND", _id: "childAND", group: "topAND" },  // Actual container
  { type: "linked", _id: "item1", group: "childAND" }, // Real items
  { type: "linked", _id: "item2", group: "childAND" }
]
```

### 3. Weapon Entry Not Clickable/Interactive
**Screenshot Evidence**: "2× simple weapon" entry appears but isn't interactive

**Root Cause**:
- Without a label, the entry was treated as incomplete/invalid
- UI logic checks for label existence before enabling interactions
- Missing label prevented selection dialog from opening

## Solutions Implemented

### Solution 1: Label Generation (`generateEquipmentLabel()`)

Created a utility function that mimics DND5e's label generation logic:

```javascript
function generateEquipmentLabel(entry, allEquipment) {
  const type = entry.type;
  const key = entry.key;
  const count = entry.count || 1;
  
  // Lookup label from CONFIG.DND5E based on type
  let label = '';
  
  switch (type) {
    case 'weapon':
      label = CONFIG.DND5E.weaponTypes[key] || 
              CONFIG.DND5E.weaponProficiencies[key];
      break;
    case 'armor':
      label = CONFIG.DND5E.armorTypes[key] || 
              CONFIG.DND5E.armorProficiencies[key];
      break;
    // ... other types
  }
  
  // Format with count
  if (count > 1) {
    label = `${count}× ${label}`;  // "2× simple weapon"
  } else {
    label = `any ${label}`;         // "any simple weapon"
  }
  
  return label;
}
```

**Key Features**:
- Checks both `weaponTypes` and `weaponProficiencies` configs
- Handles object-style config entries (extracts `.label` property)
- Formats count using `×` character (Unicode multiplication sign)
- Follows DND5e's "any X" pattern for single items

### Solution 2: Container Flattening (`flattenRedundantContainers()`)

Removes meaningless single-child AND/OR wrappers:

```javascript
function flattenRedundantContainers(equipment) {
  equipment.forEach(entry => {
    if ((entry.type === 'AND' || entry.type === 'OR') && !entry.group) {
      const children = equipment.filter(item => item.group === entry._id);
      
      // If only one child and it's also a container
      if (children.length === 1 && (children[0].type === 'AND' || children[0].type === 'OR')) {
        // Remove parent wrapper
        // Promote child to top level
        // Update grandchildren's group references
      }
    }
  });
}
```

**Before Flattening**:
```
topAND (no label → "undefined")
  └─ childAND
       ├─ Light Crossbow
       └─ 20 Crossbow Bolts
```

**After Flattening**:
```
childAND
  ├─ Light Crossbow
  └─ 20 Crossbow Bolts
```

### Solution 3: Integration into Data Pipeline

Modified `cleanEquipmentStructure()` in `src/stores/startingEquipment.js`:

```javascript
function cleanEquipmentStructure(equipment) {
  // Step 1: Enrich with labels
  let enriched = enrichEquipmentWithLabels(equipment);
  
  // Step 2: Flatten redundant containers
  enriched = flattenRedundantContainers(enriched);
  
  return enriched;
}
```

This ensures all equipment data is properly processed before reaching UI components.

## Testing

Created comprehensive test suite in `src/tests/test-artificer-equipment-display.test.js`:

### Test Coverage:
1. ✅ Label generation for weapon types
2. ✅ Redundant AND container flattening
3. ✅ Complete Artificer equipment fix workflow
4. ✅ Label format matching DND5e expectations
5. ✅ Single-child OR container handling

### Test Results:
```
Test Files  71 passed (71)
Tests       264 passed (264)
Duration    2.40s
```

All existing tests continue to pass + 5 new tests added.

## Technical Details

### DND5e Config Lookup Priority:
1. `CONFIG.DND5E.weaponTypes[key]` - Composite types (sim, mar)
2. `CONFIG.DND5E.weaponProficiencies[key]` - Specific types (simpleM, martialR)
3. Handle object-style entries: `{ label: "...", ... }`
4. Fallback to raw key if not found

### Label Formatting Rules:
- `count > 1`: `"${count}× ${label}"` → `"2× simple weapon"`
- `count === 1` (category): `"any ${label}"` → `"any simple weapon"`
- `type === 'linked'`: Item name from UUID (unchanged)
- `type === 'currency'`: `"${count} ${abbr}"` → `"50 GP"`

### Flattening Rules:
- Only flatten top-level containers (`!entry.group`)
- Only flatten when single child is also a container
- Preserve all grandchildren relationships
- Maintain sort order

## Files Modified

1. **`src/stores/startingEquipment.js`**
   - Added `generateEquipmentLabel()` function
   - Added `enrichEquipmentWithLabels()` function  
   - Added `flattenRedundantContainers()` function
   - Updated `cleanEquipmentStructure()` to use new functions

2. **`src/tests/test-artificer-equipment-display.test.js`** (NEW)
   - Comprehensive test suite for equipment display fixes
   - 5 test cases covering all scenarios

## Impact

### Before Fix:
- ❌ "2× simple weapon" appeared as empty black box
- ❌ Nested AND containers showed "undefined" 
- ❌ Weapon type entries not interactive
- ❌ Confusing UI with meaningless container wrappers

### After Fix:
- ✅ All equipment entries have proper labels
- ✅ Redundant containers removed automatically
- ✅ Weapon type entries fully interactive
- ✅ Clean, understandable equipment structure
- ✅ Matches FoundryVTT's native display logic

## Future Considerations

1. **Linked Item Names**: Currently linked items (UUIDs) don't get enriched. Could add async UUID lookup for better labels.

2. **Localization**: Labels use `game.i18n.format()` - should work with all languages that DND5e system supports.

3. **Custom Item Types**: If homebrew adds custom equipment categories, they'll need CONFIG entries to generate labels.

4. **Performance**: Label generation happens once per character load. No performance concerns.

### Solution 4: Interaction Handler for Granular Types

**Problem**: Even with labels, weapon type entries weren't clickable. `handleSelection()` had handlers for:
- Choice groups (OR selections)
- Standalone groups with AND items
- But NOT standalone groups with direct granular items (weapon/armor/tool/focus)

**Solution**: Added handler in `handleSelection()` for standalone groups with granular items:

```javascript
// Handle standalone groups with direct granular items (weapon, armor, tool, focus)
const group = selections[groupId];
if (group?.type === 'standalone' && GRANULAR_TYPES.includes(item.type)) {
  window.GAS.log.d('[handleSelection] Standalone group with granular item clicked', {
    groupId,
    itemType: item.type,
    itemLabel: item.label,
    itemKey: item.key,
    itemCount: item.count,
    willCallSelectEquipment: true
  });
  
  // Select the granular item, which will trigger the equipment selector
  selectEquipment(groupId, item._id);
  return;
}
```

**Integration with EquipmentSelectorDetail**:

When `selectEquipment()` is called for a granular type:
1. Sets `group.inProgress = true`
2. Sets `group.selectedItem = weaponItem`
3. Initializes `group.granularSelections = { self: [], children: {} }`

EquipmentSelectorDetail filters for configurable selections:
```javascript
configurableSelections = groups.filter(group =>
  group.selectedItem &&
  group.inProgress &&
  CONFIGURABLE_TYPES.includes(group.selectedItem.type) // 'weapon' is included!
)
```

Then filters available weapons based on the `key`:
```javascript
if (group.selectedItem.key === 'sim') {
  // Show only simple weapons
  return ['simpleM', 'simpleR'].includes(item.system?.type?.value);
}
```

**Result**: Clicking weapon type opens equipment selector with filtered weapon list.

## Related Issues

This fix addresses all four problems mentioned in the user's feedback:
1. ✅ "2× simple weapons - which should be clickable but is not"
   - Fixed with label generation + interaction handler
2. ✅ "'Undefined' that should be appearing"  
   - Fixed with container flattening
3. ✅ "Extraneous container wrappers when they contain only one element"
   - Fixed with redundant container removal
4. ✅ Equipment selector not opening for weapon types
   - Fixed with standalone granular type handler

All four issues are now resolved through:
- Systematic data enrichment (labels)
- Structure cleanup (container flattening)
- Proper interaction handlers (granular type selection)
