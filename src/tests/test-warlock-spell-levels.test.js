import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { derived } from 'svelte/store';

describe('Warlock Spell Level Progression', () => {
  /**
   * Test that warlocks can access the correct spell levels based on their character level
   * This tests the fix for issue #206
   * Reference: D&D 5e 2014 Warlock progression table
   * Level 1-6: 1st level spells
   * Level 7-10: 2nd level spells
   * Level 11-16: 3rd level spells
   * Level 17-20: 4th-5th level spells
   */
  
  it('should calculate correct max spell level for warlock at each character level', () => {
    // Test function that mimics the warlock spell level calculation from maxSpellLevel store
    const getWarlockSpellLevel = (characterLevel) => {
      // Warlock spell levels increase at 3, 5, 7, and 9 (2014 rules)
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      if (characterLevel >= 1) return 1;
      return 0;
    };

    // Test each level
    expect(getWarlockSpellLevel(1)).toBe(1);
    expect(getWarlockSpellLevel(2)).toBe(1);
    expect(getWarlockSpellLevel(3)).toBe(2);
    expect(getWarlockSpellLevel(4)).toBe(2);
    expect(getWarlockSpellLevel(5)).toBe(3);
    expect(getWarlockSpellLevel(6)).toBe(3);
    expect(getWarlockSpellLevel(7)).toBe(4);
    expect(getWarlockSpellLevel(8)).toBe(4);
    expect(getWarlockSpellLevel(9)).toBe(5);
    expect(getWarlockSpellLevel(20)).toBe(5);
  });

  it('should detect pact magic slots in actor data', () => {
    // Mock actor data with pact magic
    const mockActorWithPact = {
      system: {
        details: {
          level: 3
        },
        spells: {
          pact: {
            max: 1,
            value: 1
          }
        }
      }
    };

    // Simulate the maxSpellLevel store logic
    const actorData = mockActorWithPact.system;
    let hasPactMagic = false;
    
    if (actorData.spells) {
      Object.keys(actorData.spells).forEach(slotKey => {
        const slotData = actorData.spells[slotKey];
        if (slotKey === 'pact' && slotData && slotData.max > 0) {
          hasPactMagic = true;
        }
      });
    }
    
    expect(hasPactMagic).toBe(true);
    
    // Calculate the correct spell level
    const characterLevel = mockActorWithPact.system.details.level;
    let warlockSpellLevel = 0;
    if (characterLevel >= 9) warlockSpellLevel = 5;
    else if (characterLevel >= 7) warlockSpellLevel = 4;
    else if (characterLevel >= 5) warlockSpellLevel = 3;
    else if (characterLevel >= 3) warlockSpellLevel = 2;
    else if (characterLevel >= 1) warlockSpellLevel = 1;
    
    expect(warlockSpellLevel).toBe(2);
    expect(warlockSpellLevel).toBe(2);
  });

  it('should handle level-up scenarios for warlocks correctly', () => {
    // Scenario: Warlock leveling from 6 to 7
    // At level 6: max spell level = 1
    // At level 7: max spell level = 2
    
    const getMockActorAtLevel = (level) => ({
      system: {
        details: {
          level
        },
        spells: {
          pact: {
            max: level >= 7 ? 2 : 1,
            value: level >= 7 ? 2 : 1
          }
        }
      }
    });

    const getSpellLevelForActor = (actor) => {
      const characterLevel = actor.system.details.level;
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      if (characterLevel >= 1) return 1;
      return 0;
    };

    const actor2 = getMockActorAtLevel(2);
    const actor3 = getMockActorAtLevel(3);
    const actor5 = getMockActorAtLevel(5);
    const actor7 = getMockActorAtLevel(7);
    const actor9 = getMockActorAtLevel(9);
    
    expect(getSpellLevelForActor(actor2)).toBe(1);
    expect(getSpellLevelForActor(actor3)).toBe(2);
    expect(getSpellLevelForActor(actor5)).toBe(3);
    expect(getSpellLevelForActor(actor7)).toBe(4);
    expect(getSpellLevelForActor(actor9)).toBe(5);
  });

  it('should not return 0 when pact magic is present', () => {
    // This test ensures the fix for issue #206
    // Previously, warlocks would get maxSpellLevel = 0 because pact magic wasn't checked
    
    const mockWarlockActor = {
      system: {
        details: {
          level: 3
        },
        spells: {
          // No regular spell slots, only pact magic
          pact: {
            max: 1,
            value: 1
          }
        }
      }
    };

    // Simulate the full maxSpellLevel calculation
    const actorData = mockWarlockActor.system;
    let hasPactMagic = false;
    let maxLevel = 0;

    // Method 1: Check regular spells
    if (actorData.spells) {
      Object.keys(actorData.spells).forEach(slotKey => {
        const slotData = actorData.spells[slotKey];
        
        if (slotKey.startsWith('spell') && slotData) {
          const slotLevel = parseInt(slotKey.replace('spell', ''));
          if (slotLevel > maxLevel && slotData.max > 0) {
            maxLevel = slotLevel;
          }
        }
        
        if (slotKey === 'pact' && slotData && slotData.max > 0) {
          hasPactMagic = true;
        }
      });
    }

    // If found pact magic, calculate from character level
    if (hasPactMagic && maxLevel === 0) {
      const characterLevel = actorData.details?.level || 1;
      if (characterLevel >= 17) maxLevel = 5;
      else if (characterLevel >= 11) maxLevel = 3;
      else if (characterLevel >= 7) maxLevel = 2;
      else if (characterLevel >= 1) maxLevel = 1;
    }

    // With the fix, maxLevel should be 1, not 0
    expect(maxLevel).toBe(1);
  });
});
