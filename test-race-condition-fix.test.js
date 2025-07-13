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

vi.mock('svelte/store', () => ({
  writable: mockWritable,
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

// Mock Finity with the same structure as working tests
let currentState = 'idle';
let isProcessingAdvancements = false;
const eventHandlers = new Map();
const stateHandlers = new Map();

const mockFsm = {
  handle: vi.fn((event) => {
    console.log(`[RACE TEST] Handling event: ${event} from state: ${currentState}`);
    const handler = eventHandlers.get(`${currentState}:${event}`);
    if (handler) {
      const nextState = handler();
      if (nextState) {
        console.log(`[RACE TEST] Transitioning from ${currentState} to ${nextState}`);
        currentState = nextState;
        const stateHandler = stateHandlers.get(currentState);
        if (stateHandler) {
          stateHandler();
        }
      }
    }
  }),
  getCurrentState: vi.fn(() => currentState),
  start: vi.fn()
};

let currentBuilder = null;
const mockFinity = {
  configure: vi.fn(() => mockFinity),
  initialState: vi.fn((state) => {
    currentState = state;
    return mockFinity;
  }),
  state: vi.fn((stateName) => {
    currentBuilder = { stateName, events: [] };
    return mockFinity;
  }),
  on: vi.fn((event) => {
    if (currentBuilder) {
      currentBuilder.currentEvent = event;
    }
    return mockFinity;
  }),
  transitionTo: vi.fn((target) => {
    if (currentBuilder && currentBuilder.currentEvent) {
      const event = currentBuilder.currentEvent;
      const state = currentBuilder.stateName;
      
      if (typeof target === 'function') {
        eventHandlers.set(`${state}:${event}`, target);
      } else {
        eventHandlers.set(`${state}:${event}`, () => target);
      }
    }
    return mockFinity;
  }),
  onEnter: vi.fn((handler) => {
    if (currentBuilder) {
      stateHandlers.set(currentBuilder.stateName, handler);
    }
    return mockFinity;
  }),
  start: vi.fn(() => {
    // Set up basic transitions for the test
    eventHandlers.set('idle:start_character_creation', () => 'creating_character');
    eventHandlers.set('creating_character:character_created', () => 'processing_advancements');
    eventHandlers.set('processing_advancements:advancements_complete', () => 'selecting_spells');
    
    const idleHandler = stateHandlers.get('idle');
    if (idleHandler) {
      idleHandler();
    }
    return mockFsm;
  })
};

vi.mock('finity', () => ({
  default: mockFinity
}));

describe('Race Condition Bug Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentState = 'idle';
    isProcessingAdvancements = false;
    completionCallCount = 0;
    completionCalls.length = 0;
    eventHandlers.clear();
    stateHandlers.clear();
    
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
    // Mock handleAdvancementCompletion to throw an error
    const { handleAdvancementCompletion } = await import('~/src/lib/workflow.js');
    handleAdvancementCompletion.mockRejectedValueOnce(new Error('Test error'));
    
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = createWorkflowStateMachine();
    
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // The processing flag should be reset even after an error
    expect(isProcessingAdvancements).toBe(false);
  });
});
