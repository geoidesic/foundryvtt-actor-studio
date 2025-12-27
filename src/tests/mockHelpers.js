/**
 * Shared mock helpers for tests to ensure consistency
 */
import { vi } from 'vitest';

// Mock writable store factory
export const mockWritable = (value) => ({
  set: vi.fn(),
  update: vi.fn(),
  subscribe: vi.fn()
});

// Mock derived store factory
export const mockDerived = (stores, fn) => ({
  set: vi.fn(),
  update: vi.fn(),
  subscribe: vi.fn()
});

// Standard mock stores
export const mockStores = {
  activeTab: mockWritable('abilities'),
  tabs: mockWritable([]),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  dropItemRegistry: {
    advanceQueue: vi.fn().mockResolvedValue(true)
  }
};

// Mock get function
export const mockGet = vi.fn((store) => {
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

// Complete Finity mock factory
export const createFinityMock = () => {
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
};

// Mock actor factory
export const mockActor = {
  create: vi.fn(),
  name: 'Test Actor',
  classes: {},
  sheet: {
    render: vi.fn()
  }
};

// Global setup function for tests
export const setupGlobalMocks = () => {
  // Mock global objects that would be available in Foundry
  global.game = {
    settings: {
      get: vi.fn((module, key) => {
        // Default settings for testing
        if (key === 'enableEquipmentSelection') return false;
        if (key === 'enableEquipmentPurchase') return false;
        if (key === 'enableSpellSelection') return true;
        if (key === 'disableAdvancementCapture') return true;
        if (key === 'enableCustomFeatSelector') return true;
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
  global.Actor = mockActor;

  // Initialize window.GAS
  global.window.GAS = {
    log: {
      d: vi.fn(),
      w: vi.fn(),
      e: vi.fn()
    },
    dnd5eVersion: 4
  };
};

// Standard module mocks
export const createStandardMocks = () => {
  vi.mock('~/src/helpers/constants', () => ({
    MODULE_ID: 'foundryvtt-actor-studio'
  }));

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
    dropItemOnCharacter: vi.fn(),
    safeGetSetting: (module, key, defaultValue) => {
      // Mirror the real safeGetSetting behavior lightly for tests
      try {
        if (global?.game && global.game.settings) {
          try { return global.game.settings.get(module, key); } catch (e) { return defaultValue; }
        }
        return defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
  }));

  vi.mock('finity', createFinityMock);
};
