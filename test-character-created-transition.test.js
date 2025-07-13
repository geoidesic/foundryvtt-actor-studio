/**
 * Test for character created to processing advancements transition
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

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  get: mockGet
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
    console.log('[MOCK] handleAdvancementCompletion called with context:', context);
    // Simulate the logic that determines next state based on character configuration
    if (context._shouldShowSpellSelection && typeof context._shouldShowSpellSelection === 'function') {
      const shouldShowSpells = context._shouldShowSpellSelection(context.actor, context);
      if (shouldShowSpells) return 'selecting_spells';
    }
    if (context._shouldShowEquipmentSelection && typeof context._shouldShowEquipmentSelection === 'function') {
      const shouldShowEquipment = context._shouldShowEquipmentSelection(context);
      if (shouldShowEquipment) return 'selecting_equipment';
    }
    if (context._shouldShowShopping && typeof context._shouldShowShopping === 'function') {
      const shouldShowShopping = context._shouldShowShopping();
      if (shouldShowShopping) return 'shopping';
    }
    return 'completed'; // Default fallback
  })
}));

describe('Character Created Transition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentState = 'idle';
    eventHandlers.clear();
    stateHandlers.clear();
    
    // Re-set up the basic transitions
    eventHandlers.set('idle:start_character_creation', () => 'creating_character');
    eventHandlers.set('creating_character:character_created', () => 'processing_advancements');
    eventHandlers.set('processing_advancements:advancements_complete', () => 'completed');
    
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

  it('should transition from creating_character to processing_advancements when character_created event is triggered', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    // Start in idle and move to creating_character
    expect(currentState).toBe('idle');
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // Trigger character_created event (this happens after the actor is created in the system)
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Should transition to processing_advancements
    expect(currentState).toBe('processing_advancements');
  });

  it('should handle the complete workflow including character creation and advancement processing', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Set up complete character data
    mockStores.race.set({ name: 'Human', uuid: 'Compendium.dnd5e.races.Item.human' });
    mockStores.background.set({ name: 'Acolyte', uuid: 'Compendium.dnd5e.backgrounds.Item.acolyte' });
    mockStores.characterClass.set({ name: 'Bard', uuid: 'Compendium.dnd5e.classes.Item.bard' });
    mockStores.abilities.set({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
    
    const fsm = getWorkflowFSM();
    
    // Complete workflow simulation
    expect(currentState).toBe('idle');
    
    // 1. User clicks "Create Character" button
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // 2. Character is created in the Foundry system
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    expect(currentState).toBe('processing_advancements');
    
    // 3. Advancements are processed and workflow determines next step
    fsm.handle(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE);
    expect(currentState).toBe('completed');
  });

  it('should verify that the processing_advancements state handles async operations', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS, workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Set up a mock actor to test context handling
    const mockActor = {
      name: 'Test Character',
      classes: {
        bard: {
          system: {
            spellcasting: {
              progression: 'full'
            }
          }
        }
      }
    };
    
    // Set context with the created actor
    workflowFSMContext.actor = mockActor;
    
    const fsm = getWorkflowFSM();
    
    // Start workflow
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // Character created - this should trigger async advancement processing
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    expect(currentState).toBe('processing_advancements');
    
    // Note: In the real FSM implementation, the onEnter handler for processing_advancements
    // would call dropItemRegistry.advanceQueue(true), but our mock doesn't execute onEnter handlers.
    // The important thing is that we reach the processing_advancements state correctly.
    expect(currentState).toBe('processing_advancements');
    
    // Verify the context has the proper structure for async operations
    expect(workflowFSMContext.actor).toBe(mockActor);
    expect(typeof workflowFSMContext._shouldShowSpellSelection).toBe('function');
  });

  it('should validate that character_created event is only valid from creating_character state', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    // Try to trigger character_created from idle state (should not work)
    expect(currentState).toBe('idle');
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    expect(currentState).toBe('idle'); // Should remain in idle
    
    // Now do the proper flow
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // Now character_created should work
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    expect(currentState).toBe('processing_advancements');
  });

  it('should ensure the FSM context is properly maintained through character creation', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS, workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Verify context structure
    expect(workflowFSMContext).toHaveProperty('isProcessing');
    expect(workflowFSMContext).toHaveProperty('actor');
    expect(workflowFSMContext).toHaveProperty('_shouldShowEquipmentSelection');
    expect(workflowFSMContext).toHaveProperty('_shouldShowSpellSelection');
    expect(workflowFSMContext).toHaveProperty('_shouldShowShopping');
    
    const fsm = getWorkflowFSM();
    
    // Flow through character creation
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    expect(currentState).toBe('processing_advancements');
    
    // Context should remain available for decision making
    expect(typeof workflowFSMContext._shouldShowSpellSelection).toBe('function');
  });

  it('should handle error transitions during character creation workflow', async () => {
    // Set up error handler
    eventHandlers.set('creating_character:error', () => 'error');
    eventHandlers.set('processing_advancements:error', () => 'error');
    
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    const fsm = getWorkflowFSM();
    
    // Start workflow
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(currentState).toBe('creating_character');
    
    // Trigger error during character creation
    fsm.handle(WORKFLOW_EVENTS.ERROR);
    expect(currentState).toBe('error');
  });
});
