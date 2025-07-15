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

  // Mock workflow FSM
  vi.doMock('~/src/helpers/WorkflowStateMachine', () => ({
    getWorkflowFSM: vi.fn(() => ({
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'selecting_spells')
    })),
    WORKFLOW_EVENTS: {
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
    readOnlyTabs: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
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
    // Mock actor
    const mockActor = {
      id: 'actor-123',
      name: 'Test Wizard',
      items: { find: vi.fn(() => null) },
      createEmbeddedDocuments: vi.fn(() => Promise.resolve([{ id: 'spell1', name: 'Fireball' }]))
    };

    // Import workflow
    const { handleFinalizeSpells } = await import('~/src/lib/workflow.js');
    const { get } = await import('svelte/store');

    // Mock stores
    const stores = { actorInGame: { get: () => mockActor } };
    const setProcessing = vi.fn();

    // Mock spell selection
    get.mockReturnValue(new Map([
      ['fireball', { 
        itemData: { 
          toObject: () => ({ id: 'fireball', name: 'Fireball', type: 'spell' }) 
        } 
      }]
    ]));

    // Test handleFinalizeSpells
    await handleFinalizeSpells({ stores, setProcessing });

    expect(mockActor.createEmbeddedDocuments).toHaveBeenCalled();
    expect(global.ui.notifications.info).toHaveBeenCalledWith("Spells added successfully");
  });
});
