# Spell List Support for Custom Classes - Analysis & Solution

## Current State Analysis

### Problem Identification
**You are correct** - the current system does NOT properly support custom classes/subclasses when determining which spell lists they have access to. Here's why:

### How Spell Lists Currently Work

#### 1. **For Built-in D&D Classes (v4+)**
In D&D 5e v4+, spells have class information embedded in them:
- `doc.labels.classes` - Contains class names the spell is available to
- `doc.system.classes` - Alternative storage location
- `doc._lazy.classes` - Lazy-loaded class references

The system filters spells by matching `characterClassName` against these embedded spell class lists.

**Location**: `src/stores/spellSelection.js` lines 840-1100

#### 2. **For Subclasses with Prepared Spells (Eldritch Knight, Arcane Trickster)**
The system uses hardcoded mappings to determine which spell list a subclass uses:

```javascript
// src/helpers/LevelUpStateMachine.js lines 159-194
function determineSpellListClass(actor) {
  // Hardcoded mappings:
  if (subclassLower === 'eldritchknight' || subclassLower === 'arcanetrickster') {
    return 'Wizard';  // ← HARDCODED
  } else if (subclassLower === 'aberrantmind') {
    return 'Sorcerer';  // ← HARDCODED
  }
  
  // Fallback: Parse description text
  const wizardMatch = description.match(/wizard\s+spell\s+list/i);
  if (wizardMatch) {
    return 'Wizard';  // ← TEXT PARSING FALLBACK
  }
  // ... more regex patterns for other classes
}
```

### The Gap: Custom Classes/Subclasses

**Problem**: Custom classes/subclasses with spellcasting face two issues:

1. **Hardcoded List**: They won't match the hardcoded subclass checks (`eldritchknight`, `arcanetrickster`, `aberrantmind`)
2. **Text Parsing Fragility**: The fallback regex parsing of descriptions is:
   - Brittle (depends on exact text patterns)
   - English-only
   - Fails if description doesn't mention "spell list"
   - No way to specify multiple spell lists (e.g., a custom class with access to both Cleric AND Druid spells)

3. **No Multi-List Support**: Current system assumes ONE spell list per class. Custom classes might need access to multiple lists or custom combinations.

## Solution: Spell Lists Advancement (Following Subclass Plugin Pattern)

### Design Pattern Reference
The module already has a proven pattern for backporting/injecting advancements that don't exist in certain D&D versions:

**`src/plugins/subclass-level/index.js`** - Injects "Subclass" advancement into D&D 5e v3.x since it didn't have native subclass advancement support.

### Proposed Solution: "Spell Lists" Advancement

Create a new advancement type that allows GMs/module creators to specify which spell lists a class/subclass has access to.

#### Implementation Approach

**1. Create New Plugin: `src/plugins/spell-lists/index.js`**
Similar to `SubclassLevelPlugin`, but works across ALL D&D 5e versions (v3 and v4+)

```javascript
export default class SpellListsPlugin {
  static ID = 'spell-lists';
  
  static init() {
    // Works for all versions - custom advancement
    this.registerHooks();
  }
  
  static registerHooks() {
    // Hook into advancement selection rendering
    Hooks.on('renderAdvancementSelection', this._onRenderAdvancementSelection.bind(this));
    Hooks.on('renderItemSheet5e', this._onRenderItemSheet5e.bind(this));
  }
  
  // Add "Spell Lists" option to advancement selection dialog
  static async _onRenderAdvancementSelection(app, html, data) {
    const item = app.item;
    if (!item || (item.type !== 'class' && item.type !== 'subclass')) return;
    
    const spellListsOption = `
      <li class="item flexrow">
        <div class="item-name flexrow">
          <div class="item-image" style="background-image: url('modules/${MODULE_ID}/assets/spell-lists-icon.svg')"></div>
          <h3>Spell Lists</h3>
        </div>
        <div class="item-controls flexrow">
          <input name="type" type="radio" value="SpellLists">
        </div>
        <div class="item-hint notes">
          Specify which spell lists this class/subclass has access to.
        </div>
      </li>
    `;
    
    const typeList = html.find('.items-list');
    typeList.append(spellListsOption);
    
    // Handle selection
    const button = html.find('[data-button="submit"]');
    const originalClickHandler = $._data(button[0], 'events')?.click?.[0]?.handler;
    
    button.off('click').on('click', async function(event) {
      const selectedType = html.find('input[name="type"]:checked').val();
      if (selectedType === 'SpellLists') {
        await SpellListsPlugin._showSpellListsDialog(item);
        app.close();
      } else if (originalClickHandler) {
        originalClickHandler.call(this, event);
      }
    });
  }
  
  static async _showSpellListsDialog(item) {
    const spellListClasses = [
      'Artificer', 'Bard', 'Cleric', 'Druid', 
      'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'
    ];
    
    const currentLists = this.getSpellLists(item) || [];
    
    const content = `
      <form>
        <div class="form-group">
          <label>Select Spell Lists (check all that apply)</label>
          ${spellListClasses.map(className => `
            <div>
              <input type="checkbox" 
                     name="spell-list" 
                     value="${className}" 
                     id="spell-list-${className}"
                     ${currentLists.includes(className) ? 'checked' : ''}>
              <label for="spell-list-${className}">${className}</label>
            </div>
          `).join('')}
        </div>
      </form>
    `;
    
    return new Dialog({
      title: `Configure Spell Lists for ${item.name}`,
      content,
      buttons: {
        submit: {
          label: "Save",
          callback: async (html) => {
            const selectedLists = [];
            html.find('input[name="spell-list"]:checked').each((i, el) => {
              selectedLists.push($(el).val());
            });
            await this.setSpellLists(item, selectedLists);
          }
        },
        cancel: { label: "Cancel" }
      },
      default: "submit"
    }).render(true);
  }
  
  // Store spell lists in item flags
  static getSpellLists(item) {
    return item.getFlag(MODULE_ID, 'spellLists');
  }
  
  static async setSpellLists(item, lists) {
    await item.setFlag(MODULE_ID, 'spellLists', lists);
  }
}
```

**2. Update `determineSpellListClass` function**

Modify `src/helpers/LevelUpStateMachine.js` to check for the new spell lists flag **FIRST**, then fall back to existing logic:

```javascript
function determineSpellListClass(actor) {
  // ========================================================================
  // NEW: Method 0: Check for CUSTOM spell lists advancement flag
  // This ONLY applies to custom classes/subclasses that have been configured
  // Standard D&D classes will SKIP this and use existing hardcoded logic below
  // ========================================================================
  const droppedItems = actor.getFlag(MODULE_ID, 'droppedItems');
  
  // Check subclass first (subclass spell lists override class spell lists)
  if (droppedItems?.subclass) {
    const subclassItems = Array.isArray(droppedItems.subclass) 
      ? droppedItems.subclass 
      : [droppedItems.subclass];
    
    for (const item of subclassItems) {
      const subclassUuid = item.uuid;
      if (subclassUuid) {
        const subclassItem = fromUuidSync(subclassUuid);
        if (subclassItem) {
          const customSpellLists = subclassItem.getFlag(MODULE_ID, 'spellLists');
          if (customSpellLists && customSpellLists.length > 0) {
            window.GAS.log.d('[LEVELUP] Found custom spell lists flag on subclass:', customSpellLists);
            return customSpellLists; // Return array of spell lists for CUSTOM subclasses
          }
        }
      }
    }
  }
  
  // Check class
  if (droppedItems?.class) {
    const classItems = Array.isArray(droppedItems.class) 
      ? droppedItems.class 
      : [droppedItems.class];
    
    for (const item of classItems) {
      const classUuid = item.uuid;
      if (classUuid) {
        const classItem = fromUuidSync(classUuid);
        if (classItem) {
          const customSpellLists = classItem.getFlag(MODULE_ID, 'spellLists');
          if (customSpellLists && customSpellLists.length > 0) {
            window.GAS.log.d('[LEVELUP] Found custom spell lists flag on class:', customSpellLists);
            return customSpellLists; // Return array of spell lists for CUSTOM classes
          }
        }
      }
    }
  }
  
  // ========================================================================
  // EXISTING LOGIC - UNCHANGED - Works for all standard D&D classes
  // Method 1: Check for subclass spellcasting via module flags (dropped items)
  // Method 2: Check for subclass spellcasting via actor items
  // Method 3: Check for subclass in the class data itself
  // Method 4: Fallback to base class spellcasting
  // ========================================================================
  // ...existing code continues unchanged...
}
```

**3. Update Spell Filtering Logic**

Modify `src/stores/spellSelection.js` to support multiple spell lists:

```javascript
// Around line 840-900
let allSpells = [];

for (const pack of packs) {
  if (characterClassName) {
    if (window.GAS?.dnd5eVersion >= 4) {
      const allDocs = await pack.getDocuments();
      const filteredSpells = [];

      for (const doc of allDocs) {
        if (doc.type === "spell") {
          let availableToClass = false;
          
          // Support for multiple spell lists
          const spellLists = Array.isArray(characterClassName) 
            ? characterClassName 
            : [characterClassName];
          
          // Check if spell is available to ANY of the character's spell lists
          for (const className of spellLists) {
            if (doc.labels?.classes) {
              const spellClasses = doc.labels.classes;
              if (typeof spellClasses === 'string') {
                availableToClass = spellClasses.includes(className) ||
                  spellClasses.toLowerCase().includes(className.toLowerCase());
              } else if (Array.isArray(spellClasses)) {
                availableToClass = spellClasses.some(s => 
                  s === className || 
                  s.toLowerCase() === className.toLowerCase()
                );
              }
              
              if (availableToClass) break; // Found a match, stop checking
            }
            // ... check other locations (system.classes, _lazy.classes)
          }
          
          if (availableToClass) {
            filteredSpells.push(/* spell object */);
          }
        }
      }
      
      allSpells.push(...filteredSpells);
    }
  }
}
```

### Benefits of This Approach

1. **100% Backward Compatible**: 
   - ✅ Standard D&D classes (Wizard, Cleric, etc.) work **exactly as before**
   - ✅ Hardcoded subclasses (Eldritch Knight, Arcane Trickster, Aberrant Mind) **unchanged**
   - ✅ Text parsing fallback for descriptions **still works**
   - ✅ **Zero configuration required** for existing/standard classes
   - ✅ Custom flag only checked **if present** - standard classes have no flag, so they skip to existing logic

2. **Consistency**: Uses the same pattern as the existing `SubclassLevelPlugin`

3. **Version Agnostic**: Works across all D&D 5e versions (v3.x, v4+)

4. **Multi-List Support**: Allows custom classes to access multiple spell lists (e.g., Cleric + Druid)

5. **User-Friendly**: GMs configure through FoundryVTT UI, not code (but **only for custom classes**)

6. **Opt-In Only**: The spell lists advancement is **only added to classes/subclasses where the GM explicitly configures it**

7. **Extensible**: Can be expanded to support custom spell lists beyond the core 9 classes

### Implementation Steps

1. Create `src/plugins/spell-lists/index.js` 
2. Add icon asset at `assets/spell-lists-icon.svg`
3. Update `src/helpers/LevelUpStateMachine.js` - add custom flag check to `determineSpellListClass()`
4. Update `src/stores/spellSelection.js` - support array of spell lists in filtering
5. Initialize plugin in main module init code
6. Add tests in `src/tests/test-spell-lists-plugin.test.js`
7. Update documentation

### Testing Considerations

**Test Cases Needed**:
1. Custom class with single spell list (e.g., custom Wizard-like class)
2. Custom class with multiple spell lists (e.g., hybrid Cleric/Druid)
3. Custom subclass with different spell list than base class (e.g., custom Fighter subclass with Sorcerer spells)
4. Interaction with existing hardcoded subclasses (shouldn't break)
5. D&D v3.x compatibility
6. D&D v4+ compatibility with 2014 and 2024 rules

## Conclusion

**Confirmed**: Current system does NOT support custom classes/subclasses for spell list determination.

**Solution**: Implement a "Spell Lists" advancement plugin following the proven `SubclassLevelPlugin` pattern. This provides a clean, user-friendly way for GMs to configure which spell lists custom classes have access to, with support for multiple lists and full version compatibility.
