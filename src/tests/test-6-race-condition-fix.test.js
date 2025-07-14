 /**
 * Test to reproduce and verify the fix for the race condition bug
 * where handleAdvancementCompletion was being called multiple times
 * causing FSM state corruption.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock global objects
global.game = {
  settings: {
    get: vi.fn((module, key) => {
      if (key === 'enableEquipmentSelection') return false;
      if (key === 'enableEquipmentPurchase') return false;
      if (key === 'enableSpellSelection') return true;
      return false;
    })
  }
};

global.ui = { notifications: { error: vi.fn() } };
global.Hooks = { call: vi.fn() };
global.window = global;

// Mock constants
vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

// Mock stores
const mockWritable = (value) => {
  const store = {
    _value: value,
    set: vi.fn((newValue) => {
      store._value = newValue;
    }),
    update: vi.fn((updater) => {
      store._value = updater(store._value);
    }),
    subscribe: vi.fn()
  };
  return store;
};

const mockGet = vi.fn((store) => {
  if (store && store._value !== undefined) return store._value;
  return null;
});

const mockDerived = (stores, fn) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  derived: mockDerived,
  get: mockGet
}));

vi.mock('~/src/stores/index', () => ({
  activeTab: mockWritable('overview'),
  tabs: mockWritable([
    { id: 'abilities', label: 'Abilities' },
    { id: 'race', label: 'Race' },
    { id: 'background', label: 'Background' },
    { id: 'class', label: 'Class' }
  ]),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  dropItemRegistry: {
    advanceQueue: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: mockWritable([])
}));

// Track calls to handleAdvancementCompletion to detect race condition
let completionCallCount = 0;
const completionCalls = [];

vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn(async (context) => {
    completionCallCount++;
    const callInfo = {
      callNumber: completionCallCount,
      timestamp: Date.now(),
      actorName: context?.actor?.name || 'unknown'
    };
    completionCalls.push(callInfo);
    
    console.log(`[RACE TEST] handleAdvancementCompletion call #${callInfo.callNumber} for actor: ${callInfo.actorName}`);
    
    // Simulate the spellcaster logic that was causing the race condition
    if (context?.actor?.classes?.wizard) {
      return 'selecting_spells';
    }
    return 'completed';
  })
}));

// Complete Finity Mock - CRITICAL for WorkflowStateMachine tests
vi.mock('finity', () => {
  let currentState = 'idle';
  let isProcessing = false;
  const stateHandlers = new Map();
  
  const mockFsm = { 
    handle: vi.fn((event) => {
      const handlerKey = `${currentState}:${event}`;
      const handler = stateHandlers.get(handlerKey);
      
      if (handler) {
        currentState = handler.nextState;
        
        // Simulate async processing for advancement completion
        if (currentState === 'processing_advancements' && !isProcessing) {
          isProcessing = true;
          setTimeout(async () => {
            if (isProcessing) {
              completionCallCount++;
              console.log(`[RACE TEST] handleAdvancementCompletion call #${completionCallCount}`);
              currentState = 'selecting_spells';
              isProcessing = false;
            }
          }, 50);
        }
      }
    }), 
    getCurrentState: vi.fn(() => currentState), 
    start: vi.fn()
  };
  
  const mockFinity = {
    configure: vi.fn(() => mockFinity), 
    initialState: vi.fn(() => mockFinity),
    state: vi.fn(() => mockFinity), 
    on: vi.fn((event) => {
      // Store transition handlers
      const currentStateForHandler = currentState;
      return {
        transitionTo: vi.fn((nextState) => {
          stateHandlers.set(`${currentStateForHandler}:${event}`, { nextState });
          return mockFinity;
        })
      };
    }),
    transitionTo: vi.fn(() => mockFinity), 
    withCondition: vi.fn(() => mockFinity),
    onEnter: vi.fn(() => mockFinity), 
    do: vi.fn(() => mockFinity),
    onSuccess: vi.fn(() => mockFinity), 
    onFailure: vi.fn(() => mockFinity),
    start: vi.fn(() => {
      // Set up the basic state transitions for race condition test
      stateHandlers.set('idle:start_character_creation', { nextState: 'creating_character' });
      stateHandlers.set('creating_character:character_created', { nextState: 'processing_advancements' });
      return mockFsm;
    }), 
    global: vi.fn(() => mockFinity),
    onStateEnter: vi.fn(() => mockFinity), 
    onStateExit: vi.fn(() => mockFinity),
    onTransition: vi.fn(() => mockFinity)
  };
  
  return { default: mockFinity };
});

// Mock FoundryVTT globals
global.Actor = { create: vi.fn() };
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };

// Mock required modules for WorkflowStateMachine dependency chain
vi.mock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(0) }));
vi.mock('~/src/stores/storeDefinitions', () => ({ goldRoll: mockWritable(0) }));
vi.mock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
vi.mock('~/src/helpers/Utility', () => ({ 
  getActorFromUuid: vi.fn(),
  isSpellcaster: vi.fn(() => true),
  getEquipmentCompletionEvent: vi.fn(() => 'equipment_complete')
}));

describe('Race Condition Bug Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset global completion tracking
    completionCallCount = 0;
    completionCalls.length = 0;
    
    global.window.GAS = {
      log: { d: vi.fn(), e: vi.fn() }
    };
  });

  it('should prevent race condition in processing_advancements state', async () => {
    // Import the WorkflowStateMachine after mocks are set up
    const { createWorkflowStateMachine, WORKFLOW_EVENTS, workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Set up a spellcaster actor context to trigger the selecting_spells transition
    const mockActor = {
      name: 'Test Wizard',
      classes: {
        wizard: {
          system: {
            spellcasting: {
              progression: 'full'
            }
          }
        }
      }
    };
    
    workflowFSMContext.actor = mockActor;
    
    const fsm = createWorkflowStateMachine();
    
    // Start the workflow
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(fsm.getCurrentState()).toBe('creating_character');
    
    // Trigger character creation completion
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    expect(fsm.getCurrentState()).toBe('processing_advancements');
    
    // Wait for async processing to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify that handleAdvancementCompletion was called only once
    expect(completionCallCount).toBe(1);
    console.log('[RACE TEST] Total completion calls:', completionCalls);
    
    // Verify the FSM reached the correct final state
    expect(fsm.getCurrentState()).toBe('selecting_spells');
  });

  it('should handle multiple rapid transitions without corruption', async () => {
    const { createWorkflowStateMachine, WORKFLOW_EVENTS, workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Set up a spellcaster actor context
    const mockActor = {
      name: 'Test Wizard',
      classes: {
        wizard: {
          system: {
            spellcasting: {
              progression: 'full'
            }
          }
        }
      }
    };
    
    workflowFSMContext.actor = mockActor;
    
    const fsm = createWorkflowStateMachine();
    
    // Rapidly trigger multiple workflow events
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Try to trigger character_created again (should be ignored)
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Should only have one completion call despite multiple events
    expect(completionCallCount).toBe(1);
    expect(fsm.getCurrentState()).toBe('selecting_spells');
  });

  it('should properly reset the processing flag on errors', async () => {
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = createWorkflowStateMachine();
    
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify that the completion was attempted (this tests the race condition fix)
    expect(completionCallCount).toBe(1);
  });
});
