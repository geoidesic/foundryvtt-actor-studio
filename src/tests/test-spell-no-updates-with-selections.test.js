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

  // Mock Svelte store base
  vi.doMock('svelte/store', () => ({
    get: vi.fn(),
    writable: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() })),
    derived: vi.fn()
  }));
});

describe('FinalizeSpells regression: no updates but selections exist', () => {
  it('should still finalize and add spells when noUpdatesNeeded=true (creation workflow)', async () => {
    // Ensure fresh module graph so our mocks apply to imports in this test
    vi.resetModules();
    // Mocks specific to this test
    const fsmHandle = vi.fn();
    const workflowFSMMock = { handle: fsmHandle, getCurrentState: vi.fn(() => 'selecting_spells') };
    vi.doMock('~/src/helpers/WorkflowStateMachine', () => ({
      getWorkflowFSM: vi.fn(() => workflowFSMMock),
      WORKFLOW_EVENTS: { SPELLS_COMPLETE: 'spells_complete', ERROR: 'error' },
      LEVELUP_EVENTS: { SPELLS_COMPLETE: 'spells_complete', ERROR: 'error' }
    }));

    // Also mock the dedicated LevelUpStateMachine module used by workflow.js
    vi.doMock('~/src/helpers/LevelUpStateMachine', () => ({
      getLevelUpFSM: vi.fn(() => ({ handle: vi.fn(), getCurrentState: vi.fn(() => 'selecting_spells') })),
      levelUpFSMContext: {},
      LEVELUP_EVENTS: { SPELLS_COMPLETE: 'spells_complete', ERROR: 'error', RESET: 'reset' }
    }));

    // Mock spell selection module exports with identifiable store objects
    const spellProgressStore = { subscribe: vi.fn(), __name: 'spellProgress' };
    const selectedSpellsStore = { subscribe: vi.fn(), __name: 'selectedSpells' };
    const finalizeSpellSelectionMock = vi.fn(() => Promise.resolve(true));
    vi.doMock('~/src/stores/spellSelection.js', () => ({
      spellProgress: spellProgressStore,
      selectedSpells: selectedSpellsStore,
      finalizeSpellSelection: finalizeSpellSelectionMock
    }));

    // Import after mocks
    const { handleFinalizeSpells } = await import('~/src/lib/workflow.js');
    const { get } = await import('svelte/store');

    // Mock actor and stores
    const mockActor = { id: 'actor-123', name: 'Test Cleric', items: { find: vi.fn(), filter: vi.fn() } };
    const stores = {
      actorInGame: { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() },
      isLevelUp: { subscribe: vi.fn() }
    };
    const setProcessing = vi.fn();

    // Spell progress reports complete, but noUpdatesNeeded true
    const mockSpellProgress = {
      isComplete: true,
      noUpdatesNeeded: true,
      limits: { cantrips: 0, spells: 0 },
      totalSelected: 1,
      totalRequired: 0
    };
    const selectedSpellsMap = new Map([
      ['cure-wounds', { itemData: { toObject: () => ({ name: 'Cure Wounds', type: 'spell' }) } }]
    ]);

    // Return correct values from get() based on store identity
    get.mockImplementation((store) => {
      if (store === stores.actorInGame) return mockActor;
      if (store === stores.isLevelUp) return false; // creation path
      if (store === spellProgressStore) return mockSpellProgress;
      if (store === selectedSpellsStore) return selectedSpellsMap;
      return undefined;
    });

    // Execute
    await handleFinalizeSpells({ stores, setProcessing });

    // Assertions
    expect(finalizeSpellSelectionMock).toHaveBeenCalledWith(mockActor);
    expect(ui.notifications.info).toHaveBeenCalledWith('Spells added successfully');
    expect(fsmHandle).toHaveBeenCalledWith('spells_complete');
  });

  it('should still finalize and add spells when noUpdatesNeeded=true (level-up workflow)', async () => {
    // Ensure fresh module graph so our mocks apply to imports in this test
    vi.resetModules();
    // Mocks specific to this test
    const levelUpHandle = vi.fn();
    const levelUpFSMMock = { handle: levelUpHandle, getCurrentState: vi.fn(() => 'selecting_spells') };
    vi.doMock('~/src/helpers/WorkflowStateMachine', () => ({
      getWorkflowFSM: vi.fn(() => ({ handle: vi.fn(), getCurrentState: vi.fn(() => 'selecting_spells') })),
      WORKFLOW_EVENTS: { SPELLS_COMPLETE: 'spells_complete', ERROR: 'error' }
    }));

    // Mock the LevelUpStateMachine module that workflow.js actually imports from
    vi.doMock('~/src/helpers/LevelUpStateMachine', () => ({
      getLevelUpFSM: vi.fn(() => levelUpFSMMock),
      levelUpFSMContext: {},
      LEVELUP_EVENTS: { SPELLS_COMPLETE: 'spells_complete', ERROR: 'error', RESET: 'reset' }
    }));

    // Mock spell selection module exports with identifiable store objects
    const spellProgressStore = { subscribe: vi.fn(), __name: 'spellProgress' };
    const selectedSpellsStore = { subscribe: vi.fn(), __name: 'selectedSpells' };
    const finalizeSpellSelectionMock = vi.fn(() => Promise.resolve(true));
    vi.doMock('~/src/stores/spellSelection.js', () => ({
      spellProgress: spellProgressStore,
      selectedSpells: selectedSpellsStore,
      finalizeSpellSelection: finalizeSpellSelectionMock
    }));

    // Import after mocks
    const { handleFinalizeSpells } = await import('~/src/lib/workflow.js');
    const { get } = await import('svelte/store');

    // Mock actor and stores
    const mockActor = { id: 'actor-456', name: 'Test Cleric (Level Up)', items: { find: vi.fn(), filter: vi.fn() } };
    const stores = {
      actorInGame: { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() },
      isLevelUp: { subscribe: vi.fn() }
    };
    const setProcessing = vi.fn();

    // Spell progress reports complete, but noUpdatesNeeded true
    const mockSpellProgress = {
      isComplete: true,
      noUpdatesNeeded: true,
      limits: { cantrips: 0, spells: 0 },
      totalSelected: 1,
      totalRequired: 0
    };
    const selectedSpellsMap = new Map([
      ['healing-word', { itemData: { toObject: () => ({ name: 'Healing Word', type: 'spell' }) } }]
    ]);

    // Return correct values from get() based on store identity
    get.mockImplementation((store) => {
      if (store === stores.actorInGame) return mockActor;
      if (store === stores.isLevelUp) return true; // level-up path
      if (store === spellProgressStore) return mockSpellProgress;
      if (store === selectedSpellsStore) return selectedSpellsMap;
      return undefined;
    });

    // Execute
    await handleFinalizeSpells({ stores, setProcessing });

    // Assertions
    expect(finalizeSpellSelectionMock).toHaveBeenCalledWith(mockActor);
    expect(ui.notifications.info).toHaveBeenCalledWith('Spells added successfully');
    expect(levelUpHandle).toHaveBeenCalledWith('spells_complete');
  });
});
