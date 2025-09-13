# CR Retargeting and Formula Strategy

This document tracks the design and execution plan for CR retargeting and how we treat damage formulas with CR awareness.

## TL;DR decisions

- Default behavior: perform static rewrites of damage values to meet the target CR. Update both item data and descriptions. No core patches required.
- Optional dynamic scaling: support “policy-based” scaling via module flags and rewrite-on-CR-change. Avoid patching the dice parser.
- About @details.cr: prefer using actor rollData if available; if not, expose an equivalent field via wrapper utilities when we own item creation, or pre-resolve at save-time. We won’t monkey-patch dnd5e.

## Why this approach

- Stability: static rewrites and rollData augmentation are resilient across dnd5e versions. Replacing the global dice parser (CONFIG.Dice.parse) risks broad side effects.
- Transparency: updated descriptions stay in sync with data; no hidden runtime math.
- Control: a simple iterative solver can converge on target CR using our existing CRCalculator.

---

## Is @details.cr available?

dnd5e resolves formulas via `replaceFormulaData(formula, data, { actor, item, ... })` which pulls from `getRollData()` on Items/Activities.

We can detect support at runtime with a tiny probe:

- Check if an Actor exposes `actor.system.details?.cr`.
- Check if an Item’s `getRollData()` includes a `details.cr` path.
- As a fallback, call `replaceFormulaData('@details.cr', item.getRollData(), { actor, item })` and see if the returned string differs from the input and is numeric-ish.

Pseudocode:

- const hasCrOnActor = !!actor?.system?.details?.cr
- const rd = item?.getRollData?.() ?? {}
- const hasCrInRollData = !!foundry.utils.getProperty(rd, 'details.cr')
- const resolved = dnd5e.replaceFormulaData?.('@details.cr', rd, { actor, item })
- const resolves = typeof resolved === 'string' && resolved !== '@details.cr' && !Number.isNaN(Number(resolved))

If any of these signals are true, we can assume CR is addressable in formulas via `@details.cr`.

### If not available

- Non-invasive path A (preferred): when we create/update items under our control, ensure `getRollData()` from those items includes a `details.cr` value by merging actor CR into their roll data (e.g., lightweight wrapper utility that consumers use when preparing data or executing rolls).
- Non-invasive path B: pre-resolve “@CR” tokens in author-time strings to the actor’s numeric CR and save concrete values.
- Avoid: global monkey-patch of `CONFIG.Dice.parse` or replacing `replaceFormulaData`.

---

## Static rewrite vs dynamic scaling

- Static rewrite (default):
  - Recompute required DPR from target CR.
  - Allocate per-attack damage by usage weight (multiattack first).
  - Rewrite dice: preserve die size, change count; add small flat bonus if needed.
  - Update system fields (new: `system.damage.base.*`; legacy: `system.damage.parts[0][0]`).
  - Update descriptions (“Hit: 17 (5d6) …”) to match.

- Dynamic scaling (optional and safe):
  - Store a policy in `flags.gas.scaling`, e.g.: `{ base: '2d4', unit: 'd4', perCR: { start: 1, step: 2, addDice: 1 } }`.
  - On CR change, rewrite concrete dice from the policy. Deterministic and readable, no special parser support required.

- Dynamic scaling (risky): custom dice parser to accept variables like `@CR` and compute `XdY` dynamically. This touches `CONFIG.Dice.parse` or FunctionTerm and is out-of-scope for a stable first pass.

---

## Implementation plan

1) Retargeting engine
- File: `src/helpers/CRRetargeter.js`
- Responsibilities:
  - Analyze actor (defense/offense) using `CRCalculator`.
  - Compute per-item usage weights from multiattack, at-will, limited-use, legendary actions.
  - Produce a plan for HP/AC and per-item dice rewrites.
  - Apply a rewrite pass (data + description sync).
  - Iterate with damping until final CR within ±0.25 of target or 3–5 iterations.

2) Shape adapters
- File: `src/helpers/damageAdapters.js`
- Adapters:
  - New weapon damage: `system.damage.base.{number, denomination, bonus}`
  - Legacy `system.damage.parts[0][0]`: parse-write round-trip
  - Activities `damage.parts[]` DamageData objects
  - Description-only updater

3) Description sync
- File: `src/helpers/DamageTextUpdater.js`
- Extract and replace common patterns:
  - `Hit: N (XdY[+Z])` → update N and X, Y, Z
  - `XdY [type] damage` → update X, Y
- Keep idempotency: use markers/flags to avoid double-scaling.

4) CR variable availability check
- File: `src/helpers/crRollData.js`
- Exports:
  - `hasDetailsCr(actor, item?)`
  - `ensureRollDataCr(actor, rollData)` merges `details.cr` if missing
  - Tiny probe using `dnd5e.replaceFormulaData` when present

5) Optional scaling policy
- Store/replay policy via `flags.gas.scaling` on items we manage.
- Utility: `applyScalingPolicy(item, actorCR)` → concrete numbers.

6) UI hook (later)
- Add a “Retarget CR…” action in NPC builder, with a diff preview before applying updates.

7) Tests
- Location: `src/tests/cr-retargeter/`
- Fixtures for each supported shape and a sample NPC (Mage):
  - Verify update object hits expected fields.
  - Verify recalculated CR converges within tolerance.
  - Verify description sync matches numbers.

---

## Runtime snippet to check @details.cr

We’ll keep this here for dev reference (not to be committed as runtime code):

```js
// Given actor and an item
const hasCrOnActor = !!actor?.system?.details?.cr;
const rd = item?.getRollData?.() ?? {};
const hasCrInRollData = !!foundry?.utils?.getProperty?.(rd, 'details.cr');
let resolves = false;
try {
  const resolved = game?.systems?.dnd5e?.dnd5e?.replaceFormulaData
    ? game.systems.dnd5e.dnd5e.replaceFormulaData('@details.cr', rd, { actor, item })
    : (window.dnd5e?.replaceFormulaData?.('@details.cr', rd, { actor, item }));
  resolves = typeof resolved === 'string' && resolved !== '@details.cr' && !Number.isNaN(Number(resolved));
} catch (_) {}
const detailsCrAvailable = hasCrOnActor || hasCrInRollData || resolves;
```

Notes:
- Access path to `replaceFormulaData` varies; in our codebase we import from the system module when testing. At runtime, prefer the imported helper.
- If unavailable, default to static rewrites or ensure roll data via helper.

---

## Progress checklist

- [x] Build CRRetargeter skeleton wired to CRCalculator
- [x] Implement adapters for new damage.base
- [x] Implement adapters for legacy damage.parts strings
- [x] Implement adapters for activities DamageData (actions/spells/features)
- [x] Implement description updater and idempotent replacements
- [x] Implement usage weighting and allocation
- [x] Implement iterative convergence loop with damping
- [x] Add multiattack and limited-use weighting heuristics
- [x] Add crRollData helpers and tests
- [x] Implement crRollData helpers and detection
- [ ] Add optional scaling policy flags and applier
- [x] Unit tests for adapters and convergence
- [x] Integrate button/command in NPC builder (diff preview)

---

## Open questions / later improvements

- Better heuristics for limited-use valuation (per system version and localization).
- Support multi-damage-part and on-hit riders with typed damage correctly.
- Optional CR-aware spell DC formula instead of explicit number for casters we create.
- Consider exposing a dev-only toggle to use a custom parser for experiments, isolated via a guard.

---

## Status and next step

- Status: CRRetargeter skeleton, adapters, weighting (including multiattack and limited-use heuristics), convergence, and roll-data helpers added and tested.
  - Files: `src/helpers/CRRetargeter.js`, `src/tests/cr-retargeter/basic-retarget.test.js`
  - What it does: sets `details.cr`/XP; snaps HP to defensive band median and AC to expected; offensive rewrites for new/legacy/activities; description sync helper.
  - Quick test: run
    - npx vitest run src/tests/cr-retargeter/basic-retarget.test.js
    - npx vitest run src/tests/cr-retargeter/description-updater.test.js

- Completed: Adapter for new-style weapon damage (`system.damage.base`)
  - Scales number to reach DPR median (preserving die size, bonus).
  - Test: included in `src/tests/cr-retargeter/basic-retarget.test.js`.

- Completed: Adapters for legacy damage.parts and activities DamageData
  - Tests: included in `src/tests/cr-retargeter/basic-retarget.test.js`.

- Completed: Description updater helper
  - Tests: `src/tests/cr-retargeter/description-updater.test.js`.

- Next step: Expand weighting to explicit multiattack sequencing and legendary action heuristics; add optional scaling policies and UI integration with diff preview.
