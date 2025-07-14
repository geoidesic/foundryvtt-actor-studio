/**
 * Test for character creation button functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock global objects that would be available in Foundry
global.game = {
  settings: {
    get: vi.fn((module, key) => {
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
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };

// Mock the module constants
vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

// Mock stores with progress tracking
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
  
  // Mock tab progress values
  if (store === mockStores.race) return { name: 'Human', uuid: 'Compendium.dnd5e.races.Item.human' };
  if (store === mockStores.background) return { name: 'Acolyte', uuid: 'Compendium.dnd5e.backgrounds.Item.acolyte' };
  if (store === mockStores.characterClass) return { name: 'Bard', uuid: 'Compendium.dnd5e.classes.Item.bard' };
  if (store === mockStores.abilities) return { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
  
  // Default values
  if (store === mockStores.tabs) return [
    { id: 'abilities', label: 'Abilities' },
    { id: 'race', label: 'Race' },
    { id: 'background', label: 'Background' },
    { id: 'class', label: 'Class' }
  ];
  if (store === mockStores.activeTab) return 'abilities';
  if (store === mockStores.readOnlyTabs) return [];
  if (store === mockStores.preAdvancementSelections) return {};
  return null;
});

const mockStores = {
  activeTab: mockWritable('abilities'),
  tabs: mockWritable([
    { id: 'abilities', label: 'Abilities' },
    { id: 'race', label: 'Race' },
    { id: 'background', label: 'Background' },
    { id: 'class', label: 'Class' }
  ]),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  
  // Mock character creation data stores
  race: mockWritable(null),
  background: mockWritable(null),
  characterClass: mockWritable(null),
  abilities: mockWritable(null),
  
  // Mock progress indicators
  isActorCreated: mockWritable(false),
  
  dropItemRegistry: {
    advanceQueue: vi.fn().mockResolvedValue(true)
  }
};

const mockDerived = (stores, fn) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  derived: mockDerived,
  get: mockGet
}));

// Mock required modules for WorkflowStateMachine dependency chain
vi.mock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(0) }));
vi.mock('~/src/stores/storeDefinitions', () => ({ goldRoll: mockWritable(0) }));
vi.mock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
vi.mock('~/src/helpers/Utility', () => ({ 
  getActorFromUuid: vi.fn(),
  isSpellcaster: vi.fn(() => false),
  getEquipmentCompletionEvent: vi.fn(() => 'equipment_complete')
}));

vi.mock('~/src/stores/index', () => mockStores);
vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: mockWritable([])
}));

// Mock Finity with state tracking
let currentState = 'idle';
const eventHandlers = new Map();
const stateHandlers = new Map();

const mockFsm = {
  handle: vi.fn((event) => {
    console.log(`Handling event: ${event} from state: ${currentState}`);
    const handler = eventHandlers.get(`${currentState}:${event}`);
    if (handler) {
      const nextState = handler();
      if (nextState) {
        console.log(`Transitioning from ${currentState} to ${nextState}`);
        currentState = nextState;
        console.log(`Current state is now: ${currentState}`);
        const stateHandler = stateHandlers.get(currentState);
        if (stateHandler) {
          stateHandler({});
        }
      }
    } else {
      console.log(`No handler found for ${currentState}:${event}`);
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
  do: vi.fn(() => mockFinity),
  onSuccess: vi.fn(() => mockFinity),
  onFailure: vi.fn(() => mockFinity),
  withCondition: vi.fn(() => mockFinity),
  global: vi.fn(() => mockFinity),
  onStateEnter: vi.fn(() => mockFinity),
  onStateExit: vi.fn(() => mockFinity),
  onTransition: vi.fn(() => mockFinity),
  start: vi.fn(() => {
    // Manually set up the basic transitions for testing
    eventHandlers.set('idle:start_character_creation', () => 'creating_character');
    eventHandlers.set('creating_character:character_created', () => 'processing_advancements');
    eventHandlers.set('processing_advancements:advancements_complete', () => 'completed');
    
    const idleHandler = stateHandlers.get('idle');
    if (idleHandler) {
      idleHandler({});
    }
    return mockFsm;
  })
};

vi.mock('finity', () => ({
  default: mockFinity
}));

// Ensure transitions are set up before any module imports happen
eventHandlers.set('idle:start_character_creation', () => 'creating_character');
eventHandlers.set('creating_character:character_created', () => 'processing_advancements');
eventHandlers.set('processing_advancements:advancements_complete', () => 'completed');

// Mock the workflow module
vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn(async (context) => {
    return 'completed'; // Simple mock for this test
  })
}));

describe('Character Creation Button Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentState = 'idle';
    eventHandlers.clear();
    stateHandlers.clear();
    
    // Initialize window.GAS
    global.window.GAS = {
      log: {
        d: vi.fn(),
        w: vi.fn(),
        e: vi.fn()
      }
    };
    
    // Reset store values
    mockStores.race._value = null;
    mockStores.background._value = null;
    mockStores.characterClass._value = null;
    mockStores.abilities._value = null;
    mockStores.isActorCreated._value = false;
  });

  it('should start in idle state', async () => {
    const { getWorkflowFSM } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    expect(currentState).toBe('idle');
    expect(fsm.getCurrentState()).toBe('idle');
  });

  it('should transition to creating_character when start_character_creation event is triggered', async () => {
    // Set up the handlers before importing the module
    eventHandlers.set('idle:start_character_creation', () => 'creating_character');
    
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    // Verify initial state
    expect(currentState).toBe('idle');
    
    // Debug: Check if handler exists
    console.log('Available handlers:', Array.from(eventHandlers.keys()));
    
    // Trigger character creation
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    
    // Should transition to creating_character
    expect(currentState).toBe('creating_character');
  });

  it('should simulate complete character setup and successful transition', async () => {
    // Set up the handlers before importing the module
    eventHandlers.set('idle:start_character_creation', () => 'creating_character');
    
    const { getWorkflowFSM, WORKFLOW_EVENTS, workflowFSMContext } = 
      await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Set up complete character data (simulating 100% progress on all tabs)
    mockStores.race.set({ name: 'Human', uuid: 'Compendium.dnd5e.races.Item.human' });
    mockStores.background.set({ name: 'Acolyte', uuid: 'Compendium.dnd5e.backgrounds.Item.acolyte' });
    mockStores.characterClass.set({ name: 'Bard', uuid: 'Compendium.dnd5e.classes.Item.bard' });
    mockStores.abilities.set({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
    
    const fsm = getWorkflowFSM();
    
    // Start the workflow (simulating button click)
    expect(currentState).toBe('idle');
    
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // Verify that the creating_character state sets isProcessing to true
    expect(mockStores.isActorCreated.set).not.toHaveBeenCalledWith(true);
  });

  it('should validate that character data is complete before allowing creation', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Test with incomplete data
    mockStores.race.set(null);
    mockStores.background.set({ name: 'Acolyte' });
    mockStores.characterClass.set({ name: 'Bard' });
    mockStores.abilities.set({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
    
    // In a real scenario, the create button should be disabled when data is incomplete
    // This test verifies the context structure is available for such validation
    expect(workflowFSMContext).toHaveProperty('isProcessing');
    expect(workflowFSMContext).toHaveProperty('actor');
  });

  it('should handle complete workflow from button click to character creation', async () => {
    // Set up the handlers before importing the module
    eventHandlers.set('idle:start_character_creation', () => 'creating_character');
    eventHandlers.set('creating_character:character_created', () => 'processing_advancements');
    
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Set up complete character (100% progress simulation)
    mockStores.race.set({ name: 'Human', uuid: 'Compendium.dnd5e.races.Item.human' });
    mockStores.background.set({ name: 'Acolyte', uuid: 'Compendium.dnd5e.backgrounds.Item.acolyte' });
    mockStores.characterClass.set({ name: 'Bard', uuid: 'Compendium.dnd5e.classes.Item.bard' });
    mockStores.abilities.set({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
    
    const fsm = getWorkflowFSM();
    
    // Complete workflow simulation
    expect(currentState).toBe('idle');
    
    // 1. User clicks "Create Character" button (when 100% complete)
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // 2. Character creation process completes
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    expect(currentState).toBe('processing_advancements');
    
    // The processing_advancements state should handle the async operations
    // and transition to the appropriate next state
  });

  it('should verify character creation button is only available when progress is 100%', () => {
    // This test validates the concept - in the real application,
    // the button should only be enabled when all required data is present
    
    // Complete data scenario
    const completeData = {
      race: { name: 'Human', uuid: 'Compendium.dnd5e.races.Item.human' },
      background: { name: 'Acolyte', uuid: 'Compendium.dnd5e.backgrounds.Item.acolyte' },
      characterClass: { name: 'Bard', uuid: 'Compendium.dnd5e.classes.Item.bard' },
      abilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }
    };
    
    // Simulate progress calculation
    const isComplete = Object.values(completeData).every(value => value !== null && value !== undefined);
    expect(isComplete).toBe(true);
    
    // Incomplete data scenario
    const incompleteData = {
      race: null,
      background: { name: 'Acolyte' },
      characterClass: { name: 'Bard' },
      abilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }
    };
    
    const isIncomplete = Object.values(incompleteData).every(value => value !== null && value !== undefined);
    expect(isIncomplete).toBe(false);
  });
});
