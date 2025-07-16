import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

// Hoist the mock to ensure it's set up before any imports
const { mockFinity, mockFsm, mockState, eventHandlers, stateHandlers } = vi.hoisted(() => {
  let currentState = 'idle';
  const eventHandlers = new Map();
  const stateHandlers = new Map();
  
  // Create a state object that can be mutated
  const mockState = {
    current: 'idle'
  };

  const mockFsm = {
    handle: vi.fn((event) => {
      console.log(`Handling event: ${event} from state: ${mockState.current}`);
      const handler = eventHandlers.get(`${mockState.current}:${event}`);
      if (handler) {
        const nextState = typeof handler === 'function' ? handler() : handler;
        if (nextState) {
          console.log(`Transitioning from ${mockState.current} to ${nextState}`);
          mockState.current = nextState;
          console.log(`Current state is now: ${mockState.current}`);
          const stateHandler = stateHandlers.get(mockState.current);
          if (stateHandler) {
            stateHandler({});
          }
        }
      } else {
        console.log(`No handler found for ${mockState.current}:${event}`);
      }
    }),
    getCurrentState: vi.fn(() => mockState.current),
    start: vi.fn()
  };

  let currentBuilder = null;
  const mockFinity = {
    configure: vi.fn(() => mockFinity),
    initialState: vi.fn((state) => {
      mockState.current = state;
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
      // Set up basic transitions for the test
      eventHandlers.set('idle:start_character_creation', () => 'creating_character');
      eventHandlers.set('creating_character:character_created', () => 'processing_advancements');
      eventHandlers.set('processing_advancements:advancements_complete', () => 'selecting_equipment');
      eventHandlers.set('processing_advancements:queue_processed', () => 'selecting_equipment');
      eventHandlers.set('selecting_equipment:equipment_complete', () => 'shopping');
      eventHandlers.set('selecting_equipment:skip_equipment', () => 'shopping');
      eventHandlers.set('shopping:shopping_complete', () => 'completed');
      eventHandlers.set('shopping:skip_shopping', () => 'completed');
      
      // Reset transitions
      eventHandlers.set('idle:reset', () => 'idle');
      eventHandlers.set('creating_character:reset', () => 'idle');
      eventHandlers.set('processing_advancements:reset', () => 'idle');
      eventHandlers.set('selecting_equipment:reset', () => 'idle');
      eventHandlers.set('shopping:reset', () => 'idle');
      eventHandlers.set('completed:reset', () => 'idle');
      eventHandlers.set('error:reset', () => 'idle');
      
      return mockFsm;
    })
  };

  return { mockFinity, mockFsm, mockState, eventHandlers, stateHandlers };
});

vi.mock('finity', () => ({
  default: mockFinity
}));

// Mock stores
const mockWritable = (value) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });
const mockDerived = (stores, fn) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });
const mockGet = vi.fn((store) => 'advancements'); // Default to advancements tab

vi.mock('svelte/store', () => ({ writable: mockWritable, derived: mockDerived, get: mockGet }));
vi.mock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(100) }));
vi.mock('~/src/stores/storeDefinitions', () => ({ goldRoll: mockWritable(0) }));
vi.mock('~/src/stores/index', () => ({
  preAdvancementSelections: mockWritable({}),
  dropItemRegistry: { advanceQueue: vi.fn(() => Promise.resolve()) },
  flattenedSelections: mockWritable([{ key: 'item-uuid-1' }]),
  tabs: mockWritable([{ label: 'Equipment', id: 'equipment' }]),
  level: mockWritable(1),
  characterLevel: mockWritable(1),
  currentCharacter: mockWritable({}),
  actorInGame: mockWritable({})
}));
vi.mock('~/src/stores/startingEquipment', () => ({ compatibleStartingEquipment: mockWritable([]) }));
vi.mock('~/src/helpers/constants', () => ({ MODULE_ID: 'foundryvtt-actor-studio' }));
vi.mock('~/src/helpers/Utility', () => ({ 
  handleContainerContents: vi.fn(),
  delay: vi.fn(() => Promise.resolve())
}));
vi.mock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
vi.mock('~/src/helpers/AdvancementManager', () => ({ 
  destroyAdvancementManagers: vi.fn(),
  AdvancementManager: vi.fn().mockImplementation((store, inProcessStore, getPanel) => ({
    store,
    inProcessStore,
    _getPanel: getPanel,
    isTabContentEmpty: vi.fn((tabName = 'advancements') => {
      // Mock implementation that uses the injected getPanel function
      if (getPanel) {
        const panel = getPanel();
        if (panel && typeof panel.html === 'function') {
          return !Boolean(panel.html()?.trim());
        }
      }
      return false;
    }),
    checkTabContent: vi.fn(),
    autoAdvanceSteps: vi.fn()
  }))
}));

describe('Equipment to Shop Transition User Journey', () => {
  let mockGame, mockActor;

  beforeEach(() => {
    // Reset mock state
    vi.clearAllMocks();
    mockState.current = 'idle';
    eventHandlers.clear();
    stateHandlers.clear();
    
    // Set up FoundryVTT globals that match user journey scenario
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          // User journey settings: equipment + shop enabled, advancements + spells disabled
          if (key === 'enableEquipmentSelection') return true;
          if (key === 'enableEquipmentPurchase') return true; // Shop enabled
          if (key === 'enableSpellSelection') return false; // Spells disabled
          if (key === 'disableAdvancementCapture') return false; 
          return false;
        })
      },
      i18n: { localize: vi.fn((key) => key) },
      items: { fromCompendium: vi.fn(() => ({ name: 'Test Item', system: { quantity: 1 } })) }
    };

    global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
    global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
    global.window = global;

    mockActor = {
      name: 'Test Character',
      update: vi.fn(),
      system: { currency: { gp: 0, sp: 0, cp: 0 } },
      classes: {},
      items: {
        find: vi.fn(() => null),
        filter: vi.fn(() => []),
        contents: []
      }
    };

    global.Actor = { create: vi.fn(() => Promise.resolve(mockActor)) };
    global.Item = { create: vi.fn(() => Promise.resolve({ name: 'Created Item' })) };
    global.fromUuid = vi.fn(() => Promise.resolve({ name: 'Test Equipment', system: { quantity: 1 } }));
    global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }, dnd5eVersion: 4 };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should have getEquipmentCompletionEvent function implemented', async () => {
    const workflowStateMachine = await import('~/src/helpers/WorkflowStateMachine.js');
    
    expect(workflowStateMachine.getEquipmentCompletionEvent).toBeDefined();
    expect(typeof workflowStateMachine.getEquipmentCompletionEvent).toBe('function');
    
    const result = workflowStateMachine.getEquipmentCompletionEvent({}, false);
    expect(result).toBe('equipment_complete');
    
    const skipResult = workflowStateMachine.getEquipmentCompletionEvent({}, true);
    expect(skipResult).toBe('skip_equipment');
  });
});
