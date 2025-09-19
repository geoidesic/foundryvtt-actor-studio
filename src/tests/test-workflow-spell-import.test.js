import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // Mock Foundry globals
  global.foundry = {
    utils: { deepClone: vi.fn(obj => JSON.parse(JSON.stringify(obj))) }
  };
  global.ui = {
    notifications: {
      info: vi.fn(),
      warn: vi.fn(), 
      error: vi.fn()
    }
  };
  global.window = globalThis;
  window.GAS = {
    log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
    close: vi.fn()
  };

  // Mock Svelte store
  vi.doMock('svelte/store', () => ({
    get: vi.fn(),
    writable: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() })),
    derived: vi.fn()
  }));

  // Mock the workflow FSM
  vi.doMock('~/src/helpers/WorkflowStateMachine', () => ({
    getWorkflowFSM: vi.fn(() => ({
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'selecting_spells')
    })),
    getLevelUpFSM: vi.fn(() => ({
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'selecting_spells')
    })),
    WORKFLOW_EVENTS: {
      SPELLS_COMPLETE: 'spells_complete',
      ERROR: 'error'
    },
    LEVELUP_EVENTS: {
      SPELLS_COMPLETE: 'spells_complete',
      ERROR: 'error'
    }
  }));

  // Mock other stores
  vi.doMock('~/src/stores/storeDefinitions', () => ({ goldRoll: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() } }));
  vi.doMock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() } }));
  vi.doMock('~/src/stores/index.js', () => ({ 
    tabs: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    activeTab: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    readOnlyTabs: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    level: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    characterLevel: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    characterClass: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    currentCharacter: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    isLevelUp: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
    newLevelValueForExistingClass: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
  }));
  vi.doMock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
  vi.doMock('~/src/helpers/Utility', () => ({
    getLevelByDropType: vi.fn(),
    itemHasAdvancementChoices: vi.fn(),
    isAdvancementsForLevelInItem: vi.fn(),
    dropItemOnCharacter: vi.fn()
  }));
});

describe('Workflow Spell Import', () => {
  it('should successfully import and use finalizeSpellSelection in workflow', async () => {
    // Mock spell progress as complete - this is crucial for the workflow
    const mockSpellProgress = {
      isComplete: true,
      totalRequired: 1,
      totalSelected: 1,
      limits: { cantrips: 0, spells: 1 },
      hasAllSpells: false
    };

    // Mock the spell selection module
    vi.doMock('~/src/stores/spellSelection.js', () => ({
      spellProgress: { subscribe: vi.fn() },
      selectedSpells: { subscribe: vi.fn() },
      finalizeSpellSelection: vi.fn(() => Promise.resolve(true))
    }));

    // Mock actor with proper items structure
    const mockActor = {
      id: 'actor-123',
      name: 'Test Wizard',
      items: {
        find: vi.fn(() => null), // No existing spells
        filter: vi.fn(() => []),
        contents: []
      },
      createEmbeddedDocuments: vi.fn(() => Promise.resolve([{ id: 'spell1', name: 'Fireball' }]))
    };

    // Import the workflow and stores
    const { handleFinalizeSpells } = await import('~/src/lib/workflow.js');
    const { get } = await import('svelte/store');

    // Mock stores
    const stores = { 
      actorInGame: { 
        subscribe: vi.fn(),
        set: vi.fn(),
        update: vi.fn() 
      },
      isLevelUp: {
        subscribe: vi.fn()
      }
    };
    const setProcessing = vi.fn();

    // Mock spell selection with proper structure
    const mockSpellItem = {
      toObject: () => ({ 
        id: 'fireball', 
        name: 'Fireball', 
        type: 'spell',
        system: { level: 3 }
      })
    };

    const selectedSpellsMap = new Map([
      ['fireball', { 
        itemData: mockSpellItem
      }]
    ]);

    // Mock get function to return appropriate values for each store
    get.mockImplementation((store) => {
      if (store === stores.actorInGame) {
        return mockActor;
      }
      if (store === stores.isLevelUp) {
        return false; // Character creation mode
      }
      // For spellProgress store access
      if (store.subscribe) {
        return mockSpellProgress;
      }
      // For selectedSpells store access
      return selectedSpellsMap;
    });

    // Test handleFinalizeSpells
    await handleFinalizeSpells({ stores, setProcessing });

    // Verify that finalizeSpellSelection was called
    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');
    expect(finalizeSpellSelection).toHaveBeenCalledWith(mockActor);
    expect(global.ui.notifications.info).toHaveBeenCalledWith("Spells added successfully");
  });
});
