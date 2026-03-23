# Quench automation harness for Actor Studio

This module now supports a dedicated Quench automation config that mirrors debug-driven auto-selection and auto-advancement.

## Quick start

Set the harness config before opening Actor Studio:

```js
window.GAS = window.GAS || {};
window.GAS.quenchAutomation = {
  enabled: true,
  selections: {
    race: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
    background: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
    characterClass: 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000',
    characterSubClass: null,

    // Level-up tab helpers (optional)
    // Existing class key (e.g. "cleric") OR multiclass UUID.
    levelUpClass: 'cleric',
    levelUpSubClass: null
  },
  advancements: {
    enabled: true
  }
};
```

Clear it after the test:

```js
delete window.GAS.quenchAutomation;
```

## What it automates

- Character-creation tabs:
  - `race`, `background`, `characterClass`, `characterSubClass` selections on mount.
- Level-up tab:
  - Auto-selects class via `levelUpClass` (class key or multiclass UUID).
  - Auto-selects subclass via `levelUpSubClass` when subclass selection is required.
- Advancement dialogs:
  - Auto-clicks advancement controls (`next`, then `complete`, then text-based fallback) while enabled.

## Advancement override API

Use `advancements.resolveAction(context)` to override behavior per advancement step.

```js
window.GAS.quenchAutomation = {
  enabled: true,
  selections: { /* ... */ },
  advancements: {
    enabled: true,
    resolveAction: (context) => {
      // context = { index, dialog, advancementId, advancementType, title }

      // Pause a specific step for focused assertions
      if (context.advancementType === 'AbilityScoreImprovement') {
        return 'none';
      }

      // Force a specific button path
      if (context.advancementType === 'ItemChoice') {
        return 'next';
      }

      // Target a custom control first
      if (context.advancementId === 'my-custom-step') {
        return { selector: '[data-action="complete"]' };
      }

      // Return null/undefined to use default automation
      return null;
    },

    // Optional hook to perform custom setup before default next/complete clicks.
    beforeDefaultAdvance: (context) => {
      // Return true if this hook consumed the step and default click should be skipped.
      return false;
    }
  }
};
```

## Notes for Force Take Average / Custom Feat permutations

- Keep per-feature behavior controlled by module settings in your test setup:
  - `forceTakeAverageHitPoints`
  - `enableCustomFeatSelector`
- Use `resolveAction` to pause or force specific advancement steps when validating these permutations.

## Example in this repository

See Quench test batch registration and test implementation in:

- `src/index.js`
- `src/hooks/tests/character-permutation-tests.js`

The test case `"should auto-run cleric creation, show subclass selector at expected level-up level, and finalize spells"` demonstrates:

1. Enabling `window.GAS.quenchAutomation`.
2. Auto-selecting Cleric creation inputs.
3. Letting advancements progress automatically.
4. Finalizing spells and asserting cleric spell items are embedded.
5. Opening level-up flow and verifying subclass dropdown visibility at computed subclass level.
