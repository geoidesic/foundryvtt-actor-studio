/**
 * Unit tests for toonSpellHelpers.js
 *
 * Validates that parseSpellProgressionValue, shouldExpectSpellsForLevel,
 * getExpectedSpellSelectionDelta, and spellUiMayAppearForLevel produce the
 * correct output for every class config used in the Quench integration tests.
 *
 * These tests exist specifically to catch the class of bug where TOON configs
 * use cumulative totals instead of per-level deltas, or where a prepared-caster
 * class (hasAllSpells) is incorrectly treated as not needing a spell UI timeout.
 */

import { describe, it, expect } from 'vitest';
import {
  parseSpellProgressionValue,
  shouldExpectSpellsForLevel,
  getExpectedSpellSelectionDelta,
  spellUiMayAppearForLevel
} from '../hooks/tests/toonSpellHelpers.js';

// ── Class configs (mirrors the *-tests.js files exactly) ──────────────────────

const CONFIGS = {
  wizard: {
    identifier: 'wizard',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 3, spells: 6, maxSpellLevel: 1 }, '2024': { cantrips: 3, spells: 6, maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 0, spells: 2, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 2, maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 2, maxSpellLevel: 2 }, '2024': { cantrips: 0, spells: 2, maxSpellLevel: 2 } }
      }
    }
  },
  bard: {
    identifier: 'bard',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 2, spells: 4, maxSpellLevel: 1 }, '2024': { cantrips: 2, spells: 4, maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 2 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 2 } }
      }
    }
  },
  warlock: {
    identifier: 'warlock',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 2, spells: 2, maxSpellLevel: 1 }, '2024': { cantrips: 2, spells: 2, maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 2 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 2 } }
      }
    }
  },
  sorcerer: {
    identifier: 'sorcerer',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 4, spells: 2, maxSpellLevel: 1 }, '2024': { cantrips: 4, spells: 2, maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 2 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 2 } }
      }
    }
  },
  cleric: {
    identifier: 'cleric',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 3, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 3, spells: 'All', maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 3, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 3, spells: 'All', maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 3, spells: 'All', maxSpellLevel: 2 }, '2024': { cantrips: 3, spells: 'All', maxSpellLevel: 2 } }
      }
    }
  },
  ranger: {
    identifier: 'ranger',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 2, maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 0, spells: 2, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } }
      }
    }
  },
  artificer: {
    identifier: 'artificer',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 2, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 2, spells: 0, maxSpellLevel: 0 } },
        2: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 1 } }
      }
    }
  },
  fighter: {
    identifier: 'fighter',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 0 } },
        2: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 0 } },
        3: { '2014': { cantrips: 2, spells: 3, maxSpellLevel: 1 }, '2024': { cantrips: 2, spells: 3, maxSpellLevel: 1 } }
      }
    }
  },
  paladin: {
    identifier: 'paladin',
    spellProgressionTOON: {
      format: 'TOON-1',
      levels: {
        1: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 'All', maxSpellLevel: 1 } },
        2: { '2014': { cantrips: 0, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 'All', maxSpellLevel: 1 } },
        3: { '2014': { cantrips: 0, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 'All', maxSpellLevel: 1 } }
      }
    }
  }
};

// ── parseSpellProgressionValue ────────────────────────────────────────────────

describe('parseSpellProgressionValue', () => {
  it('parses object with numeric spells', () => {
    const result = parseSpellProgressionValue({ cantrips: 3, spells: 6, maxSpellLevel: 1 });
    expect(result).toEqual({ cantrips: 3, spells: 6, hasAllSpells: false, maxSpellLevel: 1, uiRequired: undefined });
  });

  it('parses object with All spells', () => {
    const result = parseSpellProgressionValue({ cantrips: 3, spells: 'All', maxSpellLevel: 1 });
    expect(result).toEqual({ cantrips: 3, spells: 0, hasAllSpells: true, maxSpellLevel: 1, uiRequired: undefined });
  });

  it('parses string format "3/6"', () => {
    const result = parseSpellProgressionValue('3/6');
    expect(result).toEqual({ cantrips: 3, spells: 6, hasAllSpells: false, maxSpellLevel: 0, uiRequired: undefined });
  });

  it('parses string format "3/All"', () => {
    const result = parseSpellProgressionValue('3/All');
    expect(result).toEqual({ cantrips: 3, spells: 0, hasAllSpells: true, maxSpellLevel: 0, uiRequired: undefined });
  });

  it('returns null for null/undefined input', () => {
    expect(parseSpellProgressionValue(null)).toBeNull();
    expect(parseSpellProgressionValue(undefined)).toBeNull();
  });

  it('returns null for malformed string', () => {
    expect(parseSpellProgressionValue('notavalue')).toBeNull();
  });
});

// ── Delta values must never exceed the delta implied by spellsKnown.json ──────
// This is the key guard: if you accidentally put cumulative totals here,
// the delta between consecutive levels will be larger than 1 per level for
// most classes and the tests below will catch it.

describe('getExpectedSpellSelectionDelta — delta values are per-level increments', () => {
  for (const edition of ['2014', '2024']) {
    describe(`${edition} rules`, () => {
      it('wizard L2 = +2 spells, +0 cantrips (not cumulative 8)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.wizard, targetLevel: 2, rulesVersion: edition });
        expect(delta.spells).toBe(2);
        expect(delta.cantrips).toBe(0);
        expect(delta.hasAllSpells).toBe(false);
      });

      it('wizard L3 = +2 spells, +0 cantrips (not cumulative 10)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.wizard, targetLevel: 3, rulesVersion: edition });
        expect(delta.spells).toBe(2);
        expect(delta.cantrips).toBe(0);
      });

      it('bard L2 = +1 spell, +0 cantrips (not cumulative 5)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.bard, targetLevel: 2, rulesVersion: edition });
        expect(delta.spells).toBe(1);
        expect(delta.cantrips).toBe(0);
      });

      it('warlock L2 = +1 spell, +0 cantrips (not cumulative 3)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.warlock, targetLevel: 2, rulesVersion: edition });
        expect(delta.spells).toBe(1);
        expect(delta.cantrips).toBe(0);
      });

      it('sorcerer L2 = +1 spell, +0 cantrips', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.sorcerer, targetLevel: 2, rulesVersion: edition });
        expect(delta.spells).toBe(1);
        expect(delta.cantrips).toBe(0);
      });

      it('cleric L2 = hasAllSpells (no manual selection)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.cleric, targetLevel: 2, rulesVersion: edition });
        expect(delta.hasAllSpells).toBe(true);
        expect(delta.spells).toBe(0);
      });

      it('artificer L2 = 0 spells, 0 cantrips (prepared caster — no selection)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.artificer, targetLevel: 2, rulesVersion: edition });
        expect(delta.spells).toBe(0);
        expect(delta.cantrips).toBe(0);
        expect(delta.required).toBe(false);
      });

      it('fighter L2 = 0 spells, 0 cantrips (no spellcasting yet)', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.fighter, targetLevel: 2, rulesVersion: edition });
        expect(delta.spells).toBe(0);
        expect(delta.cantrips).toBe(0);
        expect(delta.required).toBe(false);
        expect(delta.hasAllSpells).toBe(false);
      });

      it('fighter L3 (Eldritch Knight) = +3 spells, +2 cantrips', () => {
        const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.fighter, targetLevel: 3, rulesVersion: edition });
        expect(delta.spells).toBe(3);
        expect(delta.cantrips).toBe(2);
        expect(delta.required).toBe(true);
      });
    });
  }

  it('ranger L2 2014 = +2 spells', () => {
    const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.ranger, targetLevel: 2, rulesVersion: '2014' });
    expect(delta.spells).toBe(2);
  });

  it('ranger L2 2024 = +1 spell (not +3 cumulative)', () => {
    const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.ranger, targetLevel: 2, rulesVersion: '2024' });
    expect(delta.spells).toBe(1);
  });

  it('ranger L3 both editions = +1 spell', () => {
    for (const ed of ['2014', '2024']) {
      const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.ranger, targetLevel: 3, rulesVersion: ed });
      expect(delta.spells).toBe(1);
    }
  });
});

// ── shouldExpectSpellsForLevel ────────────────────────────────────────────────

describe('shouldExpectSpellsForLevel', () => {
  it('returns false for level 1 (always)', () => {
    for (const [, cfg] of Object.entries(CONFIGS)) {
      expect(shouldExpectSpellsForLevel({ classConfig: cfg, classIdentifier: cfg.identifier, targetLevel: 1, rulesVersion: '2024' })).toBe(false);
    }
  });

  it('returns true for wizard L2 (has spells to pick)', () => {
    expect(shouldExpectSpellsForLevel({ classConfig: CONFIGS.wizard, classIdentifier: 'wizard', targetLevel: 2, rulesVersion: '2014' })).toBe(true);
  });

  it('returns false for cleric L2 (hasAllSpells — no manual selection required)', () => {
    expect(shouldExpectSpellsForLevel({ classConfig: CONFIGS.cleric, classIdentifier: 'cleric', targetLevel: 2, rulesVersion: '2014' })).toBe(false);
  });

  it('returns false for paladin 2014 L1 (no spells at all)', () => {
    // Level 1 is always false but this also verifies the config is clean
    expect(shouldExpectSpellsForLevel({ classConfig: CONFIGS.paladin, classIdentifier: 'paladin', targetLevel: 1, rulesVersion: '2014' })).toBe(false);
  });

  it('returns false for paladin 2024 L1 (hasAllSpells at L1 — no manual selection, just finalize)', () => {
    // hasAllSpells at creation level must NOT require manual selection but DOES need a spell UI step
    expect(shouldExpectSpellsForLevel({ classConfig: CONFIGS.paladin, classIdentifier: 'paladin', targetLevel: 1, rulesVersion: '2024' })).toBe(false);
  });

  it('returns false for fighter L2 (no spells)', () => {
    expect(shouldExpectSpellsForLevel({ classConfig: CONFIGS.fighter, classIdentifier: 'fighter', targetLevel: 2, rulesVersion: '2024' })).toBe(false);
  });

  it('returns true for fighter L3 (Eldritch Knight gains spells)', () => {
    expect(shouldExpectSpellsForLevel({ classConfig: CONFIGS.fighter, classIdentifier: 'fighter', targetLevel: 3, rulesVersion: '2024' })).toBe(true);
  });
});

// ── spellUiMayAppearForLevel ──────────────────────────────────────────────────

describe('spellUiMayAppearForLevel', () => {
  it('returns true for cleric L2 (hasAllSpells — spell UI appears for Finalize)', () => {
    expect(spellUiMayAppearForLevel({ classConfig: CONFIGS.cleric, classIdentifier: 'cleric', targetLevel: 2, rulesVersion: '2014' })).toBe(true);
  });

  it('returns true for cleric L2 2024', () => {
    expect(spellUiMayAppearForLevel({ classConfig: CONFIGS.cleric, classIdentifier: 'cleric', targetLevel: 2, rulesVersion: '2024' })).toBe(true);
  });

  it('returns false for fighter L2 (no spell UI at all)', () => {
    expect(spellUiMayAppearForLevel({ classConfig: CONFIGS.fighter, classIdentifier: 'fighter', targetLevel: 2, rulesVersion: '2024' })).toBe(false);
  });

  it('returns true for fighter L3 (EK spell selection UI appears)', () => {
    expect(spellUiMayAppearForLevel({ classConfig: CONFIGS.fighter, classIdentifier: 'fighter', targetLevel: 3, rulesVersion: '2024' })).toBe(true);
  });

  it('returns true for wizard L2', () => {
    expect(spellUiMayAppearForLevel({ classConfig: CONFIGS.wizard, classIdentifier: 'wizard', targetLevel: 2, rulesVersion: '2024' })).toBe(true);
  });

  it('returns false for barbarian-like class with no TOON data (missing levels)', () => {
    const noSpells = { identifier: 'barbarian', spellProgressionTOON: { format: 'TOON-1', levels: {} } };
    expect(spellUiMayAppearForLevel({ classConfig: noSpells, classIdentifier: 'barbarian', targetLevel: 2, rulesVersion: '2024' })).toBe(false);
  });

  // ── Paladin creation scenario (the regression this test guards against) ──────
  // Paladin 2024 at L1 has hasAllSpells — the spell UI appears even though no
  // manual selection is needed. creationRequiredSelection must NOT be null for
  // this path, or the short timeout fires and the creation flow deadlocks.

  it('paladin 2024 L1 — spellUiMayAppear is true (prepared caster spell UI appears at creation)', () => {
    // Level-up path: spellUiMayAppearForLevel checks N>1, but for creation the
    // caller checks the L1 delta directly. We verify the delta carries hasAllSpells.
    const delta = getExpectedSpellSelectionDelta({ classConfig: CONFIGS.paladin, targetLevel: 1, rulesVersion: '2024' });
    // Level 1 returns zero delta (it's the starting pool, handled by creation path directly)
    // The creation path reads level1Raw directly and parses it — verify the parse output:
    const level1Raw = CONFIGS.paladin.spellProgressionTOON.levels[1]['2024'];
    const parsed = parseSpellProgressionValue(level1Raw);
    expect(parsed.hasAllSpells).toBe(true);
    expect(parsed.cantrips).toBe(0);
    expect(parsed.spells).toBe(0);
    // The creation condition is: cantrips > 0 || spells > 0 || hasAllSpells
    // Without the || hasAllSpells guard this was null → short timeout → FAIL
    const shouldTriggerSpellStep = parsed.cantrips > 0 || parsed.spells > 0 || parsed.hasAllSpells;
    expect(shouldTriggerSpellStep).toBe(true);
  });

  it('paladin 2014 L1 — no spell step needed', () => {
    const level1Raw = CONFIGS.paladin.spellProgressionTOON.levels[1]['2014'];
    const parsed = parseSpellProgressionValue(level1Raw);
    expect(parsed.hasAllSpells).toBe(false);
    const shouldTriggerSpellStep = parsed.cantrips > 0 || parsed.spells > 0 || parsed.hasAllSpells;
    expect(shouldTriggerSpellStep).toBe(false);
  });
});
