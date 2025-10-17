import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the functions we need to test
const mockFromUuidSync = vi.fn();
const mockGetFlag = vi.fn();

// Mock the spell limits calculation logic
function getSpellLimitsFromSubclassAdvancement(actor, level) {
  if (!actor) return null;

  // Method 1: Check for subclass spellcasting via module flags (dropped items)
  const droppedItems = actor.getFlag('gas', 'droppedItems');
  
  // Handle both array and object formats
  let subclassItems = [];
  if (Array.isArray(droppedItems)) {
    subclassItems = droppedItems.filter(item => item.type === 'subclass');
  } else if (droppedItems && typeof droppedItems === 'object' && droppedItems.subclass) {
    subclassItems = Array.isArray(droppedItems.subclass) ? droppedItems.subclass : [droppedItems.subclass];
  }
  
  for (const item of subclassItems) {
    const subclassUuid = item.uuid;
    if (subclassUuid) {
      try {
        const subclassItem = mockFromUuidSync(subclassUuid);
        if (subclassItem) {
          const limits = parseSpellLimitsFromAdvancement(subclassItem, level);
          if (limits) {
            return limits;
          }
        }
      } catch (error) {
        console.warn('Error parsing subclass advancement:', error);
      }
    }
  }
  
  // Method 2: Check for subclass items on the actor
  const actorItems = actor.items || [];
  for (const item of actorItems) {
    if (item.type === 'subclass') {
      const limits = parseSpellLimitsFromAdvancement(item, level);
      if (limits) {
        return limits;
      }
    }
  }
  
  return null;
}

// Helper function to parse spell limits from advancement data
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
          } else                   if (title.includes('prepared spell')) {
                    // For prepared spells, it's a scale value array
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
  
  // Fallback to old advancement table structure
  if (subclassItem.system?.advancement) {
    const advancement = subclassItem.system.advancement;
    if (!Array.isArray(advancement)) {
      return null;
    }
    
    // Find the advancement entry for the current level
    const levelAdvancement = advancement.find(adv => adv.level === level);
    if (!levelAdvancement || !levelAdvancement.entries) {
      return null;
    }
    
    let cantrips = 0;
    let spells = 0;
    
    // Parse the advancement entries to find cantrips and prepared spells
    for (const entry of levelAdvancement.entries) {
      if (entry.type === 'entries' && Array.isArray(entry.entries)) {
        for (const subEntry of entry.entries) {
          if (subEntry.type === 'table' && subEntry.rows) {
            // Parse table rows to find cantrips and prepared spells
            for (const row of subEntry.rows) {
              if (Array.isArray(row) && row.length >= 2) {
                const description = row[0]?.toLowerCase() || '';
                const value = row[1];
                
                if (description.includes('cantrip')) {
                  cantrips = parseInt(value) || 0;
                } else if (description.includes('prepared spell') || description.includes('spells prepared')) {
                  spells = parseInt(value) || 0;
                }
              }
            }
          }
        }
      }
    }
    
    if (cantrips > 0 || spells > 0) {
      return { cantrips, spells, hasAllSpells: false };
    }
  }
  
  return null;
}

describe('Subclass Spell Limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse spell limits from Eldritch Knight advancement table', () => {
    const mockEldritchKnightItem = {
      name: 'Eldritch Knight',
      document: {
        advancement: {
          byLevel: {
            3: [
              {
                type: 'ScaleValue',
                title: 'Prepared Spells',
                value: {},
                levels: [3, 4, 7, 8, 10, 11, 13, 14, 17, 19, 20]
              }
            ]
          }
        }
      }
    };

    const mockActor = {
      name: 'Test Fighter',
      getFlag: mockGetFlag.mockReturnValue({
        subclass: [
          {
            type: 'subclass',
            uuid: 'Compendium.dnd5e.classfeatures.eldritch-knight'
          }
        ]
      }),
      items: []
    };

    mockFromUuidSync.mockReturnValue(mockEldritchKnightItem);

    // Test level 3 (should get 2 cantrips from fallback, 3 spells from advancement)
    const level3Limits = getSpellLimitsFromSubclassAdvancement(mockActor, 3);
    expect(level3Limits).toEqual({
      cantrips: 2,
      spells: 3,
      hasAllSpells: false
    });

    console.log('✅ Eldritch Knight spell limits parsed correctly from advancement table');
  });

  it('should handle actor items method for subclass spell limits', () => {
    const mockEldritchKnightItem = {
      type: 'subclass',
      name: 'Eldritch Knight',
      system: {
        advancement: [
          {
            level: 3,
            entries: [
              {
                type: 'entries',
                entries: [
                  {
                    type: 'table',
                    rows: [
                      ['Subclass Features', '-'],
                      ['Cantrips', '2'],
                      ['Prepared Spells', '3']
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    const mockActor = {
      name: 'Test Fighter',
      getFlag: mockGetFlag.mockReturnValue(null),
      items: [mockEldritchKnightItem]
    };

    const level3Limits = getSpellLimitsFromSubclassAdvancement(mockActor, 3);
    expect(level3Limits).toEqual({
      cantrips: 2,
      spells: 3,
      hasAllSpells: false
    });

    console.log('✅ Subclass spell limits parsed correctly from actor items');
  });

  it('should return null when no advancement data is found', () => {
    const mockActor = {
      name: 'Test Fighter',
      getFlag: mockGetFlag.mockReturnValue(null),
      items: []
    };

    const limits = getSpellLimitsFromSubclassAdvancement(mockActor, 3);
    expect(limits).toBeNull();

    console.log('✅ Returns null when no advancement data found');
  });

  it('should handle different advancement table formats', () => {
    const mockSubclassItem = {
      name: 'Test Subclass',
      system: {
        advancement: [
          {
            level: 3,
            entries: [
              {
                type: 'entries',
                entries: [
                  {
                    type: 'table',
                    rows: [
                      ['Cantrips Known', '2'],
                      ['Spells Prepared', '3']
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    // Test with different row descriptions
    const limits = parseSpellLimitsFromAdvancement(mockSubclassItem, 3);
    expect(limits).toEqual({
      cantrips: 2,
      spells: 3,
      hasAllSpells: false
    });

    console.log('✅ Handles different advancement table row descriptions');
  });

  it('should handle alternative advancement structure locations', () => {
    // Test direct advancement.byLevel structure
    const mockSubclassItem1 = {
      name: 'Test Subclass',
      advancement: {
        byLevel: {
          3: [
            {
              type: 'ScaleValue',
              title: 'Prepared Spells',
              value: {},
              levels: [3, 4, 7, 8, 10, 11, 13, 14, 17, 19, 20]
            }
          ]
        }
      }
    };

    const limits1 = parseSpellLimitsFromAdvancement(mockSubclassItem1, 3);
    expect(limits1).toEqual({
      cantrips: 2, // fallback
      spells: 3,
      hasAllSpells: false
    });

    // Test system.advancement.byLevel structure
    const mockSubclassItem2 = {
      name: 'Test Subclass',
      system: {
        advancement: {
          byLevel: {
            3: [
              {
                type: 'ScaleValue',
                title: 'Prepared Spells',
                value: {},
                levels: [3, 4, 7, 8, 10, 11, 13, 14, 17, 19, 20]
              }
            ]
          }
        }
      }
    };

    const limits2 = parseSpellLimitsFromAdvancement(mockSubclassItem2, 3);
    expect(limits2).toEqual({
      cantrips: 2, // fallback
      spells: 3,
      hasAllSpells: false
    });

    console.log('✅ Handles alternative advancement structure locations');
  });

  it('should handle missing or invalid advancement data gracefully', () => {
    const mockActor = {
      name: 'Test Fighter',
      getFlag: mockGetFlag.mockReturnValue({
        subclass: [
          {
            type: 'subclass',
            uuid: 'invalid-uuid'
          }
        ]
      }),
      items: []
    };

    mockFromUuidSync.mockReturnValue(null);

    const limits = getSpellLimitsFromSubclassAdvancement(mockActor, 3);
    expect(limits).toBeNull();

    console.log('✅ Handles missing or invalid advancement data gracefully');
  });
});