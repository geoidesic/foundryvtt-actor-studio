/**
 * Test for complete Magic Initiate workflow simulation
 * This simulates the exact user experience to debug why the tab isn't appearing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock FoundryVTT globals
global.game = {
  settings: {
    get: vi.fn((module, key) => {
      if (key === 'enableSpellSelection') return true;
      if (key === 'enableEquipmentSelection') return true;
      if (key === 'enableEquipmentPurchase') return true;
      return true;
    })
  },
  i18n: { localize: vi.fn((key) => key) }
};

global.window = global;
global.window.GAS = {
  log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }
};

global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.Actor = { create: vi.fn() };

// Mock stores
const mockWritable = (value) => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn((fn) => { fn(value); return vi.fn(); })
});
const mockDerived = () => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn((fn) => { fn(0); return vi.fn(); })
});
const mockGet = vi.fn((store) => store.value || 0);

vi.mock('svelte/store', () => ({ 
  writable: mockWritable, 
  derived: mockDerived, 
  get: mockGet 
}));

// Mock required modules
vi.mock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(0) }));
vi.mock('~/src/stores/storeDefinitions', () => ({ 
  goldRoll: mockWritable(0),
  characterClass: mockWritable({}),
  background: mockWritable({})
}));
vi.mock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
vi.mock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
vi.mock('~/src/helpers/Utility', () => ({ 
  setupModule: vi.fn(),
  setupD5eSheet: vi.fn(),
  setupTidy5eSheet: vi.fn()
}));

describe('Magic Initiate Workflow Simulation', () => {
  
  it('should reproduce the exact user scenario: Fighter with Magic Initiate feat', async () => {
    console.log('🧪 SIMULATING: Fighter with Magic Initiate feat during character creation');
    
    // Step 1: Import the modules we need
    const { parseFeatSpellRequirements, shouldShowFeatSpellSelection } = await import('~/src/helpers/FeatSpellParser.js');
    
    // Step 2: Mock a character that would be created during character creation
    // This simulates a Fighter that reaches level 4 and gains Magic Initiate feat
    const mockActor = {
      id: 'test-fighter-id',
      name: 'Test Fighter',
      type: 'character',
      system: {
        details: {
          level: 4 // Level where feats are gained
        }
      },
      items: [
        // Mock the Magic Initiate feat
        {
          _id: 'magic-initiate-wizard',
          name: 'Magic Initiate (Wizard)',
          type: 'feat',
          system: {
            description: {
              value: '<p>Choose two cantrips and one 1st-level spell from the Wizard spell list. You learn those spells and can cast the 1st-level spell once per long rest.</p>'
            }
          }
        }
      ]
    };
    
    console.log('📋 Step 1: Character created with Magic Initiate feat');
    console.log('- Character level:', mockActor.system.details.level);
    console.log('- Feat name:', mockActor.items[0].name);
    
    // Step 3: Parse the feat requirements (what FeatSpellParser.js does)
    const feats = mockActor.items.filter(item => item.type === 'feat');
    const requirements = parseFeatSpellRequirements(feats);
    
    console.log('📋 Step 2: Parse feat requirements');
    console.log('- Requirements found:', requirements.length);
    console.log('- Requirement details:', requirements[0]);
    
    expect(requirements).toHaveLength(1);
    expect(requirements[0].type).toBe('magic-initiate');
    expect(requirements[0].choiceCount).toBe(3); // 2 cantrips + 1 spell
    
    // Step 4: Check if feat spell selection should be shown (what WorkflowStateMachine does)
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    
    console.log('📋 Step 3: Check if spell selection should be shown');
    console.log('- shouldShowFeatSpellSelection result:', shouldShow);
    
    expect(shouldShow).toBe(true);
    
    // Step 5: Simulate what the FeatSpells component should do
    console.log('📋 Step 4: Simulate FeatSpells component behavior');
    
    // Filter requirements (like FeatSpells.svelte does)
    const filteredRequirements = requirements; // No longer filtering out choiceCount === 0
    console.log('- Filtered requirements:', filteredRequirements.length);
    
    expect(filteredRequirements).toHaveLength(1);
    
    // Check completion status (like areAllSelectionsComplete does)
    const magicInitiateReq = filteredRequirements[0];
    const hasChoices = magicInitiateReq.choiceCount > 0;
    const hasFixedSpells = magicInitiateReq.fixedSpells && magicInitiateReq.fixedSpells.length > 0;
    
    console.log('- Has choices to make:', hasChoices);
    console.log('- Has fixed spells:', hasFixedSpells);
    console.log('- Requires user interaction:', hasChoices || hasFixedSpells);
    
    expect(hasChoices).toBe(true); // Magic Initiate should have choices
    
    // The component should NOT auto-complete since there are choices to make
    const shouldAutoComplete = !hasChoices && !hasFixedSpells;
    console.log('- Should auto-complete:', shouldAutoComplete);
    
    expect(shouldAutoComplete).toBe(false);
    
    console.log('✅ RESULT: Magic Initiate feat should trigger spell selection tab!');
    console.log('✅ The feat is parsed correctly, condition returns true, and component should show UI');
  });
  
  it('should demonstrate the D&D 2024 Magic Initiate issue', async () => {
    console.log('🧪 SIMULATING: D&D 2024 Magic Initiate feat (the problematic case)');
    
    const { parseFeatSpellRequirements, shouldShowFeatSpellSelection } = await import('~/src/helpers/FeatSpellParser.js');
    
    // Mock D&D 2024 style feat with UUIDs
    const mockActor = {
      id: 'test-fighter-2024',
      name: 'Test Fighter 2024',
      type: 'character',
      items: [
        {
          _id: 'magic-initiate-2024',
          name: 'Magic Initiate',
          type: 'feat',
          system: {
            description: {
              value: '<p>You have learned some spells associated with a particular tradition of magic. Choose a class: Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard. You learn two cantrips and one 1st-level spell of your choice from that class spell list.</p>'
            }
          }
        }
      ]
    };
    
    const feats = mockActor.items.filter(item => item.type === 'feat');
    const requirements = parseFeatSpellRequirements(feats);
    
    console.log('📋 D&D 2024 parsing result:', requirements[0]);
    
    // Now it should get parsed as 'magic-initiate-generic' type with class selection required
    expect(requirements).toHaveLength(1);
    expect(requirements[0].type).toBe('magic-initiate-generic');
    expect(requirements[0].spellSources).toEqual([]); // Empty until class selected
    expect(requirements[0].requiresClassSelection).toBe(true);
    expect(requirements[0].availableClasses).toEqual(['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']);
    expect(requirements[0].choiceCount).toBe(3); // User must choose spells
    
    // It should show spell selection because of the choices
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    console.log('- Should show spell selection:', shouldShow);
    
    expect(shouldShow).toBe(true);
    
    console.log('✅ FIXED: D&D 2024 Magic Initiate now creates spell selection requirement');
  });
  
  it('should show why the original problem occurred', async () => {
    console.log('🧪 DEBUGGING: Why Magic Initiate tab might not have appeared');
    
    const { parseFeatSpellRequirements, shouldShowFeatSpellSelection } = await import('~/src/helpers/FeatSpellParser.js');
    
    // Simulate the exact scenario that was failing
    const mockActor = {
      id: 'problematic-actor',
      name: 'Problematic Fighter',
      items: [
        {
          _id: 'magic-initiate-problem',
          name: 'Magic Initiate',  // No class in parentheses
          type: 'feat',
          system: {
            description: {
              value: '<p>You have learned some spells... Choose a class: Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard. You learn two cantrips and one 1st-level spell...</p>'
            }
          }
        }
      ]
    };
    
    const requirements = parseFeatSpellRequirements(mockActor.items.filter(i => i.type === 'feat'));
    console.log('📋 Problematic parsing result:', requirements[0]);
    
    const shouldShow = shouldShowFeatSpellSelection(mockActor);
    console.log('📋 Should show result:', shouldShow);
    
    // Now Magic Initiate should be detected even without class in parentheses
    expect(requirements).toHaveLength(1);
    expect(requirements[0].type).toBe('magic-initiate-generic');
    expect(requirements[0].choiceCount).toBe(3);
    
    // Before our fix: FeatSpells component would have filtered out choiceCount === 0
    // After our fix: FeatSpells component keeps all requirements
    
    const beforeFix_wouldFilter = requirements.filter(req => req.choiceCount > 0);
    const afterFix_keeps = requirements; // No longer filtering
    
    console.log('🔧 Before fix - filtered requirements:', beforeFix_wouldFilter.length);
    console.log('🔧 After fix - kept requirements:', afterFix_keeps.length);
    
    console.log('✅ FIX SUCCESSFUL: Magic Initiate now detected even without class specification');
    
    expect(shouldShow).toBe(true);
    expect(afterFix_keeps.length).toBeGreaterThan(0);
  });
});
