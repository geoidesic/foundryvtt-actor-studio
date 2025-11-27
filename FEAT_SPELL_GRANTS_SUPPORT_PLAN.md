# Feat and Fighting Style Spell Grant Support - Implementation Plan

## Problem Statement

Currently, Actor Studio's Spells tab does not support spell/cantrip choices granted by feats and fighting styles. Examples include:

- **Magic Initiate** feat - Grants 2 cantrips + 1 1st-level spell from a chosen class
- **Druidic Warrior** fighting style (Rangers) - Grants 2 druid cantrips
- **Blessed Warrior** fighting style (Paladins) - Grants 2 cleric cantrips
- **Eldritch Adept** feat - Grants warlock invocations (some provide spells)
- **Ritual Caster** feat - Grants ritual spell access
- **Fey Touched / Shadow Touched** feats - Grant specific spells
- **Elemental Adept** feat - Provides spell-related bonuses (not actual spell grants)
- **Aberrant Dragonmark** feat - Grants cantrip + 1st-level spell

These spell choices are embedded within D&D 5e advancement structures but currently bypass Actor Studio's spell selection workflow entirely.

## Current Architecture Analysis

### How Spells Are Currently Handled

**Actor Studio Spell Tab** (`src/components/organisms/dnd5e/Tabs/Spells.svelte`):
- Only tracks spells from **class/subclass spellcasting progression**
- Uses `spellSelection.js` store to calculate limits based on:
  - Class spell list (Wizard, Cleric, etc.)
  - Subclass spell limits from advancement data (`parseSpellLimitsFromAdvancement`)
  - `spellsKnown.json` configuration for cantrips/spells per level
- Progress tracking: `spellProgress` derived store

**Advancement Capture System** (`src/hooks/captureAdvancement.js`):
- Intercepts D&D 5e advancement dialogs
- **Currently captures**:
  - Feats via `isFeatAdvancementFlow()` → uses `FeatSelector.svelte`
  - Traits, Ability Score Improvements, Hit Points
  - Fighting Styles (as generic `ItemChoice`)
- **Does NOT capture spell choices** embedded in feats/fighting styles

### D&D 5e Advancement Structure for Spell Grants

Feats and fighting styles that grant spells use **`ItemChoice` advancement type**:

```javascript
// Example: Magic Initiate feat structure
{
  type: "ItemChoice",
  configuration: {
    type: "spell",
    restriction: {
      type: "spell",
      level: { min: 0, max: 1 },    // Cantrips (0) or 1st-level
      spellList: "wizard"            // Or cleric, druid, etc.
    },
    choices: [
      { count: 2 },  // 2 cantrips
      { count: 1 }   // 1 first-level spell
    ],
    pool: []  // Empty - allows any from compendium matching restriction
  },
  title: "Magic Initiate Spells",
  hint: "Choose 2 cantrips and 1 first-level spell"
}

// Example: Druidic Warrior fighting style
{
  type: "ItemChoice",
  configuration: {
    type: "spell",
    restriction: {
      type: "spell",
      level: { min: 0, max: 0 },    // Cantrips only
      spellList: "druid"
    },
    choices: [{ count: 2 }],
    pool: []
  },
  title: "Druidic Warrior Cantrips"
}

// Example: Fey Touched feat (grants specific spells)
{
  type: "ItemGrant",
  configuration: {
    items: [
      { uuid: "Compendium.dnd5e.spells.Item.misty-step" }
    ]
  },
  // Plus ItemChoice for 1 divination/enchantment spell
}
```

**Key Insight**: These use `ItemChoice` with `restriction.type: "spell"` - different from:
- `restriction.type: "feat"` → Feat selection
- No restriction or class feature pool → Fighting Style selection

## Gap Analysis

### What's Missing

1. **Detection**: No logic to identify spell-granting `ItemChoice` advancements
2. **Capture**: Spell choices in feats/fighting styles aren't intercepted
3. **UI Integration**: No way to display these choices in Spells tab
4. **Limit Tracking**: Spell limits don't account for feat/fighting style grants
5. **Progress Calculation**: `spellProgress` doesn't include feat-granted spell requirements
6. **Filtering**: Feat-granted spells have different filters (spell list, level restrictions)

### Current Behavior

When a player:
1. Selects **Magic Initiate** feat during ASI advancement
2. Clicks through D&D 5e's advancement dialog
3. Actor Studio **captures the feat selection** but...
4. **Native Foundry dialog appears** for spell choices (NOT captured)
5. Choices are made outside Actor Studio UI
6. Spells tab remains empty of these selections

## Proposed Solution

### High-Level Strategy

**Two-Phase Approach**:
1. **Phase 1 (MVP)**: Display feat/fighting style spell grants in Spells tab as **read-only informational items** with link to native advancement
2. **Phase 2 (Full Integration)**: Capture and manage these spell choices within Actor Studio's workflow

### Phase 1: Read-Only Display & Detection (Recommended Starting Point)

#### Goals
- Detect when character has feats/fighting styles that grant spells
- Display these spell choices in Spells tab
- Provide clear indication these are managed via native advancement
- No workflow disruption

#### Implementation Steps

**1. Create Spell Grant Detection Module** (`src/helpers/SpellGrantDetection.js`)

```javascript
/**
 * Detects spell grants from feats, fighting styles, and other non-class sources
 */
export class SpellGrantDetection {
  /**
   * Check if an advancement is a spell-granting ItemChoice
   */
  static isSpellGrantAdvancement(advancement) {
    if (advancement.type !== 'ItemChoice') return false;
    
    const restriction = advancement.configuration?.restriction;
    return restriction?.type === 'spell';
  }
  
  /**
   * Check if an advancement is a spell-granting ItemGrant
   */
  static isSpellItemGrant(advancement) {
    if (advancement.type !== 'ItemGrant') return false;
    
    const items = advancement.configuration?.items || [];
    // Check if granted items are spells
    return items.some(item => {
      // Would need to resolve UUID to check type
      return item.uuid?.includes('.spells.');
    });
  }
  
  /**
   * Parse spell grant configuration to extract requirements
   */
  static parseSpellGrant(advancement, sourceItem) {
    const config = advancement.configuration;
    const restriction = config?.restriction || {};
    
    return {
      type: 'spell-grant',
      source: sourceItem.name,           // "Magic Initiate", "Druidic Warrior", etc.
      sourceType: sourceItem.type,       // "feat", "classFeature", etc.
      sourceUuid: sourceItem.uuid,
      advancementId: advancement.id,
      
      spellList: restriction.spellList,  // "wizard", "druid", etc.
      levelMin: restriction.level?.min ?? 0,
      levelMax: restriction.level?.max ?? 9,
      
      choices: config.choices || [],     // [{ count: 2 }, { count: 1 }]
      pool: config.pool || [],           // Specific spells if restricted
      
      title: advancement.title,
      hint: advancement.hint
    };
  }
  
  /**
   * Get all spell grants for an actor
   */
  static getSpellGrantsForActor(actor) {
    const grants = [];
    
    for (const item of actor.items) {
      // Check feats
      if (item.type === 'feat') {
        const advancements = item.system?.advancement || [];
        for (const advancement of Object.values(advancements)) {
          if (this.isSpellGrantAdvancement(advancement) || this.isSpellItemGrant(advancement)) {
            grants.push(this.parseSpellGrant(advancement, item));
          }
        }
      }
      
      // Check class features (fighting styles, etc.)
      if (item.type === 'feat' && item.system?.type?.value === 'class') {
        // Similar logic
      }
    }
    
    return grants;
  }
  
  /**
   * Get spells selected for a specific spell grant
   */
  static async getSelectedSpellsForGrant(actor, grant) {
    // D&D 5e stores advancement selections in actor flags
    const advancementData = actor.getFlag('dnd5e', `advancement.${grant.advancementId}`);
    
    if (!advancementData?.selected) return [];
    
    // Resolve UUIDs to actual spell items
    const spells = [];
    for (const uuid of advancementData.selected) {
      const spell = await fromUuid(uuid);
      if (spell) spells.push(spell);
    }
    
    return spells;
  }
}
```

**2. Update Spell Selection Store** (`src/stores/spellSelection.js`)

Add derived store for feat/fighting style spell grants:

```javascript
import { SpellGrantDetection } from '~/src/helpers/SpellGrantDetection';

/**
 * Derived store: Spell grants from feats/fighting styles
 */
export const spellGrants = derived(
  [currentCharacter],
  ([$currentCharacter]) => {
    if (!$currentCharacter) return [];
    
    const grants = SpellGrantDetection.getSpellGrantsForActor($currentCharacter);
    
    // Fetch selected spells for each grant
    return Promise.all(grants.map(async (grant) => ({
      ...grant,
      selectedSpells: await SpellGrantDetection.getSelectedSpellsForGrant($currentCharacter, grant)
    })));
  }
);

/**
 * Update spellProgress to account for spell grants (optional for Phase 1)
 */
// Could add informational display but not block progress
```

**3. Update Spells Tab UI** (`src/components/organisms/dnd5e/Tabs/Spells.svelte`)

Add a new section before or after main spell list:

```pug
//- New section for feat/fighting style spell grants
+if("$spellGrants && $spellGrants.length > 0")
  .spell-grants-section.mt-md
    h3.section-header Spells from Feats & Features
    p.info-text.mt-xs 
      | These spells are granted by feats or class features. 
      | To change selections, edit the source item on your character sheet.
    
    +each("$spellGrants as grant")
      .spell-grant-group.mt-sm
        .grant-header.flexrow
          .flex1
            h4.gold {grant.source}
            +if("grant.title")
              span.hint.ml-xs ({grant.title})
          .flex0
            button.gold-button.sm(
              type="button"
              on:click="{() => openSourceItem(grant)}"
            ) 
              i.fas.fa-external-link-alt
              span  Edit
        
        +if("grant.selectedSpells.length > 0")
          ul.spell-grant-list
            +each("grant.selectedSpells as spell")
              li.spell-grant-item.flexrow
                .flex0.spell-icon
                  img.icon(src="{spell.img}" alt="{spell.name}")
                .flex1
                  span.spell-name {spell.name}
                  +if("spell.system?.level === 0")
                    span.spell-level.ml-xs (Cantrip)
                  +else()
                    span.spell-level.ml-xs (Level {spell.system?.level})
        +else()
          p.no-spells-text.ml-md 
            em No spells selected yet. Click "Edit" to choose spells.
```

**4. Helper Function to Open Source Item**

```javascript
async function openSourceItem(grant) {
  const item = await fromUuid(grant.sourceUuid);
  if (item?.sheet) {
    item.sheet.render(true);
    ui.notifications.info(`Opening ${grant.source} to edit spell selections.`);
  }
}
```

#### Phase 1 Benefits
- ✅ **Low Risk**: No workflow changes
- ✅ **Immediate Value**: Players see ALL spells in one place
- ✅ **Clear UX**: Explicitly tells users how to manage these spells
- ✅ **Fast Implementation**: ~1-2 days development
- ✅ **No Breaking Changes**: Existing spell selection untouched

#### Phase 1 Limitations
- ❌ Spell grants not managed in Actor Studio workflow
- ❌ Can't select these spells during character creation
- ❌ Must exit to native sheet to change selections

---

### Phase 2: Full Integration (Future Enhancement)

#### Goals
- Capture spell-granting advancements during character creation/level-up
- Integrate spell choices into Actor Studio's Spells tab workflow
- Unified spell selection experience

#### Implementation Steps

**1. Update Advancement Capture System** (`src/hooks/captureAdvancement.js`)

Add detection for spell-granting advancements:

```javascript
import { SpellGrantDetection } from '~/src/helpers/SpellGrantDetection';

const isSpellGrantAdvancement = (flow) => {
  if (!flow) return false;
  const advancement = flow.advancement ?? {};
  return SpellGrantDetection.isSpellGrantAdvancement(advancement);
};

// In captureAdvancement hook
if (isSpellGrantAdvancement(flow)) {
  // Queue spell grant for Spells tab instead of showing native dialog
  queueSpellGrantForTab(flow);
  return; // Prevent native dialog
}
```

**2. Create Spell Grant Queue** (`src/stores/spellGrants.js`)

Similar to `dropItemRegistry` for advancements:

```javascript
export const spellGrantQueue = writable([]);

export function queueSpellGrant(grantData) {
  spellGrantQueue.update(queue => [...queue, grantData]);
}

export function dequeueSpellGrant(grantId) {
  spellGrantQueue.update(queue => queue.filter(g => g.id !== grantId));
}
```

**3. Extend Spells Tab with Dynamic Spell Grant Sections**

```pug
//- Queued spell grants during creation/level-up
+if("$spellGrantQueue.length > 0")
  +each("$spellGrantQueue as grant")
    .spell-grant-selector.mt-md
      h3 {grant.source} - Spell Selection
      p.hint {grant.hint}
      
      //- Reuse existing spell selection UI but with grant-specific filters
      SpellGrantSelector(
        grant="{grant}"
        on:complete="{handleGrantComplete}"
      )
```

**4. Create Spell Grant Selector Component** (`src/components/molecules/dnd5e/SpellGrantSelector.svelte`)

Reuse logic from main Spells tab but apply grant-specific filters:

```javascript
// Filter spells by grant restrictions
$: filteredSpells = $availableSpells.filter(spell => {
  const level = spell.system?.level ?? 0;
  
  // Level restriction
  if (level < grant.levelMin || level > grant.levelMax) return false;
  
  // Spell list restriction
  if (grant.spellList) {
    const spellLists = spell.system?.sourceClass || [];
    if (!spellLists.includes(grant.spellList)) return false;
  }
  
  // Pool restriction (specific spells only)
  if (grant.pool.length > 0) {
    return grant.pool.some(p => p.uuid === spell.uuid);
  }
  
  return true;
});
```

**5. Update Spell Limits & Progress**

```javascript
// In spellSelection.js
export const totalSpellLimits = derived(
  [spellLimits, spellGrantQueue],
  ([$spellLimits, $spellGrantQueue]) => {
    let totalCantrips = $spellLimits.cantrips;
    let totalSpells = $spellLimits.spells;
    
    // Add grant requirements
    for (const grant of $spellGrantQueue) {
      for (const choice of grant.choices) {
        if (grant.levelMin === 0 && grant.levelMax === 0) {
          totalCantrips += choice.count;
        } else {
          totalSpells += choice.count;
        }
      }
    }
    
    return { cantrips: totalCantrips, spells: totalSpells };
  }
);
```

**6. Update Workflow State Machine**

```javascript
// In WorkflowStateMachine.js
.state('selecting_spells')
  .do(async (context) => {
    // Initialize class spells
    await initializeSpellSelection();
    
    // Initialize spell grants
    const grants = get(spellGrantQueue);
    if (grants.length > 0) {
      // Mark grants as requiring selection
      context.hasSpellGrants = true;
    }
  })
  .on('SPELLS_COMPLETE').transitionTo('completed')
    .withCondition((context) => {
      const classSpellsComplete = get(spellProgress).isComplete;
      const grantsComplete = context.hasSpellGrants 
        ? areAllSpellGrantsComplete() 
        : true;
      return classSpellsComplete && grantsComplete;
    })
```

#### Phase 2 Benefits
- ✅ **Unified UX**: All spell selection in one place
- ✅ **Workflow Integration**: Spell grants part of character creation
- ✅ **Better Validation**: Can enforce grant requirements
- ✅ **Progress Tracking**: Includes grants in completion calculation

#### Phase 2 Challenges
- ⚠️ **Complex Filtering**: Different restrictions per grant
- ⚠️ **State Management**: Multiple spell grant sources
- ⚠️ **Backward Compatibility**: Must handle existing characters
- ⚠️ **Testing Complexity**: Many feat/fighting style combinations

---

## Implementation Recommendations

### Recommended Approach: **Phase 1 First, Then Evaluate Phase 2**

**Why?**
1. **Quick Value**: Players get visibility into all spells immediately
2. **Risk Mitigation**: No workflow disruption
3. **User Feedback**: Can gather feedback on whether full integration is needed
4. **Time Efficiency**: Phase 1 = ~2 days vs Phase 2 = ~2 weeks

**When to Move to Phase 2?**
- User feedback indicates native advancement is too disruptive
- Multiple users request integrated spell grant selection
- After completing higher-priority features

### Testing Strategy

**Phase 1 Testing**:
- [ ] Test Magic Initiate feat detection
- [ ] Test Druidic Warrior fighting style detection
- [ ] Test Fey Touched feat (ItemGrant + ItemChoice combo)
- [ ] Test display in Spells tab
- [ ] Test "Edit" button opens correct item
- [ ] Test with characters that have no spell grants
- [ ] Test with multiple spell grants on same character

**Phase 2 Testing** (if implemented):
- [ ] All Phase 1 tests
- [ ] Test spell grant capture during character creation
- [ ] Test spell grant capture during level-up
- [ ] Test filtering by spell list (wizard, druid, etc.)
- [ ] Test filtering by spell level (cantrips only, etc.)
- [ ] Test progress calculation with grants
- [ ] Test workflow completion with incomplete grants
- [ ] Test multiple grants in same workflow

### Edge Cases to Consider

1. **Feat/Feature Replacement**: What happens when a feat is removed?
2. **Multiclass Spell Lists**: Magic Initiate with multiclass caster
3. **Spell Level Increases**: Warlock's Pact Magic (spell level changes)
4. **Ritual Caster**: Grants ritual-only spells (different from normal spell selection)
5. **Eldritch Invocations**: Some grant "at will" spells
6. **Race/Background Spells**: Some races/backgrounds grant spells (e.g., Drow, Tiefling)

### Related Files to Review

**Current Spell System**:
- `src/stores/spellSelection.js` - Main spell store
- `src/components/organisms/dnd5e/Tabs/Spells.svelte` - Spell tab UI
- `src/helpers/Utility.js` - `determineSpellListClass()` function

**Advancement System**:
- `src/hooks/captureAdvancement.js` - Advancement capture hooks
- `src/stores/advancements.js` - Advancement queue
- `src/components/molecules/dnd5e/Advancements/ItemChoice.svelte` - ItemChoice display
- `src/components/molecules/dnd5e/Advancements/ItemGrant.svelte` - ItemGrant display

**Feat System**:
- `src/components/molecules/dnd5e/Feats/FeatSelector.svelte` - Feat selection UI
- `FEAT_SELECTOR_FALSE_POSITIVE_FIX.md` - Feat detection logic

---

## API Changes & Breaking Changes

### Phase 1
- **New Exports**: `SpellGrantDetection` helper class
- **New Store**: `spellGrants` derived store
- **No Breaking Changes**: All additions, no modifications to existing exports

### Phase 2
- **Modified Store**: `spellLimits` calculation includes grants
- **Modified Component**: `Spells.svelte` accepts spell grants
- **New Store**: `spellGrantQueue` writable store
- **Modified Hook**: `captureAdvancement` intercepts spell grants
- **Breaking Change Risk**: ⚠️ Spell progress calculation changes (may affect completion logic)

---

## Success Metrics

**Phase 1**:
- [ ] All feat/fighting style spell grants detected correctly
- [ ] Spell grants display in Spells tab
- [ ] "Edit" button opens source item successfully
- [ ] No performance degradation on actors with many items
- [ ] Zero regression in existing spell selection tests

**Phase 2**:
- [ ] Spell grants captured during advancement flow
- [ ] Spell grant selection integrated in Spells tab
- [ ] Progress calculation includes spell grants
- [ ] Workflow completes only when all grants satisfied
- [ ] All existing spell tests pass
- [ ] New spell grant tests pass (100% coverage)

---

## Conclusion

This plan provides a **two-phase approach** to supporting feat and fighting style spell grants:

1. **Phase 1 (MVP)**: Quick win - display spell grants with link to native advancement (~2 days)
2. **Phase 2 (Full)**: Complete integration into Actor Studio workflow (~2 weeks)

**Recommendation**: Start with Phase 1, gather user feedback, then decide on Phase 2 based on demand and priority.

The existing architecture supports this incremental approach well, with clear separation between spell selection logic and UI components.
