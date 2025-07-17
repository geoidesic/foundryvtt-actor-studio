/**
 * Test for Magic Initiate feat spell selection fix
 * This test verifies that the Magic Initiate feat properly triggers spell selection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock FoundryVTT globals first
global.game = {
  settings: {
    get: vi.fn((module, key) => {
      if (key === 'enableSpellSelection') return true;
      return true;
    })
  },
  i18n: {
    localize: vi.fn((key) => key)
  }
};

global.window = global;
global.window.GAS = {
  log: {
    d: vi.fn(),
    w: vi.fn(),
    e: vi.fn()
  }
};

// Mock imports
const { parseFeatSpellRequirements, shouldShowFeatSpellSelection } = await import('~/src/helpers/FeatSpellParser.js');

describe('Magic Initiate Feat Fix', () => {
  
  it('should parse Magic Initiate feat correctly and trigger spell selection', () => {
    // Mock a character with Magic Initiate feat
    const mockFeats = [
      {
        _id: 'magic-initiate-id',
        name: 'Magic Initiate (Wizard)',
        type: 'feat',
        system: {
          description: {
            value: '<p>Choose two cantrips and one 1st-level spell from the Wizard spell list. You learn those spells and can cast the 1st-level spell once per long rest.</p>'
          }
        }
      }
    ];
    
    const mockActor = {
      id: 'test-actor',
      name: 'Test Fighter',
      items: mockFeats
    };
    
    // Test feat parsing
    const requirements = parseFeatSpellRequirements(mockFeats);
    console.log('Magic Initiate requirements:', requirements);
    
    expect(requirements).toHaveLength(1);
    expect(requirements[0].featName).toBe('Magic Initiate (Wizard)');
    expect(requirements[0].type).toBe('magic-initiate');
    expect(requirements[0].choiceCount).toBe(3); // 2 cantrips + 1 spell
    expect(requirements[0].spellSources).toContain('wizard');
    
    // Test that shouldShowFeatSpellSelection returns true
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    console.log('Should show feat spell selection:', shouldShow);
    
    expect(shouldShow).toBe(true);
  });
  
  it('should handle Magic Initiate with D&D 2024 format correctly', () => {
    // Mock D&D 2024 style Magic Initiate feat
    const mockFeats = [
      {
        _id: 'magic-initiate-2024',
        name: 'Magic Initiate',
        type: 'feat',
        system: {
          description: {
            value: '<p>You have learned some spells associated with a particular tradition of magic. Choose a class: @UUID[Compendium.dnd5e.classfeatures.Item.BJdg5XDHw1WQhYA8]{Bard}, @UUID[Compendium.dnd5e.classfeatures.Item.mwUqb1Kn6y6Pqveh]{Cleric}, @UUID[Compendium.dnd5e.classfeatures.Item.7x7pSL7yCCK4eEhF]{Druid}, @UUID[Compendium.dnd5e.classfeatures.Item.XgCwxJsYPd42G9Y8]{Sorcerer}, @UUID[Compendium.dnd5e.classfeatures.Item.PgG5L8D9FtjXL6CU]{Warlock}, or @UUID[Compendium.dnd5e.classfeatures.Item.mhjJIYt9Wlx5eJgR]{Wizard}. You learn two cantrips and one 1st-level spell of your choice from that class\'s spell list. You can cast the spell once without expending a spell slot, and you regain the ability to do so when you finish a long rest.</p>'
          }
        }
      }
    ];
    
    const mockActor = {
      id: 'test-actor-2024',
      name: 'Test Fighter 2024',
      items: mockFeats
    };
    
    // Test feat parsing for D&D 2024 format
    const requirements = parseFeatSpellRequirements(mockFeats);
    console.log('D&D 2024 Magic Initiate requirements:', requirements);
    
    // Should still be detected as requiring spell selection
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    console.log('Should show spell selection (2024):', shouldShow);
    
    expect(shouldShow).toBe(true);
    
    // Even if parsing fails to extract class, it should still show something
    expect(requirements.length).toBeGreaterThan(0);
  });
  
  it('should handle Telekinetic feat with fixed spells correctly', () => {
    // Mock Telekinetic feat that grants fixed spells
    const mockFeats = [
      {
        _id: 'telekinetic-id',
        name: 'Telekinetic',
        type: 'feat',
        system: {
          description: {
            value: '<p>You learn to move things with your mind. You gain the following benefits:</p><ul><li>You learn the Mage Hand cantrip.</li></ul>'
          }
        }
      }
    ];
    
    const mockActor = {
      id: 'test-actor-telekinetic',
      name: 'Test Fighter with Telekinetic',
      items: mockFeats
    };
    
    // Test feat parsing
    const requirements = parseFeatSpellRequirements(mockFeats);
    console.log('Telekinetic requirements:', requirements);
    
    expect(requirements).toHaveLength(1);
    expect(requirements[0].featName).toBe('Telekinetic');
    expect(requirements[0].type).toBe('telekinetic');
    expect(requirements[0].fixedSpells).toContain('Mage Hand');
    expect(requirements[0].choiceCount).toBe(0); // No choices, just fixed spell
    
    // Test that shouldShowFeatSpellSelection returns true even for fixed spells
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    console.log('Should show feat spell selection (fixed):', shouldShow);
    
    expect(shouldShow).toBe(true);
  });
  
  it('should demonstrate our FeatSpells component fix handles both types', () => {
    // Mock both types of feats together
    const mockFeats = [
      {
        _id: 'magic-initiate-id',
        name: 'Magic Initiate (Wizard)',
        type: 'feat',
        system: {
          description: {
            value: '<p>Choose two cantrips and one 1st-level spell from the Wizard spell list.</p>'
          }
        }
      },
      {
        _id: 'telekinetic-id',
        name: 'Telekinetic',
        type: 'feat',
        system: {
          description: {
            value: '<p>You learn the Mage Hand cantrip.</p>'
          }
        }
      }
    ];
    
    const mockActor = {
      id: 'test-actor-both',
      name: 'Test Fighter with Multiple Feats',
      items: mockFeats
    };
    
    // Test feat parsing
    const requirements = parseFeatSpellRequirements(mockFeats);
    console.log('Multiple feat requirements:', requirements);
    
    expect(requirements).toHaveLength(2);
    
    // One should have choices, one should have fixed spells
    const magicInitiate = requirements.find(r => r.type === 'magic-initiate');
    const telekinetic = requirements.find(r => r.type === 'telekinetic');
    
    expect(magicInitiate.choiceCount).toBeGreaterThan(0);
    expect(telekinetic.choiceCount).toBe(0);
    expect(telekinetic.fixedSpells.length).toBeGreaterThan(0);
    
    // Should show spell selection for both
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    console.log('Should show spell selection (both types):', shouldShow);
    
    expect(shouldShow).toBe(true);
  });
});
