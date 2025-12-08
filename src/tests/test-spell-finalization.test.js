import { describe, it, expect, vi, beforeEach } from 'vitest';

// Store mocks must be defined before mocking
const mockWritable = (value) => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn(),
  toString: () => `writable(${JSON.stringify(value)})`
});
const mockDerived = (stores, fn) => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn(),
  toString: () => 'derived'
});
const mockGet = vi.fn(() => ({}));

// Mock svelte/store at the top level
vi.mock('svelte/store', () => ({ 
  writable: mockWritable, 
  derived: mockDerived, 
  get: mockGet 
}));

// Mock required modules
vi.mock('~/src/stores/index', () => ({
  activeTab: mockWritable('spells'),
  tabs: mockWritable([]),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  dropItemRegistry: { advanceQueue: vi.fn() },
  characterClass: mockWritable({}),
  level: mockWritable(1),
  isLevelUp: mockWritable(false),
  newLevelValueForExistingClass: mockWritable(false),
  levelUpClassObject: mockWritable(null),
  classUuidForLevelUp: mockWritable(null),
  currentCharacter: mockWritable(null)
}));

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: mockWritable([])
}));

vi.mock('~/src/stores/storeDefinitions', () => ({
  actorInGame: mockWritable({})
}));

vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn(),
  handleFinalizeSpells: vi.fn(),
  handleSpellsCompleteLevelUp: vi.fn()
}));

vi.mock('~/src/helpers/AdvancementManager', () => ({
  destroyAdvancementManagers: vi.fn()
}));

vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

vi.mock('~/src/helpers/Utility', () => ({
  getPacksFromSettings: vi.fn(() => []),
  extractItemsFromPacksAsync: vi.fn(() => Promise.resolve([]))
}));

// Mock Finity
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
  return { default: mockFinity };
});

// Setup comprehensive mocking following the established pattern
beforeEach(() => {
  // FoundryVTT globals
  global.game = {
    settings: { 
      get: vi.fn((module, key) => {
        if (key === 'enableSpellSelection') return true;
        if (key === 'enableEquipmentSelection') return false;
        if (key === 'enableEquipmentPurchase') return false;
        return false;
      })
    },
    i18n: { localize: vi.fn((key) => key) }
  };
  global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
  global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
  global.window = global;
  global.Actor = { create: vi.fn() };
  global.window.GAS = { 
    log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
    dnd5eVersion: 4
  };
  global.foundry = {
    utils: {
      deepClone: vi.fn((obj) => JSON.parse(JSON.stringify(obj)))
    }
  };
});

describe('Spell Finalization Workflow', () => {
  it('should properly finalize spells and add them to the character', async () => {
    // Mock actor with spells
    const mockActor = {
      id: 'actor-123',
      name: 'Test Bard',
      items: { find: vi.fn(() => null) }, // No existing spells
      createEmbeddedDocuments: vi.fn(() => Promise.resolve([
        { id: 'spell1', name: 'Magic Missile' },
        { id: 'spell2', name: 'Cure Wounds' }
      ]))
    };

    // Mock selected spells
    const mockSpellData1 = {
      id: 'spell1',
      name: 'Magic Missile',
      type: 'spell',
      toObject: () => ({ id: 'spell1', name: 'Magic Missile', type: 'spell' })
    };
    const mockSpellData2 = {
      id: 'spell2', 
      name: 'Cure Wounds',
      type: 'spell',
      toObject: () => ({ id: 'spell2', name: 'Cure Wounds', type: 'spell' })
    };

    // Import the spell selection store
    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');
    
    // Test the spell finalization function directly - first with no spells
    const result = await finalizeSpellSelection(mockActor);
    expect(result).toBe(false); // No spells selected, so should return false

    // Test with spells in the store - we need to mock the get function to return spells
    const { get } = await import('svelte/store');
    const mockMap = new Map([
      ['spell1', { itemData: mockSpellData1 }],
      ['spell2', { itemData: mockSpellData2 }]
    ]);
    get.mockReturnValueOnce(mockMap);

    const resultWithSpells = await finalizeSpellSelection(mockActor);

    expect(resultWithSpells).toBe(true);
    expect(mockActor.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
      { id: 'spell1', name: 'Magic Missile', type: 'spell' },
      { id: 'spell2', name: 'Cure Wounds', type: 'spell' }
    ]);
    expect(global.ui.notifications.info).toHaveBeenCalledWith("Added 2 spells to character");
  });

  it('should handle duplicate spells correctly', async () => {
    // Mock actor with existing spell
    const mockActor = {
      id: 'actor-123',
      name: 'Test Bard',
      items: { 
        find: vi.fn((predicate) => {
          // Test with actual spell objects to see what predicate receives
          const testSpell = { name: 'Magic Missile', type: 'spell' };
          if (predicate(testSpell)) {
            return { id: 'existing-spell1', name: 'Magic Missile', type: 'spell' };
          }
          return null;
        })
      },
      createEmbeddedDocuments: vi.fn(() => Promise.resolve([
        { id: 'spell2', name: 'Cure Wounds' }
      ]))
    };

    const mockSpellData1 = {
      id: 'spell1',
      name: 'Magic Missile',
      type: 'spell',
      toObject: () => ({ id: 'spell1', name: 'Magic Missile', type: 'spell' })
    };
    const mockSpellData2 = {
      id: 'spell2', 
      name: 'Cure Wounds',
      type: 'spell',
      toObject: () => ({ id: 'spell2', name: 'Cure Wounds', type: 'spell' })
    };

    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');
    const { get } = await import('svelte/store');
    
    const mockMap = new Map([
      ['spell1', { itemData: mockSpellData1 }],
      ['spell2', { itemData: mockSpellData2 }]
    ]);
    get.mockReturnValueOnce(mockMap);

    const result = await finalizeSpellSelection(mockActor);

    expect(result).toBe(true);
    // Should only create Cure Wounds, not Magic Missile (duplicate)
    expect(mockActor.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
      { id: 'spell2', name: 'Cure Wounds', type: 'spell' }
    ]);
    expect(global.ui.notifications.info).toHaveBeenCalledWith("Added 1 spells to character");
  });

  it('should verify workflow state machine has correct configuration for spells', async () => {
    // Import workflow state machine
    const { WORKFLOW_EVENTS, WORKFLOW_STATES } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Verify that the state machine has the correct events and states
    expect(WORKFLOW_EVENTS.SPELLS_COMPLETE).toBe('spells_complete');
    expect(WORKFLOW_STATES.SELECTING_SPELLS).toBe('selecting_spells');
    expect(WORKFLOW_STATES.COMPLETED).toBe('completed');
  });

  it('should handle error cases in spell finalization', async () => {
    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');

    // Test with null actor
    const resultNoActor = await finalizeSpellSelection(null);
    expect(resultNoActor).toBe(false);
    expect(global.ui.notifications.error).toHaveBeenCalledWith("No active character");

    // Test with actor but createEmbeddedDocuments throws error
    const errorActor = {
      id: 'error-actor',
      name: 'Error Actor',
      items: { find: vi.fn(() => null) },
      createEmbeddedDocuments: vi.fn(() => Promise.reject(new Error('Database error')))
    };

    const { get } = await import('svelte/store');
    get.mockReturnValueOnce(new Map([
      ['spell1', { 
        itemData: {
          toObject: () => ({ id: 'spell1', name: 'Test Spell', type: 'spell' })
        }
      }]
    ]));

    const resultError = await finalizeSpellSelection(errorActor);
    expect(resultError).toBe(false);
    expect(global.ui.notifications.error).toHaveBeenCalledWith("Error adding spells to character: Database error");
  });
});
