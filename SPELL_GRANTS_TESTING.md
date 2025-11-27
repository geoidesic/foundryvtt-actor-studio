# Spell Grants Feature - Testing Guide

## Implementation Summary

The spell grants feature now uses a **hybrid multi-strategy detection approach** to handle D&D 5e's inconsistent implementation of spell-granting feats and fighting styles:

### Detection Strategies (in order of priority):

1. **Hardcoded Definitions** - Known spell-granting feats/fighting styles by `system.identifier`
2. **Advancement System** - D&D 5e ItemChoice advancements with spell restrictions  
3. **Description Parsing** - Pattern matching on item description text

### Currently Hardcoded Spell Grants:

- `druidic-warrior` - 2 Druid cantrips (Fighting Style)
- `blessed-warrior` - 2 Cleric cantrips (Fighting Style)
- `magic-initiate-cleric` - 2 Cleric cantrips + 1 Cleric 1st level spell (Origin Feat)
- `magic-initiate-druid` - 2 Druid cantrips + 1 Druid 1st level spell (Origin Feat)
- `magic-initiate-wizard` - 2 Wizard cantrips + 1 Wizard 1st level spell (Origin Feat)

### Description Parsing Patterns:

The system can detect these text patterns in item descriptions:
- "learn X [Class] cantrips" → Detects cantrip grants
- "learn X [Class] spell of Xth level" → Detects spell grants with level restrictions

## Testing Steps

### Test 1: Druidic Warrior Fighting Style

1. Open Actor Studio in FoundryVTT
2. Create a Ranger character (2024 rules)
3. During character creation, select **Druidic Warrior** as the fighting style
4. Continue through advancement steps
5. **Expected**: When reaching the Spells tab, you should see:
   - A "Spell Grants" section ABOVE the normal spell selection
   - The section should show: "Druidic Warrior - Select 2 Druid cantrips"
   - A spell grid showing only Druid cantrips (level 0)
   - Progress indicator showing 0/2 selected

### Test 2: Console Debugging

Open the browser console (F12) and look for these log messages:

```javascript
// When spell grants are checked:
[spellGrants] Checking actor items for spell grants: {actorName: 'Ranger', itemCount: X}

// When a spell grant is found:
[spellGrants] Found spell grants in item: {
  itemName: 'Fighting Style',
  itemType: 'feat',
  grantsCount: 1
}
```

### Test 3: Manual Detection Check

Run this in the browser console after selecting Druidic Warrior:

```javascript
// Find the Fighting Style item
const fightingStyle = game.actors.getName('Your Ranger Name').items.find(i => 
  i.name === 'Fighting Style' || i.system.identifier === 'druidic-warrior'
);

console.log('Fighting Style item:', fightingStyle);
console.log('System identifier:', fightingStyle?.system?.identifier);
console.log('Advancement:', fightingStyle?.system?.advancement);

// Test detection
const SpellGrantDetection = (await import('./src/helpers/SpellGrantDetection.js')).default;
const grants = SpellGrantDetection.detectSpellGrant(fightingStyle);
console.log('Detected grants:', grants);
```

## Known Issues & Limitations

### Issue: Fighting Style Wrapper Items

D&D 5e system creates a "Fighting Style" feat that **references** the actual fighting style via `@Embed` links in the description, rather than storing it directly. The actual `druidic-warrior` identifier may NOT be on the actor's item.

**Workaround Options:**
1. Parse the `@Embed` link and fetch the referenced compendium item
2. Check the description for "Druidic Warrior" text
3. Look for the embedded compendium UUID

### Issue: Actor Items vs Queue Items

The spell grants store checks two sources:
- `actorInGame.items` - Items already applied to the actor
- `dropItemRegistry` - Items queued but not yet applied

Fighting styles should appear in `actorInGame.items` after the advancement is applied.

## If It Doesn't Work

### Diagnostic Steps:

1. **Check console logs** - Are spell grants being detected at all?
   - If NO logs: Detection code isn't running
   - If logs but no grants found: Detection failing

2. **Inspect the Fighting Style item structure:**
   ```javascript
   const item = game.actors.getName('Ranger').items.find(i => 
     i.name.includes('Fighting Style')
   );
   console.log('Full item:', item.toObject());
   console.log('Identifier:', item.system.identifier);
   console.log('Description:', item.system.description.value);
   ```

3. **Check if identifier matches:**
   - Expected: `system.identifier === 'druidic-warrior'`
   - Actual: May be `'fighting-style'` or something else

4. **Check for @Embed links:**
   ```javascript
   const description = item.system.description.value;
   const embedMatch = description.match(/@Embed\[([^\]]+)\]/);
   console.log('Embed link:', embedMatch?.[1]);
   ```

### Fallback: Add @Embed Resolution

If the identifier is NOT `druidic-warrior`, we need to:
1. Extract `@Embed[Compendium.dnd-players-handbook.feats.Item.phbfstDruidicWar ...]` from description
2. Parse the UUID
3. Fetch the compendium item
4. Check ITS identifier and description

This is the next implementation step if hardcoded detection alone doesn't work.

## Test Results Template

```
Date: [Date]
FoundryVTT Version: [Version]
D&D 5e System Version: [Version]
Test Character: [Name]

Fighting Style Selected: Druidic Warrior

✅/❌ Spell Grants section appeared on Spells tab
✅/❌ Console showed detection logs
✅/❌ Correct spell list shown (Druid cantrips only)
✅/❌ Can select spells
✅/❌ Spell count enforced (max 2)

Console Output:
[Paste relevant console output here]

Item Structure:
[Paste item.toObject() output here]
```
