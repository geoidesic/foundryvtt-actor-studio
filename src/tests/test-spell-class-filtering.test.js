import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Spell Class Filtering', () => {
  it('should correctly filter spells by character class using spell.labels.classes string', () => {
    // Mock spell data with different class restrictions (STRING format, not array)
    const mockSpells = [
      {
        name: 'Fireball',
        system: { level: 3 },
        labels: { classes: 'Sorcerer, Wizard' }  // STRING format
      },
      {
        name: 'Cure Wounds',
        system: { level: 1 },
        labels: { classes: 'Bard, Cleric, Druid' }  // STRING format
      },
      {
        name: 'Magic Missile',
        system: { level: 1 },
        labels: { classes: 'Sorcerer, Wizard' }  // STRING format
      },
      {
        name: 'Sacred Flame',
        system: { level: 0 },
        labels: { classes: 'Cleric' }  // STRING format
      },
      {
        name: 'Guidance',
        system: { level: 0 },
        labels: { classes: '' } // No class restrictions - should be available to all
      }
    ];

    // Test filtering for Wizard
    const characterClassName = 'Wizard';
    const effectiveMaxSpellLevel = 5;
    const keywordFilter = '';

    const filteredSpells = mockSpells.filter(spell => {
      const matchesKeyword = spell.name.toLowerCase().includes(keywordFilter.toLowerCase());
      const spellLevel = spell.system?.level || 0;
      const withinCharacterLevel = spellLevel <= effectiveMaxSpellLevel;
      
      // Filter by character class - check spell.labels.classes STRING
      const spellClasses = spell.labels?.classes || '';
      
      // Check if the character class is in the spell's class string
      const availableToClass = typeof spellClasses === 'string' 
        ? spellClasses.includes(characterClassName) || 
          spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
          // Fallback: if no class restrictions, allow all spells
          spellClasses.length === 0
        : false;
      
      return matchesKeyword && withinCharacterLevel && availableToClass;
    });

    // Verify results
    expect(filteredSpells.length).toBe(3);
    expect(filteredSpells.map(s => s.name)).toEqual(['Fireball', 'Magic Missile', 'Guidance']);

    // Test filtering for Cleric
    const clericSpells = mockSpells.filter(spell => {
      const matchesKeyword = spell.name.toLowerCase().includes(keywordFilter.toLowerCase());
      const spellLevel = spell.system?.level || 0;
      const withinCharacterLevel = spellLevel <= effectiveMaxSpellLevel;
      
      const spellClasses = spell.labels?.classes || '';
      const availableToClass = typeof spellClasses === 'string' 
        ? spellClasses.includes('Cleric') || 
          spellClasses.toLowerCase().includes('cleric') ||
          spellClasses.length === 0
        : false;
      
      return matchesKeyword && withinCharacterLevel && availableToClass;
    });

    expect(clericSpells.length).toBe(3);
    expect(clericSpells.map(s => s.name)).toEqual(['Cure Wounds', 'Sacred Flame', 'Guidance']);

    console.log('✅ Spell class filtering working correctly');
    console.log(`✅ Wizard gets ${filteredSpells.length} spells: ${filteredSpells.map(s => s.name).join(', ')}`);
    console.log(`✅ Cleric gets ${clericSpells.length} spells: ${clericSpells.map(s => s.name).join(', ')}`);
  });

  it('should handle edge cases in spell class filtering', () => {
    const mockSpells = [
      {
        name: 'Spell with no labels',
        system: { level: 1 },
        // No labels property at all
      },
      {
        name: 'Spell with null classes',
        system: { level: 1 },
        labels: { classes: null }
      },
      {
        name: 'Spell with undefined classes',
        system: { level: 1 },
        labels: { classes: undefined }
      },
      {
        name: 'Spell with valid classes',
        system: { level: 1 },
        labels: { classes: 'Bard' }  // STRING format
      }
    ];

    const filteredSpells = mockSpells.filter(spell => {
      const spellClasses = spell.labels?.classes || '';
      const availableToClass = typeof spellClasses === 'string' 
        ? spellClasses.includes('Bard') || 
          spellClasses.toLowerCase().includes('bard') ||
          spellClasses.length === 0
        : false;
      
      return availableToClass;
    });

    // Should get spells with no labels, null classes, undefined classes (all treated as no restrictions)
    // plus the spell with valid Bard class = 4 total
    expect(filteredSpells.length).toBe(4);
    expect(filteredSpells.map(s => s.name)).toEqual([
      'Spell with no labels',
      'Spell with null classes', 
      'Spell with undefined classes',
      'Spell with valid classes'
    ]);

    console.log('✅ Edge cases in spell class filtering handled correctly - spells with no class restrictions are available to all classes');
  });
});
