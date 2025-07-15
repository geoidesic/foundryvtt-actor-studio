import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  // Mock Foundry globals
  global.foundry = {
    utils: {
      deepClone: vi.fn(obj => JSON.parse(JSON.stringify(obj)))
    }
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
    log: {
      d: vi.fn(),
      w: vi.fn(),
      e: vi.fn()
    },
    finalizeSpellSelection: null,
    close: vi.fn()
  };

  // Mock Svelte store
  vi.doMock('svelte/store', () => ({
    get: vi.fn(),
    writable: vi.fn(() => ({
      set: vi.fn(),
      update: vi.fn(),
      subscribe: vi.fn()
    })),
    derived: vi.fn(),
    readable: vi.fn()
  }));
});

describe('Spell Workflow Integration', () => {
  it('should verify complete spell finalization workflow', async () => {
    // Mock actor
    const mockActor = {
      id: 'actor-123',
      name: 'Test Wizard',
      items: { 
        find: vi.fn(() => null) // No existing spells
      },
      createEmbeddedDocuments: vi.fn(() => Promise.resolve([
        { id: 'spell1', name: 'Fireball' }
      ]))
    };

    // Import spell finalization
    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');
    const { get } = await import('svelte/store');

    // Mock spell selection
    const mockSpellData = {
      id: 'fireball',
      name: 'Fireball',
      type: 'spell',
      toObject: () => ({ id: 'fireball', name: 'Fireball', type: 'spell' })
    };

    get.mockReturnValue(new Map([
      ['fireball', { itemData: mockSpellData }]
    ]));

    // Test finalization
    const result = await finalizeSpellSelection(mockActor);

    expect(result).toBe(true);
    expect(mockActor.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
      { id: 'fireball', name: 'Fireball', type: 'spell' }
    ]);
    expect(global.ui.notifications.info).toHaveBeenCalledWith("Added 1 spells to character");
  });

  it('should verify workflow state machine imports and exports correctly', async () => {
    // Import state machine constants
    const { WORKFLOW_EVENTS, WORKFLOW_STATES } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Verify required constants exist
    expect(WORKFLOW_EVENTS).toHaveProperty('SPELLS_COMPLETE');
    expect(WORKFLOW_STATES).toHaveProperty('SELECTING_SPELLS');
    expect(WORKFLOW_STATES).toHaveProperty('COMPLETED');

    expect(WORKFLOW_EVENTS.SPELLS_COMPLETE).toBe('spells_complete');
    expect(WORKFLOW_STATES.SELECTING_SPELLS).toBe('selecting_spells');
    expect(WORKFLOW_STATES.COMPLETED).toBe('completed');
  });

  it('should verify handleFinalizeSpells exists and is exported', async () => {
    // Import workflow function
    const workflow = await import('~/src/lib/workflow.js');

    expect(workflow).toHaveProperty('handleFinalizeSpells');
    expect(typeof workflow.handleFinalizeSpells).toBe('function');
  });

  it('should verify spell selection store exports finalizeSpellSelection', async () => {
    const spellStore = await import('~/src/stores/spellSelection.js');

    expect(spellStore).toHaveProperty('finalizeSpellSelection');
    expect(typeof spellStore.finalizeSpellSelection).toBe('function');
  });
});
