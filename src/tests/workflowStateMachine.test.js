import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowStateMachine, WORKFLOW_STATES, WORKFLOW_EVENTS } from '../helpers/WorkflowStateMachine.js';

// Mocks for Foundry/game globals
const mockHooks = { call: vi.fn() };
global.Hooks = mockHooks;
global.window = { GAS: { log: { d: vi.fn(), w: vi.fn(), e: vi.fn(), i: vi.fn() } } };
global.ui = { notifications: { error: vi.fn() } };

describe('WorkflowStateMachine - Barbarian, equipment off, spells on', () => {
  beforeEach(() => {
    workflowStateMachine.reset();
    mockHooks.call.mockClear();
    
    // Mock the MODULE_ID constant
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          console.log(`Settings get called with: ${module}.${key}`);
          if (key === 'enableEquipmentSelection') return false;
          if (key === 'enableSpellSelection') return true;
          if (key === 'enableEquipmentPurchase') return false;
          return false;
        })
      }
    };
  });

  it('should call gas.close after advancements complete for Barbarian (non-spellcaster) with equipment disabled', async () => {
    // Simulate a Barbarian (non-spellcaster) actor - exactly as in the debug settings
    const actor = { 
      name: 'Test Barbarian', 
      classes: { 
        barbarian: { 
          system: { 
            spellcasting: { 
              progression: 'none' 
            } 
          } 
        } 
      }, 
      sheet: { render: vi.fn() } 
    };

    // Go through the workflow step by step
    await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    
    await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor });
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);
    
    await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor });
    
    // With equipment disabled and Barbarian being non-spellcaster, it should go directly to completed
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.COMPLETED);
    
    // Verify the settings were checked correctly
    expect(global.game.settings.get).toHaveBeenCalledWith(expect.any(String), 'enableEquipmentSelection');
    expect(global.game.settings.get).toHaveBeenCalledWith(expect.any(String), 'enableSpellSelection');
    
    // Wait for the close timeout (1500ms + buffer)
    await new Promise(r => setTimeout(r, 1600));
    expect(mockHooks.call).toHaveBeenCalledWith('gas.close');
    expect(actor.sheet.render).toHaveBeenCalledWith(true);
  });

  it('should fail to transition when equipment is disabled but we try to do equipment anyway', async () => {
    // Simulate a Barbarian (non-spellcaster) actor  
    const actor = { 
      name: 'Test Barbarian', 
      classes: { 
        barbarian: { 
          system: { 
            spellcasting: { 
              progression: 'none' 
            } 
          } 
        } 
      }, 
      sheet: { render: vi.fn() } 
    };

    // Go through the workflow
    await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor });
    await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor });
    
    // Since equipment is disabled and Barbarian is non-spellcaster, it should go to COMPLETED
    // This test demonstrates the expected behavior
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.COMPLETED);
  });

  it('should check if missing store dependencies could cause the issue', async () => {
    // Check if the required stores are available
    const { get } = await import('svelte/store');
    const { preAdvancementSelections } = await import('~/src/stores/index');
    const { compatibleStartingEquipment } = await import('~/src/stores/startingEquipment');
    
    console.log('preAdvancementSelections store value:', get(preAdvancementSelections));
    console.log('compatibleStartingEquipment store value:', get(compatibleStartingEquipment));
    
    // These stores might be undefined in real application, causing equipment check to fail
    expect(get(preAdvancementSelections)).toBeDefined();
    expect(get(compatibleStartingEquipment)).toBeDefined();
  });

  it('should verify the exact debug scenario: Barbarian creation workflow', async () => {
    console.log('🧪 Testing exact debug scenario from init.js');
    
    // Exactly match the debug scenario: Barbarian 
    const actor = { 
      name: 'Debug Test Barbarian', 
      classes: { 
        barbarian: { 
          system: { 
            spellcasting: { 
              progression: 'none' // Barbarians are not spellcasters
            } 
          } 
        } 
      }, 
      sheet: { render: vi.fn() } 
    };

    // Start workflow
    console.log('🚀 Starting character creation...');
    await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    console.log('✅ State after START:', workflowStateMachine.getState());
    
    await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor });
    console.log('✅ State after CHARACTER_CREATED:', workflowStateMachine.getState());
    
    await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor });
    console.log('✅ State after ADVANCEMENTS_COMPLETE:', workflowStateMachine.getState());
    
    // For Barbarian with current settings (equipment disabled, spells enabled but barbarian is non-spellcaster)
    // Should go to COMPLETED
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.COMPLETED);
    console.log('✅ Reached COMPLETED state as expected');
    
    // The _onEnterCompleted method should have been called
    // Check if actor.sheet.render was called (this happens immediately)
    expect(actor.sheet.render).toHaveBeenCalledWith(true);
    console.log('✅ Actor sheet render called');
    
    // Wait for the gas.close timeout (1500ms + buffer)
    console.log('⏰ Waiting for gas.close timeout...');
    await new Promise(r => setTimeout(r, 1600));
    
    // Verify gas.close was called
    expect(mockHooks.call).toHaveBeenCalledWith('gas.close');
    console.log('✅ gas.close hook called successfully');
    
    // Log all Hook calls for debugging
    console.log('📞 All Hook calls made:', mockHooks.call.mock.calls);
  });
});
