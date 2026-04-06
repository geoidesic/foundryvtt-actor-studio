/**
 * Shared TOON spell progression helpers.
 *
 * Extracted so that both the Quench in-app tests (character-permutation-tests.js)
 * and Vitest unit tests can import and verify the same logic.
 *
 * TOON-1 format rules:
 *   Level 1 entry  — cumulative starting pool (how many to pick at character creation).
 *   Level N (N>1) — delta (how many NEW spells/cantrips to pick when levelling to N).
 *
 * "All" in spells means the class is a prepared caster; the engine auto-populates
 * the spell list and a Finalize button is presented without manual selection.
 */

/**
 * Parse a single TOON spell progression value.
 * Accepts either an object { cantrips, spells, maxSpellLevel, … } or a
 * legacy "C/S" string (e.g. "3/6", "3/All").
 *
 * @param {object|string|undefined} value
 * @returns {{ cantrips: number, spells: number, hasAllSpells: boolean, maxSpellLevel: number, uiRequired: boolean|undefined } | null}
 */
export function parseSpellProgressionValue(value) {
  if (!value) return null;

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const cantrips = Number.parseInt(value.cantrips, 10) || 0;
    const rawSpells = value.spells;
    const hasAllSpells = String(rawSpells || '').toLowerCase() === 'all' || value.hasAllSpells === true;
    const spells = hasAllSpells ? 0 : (Number.parseInt(rawSpells, 10) || 0);

    return {
      cantrips,
      spells,
      hasAllSpells,
      maxSpellLevel: Number.parseInt(value.maxSpellLevel, 10) || 0,
      uiRequired: typeof value.uiRequired === 'boolean' ? value.uiRequired : undefined
    };
  }

  if (typeof value !== 'string') return null;
  const [cantripsRaw, spellsRaw] = value.split('/').map((entry) => String(entry ?? '').trim());
  if (!cantripsRaw || !spellsRaw) return null;

  return {
    cantrips: Number.parseInt(cantripsRaw, 10) || 0,
    spells: Number.parseInt(spellsRaw, 10) || 0,
    hasAllSpells: spellsRaw.toLowerCase() === 'all',
    maxSpellLevel: 0,
    uiRequired: undefined
  };
}

/**
 * Given a class config and a target level, return whether the spell selection
 * UI is expected to appear AND require explicit user selection.
 *
 * Returns false for prepared casters (hasAllSpells) — they show a UI but the
 * engine auto-selects all spells; only Finalize needs clicking.
 *
 * @param {{ classConfig: object, classIdentifier: string }} params
 * @param {{ targetLevel: number, rulesVersion: string }} levelParams
 * @returns {boolean}
 */
export function shouldExpectSpellsForLevel({ classConfig, classIdentifier, targetLevel, rulesVersion }) {
  const numericTargetLevel = Number(targetLevel) || 0;
  if (numericTargetLevel <= 1) return false;

  const progressionTOON = classConfig?.spellProgressionTOON?.levels;
  const levelValue = readTOONValue(progressionTOON, numericTargetLevel, rulesVersion);
  if (!levelValue) return false;

  const parsed = parseSpellProgressionValue(levelValue);
  if (!parsed) return false;

  if (typeof parsed.uiRequired === 'boolean') return parsed.uiRequired;

  // Auto-prepared casters don't require manual selection
  if (parsed.hasAllSpells) return false;

  return parsed.cantrips > 0 || parsed.spells > 0;
}

/**
 * Given a class config and target level, return the expected DELTA for spell
 * selection at that level (how many new spells/cantrips to pick).
 *
 * @param {{ classConfig: object }} params
 * @param {{ targetLevel: number, rulesVersion: string }} levelParams
 * @returns {{ cantrips: number, spells: number, required: boolean, hasAllSpells: boolean }}
 */
export function getExpectedSpellSelectionDelta({ classConfig, targetLevel, rulesVersion }) {
  const numericTargetLevel = Number(targetLevel) || 0;
  if (numericTargetLevel <= 1) return { cantrips: 0, spells: 0, required: false, hasAllSpells: false };

  const progressionTOON = classConfig?.spellProgressionTOON?.levels;
  const parsed = parseSpellProgressionValue(readTOONValue(progressionTOON, numericTargetLevel, rulesVersion));
  if (!parsed) return { cantrips: 0, spells: 0, required: false, hasAllSpells: false };

  const cantrips = parsed.hasAllSpells ? 0 : (parsed.cantrips || 0);
  const spells = parsed.hasAllSpells ? 0 : (parsed.spells || 0);

  return {
    cantrips,
    spells,
    required: cantrips > 0 || spells > 0,
    hasAllSpells: parsed.hasAllSpells === true
  };
}

/**
 * Whether the spell UI may appear for a given level-up.
 * True when either explicit selection is required OR the class is a prepared
 * caster (the Finalize flow still needs time to run).
 */
export function spellUiMayAppearForLevel({ classConfig, classIdentifier, targetLevel, rulesVersion }) {
  const expectSpells = shouldExpectSpellsForLevel({ classConfig, classIdentifier, targetLevel, rulesVersion });
  const delta = getExpectedSpellSelectionDelta({ classConfig, targetLevel, rulesVersion });
  return expectSpells || delta.hasAllSpells;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function readTOONValue(progressionTOON, levelNumber, rulesVersion) {
  const levelData = progressionTOON?.[String(levelNumber)] || progressionTOON?.[Number(levelNumber)] || null;
  if (!levelData) return undefined;
  return levelData?.[rulesVersion] ?? levelData?.default;
}
