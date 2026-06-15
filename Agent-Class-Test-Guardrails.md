# FoundryVTT Actor Studio - Class Test Guardrails

## Class Permutation Test Structure

### Test Organization
- Keep class blocks split into four ordered tests: creation, open-level-up-app, level 1->2, level 2->3
- For each class block, set in level-up tests:
  - `game.settings.set(MODULE_ID, 'milestoneLeveling', true)`
  - `game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true)`
- Use class-specific actor ids and names per describe block; do not share actor state across class describes
- Use a unique actor name per run and recover actor id from `game.actors` by that name if store id is null

### Creation Flow Assertions
- For non-spellcaster creation flows, assert completion by waiting for Actor Studio close and persisted actor items
- Always verify creation persisted at least:
  - one class item with expected class identifier at level 1
  - one background item

### Ranger Implementation Guidelines
- For Ranger implementation, clone the stable Fighter block and then change only class UUID, class identifier, and spell-tab expectations
- When adding a new class permutation suite, also register it in `src/index.js` via `quench.registerBatch(...)`; test code alone is not enough for Quench UI visibility

### Spell Automation Rules
- For Ranger spell automation, expand collapsed `.spell-level-header` groups before trying to click `.add-btn`; do not assume spell rows are initially expanded
- Before clicking class-row/plus during level-up tests, explicitly switch to `Level Up` / `Class` tab

### Error Handling and Diagnostics
- If spells tab is visible but has no spell rows, no enabled `.add-btn`, and no finalize/skip footer actions, fail with explicit diagnostics and treat this as a real bug
- Never use hard-coded timeout/polling literals in Quench tests. Use `getTestTimeouts()` settings and named constants derived from those settings
- Never dispatch workflow/level-up FSM events from tests to bypass broken UI behavior
- Never add fallback logic that converts a real integration failure into a pass
- Never force FSM transitions (e.g., `skip_spells`, `spells_complete`, `completed`) from tests to bypass broken UI paths
- Never replace UI-driven assertions with weaker assertions just to pass tests
- If UI is missing required controls/content, fail fast with diagnostics and fix production behavior