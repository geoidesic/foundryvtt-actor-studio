import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Foundry globals
global.game = {
  settings: {
    get: vi.fn((module, key) => {
      // Default: no special settings
      return false;
    })
  },
  i18n: { localize: vi.fn((k) => k) }
};

global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.window = global;
global.Actor = { create: vi.fn() };
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };

// Mock constants
vi.mock('~/src/helpers/constants', () => ({ MODULE_ID: 'foundryvtt-actor-studio' }));

// Simple mock writable implementation used across tests
const mockWritable = (value) => {
  const store = {
    _value: value,
    set: vi.fn((newValue) => { store._value = newValue; }),
    update: vi.fn((updater) => { store._value = updater(store._value); }),
    subscribe: vi.fn()
  };
  return store;
};

// Mock get() helper
const mockGet = vi.fn((store) => {
  if (store && store._value !== undefined) return store._value;
  if (store === mockStores.tabs) return [
    { id: 'abilities', label: 'Abilities' },
    { id: 'race', label: 'Race' },
    { id: 'background', label: 'Background' },
    { id: 'class', label: 'Class' }
  ];
  if (store === mockStores.activeTab) return 'abilities';
  return null;
});

const mockDerived = (stores, fn) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });

// Provide a standard set of stores used by the FSM
const mockStores = {
  tabs: mockWritable([
    { id: 'abilities', label: 'Abilities' },
    { id: 'race', label: 'Race' },
    { id: 'background', label: 'Background' },
    { id: 'class', label: 'Class' }
  ]),
  activeTab: mockWritable('abilities'),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  race: mockWritable(null),
  background: mockWritable(null),
  characterClass: mockWritable(null),
  abilities: mockWritable(null),
  isActorCreated: mockWritable(false),
  isLevelUp: mockWritable(false),
  newLevelValueForExistingClass: mockWritable(false),
  levelUpClassObject: mockWritable(null),
  classUuidForLevelUp: mockWritable(null),
  levelUpTabs: mockWritable([])
};

vi.mock('svelte/store', () => ({ writable: mockWritable, derived: mockDerived, get: mockGet }));

// Mock Finity similar to other tests
let currentState = 'idle';
const eventHandlers = new Map();
const stateHandlers = new Map();

const mockFsm = {
  handle: vi.fn((event) => {
    const handler = eventHandlers.get(`${currentState}:${event}`);
    if (handler) {
      const nextState = handler();
      if (nextState) {
        currentState = nextState;
        const stateHandler = stateHandlers.get(currentState);
        if (stateHandler) stateHandler({});
      }
    }
  }),
  getCurrentState: vi.fn(() => currentState),
  start: vi.fn()
};

let currentBuilder = null;
const mockFinity = {
  configure: vi.fn(() => mockFinity),
  initialState: vi.fn((s) => { currentState = s; return mockFinity; }),
  state: vi.fn((stateName) => { currentBuilder = { stateName, events: [] }; return mockFinity; }),
  on: vi.fn((event) => { if (currentBuilder) currentBuilder.currentEvent = event; return mockFinity; }),
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
  onEnter: vi.fn((handler) => { if (currentBuilder) stateHandlers.set(currentBuilder.stateName, handler); return mockFinity; }),
  do: vi.fn(() => mockFinity),
  onSuccess: vi.fn(() => mockFinity),
  onFailure: vi.fn(() => mockFinity),
  withCondition: vi.fn(() => mockFinity),
  global: vi.fn(() => mockFinity),
  onStateEnter: vi.fn(() => mockFinity),
  onStateExit: vi.fn(() => mockFinity),
  onTransition: vi.fn(() => mockFinity),
  start: vi.fn(() => { eventHandlers.set('idle:start_character_creation', () => 'creating_character'); return mockFsm; })
};

vi.mock('finity', () => ({ default: mockFinity }));

// Mock other dependencies used by the FSM
vi.mock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(0) }));
vi.mock('~/src/stores/storeDefinitions', () => ({ goldRoll: mockWritable(0) }));
vi.mock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
vi.mock('~/src/stores/index', () => mockStores);
vi.mock('~/src/stores/startingEquipment', () => ({ compatibleStartingEquipment: mockWritable([]) }));

// Mock safeGetSetting so that EnableBiographyTab returns true for this test
vi.mock('~/src/helpers/Utility', () => ({ safeGetSetting: vi.fn((module, key) => key === 'EnableBiographyTab' ? true : false), getActorFromUuid: vi.fn(), isSpellcaster: vi.fn(() => false), getEquipmentCompletionEvent: vi.fn(() => 'equipment_complete') }));

describe('Biography tab appears when starting creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentState = 'idle';
    eventHandlers.clear();
    stateHandlers.clear();
    mockStores.tabs._value = [
      { id: 'abilities', label: 'Abilities' },
      { id: 'race', label: 'Race' },
      { id: 'background', label: 'Background' },
      { id: 'class', label: 'Class' }
    ];
    mockStores.activeTab._value = 'abilities';
  });

  it('adds biography tab and switches to it on START_CHARACTER_CREATION', async () => {
    const { getWorkflowFSM, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    const fsm = getWorkflowFSM();

    // Fire start event
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);

    // After handling, the creating_character state's onEnter should have been executed
    // Verify tabs.update was called to append biography
    expect(mockStores.tabs.update).toHaveBeenCalled();

    // Verify activeTab was set to biography
    expect(mockStores.activeTab.set).toHaveBeenCalledWith('biography');
  });
});
