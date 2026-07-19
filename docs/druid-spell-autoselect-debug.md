# Druid Spell Auto-Selection Debug — Findings & Continuation

**Date:** 2026-07-19
**Status:** Investigation complete, NO production code changes made yet. Tests needed (TDD) to drive the fix.

## TL;DR

The commit `6e3a652dc721c5f89aa468c0f56473ade8313ebe` ("fixed all cleric-type spellcasters") applied a **generic, class-agnostic** fix in `src/components/organisms/dnd5e/Tabs/Spells.svelte`. It is keyed on `hasAllSpellsAccess`, not on a specific class. Druid is already correctly flagged as a full caster with `hasAllSpells: true` in all the data and logic paths.

There are **two distinct bugs** to fix:

1. **Message bug (both Cleric AND Druid):** The "all spells notice" message renders `0 spells are auto-selected` / `Spells 0/0` even though the left-hand "Expected Spell Selections" panel correctly shows `15/15`. The message uses the wrong variable (`displaySpellLimit` = `getAutoSelectedSpells().length` = 0 at render time) instead of the actual selected count (`effectiveSelectedSpellCount` = 15).

2. **Druid level-offset bug (deeper):** During level-up, spells are reported/populated at the wrong level — e.g. leveling to 3 reports that all level-2 spells were "already provided at the previous level," so it shows `0/0` and skips auto-selection. The same offset pattern repeats at later levels. This is a real product defect, not a test artifact.

## Confirmed Facts

- `src/stores/spellsKnown.json` already has Druid as `"All"` for **both** `"2014"` and `"2024"` rules versions, at **all** levels 1–20. Data is correct.
- Druid is present in **every** `fullCasters` list across the codebase:
  - `Spells.svelte` `getMaxSpellLevelForClass()` → `['bard','cleric','druid','sorcerer','wizard']`
  - `spellSelection.js` `getMaxSpellLevelByClassName` → `['Bard','Cleric','Druid','Sorcerer','Wizard']`
  - `LevelUpStateMachine.js` `_getMaxSpellLevelForProgression` → `['bard','cleric','druid','sorcerer','wizard']`
- Baseline test suite: **776 tests pass, 94 test files** (`nvm use 24; bun run test`).
- The "only 2 spells at level 1" observation was a misread — those were Circle of the Moon **subclass** spells added at a later level, not the full-caster auto-grant.

## Root-Cause Analysis

### Bug 1 — Wrong variable in the message

In `src/components/organisms/dnd5e/Tabs/Spells.svelte`:

```js
// lines ~203-209
$: autoPopulateEligibleSpellCount = hasAllSpellsAccess ? getAutoSelectedSpells().length : $spellLimits.spells;
$: displaySpellLimit = hasAllSpellsAccess ? autoPopulateEligibleSpellCount : $spellLimits.spells;
$: isLevelUpWithNoSpellUpdates = $isLevelUp && hasAllSpellsAccess && autoPopulateEligibleSpellCount === 0 && $spellLimits.cantrips === 0;
$: shouldShowAllSpellsNotice = hasAllSpellsAccess && !isLevelUpWithNoSpellUpdates;
```

```js
// lines ~627-630
$: displayedSelectedSpellCount = selectedSpellsList.filter((entry) => (entry?.spell?.system?.level || 0) > 0).length
$: effectiveSelectedSpellCount = hasAllSpellsAccess ? displayedSelectedSpellCount : $currentSpellCounts.spells
$: uiSpellLimit = hasAllSpellsAccess ? Math.max(displaySpellLimit, effectiveSelectedSpellCount) : displaySpellLimit
```

- `getAutoSelectedSpells()` returns `[]` when `!hasAllSpellsAccess`, and otherwise filters `$availableSpells` by spell level. At the time the notice renders, `$availableSpells` is often empty / the level window yields 0, so `displaySpellLimit` = 0.
- The left panel receives `currentSpells="{effectiveSelectedSpellCount}"` and `spellLimit="{uiSpellLimit}"`, which is why it correctly shows `15/15`.
- **Fix direction:** the all-spells-notice message should use `effectiveSelectedSpellCount` (or `uiSpellLimit`) instead of `displaySpellLimit`. Per user: "we see 15/15 spells selected in Expected Spell Selections area for cleric – so we should be able to use that first number to populate the message."

### Bug 2 — Druid level-up offset

The level-up flow computes spell levels from `newLevelValueForExistingClass` and `oldMaxSpellLevel`. The suspicion (not yet pinned down with a failing test) is an off-by-one / wrong-level comparison in one of:

- `Spells.svelte` reactive block (lines ~100-140):
  ```js
  $: effectiveCharacterLevel = $isLevelUp && $newLevelValueForExistingClass ? $newLevelValueForExistingClass : 1;
  $: levelUpAwareMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass ? getMaxSpellLevelForClass($newLevelValueForExistingClass, characterClassName, $actor) : calculatedMaxSpellLevel;
  $: oldMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass ? getMaxSpellLevelForClass($newLevelValueForExistingClass - 1, characterClassName, $actor) : 0;
  ```
- `spellSelection.js` `spellProgress` derived store (lines ~820-1000): `noUpdatesNeeded` logic returns `true` when `newMaxSpellLevel <= oldMaxSpellLevel && $spellLimits.cantrips === 0`.
- `spellSelection.js` `autoPopulateAllSpells(characterClassName, maxSpellLevel, actor, isLevelUp, oldMaxSpellLevel)` (lines ~1735-1874): filters `spellLevel > oldMaxSpellLevel && spellLevel <= maxSpellLevel`.
- `LevelUpStateMachine.js` `_shouldRequireSpellSelectionForLevelUp(actor)` (lines ~455-505) and `selecting_spells` `onEnter` (lines ~820-845) which calls `loadAvailableSpells(determineSpellListClass(actor))`.

The offset means at level-up the code believes the new spells were already granted at the prior level, so it reports `0/0` and skips auto-selection. This needs a TDD test that reproduces the level-up sequence for Druid and asserts the correct spells get auto-selected at the correct level.

## Suspect Files (in priority order)

1. `src/components/organisms/dnd5e/Tabs/Spells.svelte` — message template (~lines 688-695) + reactive derivations (~lines 100-140, 203-209, 627-630).
2. `src/stores/spellSelection.js` — `spellProgress` no-updates logic (~820-1000), `autoPopulateAllSpells` (~1735-1874), `loadAvailableSpells` class filtering (~1037-1340, esp. `doc.labels.classes` checks for v4+).
3. `src/helpers/LevelUpStateMachine.js` — `_shouldRequireSpellSelectionForLevelUp` (~455-505), `selecting_spells` onEnter (~820-845).

## Existing Test Patterns To Mirror

- `src/tests/test-cleric-auto-populate.test.js` — tests `autoPopulateAllSpells('Cleric', 2, null, false, 0)` → 10 spells (5/level × 2), and `autoPopulateAllSpells('Cleric', 2, null, true, 1)` → 8 level-2 spells. Uses `vi.doMock('svelte/store', ...)` with real `get`, mocks `Dialog.confirm` → `true`, sets `spellModule.availableSpells.set(mockSpells)`.
- `src/tests/setup.js` — mocks svelte/store (no-op writable/readable/derived, `get` returns `{}`), `game.settings.get` → `false`, `MODULE_ID='foundryvtt-actor-studio'`, `document.querySelectorAll` → `[]`, `Hooks`.
- Test command: `nvm use 24; bun run test`. CRITICAL: no hardcoded timeouts — use `getTestTimeouts()` from `src/helpers/testTimeouts.js`.

## Recommended TDD Plan

1. **Failing test A — Druid auto-populate parity:** Create `src/tests/test-druid-auto-populate.test.js` mirroring the cleric test. Assert `autoPopulateAllSpells('Druid', 2, null, false, 0)` and `autoPopulateAllSpells('Druid', 2, null, true, 1)` return the same counts as Cleric. This isolates whether Druid auto-population works identically.
2. **Failing test B — Message count:** Assert that when `hasAllSpellsAccess` is true and `effectiveSelectedSpellCount` = 15, the displayed notice count is 15, not 0. May need to extract the message-count logic or test the derived values `displaySpellLimit` vs `effectiveSelectedSpellCount`/`uiSpellLimit`.
3. **Failing test C — Druid level-up offset:** Reproduce a Druid 1→2→3 level-up and assert the correct spells are auto-selected at each level (no off-by-one). This is the hardest and most important to pin the real defect.
4. **Fix Bug 1:** Change the all-spells-notice template in `Spells.svelte` from `{displaySpellLimit}` to `{effectiveSelectedSpellCount}` (or `{uiSpellLimit}`).
5. **Fix Bug 2:** Correct the level-offset in the level-up spell computation once test C reproduces it.
6. Run `nvm use 24; bun run test` and confirm all green + no regressions.

## Constraints (from copilot-instructions.md)

- NEVER edit `dist/` — make changes in `src/`.
- NO hardcoded timeouts — use settings-driven helpers.
- NEVER auto-run git/PR operations.
- All Svelte components use `<template lang="pug">` — never standard HTML.
- i18n via `localize()` from `~/src/helpers/Utility`, key WITHOUT `GAS.` prefix.
- ESM-only — never `require()`.


# Conclusion

What was wrong with Druid
There were two distinct defects, both affecting "all-spells" full casters (Cleric, Druid, etc.), but Druid exposed the deeper one.

## Bug 1
Wrong count in the "all spells" notice (Cleric + Druid)
The notice message in Spells.svelte used displaySpellLimit, which is derived from getAutoSelectedSpells().length. That function filters $availableSpells by spell level, but at render time the available-spells list is often empty or not yet scoped, so it returns 0. The left-hand "Expected Spell Selections" panel was correct (showing 15/15) because it used effectiveSelectedSpellCount. The fix was to make the notice use effectiveSelectedSpellCount instead of displaySpellLimit.

## Bug 2 
Druid level-up offset (the real Druid-specific defect)
During level-up, spellProgress in spellSelection.js computes whether new spell levels were gained. It had a fallback helper getMaxSpellLevelByClassName that compared the class name against a capitalized list:

But the incoming className for Druid was lowercase ('druid'), so the check failed and Druid was treated as a non-caster. That made newMaxSpellLevel compute as 0, so the noUpdatesNeeded branch triggered:

Result: leveling Druid to 3 reported "no spell updates needed," showed 0/0, and skipped auto-selection of the newly available level-2 spells. Cleric happened to work because its identifier was already capitalized in the relevant path, masking the bug for that class.

The fix normalized the class name to lowercase before comparison, so 'druid' now matches the full-caster list and the level-up correctly requires spell updates.

## Verification
Added failing tests first (Druid auto-populate parity, notice-count, Druid 2→3 level-up regression), confirmed them red.
Applied both fixes.
Full suite: 96 files, 780 tests passing (4 new tests added on top of the prior baseline).