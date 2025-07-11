import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowStateMachine, WORKFLOW_EVENTS, WORKFLOW_STATES } from '~/src/helpers/WorkflowStateMachine.js';

// Mock the Svelte stores with simplified return values
vi.mock('~/src/stores/index', () => ({
  preAdvancementSelections: { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() },
  activeTab: { set: vi.fn() },
  tabs: { subscribe: vi.fn(), update: vi.fn() },
  readOnlyTabs: { subscribe: vi.fn(), update: vi.fn() }
}));

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: { subscribe: vi.fn() }
}));

vi.mock('svelte/store', () => {
  const createMockStore = (initialValue) => {
    let value = initialValue;
    return {
      subscribe: vi.fn(),
      set: vi.fn((newValue) => { value = newValue; }),
      update: vi.fn((fn) => { value = fn(value); }),
      get: () => value
    };
  };
  
  return {
    writable: vi.fn(createMockStore),
    get: vi.fn((store) => {
      if (store && store.get) {
        return store.get();
      }
      // Return reasonable defaults for different store types
      return [];
    })
  };
});

describe('Orc Artisan Barbarian Equipment Bug Reproduction', () => {
  let workflowStateMachine;
  let mockGas;
  let mockActor;

  beforeEach(() => {
    // Reset workflow state machine
    workflowStateMachine = new WorkflowStateMachine();
    
    // Mock the global GAS object
    mockGas = {
      debug: true,
      race: "Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000",
      background: "Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000",
      characterClass: "Compendium.dnd-players-handbook.classes.Item.phbbrbBarbarian0",
      close: vi.fn(),
      log: { i: vi.fn(), d: vi.fn(), v: vi.fn(), w: vi.fn(), e: vi.fn() }
    };
    
    global.window = { GAS: mockGas };
    global.GAS = mockGas;

    // Mock actor
    mockActor = {
      name: 'Test Orc Barbarian',
      img: 'icons/svg/mystery-man.svg',
      classes: { barbarian: { identifier: 'barbarian', levels: 1 } }
    };

    // Mock Hooks
    global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };

    // Mock game settings 
    global.game = {
      settings: {
        get: vi.fn((module, setting) => {
          if (module === 'foundryvtt-actor-studio') {
            if (setting === 'enableEquipmentSelection') return false; // This is key - no equipment selection
            if (setting === 'enableEquipmentPurchase') return true; // But shopping is enabled
            if (setting === 'enableSpellSelection') return false;
          }
          return false;
        })
      }
    };
  });

  it('🐛 REPRODUCES BUG: Invalid transition advancements_complete from creating_character', async () => {
    // This test reproduces the exact error from the logs:
    // "Invalid transition: advancements_complete from state creating_character"
    
    console.log('🔍 Reproducing the exact workflow bug...');
    
    // 1. Start in creating_character state (mimicking user starting character creation)
    let result = await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    console.log('✅ State: creating_character');

    // 2. Attempt to call advancements_complete directly from creating_character
    // This is what the AdvancementManager is doing in the bug scenario
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: mockActor });
    
    // This should fail - this IS the bug
    expect(result).toBe(false);
    console.log('❌ BUG REPRODUCED: advancements_complete failed from creating_character state');
    
    // The workflow is still stuck in creating_character state
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    
    // And gas.close is never called because we never reach COMPLETED state
    expect(mockGas.close).not.toHaveBeenCalled();
    console.log('❌ gas.close was NOT called due to failed transition');
  });

  it('✅ SHOWS CORRECT WORKFLOW: Must be in processing_advancements to call advancements_complete', async () => {
    // This test shows the CORRECT sequence that should happen
    
    console.log('🔍 Showing the correct workflow sequence...');
    
    // 1. Start character creation
    let result = await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    console.log('✅ State: creating_character');

    // 2. Character is created - should transition to processing_advancements
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: mockActor });
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);
    console.log('✅ State: processing_advancements');

    // 3. NOW advancements_complete should work
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: mockActor });
    expect(result).toBe(true);
    console.log('✅ advancements_complete succeeded from processing_advancements state');
    
    // Should transition to shopping (since enableEquipmentPurchase is true but enableEquipmentSelection is false)
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SHOPPING);
    console.log('✅ State: shopping (equipment purchase enabled)');
  });

  it('🔧 Verifies Orc Artisan Barbarian configuration triggers equipment purchase', () => {
    // Verify the specific configuration that triggers the bug
    expect(mockGas.race).toBe("Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000");
    expect(mockGas.background).toBe("Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000");
    expect(mockGas.characterClass).toBe("Compendium.dnd-players-handbook.classes.Item.phbbrbBarbarian0");
    
    // This configuration has equipment purchase enabled
    expect(game.settings.get('foundryvtt-actor-studio', 'enableEquipmentPurchase')).toBe(true);
    console.log('✅ Orc Artisan Barbarian configuration verified');
  });
});
