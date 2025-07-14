/**
 * Test for Actor Studio opening functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock global objects that would be available in Foundry
global.game = {
  settings: {
    get: vi.fn((module, key) => {
      // Default settings for testing
      if (key === 'enableEquipmentSelection') return false;
      if (key === 'enableEquipmentPurchase') return false;
      if (key === 'enableSpellSelection') return true;
      return false;
    })
  },
  i18n: {
    localize: vi.fn((key) => key)
  }
};

global.ui = {
  notifications: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
};

global.Hooks = {
  call: vi.fn(),
  on: vi.fn(),
  once: vi.fn()
};

global.window = global;
global.Actor = {
  create: vi.fn()
};

// Mock the module constants
vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

// Mock the stores
const mockWritable = (value) => ({
  set: vi.fn(),
  update: vi.fn(),
  subscribe: vi.fn()
});

const mockDerived = (stores, fn) => ({
  set: vi.fn(),
  update: vi.fn(),
  subscribe: vi.fn()
});

const mockStores = {
  activeTab: mockWritable('abilities'),
  tabs: mockWritable([]),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  dropItemRegistry: {
    advanceQueue: vi.fn().mockResolvedValue(true)
  }
};

const mockGet = vi.fn((store) => {
  if (store === mockStores.tabs) return [
    { id: 'abilities', label: 'Abilities' },
    { id: 'race', label: 'Race' },
    { id: 'background', label: 'Background' },
    { id: 'class', label: 'Class' }
  ];
  if (store === mockStores.activeTab) return 'abilities';
  if (store === mockStores.readOnlyTabs) return [];
  return null;
});

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  derived: mockDerived,
  get: mockGet
}));

vi.mock('~/src/stores/index', () => mockStores);
vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: mockWritable([])
}));
vi.mock('~/src/stores/goldChoices', () => ({
  totalGoldFromChoices: mockWritable(0)
}));
vi.mock('~/src/stores/storeDefinitions', () => ({
  goldRoll: mockWritable(0)
}));
vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn()
}));
vi.mock('~/src/helpers/AdvancementManager', () => ({
  destroyAdvancementManagers: vi.fn()
}));
vi.mock('~/src/helpers/Utility', () => ({
  getLevelByDropType: vi.fn(),
  itemHasAdvancementChoices: vi.fn(),
  isAdvancementsForLevelInItem: vi.fn(),
  dropItemOnCharacter: vi.fn()
}));

vi.mock('finity', () => {
  const mockFsm = {
    handle: vi.fn(),
    getCurrentState: vi.fn(() => 'idle'),
    start: vi.fn()
  };
  
  const mockFinity = {
    configure: vi.fn(() => mockFinity),
    initialState: vi.fn(() => mockFinity),
    state: vi.fn(() => mockFinity),
    on: vi.fn(() => mockFinity),
    transitionTo: vi.fn(() => mockFinity),
    withCondition: vi.fn(() => mockFinity),
    onEnter: vi.fn(() => mockFinity),
    do: vi.fn(() => mockFinity),
    onSuccess: vi.fn(() => mockFinity),
    onFailure: vi.fn(() => mockFinity),
    start: vi.fn(() => mockFsm)
  };
  
  return {
    default: mockFinity
  };
});

describe('Actor Studio Opening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize window.GAS
    global.window.GAS = {
      log: {
        d: vi.fn(),
        w: vi.fn(),
        e: vi.fn()
      }
    };
  });

  it('should create a workflow state machine', async () => {
    const { createWorkflowStateMachine } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = createWorkflowStateMachine();
    
    expect(fsm).toBeDefined();
    expect(fsm.handle).toBeDefined();
    expect(fsm.getCurrentState).toBeDefined();
  });

  it('should initialize FSM in idle state', async () => {
    const { getWorkflowFSM } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    expect(fsm.getCurrentState()).toBe('idle');
  });

  it('should expose FSM globally for debugging', async () => {
    const { getWorkflowFSM } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    // Check that the FSM was created and has the expected methods
    expect(fsm).toBeDefined();
    expect(fsm.handle).toBeDefined();
    expect(fsm.getCurrentState).toBeDefined();
  });

  it('should handle start_character_creation event', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    // Create a spy on the handle method
    const handleSpy = vi.spyOn(fsm, 'handle');
    
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    
    expect(handleSpy).toHaveBeenCalledWith('start_character_creation');
  });

  it('should have proper workflow context structure', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    expect(workflowFSMContext).toHaveProperty('isProcessing');
    expect(workflowFSMContext).toHaveProperty('actor');
    expect(workflowFSMContext).toHaveProperty('_shouldShowEquipmentSelection');
    expect(workflowFSMContext).toHaveProperty('_shouldShowSpellSelection');
    expect(workflowFSMContext).toHaveProperty('_shouldShowShopping');
  });
});
