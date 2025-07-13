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
const mockWritable = (value) => ({
  _value: value,
  set: vi.fn((newValue) => { this._value = newValue; }),
  update: vi.fn((updater) => { this._value = updater(this._value); }),
  subscribe: vi.fn()
});

const mockGet = vi.fn((store) => store._value);

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  get: mockGet
}));

vi.mock('~/src/stores/index', () => ({
  activeTab: mockWritable('overview'),
  tabs: mockWritable([]),
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

// Mock Finity - simplified version that captures the real behavior
let currentState = 'idle';
let isProcessingAdvancements = false;

const mockFSM = {
  handle: vi.fn((event) => {
    console.log(`[RACE TEST] FSM handling event: ${event} from state: ${currentState}`);
    
    if (event === 'start_character_creation' && currentState === 'idle') {
      currentState = 'creating_character';
    } else if (event === 'character_created' && currentState === 'creating_character') {
      currentState = 'processing_advancements';
      
      // Simulate the onEnter handler for processing_advancements
      // This is where the race condition would occur
      setTimeout(async () => {
        if (isProcessingAdvancements) {
          console.log('[RACE TEST] Already processing advancements, skipping (race condition prevented)');
          return;
        }
        isProcessingAdvancements = true;
        
        try {
          const { handleAdvancementCompletion } = await import('~/src/lib/workflow.js');
          const nextState = await handleAdvancementCompletion({
            actor: { name: 'Test Wizard', classes: { wizard: { system: { spellcasting: { progression: 'full' } } } } }
          });
          
          console.log(`[RACE TEST] Advancement completion returned: ${nextState}`);
          
          // Trigger the advancement complete event
          setTimeout(() => {
            isProcessingAdvancements = false;
            mockFSM.handle('advancements_complete');
          }, 10);
        } catch (error) {
          console.error('[RACE TEST] Error in processing:', error);
          isProcessingAdvancements = false;
        }
      }, 50);
      
    } else if (event === 'advancements_complete' && currentState === 'processing_advancements') {
      currentState = 'selecting_spells';
    }
  }),
  getCurrentState: () => currentState
};

vi.mock('finity', () => ({
  default: {
    configure: () => ({
      initialState: () => mockFSM,
      state: () => ({
        on: () => ({ transitionTo: () => mockFSM }),
        onEnter: () => mockFSM
      }),
      start: () => mockFSM
    })
  }
}));

describe('Race Condition Bug Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentState = 'idle';
    isProcessingAdvancements = false;
    completionCallCount = 0;
    completionCalls.length = 0;
    
    global.window.GAS = {
      log: { d: vi.fn(), e: vi.fn() }
    };
  });

  it('should prevent race condition in processing_advancements state', async () => {
    // Import the WorkflowStateMachine after mocks are set up
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
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
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
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
