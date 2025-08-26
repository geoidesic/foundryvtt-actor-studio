## NPC Builder – Implementation Plan (WIP)

This plan defines the steps to build the NPC creation flow mirroring the PC user journey, with its own state machine, stores, and tabs. We will mark tasks as we complete them.

Assumptions / notes:
- We already open an in-memory `Actor.implementation` with type `npc` via `openNPCStudio` → `NPCApplication` → `NPCAppShell` which sets the `#doc` Svelte context to the document store.
- The current `NpcSelect` tab selects a compendium NPC and renders its enriched bio and a minimal stat block from the compendium document, not from the in-memory actor.
- We will copy the selected NPC’s data into the in-memory actor document (`#doc`) so inline edits update that document directly, and save to world later.
- Adult Green Dragon sample data was referenced but not included in this message. We’ll implement the stat-block fields generically for any dnd5e NPC; we can validate with the Dragon when data is provided or pulled from compendium.

---

### Step 1 — Tab 1 (Select base NPC) with read-only stat block

Goal: Keep the first tab focused on selecting a base NPC from compendiums and showing a complete, read-only stat block sourced from the selected compendium item. No inline editing here.

- [ ] Read-only stat block expansion
  - [ ] Expand `NPCStatBlock.svelte` to render the traditional 5e layout (read-only):
    - Header: Name
    - Line 1: Size, Type (w/subtype), Alignment
    - AC (with source); HP (and hit dice); Speed(s)
    - Ability scores: STR, DEX, CON, INT, WIS, CHA (with modifiers)
    - Saving Throws (proficient saves)
    - Skills
    - Damage Resistances / Immunities / Vulnerabilities
    - Condition Immunities
    - Senses (incl. passive Perception)
    - Languages
    - Proficiency Bonus
    - Challenge (CR) and XP
    - Traits; Actions; Bonus Actions; Reactions; Legendary; Lair/Mythic (as present)
  - [ ] Cross-check online official stat blocks for missing fields, then locate values in `npc.system` to determine correct key paths.

- [ ] Footer integration on Tab 1
  - [ ] Add the PC-style footer (`Footer.svelte`) with a progress bar and a “Select base NPC” button.
  - [ ] Progress = 100% once a base NPC is selected.
  - [ ] Clicking “Select base NPC” advances to Tab 2.

Deliverables / file edits:
- [ ] `src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte` — expanded read-only fields
- [ ] `src/components/organisms/dnd5e/Tabs/NpcSelect.svelte` — add footer and completion handling

---

### Step 2 — Global Features indexing (background worker) and cache

Goal: Build a deduplicated, searchable index of all Features from all NPCs in the source compendiums, stored in localStorage for fast lookups.

- [ ] Worker setup
  - [ ] Create `src/workers/npcFeaturesIndexer.js` to run as a Web Worker.
  - [ ] Input: list of pack IDs for NPC compendiums (from settings).
  - [ ] Process: for each NPC document: iterate its `items` and collect feature-like items (e.g., `feat`, `feature`, `action`, `trait`, `legendary`, etc. — confirm item types in dnd5e system).
  - [ ] Output: deduped by `name` + `type` (or by UUID if better), elements shaped as `{ name, itemUuid, fromActorUuid }`.
  - [ ] Store to `localStorage` under key `${MODULE_ID}.npcFeaturesIndex.v1`.

- [ ] Hook on load
  - [ ] In `src/index.js` after ready (and if `enableNPCCreation`), spawn the worker and feed it the compendium pack list.
  - [ ] Add a small status log and a setting or dev command to rebuild / clear the cache.
  - [ ] Provide a non-worker fallback if Workers are unavailable (run in a `setTimeout` idle task).

---

### Step 3 — Tab 2 (Select and add features)

Goal: Let users browse the indexed global feature list and add features to the current in-memory NPC; right panel shows the features that will be added on creation.

- [ ] Tabs / layout
  - [ ] Add `Features` tab to `npcTabs` after `NpcSelect`.
  - [ ] Component: left panel uses `IconSearchSelect` bound to the index; right panel lists features selected for inclusion.

- [ ] Adding/removing features for creation
  - [ ] On select, fetch the item via its UUID and stage it in a local selection list (not yet altering `#doc`).
  - [ ] Allow removal and prevent duplicates.
  - [ ] Footer: “Create NPC” which creates the in-world actor from the base NPC plus selected features.

Deliverables / file edits:
- [ ] `src/stores/index.js` — add `Features` tab entry
- [ ] `src/components/organisms/dnd5e/Tabs/NpcFeaturesBrowse.svelte`
- [ ] `src/lib/npcWorkflow.js` — creation helper to instantiate actor and embed all staged items

---

### Step 4 — Replace the default NPC actor sheet (editable stat block + features + CR)

Goal: Move editing to the NPC actor sheet for long-term flexibility; allow CR recalculation from the sheet.

- [ ] Register a custom NPC sheet
  - [ ] Implement a class extending `ActorSheet` or `DocumentSheet` that renders our Svelte shell / stat block.
  - [ ] Register only for `types: ['npc']` using `Actors.registerSheet(MODULE_ID, MyNPCSheet, { types: ['npc'], makeDefault: true })`.
  - [ ] Do not change `CONFIG.Actor.documentClass` (that’s for document model); use sheet registration to target NPCs only.

- [ ] Editable stat block and features on the sheet
  - [ ] Reuse the stat block UI but enable inline editing (using `actor.update` or `updateSource`).
  - [ ] Embedded Items list with add/remove/edit; reuse item rendering components if needed.

- [ ] CR calculator
  - [ ] Add a “Recalculate CR” button on the sheet header or within the stat block.
  - [ ] Use deterministic algorithm from `src/helpers/CR.js` (see Step 6) to compute and optionally sync to `system.details.cr` and `system.details.xp`.

---

### Step 5 — Create NPC from Actor Studio

Goal: From Tab 2, create the actual Actor in the world using the base NPC plus selected features.

- [ ] Implement `createNpcInGameAndEmbedItems({ baseNpc, selectedFeatures, folder })` in `src/lib/npcWorkflow.js`.
- [ ] After creation, optionally open the new actor sheet (our custom NPC sheet).

---

### Step 6 — CR calculation algorithm (deterministic, rules-based)

Goal: Provide a reliable, offline, deterministic implementation of the CR method.

- [ ] `src/helpers/CR.js`
  - [ ] CR tables (CR ↔ expected HP/AC and DPR/Attack bonus/Save DC) and mapping utilities.
  - [ ] Defensive CR calculation (HP + resistance multiplier; AC adjustment).
  - [ ] Offensive CR calculation (DPR; attack bonus or save DC adjustment; include toggles for legendary/lair contributions if desired).
  - [ ] Average and final CR with rounding rules.
  - [ ] Return both detailed breakdown and final CR/XP.

---

### Step 7 — State machine & stores (optional later)

Goal: Introduce a lightweight NPC-specific FSM if we later need multi-step validation inside Actor Studio.

- [ ] `src/helpers/NPCWorkflowStateMachine.js` — minimal scaffold (idle → selecting base → selecting features → completed).
- [ ] NPC-specific stores for selection state if needed.

---

### Step 8 — QA and Documentation

- [ ] Smoke-test stat block editing and CR recalculation with multiple compendium NPCs.
- [ ] Validate features index build time and size; ensure localStorage keying and versioning.
- [ ] Update docs:
  - [ ] `docs/features/npc_builder.md` with usage and screenshots.
  - [ ] Settings docs for NPC feature indexing toggle and rebuild.

---

### Field mapping reference (dnd5e)

We will read from and write to the following `actor.system` paths (v3/v4 compatible when possible):
- `system.traits.size`, `system.details.type.value`, `system.details.alignment`
- `system.attributes.ac.flat`, `system.attributes.hp` (value, max, formula), `system.attributes.movement`
- `system.abilities.{str|dex|con|int|wis|cha}.value`
- `system.attributes.prof`, `system.attributes.pb`
- `system.traits.dr`, `system.traits.di`, `system.traits.dv`, `system.traits.ci`
- `system.skills`, `system.saves`
- `system.traits.senses`, `system.traits.languages`
- `system.details.cr`, `system.details.xp`
- Action/feature rendering will come from embedded `Item` documents

If Adult Green Dragon data is provided, we will use it to validate layout and parsing.

---

### CR Calculation – Feasibility & Approach

Assessment:
- A deterministic algorithm matching the CR method is feasible and reliable. Inputs: effective HP (with resistance multipliers), AC, DPR, attack bonus or save DC, and optional adjustments for legendary/lair actions.
- Edge cases like complex spellcasters, AoE assumptions, rider effects, or control abilities require judgment; we can expose toggles/inputs so users can include/exclude those contributions.

Recommendation:
- Implement a local algorithm (`src/helpers/CR.js`) instead of an AI integration. Benefits: offline, fast, deterministic, testable, and consistent with book rules. AI would add latency, require external services, and be non-deterministic.

