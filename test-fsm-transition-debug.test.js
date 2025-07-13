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
      d: (...args) => console.log('[WORKFLOW LOG]', ...args),
      e: (...args) => console.error('[WORKFLOW ERROR]', ...args)
    }
  }
};

describe('FSM Transition Debug', () => {
  let mockWritable;
  
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
      actorInGame: mockWritable(null),
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

  it('should debug the transition function directly', async () => {
    const { createWorkflowStateMachine, WORKFLOW_EVENTS, workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    console.log('[DEBUG] Imported functions, creating FSM...');
    
    // Create FSM
    const fsm = createWorkflowStateMachine();
    
    console.log('[DEBUG] FSM created, current state:', fsm.getCurrentState());
    
    // Test the _shouldShowShopping function directly
    console.log('[DEBUG] workflowFSMContext._shouldShowShopping:', workflowFSMContext._shouldShowShopping);
    console.log('[DEBUG] Calling _shouldShowShopping():', workflowFSMContext._shouldShowShopping());
    
    // Set up test context
    const testContext = {
      ...workflowFSMContext,
      actor: { 
        name: 'Test Fighter', 
        classes: { 
          fighter: { 
            system: { 
              spellcasting: { progression: 'none' } 
            } 
          } 
        } 
      }
    };
    
    console.log('[DEBUG] Test context _shouldShowShopping:', testContext._shouldShowShopping());
    console.log('[DEBUG] Test context _shouldShowSpellSelection:', testContext._shouldShowSpellSelection(testContext.actor, testContext));
    
    // Navigate to selecting_equipment
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    console.log('[DEBUG] After START_CHARACTER_CREATION:', fsm.getCurrentState());
    
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    console.log('[DEBUG] After CHARACTER_CREATED:', fsm.getCurrentState());
    
    // Wait for automatic transition to selecting_equipment
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('[DEBUG] After delay:', fsm.getCurrentState());
    
    expect(fsm.getCurrentState()).toBe('selecting_equipment');
    
    // Now try the transition
    console.log('[DEBUG] About to handle EQUIPMENT_COMPLETE with context...');
    try {
      fsm.handle(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, testContext);
      console.log('[DEBUG] Event handled successfully, new state:', fsm.getCurrentState());
      console.log('[DEBUG] typeof new state:', typeof fsm.getCurrentState());
      
      // Wait a moment to see if the state changes
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[DEBUG] After delay, new state:', fsm.getCurrentState());
      
      if (typeof fsm.getCurrentState() === 'string') {
        expect(fsm.getCurrentState()).toBe('shopping');
      } else {
        console.log('[DEBUG] State is still a function, this indicates an issue with Finity configuration');
        expect(true).toBe(false); // Force test failure to highlight the issue
      }
    } catch (error) {
      console.log('[DEBUG] Error handling event:', error.message);
      console.log('[DEBUG] Error stack:', error.stack);
    }
  });
});
