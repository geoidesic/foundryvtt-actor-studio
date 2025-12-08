/**
 * Test coverage for subclasses using "Spells Known" scale values (Sorcerer/Bard-style)
 * instead of "Prepared Spells" (Issue #204 comment about custom Eldritch Knight subclass)
 */

import { describe, it, expect, vi } from 'vitest';

// Helper function to parse spell limits from advancement data (copied from spellSelection.js)
function parseSpellLimitsFromAdvancement(subclassItem, level) {
  if (!subclassItem) {
    return null;
  }
  
  // Try multiple possible locations for the advancement data
  let byLevel = null;
  let levelAdvancements = null;
  
  // Method 1: Check document.advancement.byLevel (new D&D 5e structure)
  if (subclassItem.document?.advancement?.byLevel) {
    byLevel = subclassItem.document.advancement.byLevel;
    levelAdvancements = byLevel[level];
  }
  // Method 2: Check direct advancement.byLevel (alternative structure)
  else if (subclassItem.advancement?.byLevel) {
    byLevel = subclassItem.advancement.byLevel;
    levelAdvancements = byLevel[level];
  }
  // Method 3: Check system.advancement.byLevel (system structure)
  else if (subclassItem.system?.advancement?.byLevel) {
    byLevel = subclassItem.system.advancement.byLevel;
    levelAdvancements = byLevel[level];
  }
  
  if (byLevel && levelAdvancements !== undefined) {
    if (Array.isArray(levelAdvancements)) {
      let cantrips = 0;
      let spells = 0;
      
      for (const advancement of levelAdvancements) {
        if (advancement.type === 'ScaleValue' && advancement.title) {
          const title = advancement.title.toLowerCase();
          
          if (title.includes('cantrip')) {
            // For cantrips, it's usually a fixed value, not a scale
            cantrips = parseInt(advancement.value) || 0;
          } else if (title.includes('spell')) {
            // For spells (prepared or known), it's a scale value array
            if (advancement.levels && Array.isArray(advancement.levels)) {
              // The levels array is 0-indexed, so level 3 (first level of spellcasting) is index 0
              const levelIndex = level - 3; // Eldritch Knight starts at level 3
              if (levelIndex >= 0 && levelIndex < advancement.levels.length) {
                spells = advancement.levels[levelIndex];
              }
            }
          }
        }
      }
      
      // Fallback for cantrips if not found in advancement data
      // Eldritch Knight gets 2 cantrips at level 3 according to the description
      if (cantrips === 0 && level >= 3) {
        cantrips = 2;
      }
      
      if (cantrips > 0 || spells > 0) {
        return { cantrips, spells, hasAllSpells: false };
      }
    }
  }
  
  return null;
}

describe('Spells Known Scale Values (Sorcerer/Bard-style subclasses)', () => {
  
  it('should parse "Spells Known" scale value advancement', () => {
    const mockSubclass = {
      type: 'subclass',
      name: 'Custom Fighter Subclass',
      system: {
        advancement: {
          byLevel: {
            3: [{
              type: 'ScaleValue',
              title: 'Spells Known',
              levels: [2, 3, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
            }, {
              type: 'ScaleValue',
              title: 'Cantrips Known',
              value: 2
            }]
          }
        }
      }
    };

    const result = parseSpellLimitsFromAdvancement(mockSubclass, 3);
    
    expect(result.cantrips).toBe(2);
    expect(result.spells).toBe(2); // First value in levels array (index 0 for level 3)
    expect(result.hasAllSpells).toBe(false);
  });

  it('should handle "Cantrips Known" scale value', () => {
    const mockSubclass = {
      type: 'subclass',
      name: 'Custom Subclass',
      system: {
        advancement: {
          byLevel: {
            3: [{
              type: 'ScaleValue',
              title: 'Cantrips Known',
              value: 3
            }]
          }
        }
      }
    };

    const result = parseSpellLimitsFromAdvancement(mockSubclass, 3);
    
    expect(result.cantrips).toBe(3);
  });

  it('should parse "Spells Known" at higher levels', () => {
    // Create advancement data for all levels from 3-20
    const byLevelData = {};
    const spellsKnownProgression = [2, 3, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
    
    for (let level = 3; level <= 20; level++) {
      byLevelData[level] = [{
        type: 'ScaleValue',
        title: 'Spells Known',
        levels: spellsKnownProgression
      }];
    }
    
    const mockSubclass = {
      type: 'subclass',
      name: 'Custom Fighter Subclass',
      system: {
        advancement: {
          byLevel: byLevelData
        }
      }
    };

    // Level 7 should be index 4 (7-3) = 4 spells known
    const resultLevel7 = parseSpellLimitsFromAdvancement(mockSubclass, 7);
    expect(resultLevel7.spells).toBe(4);

    // Level 10 should be index 7 (10-3) = 6 spells known
    const resultLevel10 = parseSpellLimitsFromAdvancement(mockSubclass, 10);
    expect(resultLevel10.spells).toBe(6);
  });

  it('should still work with "Prepared Spells" (backward compatibility)', () => {
    const mockSubclass = {
      type: 'subclass',
      name: 'Standard Eldritch Knight',
      system: {
        advancement: {
          byLevel: {
            3: [{
              type: 'ScaleValue',
              title: 'Prepared Spells',
              levels: [3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13, 13, 14, 15]
            }]
          }
        }
      }
    };

    const result = parseSpellLimitsFromAdvancement(mockSubclass, 3);
    
    expect(result.spells).toBe(3); // First value in levels array
  });

  it('should match any variation with "spell" in the title', () => {
    const variations = [
      'Spells Known',
      'Prepared Spells', 
      'Known Spells',
      'Spell Selection'
    ];

    variations.forEach(title => {
      const mockSubclass = {
        type: 'subclass',
        name: 'Test Subclass',
        system: {
          advancement: {
            byLevel: {
              3: [{
                type: 'ScaleValue',
                title: title,
                levels: [2, 3, 4, 5]
              }]
            }
          }
        }
      };

      const result = parseSpellLimitsFromAdvancement(mockSubclass, 3);
      expect(result.spells).toBe(2); // Should parse all variations
    });
  });
});
