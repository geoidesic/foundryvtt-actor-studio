import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for tcr-main-module compatibility: spell class filtering via item flags
 * for D&D 5e v3.x (FoundryVTT V12, D&D 3.3.1).
 *
 * tcr-main-module stores `flags["tcr-main-module"]["spellClasses"]` on spell items
 * as an object where keys are class/subclass UUIDs and values are document names:
 *   { "Compendium.dnd5e.classes.Item.XXXXX": "Wizard", ... }
 *
 * Spells with no TCR flag (or an empty flag object) have no class restriction
 * and should be available to all classes.
 */
describe('tcr-main-module spell class flag filtering', () => {
  const WIZARD_UUID = 'Compendium.dnd5e.classes.Item.wizard-uuid-001';
  const CLERIC_UUID = 'Compendium.dnd5e.classes.Item.cleric-uuid-002';
  const BARD_UUID   = 'Compendium.dnd5e.classes.Item.bard-uuid-003';
  const SUBCLASS_UUID = 'Compendium.dnd5e.subclasses.Item.evocation-uuid-004';

  // Simulate the flag-based filtering logic extracted from loadAvailableSpells
  function filterSpellsByTCRFlag(docs, classUuidsToCheck) {
    const uuidSet = new Set(classUuidsToCheck);
    return docs.filter(doc => {
      if (doc.type !== 'spell') return false;
      const tcrSpellClasses = doc.flags?.['tcr-main-module']?.spellClasses;
      if (!tcrSpellClasses || Object.keys(tcrSpellClasses).length === 0) {
        // No restriction – include for all classes
        return true;
      }
      if (uuidSet.size === 0) {
        // No character class UUID known – include to avoid empty list
        return true;
      }
      return [...uuidSet].some(uuid => uuid in tcrSpellClasses);
    });
  }

  const mockSpells = [
    {
      id: '1', name: 'Fireball', type: 'spell',
      flags: { 'tcr-main-module': { spellClasses: { [WIZARD_UUID]: 'Wizard' } } },
      system: { level: 3, school: 'evo' }
    },
    {
      id: '2', name: 'Cure Wounds', type: 'spell',
      flags: { 'tcr-main-module': { spellClasses: { [CLERIC_UUID]: 'Cleric', [BARD_UUID]: 'Bard' } } },
      system: { level: 1, school: 'evo' }
    },
    {
      id: '3', name: 'Magic Missile', type: 'spell',
      flags: { 'tcr-main-module': { spellClasses: { [WIZARD_UUID]: 'Wizard' } } },
      system: { level: 1, school: 'evo' }
    },
    {
      id: '4', name: 'Guidance', type: 'spell',
      flags: {},  // No TCR flag – available to all
      system: { level: 0, school: 'div' }
    },
    {
      id: '5', name: 'Sacred Flame', type: 'spell',
      flags: { 'tcr-main-module': { spellClasses: {} } }, // Empty object – available to all
      system: { level: 0, school: 'evo' }
    },
    {
      id: '6', name: 'Evocation Special', type: 'spell',
      flags: { 'tcr-main-module': { spellClasses: { [SUBCLASS_UUID]: 'School of Evocation' } } },
      system: { level: 2, school: 'evo' }
    },
    {
      id: '7', name: 'Non-spell item', type: 'weapon',
      flags: {},
      system: { level: 0 }
    }
  ];

  it('should show only Wizard spells and unrestricted spells for a Wizard character', () => {
    const result = filterSpellsByTCRFlag(mockSpells, [WIZARD_UUID]);
    const names = result.map(s => s.name);
    expect(names).toContain('Fireball');
    expect(names).toContain('Magic Missile');
    expect(names).toContain('Guidance');       // No TCR flag → all classes
    expect(names).toContain('Sacred Flame');   // Empty flag object → all classes
    expect(names).not.toContain('Cure Wounds');
    expect(names).not.toContain('Evocation Special');
    expect(names).not.toContain('Non-spell item');
    expect(result.length).toBe(4);
  });

  it('should show only Cleric spells and unrestricted spells for a Cleric character', () => {
    const result = filterSpellsByTCRFlag(mockSpells, [CLERIC_UUID]);
    const names = result.map(s => s.name);
    expect(names).toContain('Cure Wounds');
    expect(names).toContain('Guidance');
    expect(names).toContain('Sacred Flame');
    expect(names).not.toContain('Fireball');
    expect(names).not.toContain('Magic Missile');
    expect(result.length).toBe(3);
  });

  it('should include subclass spells when the character subclass UUID is provided', () => {
    // Wizard + Evocation subclass
    const result = filterSpellsByTCRFlag(mockSpells, [WIZARD_UUID, SUBCLASS_UUID]);
    const names = result.map(s => s.name);
    expect(names).toContain('Fireball');
    expect(names).toContain('Magic Missile');
    expect(names).toContain('Evocation Special'); // matched via subclass UUID
    expect(names).toContain('Guidance');
    expect(names).toContain('Sacred Flame');
    expect(names).not.toContain('Cure Wounds');
    expect(result.length).toBe(5);
  });

  it('should return all spells (no filtering) when no class UUIDs are known', () => {
    // When classUuidsToCheck is empty we include all spells rather than showing nothing
    const result = filterSpellsByTCRFlag(mockSpells, []);
    const spells = result.filter(d => d.type === 'spell');
    expect(spells.length).toBe(mockSpells.filter(d => d.type === 'spell').length);
  });

  it('should treat spells with no TCR flag as unrestricted (available to all classes)', () => {
    const guidanceOnly = [
      { id: 'g', name: 'Guidance', type: 'spell', flags: {}, system: { level: 0 } }
    ];
    const result = filterSpellsByTCRFlag(guidanceOnly, [WIZARD_UUID]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Guidance');
  });

  it('should treat spells with an empty spellClasses object as unrestricted', () => {
    const spell = [
      { id: 's', name: 'Sacred Flame', type: 'spell',
        flags: { 'tcr-main-module': { spellClasses: {} } },
        system: { level: 0 } }
    ];
    const result = filterSpellsByTCRFlag(spell, [WIZARD_UUID]);
    expect(result.length).toBe(1);
  });

  it('should filter out non-spell items regardless of flags', () => {
    const result = filterSpellsByTCRFlag(mockSpells, [WIZARD_UUID]);
    expect(result.every(d => d.type === 'spell')).toBe(true);
  });

  it('should handle sourceId aliases for the same class (e.g. embedded actor items)', () => {
    // When a class is embedded in an actor its UUID changes to Actor.X.Item.Y,
    // but the original compendium UUID may be stored in flags.core.sourceId.
    // Callers should add both UUIDs to the set; the filtering itself just checks membership.
    const embeddedWizardUUID = 'Actor.abc123.Item.def456'; // actor-embedded UUID
    // The spell still carries the original compendium UUID as the key
    const spells = [
      { id: '1', name: 'Fireball', type: 'spell',
        flags: { 'tcr-main-module': { spellClasses: { [WIZARD_UUID]: 'Wizard' } } },
        system: { level: 3 } }
    ];
    // If we only pass the embedded UUID (no compendium UUID) it won't match
    expect(filterSpellsByTCRFlag(spells, [embeddedWizardUUID]).length).toBe(0);
    // If we also include the compendium UUID (from flags.core.sourceId) it matches
    expect(filterSpellsByTCRFlag(spells, [embeddedWizardUUID, WIZARD_UUID]).length).toBe(1);
  });
});
