import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeValues = {
  tabs: [],
  activeTab: 'abilities',
  readOnlyTabs: [],
  preAdvancementSelections: {},
  compatibleStartingEquipment: []
};

const createStore = (name) => ({ __storeName: name, set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });

const mockStores = {
  activeTab: createStore('activeTab'),
  tabs: createStore('tabs'),
  readOnlyTabs: createStore('readOnlyTabs'),
  getCoreCreationReadOnlyTabs: vi.fn(() => ['race', 'class', 'background', 'abilities']),
  preAdvancementSelections: createStore('preAdvancementSelections'),
  dropItemRegistry: {
    advanceQueue: vi.fn().mockResolvedValue(true)
  }
};

const mockStoreDefinitions = {
  actorInGame: createStore('actorInGame'),
  startingWealthChoice: createStore('startingWealthChoice')
};

const mockGet = vi.fn((store) => {
  if (store?.__storeName && Object.prototype.hasOwnProperty.call(storeValues, store.__storeName)) {
    return storeValues[store.__storeName];
  }

  if (store === mockStores.getCoreCreationReadOnlyTabs) {
    return mockStores.getCoreCreationReadOnlyTabs();
  }

  return undefined;
});

vi.mock('svelte/store', () => ({
  writable: (value) => ({ __storeName: 'anonymous', set: vi.fn(), update: vi.fn(), subscribe: vi.fn(), _value: value }),
  derived: () => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }),
  get: mockGet
}));

vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

vi.mock('~/src/stores/index', () => mockStores);

vi.mock('~/src/stores/storeDefinitions', () => mockStoreDefinitions);

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: createStore('compatibleStartingEquipment')
}));

vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn()
}));

vi.mock('~/src/helpers/AdvancementManager', () => ({
  destroyAdvancementManagers: vi.fn()
}));

vi.mock('~/src/helpers/spellProgression', () => ({
  getSpellLimitsForClassLevel: vi.fn(() => null)
}));

vi.mock('~/src/helpers/Utility', () => ({
  safeGetSetting: vi.fn((moduleId, key, defaultValue) => {
    if (key === 'enableEquipmentSelection') return true;
    if (key === 'enableSpellSelection') return false;
    if (key === 'enableEquipmentPurchase') return false;
    return defaultValue;
  }),
  bringActorStudioToFront: vi.fn(),
  resolveDefaultActorSheetId: vi.fn()
}));

vi.mock('finity', () => {
  const mockFsm = {
    handle: vi.fn(),
    getCurrentState: vi.fn(() => 'idle'),
    start: vi.fn()
  };

  const mockGlobal = {
    onStateEnter: vi.fn(() => mockGlobal),
    onStateExit: vi.fn(() => mockGlobal),
    onTransition: vi.fn(() => mockGlobal),
    start: vi.fn(() => mockFsm)
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
    global: vi.fn(() => mockGlobal),
    start: vi.fn(() => mockFsm)
  };

  return { default: mockFinity };
});

describe('workflow equipment selection visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeValues.tabs = [];
    storeValues.activeTab = 'abilities';
    storeValues.readOnlyTabs = [];
    storeValues.preAdvancementSelections = {};
    storeValues.compatibleStartingEquipment = [];

    global.game = {
      settings: { get: vi.fn() },
      i18n: { localize: vi.fn((key) => key) }
    };
    global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
    global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn(), off: vi.fn() };
    global.window = global;
    global.window.GAS = {
      log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
      dnd5eRules: '2014',
      dnd5eVersion: 3
    };
  });

  it('shows the equipment flow for 2014 classes that have wealth but no starting equipment', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    storeValues.preAdvancementSelections = {
      class: {
        system: {
          startingEquipment: [],
          wealth: '5d4x10'
        }
      }
    };
    storeValues.compatibleStartingEquipment = [];

    expect(workflowFSMContext._shouldShowEquipmentSelection()).toBe(true);
  });

  it('shows the equipment flow when only background equipment is compatible under 2024 rules', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    window.GAS.dnd5eRules = '2024';
    window.GAS.dnd5eVersion = 4;

    storeValues.preAdvancementSelections = {
      class: {
        system: {
          startingEquipment: [],
          wealth: 50
        }
      },
      background: {
        system: {
          startingEquipment: [{ _id: 'bg-pack' }],
          wealth: 15
        }
      }
    };
    storeValues.compatibleStartingEquipment = [{ _id: 'bg-pack' }];

    expect(workflowFSMContext._shouldShowEquipmentSelection()).toBe(true);
  });
});