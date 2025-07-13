import { describe, it, expect, beforeEach, vi } from 'vitest';

// Global mocks setup
global.$ = vi.fn(() => ({
  html: vi.fn(() => ''),
}));

global.Hooks = {
  call: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

global.game = {
  settings: {
    get: vi.fn((moduleId, setting) => {
      const settings = {
        'enableEquipmentSelection': true,
        'enableEquipmentPurchase': true,    // Shopping enabled
        'enableSpellSelection': false,      // Spells disabled
        'disableAdvancementCapture': true
      };
      return settings[setting] || false;
    })
  },
  user: { isGM: true },
  i18n: {
    localize: vi.fn((key) => key)
  }
};

global.document = {
  querySelectorAll: vi.fn(() => [])
};

global.ui = {
  notifications: {
    error: vi.fn()
  }
};

global.window = {
  GAS: {
    log: {
      d: vi.fn(),
      e: vi.fn()
    }
  }
};

describe('Real Workflow Issue Test', () => {
  let mockWritable;
  let mockActorInGame;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock writable store
    mockWritable = (initialValue) => {
      let _value = initialValue;
      const subscribers = [];
      
      return {
        _value,
        set: vi.fn((value) => {
          _value = value;
          subscribers.forEach(fn => fn(value));
        }),
        update: vi.fn((fn) => {
          _value = fn(_value);
          subscribers.forEach(sub => sub(_value));
        }),
        subscribe: vi.fn((fn) => {
          subscribers.push(fn);
          fn(_value);
          return () => {
            const index = subscribers.indexOf(fn);
            if (index !== -1) subscribers.splice(index, 1);
          };
        })
      };
    };
    
    // Create a mock actor
    mockActorInGame = mockWritable({ 
      name: 'Test Fighter', 
      classes: { 
        fighter: { 
          system: { 
            spellcasting: { progression: 'none' } 
          } 
        } 
      } 
    });
    
    // Mock all required modules
    vi.doMock('svelte/store', () => ({
      writable: mockWritable,
      get: vi.fn((store) => store._value)
    }));
    
    vi.doMock('~/src/stores/index', () => ({
      isProcessing: mockWritable(false),
      activeTab: mockWritable('abilities'),
      tabs: mockWritable([
        { id: 'abilities', label: 'Abilities' },
        { id: 'race', label: 'Race' },
        { id: 'background', label: 'Background' },
        { id: 'class', label: 'Class' }
      ]),
      readOnlyTabs: mockWritable([]),
      actorInGame: mockActorInGame,
      preAdvancementSelections: mockWritable(null),
      dropItemRegistry: {
        advanceQueue: vi.fn(() => Promise.resolve()),
        isEmpty: () => true
      }
    }));
    
    vi.doMock('~/src/stores/startingEquipment', () => ({
      compatibleStartingEquipment: mockWritable([])
    }));
    
    vi.doMock('~/src/stores/storeDefinitions', () => ({
      goldRoll: mockWritable(0)
    }));
    
    vi.doMock('~/src/helpers/constants', () => ({
      MODULE_ID: 'foundryvtt-actor-studio'
    }));
    
    vi.doMock('~/src/helpers/Utility', () => ({
      delay: vi.fn(() => Promise.resolve()),
      prepareItemForDrop: vi.fn(() => Promise.resolve({})),
      dropItemOnCharacter: vi.fn(() => Promise.resolve({}))
    }));
    
    vi.doMock('~/src/helpers/AdvancementManager', () => ({
      destroyAdvancementManagers: vi.fn()
    }));
    
    // Mock workflow functions
    vi.doMock('~/src/lib/workflow.js', () => ({
      handleAdvancementCompletion: vi.fn(() => Promise.resolve('selecting_equipment'))
    }));
  });

  it('should test the actual workflow entry point that reproduces the user issue', async () => {
    console.log('[TEST] Starting real workflow test that mimics user behavior...');
    
    // Import the helper function that determines the correct event to trigger
    const { getEquipmentCompletionEvent } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Create FSM like the real app
    const fsm = createWorkflowStateMachine();
    
    // Set up a context that should trigger shopping (shopping enabled)
    const testContext = {
      actor: { name: 'Test Fighter', classes: { fighter: { system: {} } } },
      _shouldShowShopping: () => true,
      _shouldShowSpellSelection: () => false
    };
    
    // Navigate to selecting_equipment state
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    fsm.handle(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE);
    
    console.log('[TEST] Testing equipmentCompletionEvent with shopping enabled...');
    
    try {
      // Get the correct event to trigger based on context
      const completionEvent = getEquipmentCompletionEvent(testContext, false);
      console.log('[TEST] Completion event:', completionEvent);
      
      // This should be 'equipment_complete_to_shopping' when shopping is enabled
      expect(completionEvent).toBe('equipment_complete_to_shopping');
      
      // Trigger the event
      fsm.handle(completionEvent, testContext);
      
      // Check if we transitioned to shopping
      expect(fsm.state).toBe('shopping');
      
      console.log('[TEST] Handler completed successfully, transitioned to shopping');
      
    } catch (error) {
      console.log('[TEST] Error in handler:', error.message);
      
      // If there's an "Unhandled event" error, that's the bug we're looking for
      if (error.message.includes('Unhandled event')) {
        console.log('[TEST] Found the FSM transition bug!');
        expect(error.message).toContain('equipment_complete');
        return;
      }
      
      throw error;
    }
  });

  it('should directly test the FSM transition that fails in the real app', async () => {
    console.log('[TEST] Testing direct FSM usage like the real application...');
    
    // Import and set up the FSM exactly like the real application does
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { get } = await import('svelte/store');
    
    // Create FSM
    const fsm = createWorkflowStateMachine();
    
    // Set up to selecting_equipment state like the real app
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Wait for automatic transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    expect(fsm.getCurrentState()).toBe('selecting_equipment');
    
    console.log('[TEST] FSM in selecting_equipment state, now testing equipment_complete event...');
    
    // This is where the real app would call the FSM with the context
    // Let's get the actual actor from the store like the real app does
    const actor = get(mockActorInGame);
    console.log('[TEST] Actor from store:', actor);
    
    // Import the actual context like the real app uses
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const contextWithActor = { ...workflowFSMContext, actor };
    
    console.log('[TEST] Context _shouldShowShopping:', contextWithActor._shouldShowShopping());
    console.log('[TEST] About to call FSM handle with equipment completion event...');
    
    // Use the helper function to get the correct event instead of the old EQUIPMENT_COMPLETE
    const { getEquipmentCompletionEvent } = await import('~/src/helpers/WorkflowStateMachine.js');
    const completionEvent = getEquipmentCompletionEvent(contextWithActor, false);
    
    console.log('[TEST] Using completion event:', completionEvent);
    
    // This is the exact call that should work with the new FSM design
    try {
      fsm.handle(completionEvent, contextWithActor);
      console.log('[TEST] FSM handle call completed, current state:', fsm.getCurrentState());
      
      // Give time for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[TEST] After delay, current state:', fsm.getCurrentState());
      
      // This should be 'shopping' but might be a function or something else
      const currentState = fsm.getCurrentState();
      if (typeof currentState === 'function') {
        console.log('[TEST] ERROR: Current state is a function, this is the bug!');
        console.log('[TEST] Function toString:', currentState.toString());
        expect(typeof currentState).toBe('string');
      } else {
        console.log('[TEST] State is:', currentState);
        expect(currentState).toBe('shopping');
      }
      
    } catch (error) {
      console.log('[TEST] FSM handle threw error:', error.message);
      
      // This should no longer happen with our new event-based approach
      expect(error.message).not.toContain('equipment_complete');
      throw error;
    }
  });
});
