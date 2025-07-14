import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Fixed Shopping State Condition - TDD', () => {
  let mockGame, mockActor, mockBardClass;

  beforeEach(() => {
    // Set up FoundryVTT globals exactly as they would be in real usage
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          // All features enabled like user's scenario
          if (key === 'enableEquipmentSelection') return true;
          if (key === 'enableEquipmentPurchase') return true;
          if (key === 'enableSpellSelection') return true;
          if (key === 'disableAdvancementCapture') return false;
          return false;
        })
      },
      i18n: { localize: vi.fn((key) => key) }
    };

    global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
    global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
    global.window = global;

    // Mock a complete bard actor as it would exist after character creation
    mockBardClass = {
      name: 'Bard',
      system: {
        spellcasting: {
          progression: 'full'
        }
      }
    };

    mockActor = {
      name: 'Test Bard Character',
      id: 'actor-123',
      type: 'character',
      system: { 
        currency: { gp: 50, sp: 0, cp: 0 },
        details: { class: 'bard' }
      },
      classes: {
        bard: mockBardClass
      },
      items: [],
      sheet: { render: vi.fn() }
    };

    global.Actor = { create: vi.fn(() => Promise.resolve(mockActor)) };
    global.window.GAS = { 
      log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }, 
      dnd5eVersion: 4
    };

    // Mock minimal stores
    vi.doMock('~/src/stores/index', () => ({
      preAdvancementSelections: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
      dropItemRegistry: { advanceQueue: vi.fn(() => Promise.resolve()) },
      tabs: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
      readOnlyTabs: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
      activeTab: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
    }));
    vi.doMock('~/src/stores/startingEquipment', () => ({ 
      compatibleStartingEquipment: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
    }));
    vi.doMock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
    vi.doMock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
    vi.doMock('~/src/helpers/constants', () => ({ MODULE_ID: 'foundryvtt-actor-studio' }));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.doUnmock('~/src/stores/index');
    vi.doUnmock('~/src/stores/startingEquipment');
    vi.doUnmock('~/src/lib/workflow.js');
    vi.doUnmock('~/src/helpers/AdvancementManager');
    vi.doUnmock('~/src/helpers/constants');
  });

  it('should fix the issue where preCreationActor overrides inGameActor parameter', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Test 1: With a valid actor parameter, should ignore context properties
    const result1 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result1).toBe(true);

    // Test 2: Set preCreationActor to empty object (this was breaking before the fix)
    workflowFSMContext.preCreationActor = {};
    const result2 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    // After fix: should still use mockActor parameter, not the empty preCreationActor
    expect(result2).toBe(true);

    // Test 3: Set preCreationActor to null (this was breaking before the fix)
    workflowFSMContext.preCreationActor = null;
    const result3 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result3).toBe(true);

    // Test 4: Set preCreationActor to a valid actor but parameter should still take precedence
    const validPreCreationActor = { classes: { wizard: { system: { spellcasting: { progression: 'full' } } } } };
    workflowFSMContext.preCreationActor = validPreCreationActor;
    const result4 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    // Should still use the bard from the parameter, not the wizard from context
    expect(result4).toBe(true);
  });

  it('should use context actors as fallback when no parameter is provided', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Test fallback behavior when no inGameActor parameter
    workflowFSMContext.preCreationActor = mockActor;
    const result = workflowFSMContext._shouldShowSpellSelection(null);
    expect(result).toBe(true);

    // Test with undefined parameter
    const result2 = workflowFSMContext._shouldShowSpellSelection(undefined);
    expect(result2).toBe(true);
  });

  it('should fix the shopping state transition with the corrected condition', async () => {
    const realFinity = await import('finity');
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Mock get to return our actor (simulating actorInGame store with valid data)
    const mockGet = vi.fn(() => mockActor);
    vi.doMock('svelte/store', () => ({ 
      writable: vi.fn(), 
      get: mockGet 
    }));
    vi.doMock('~/src/stores/storeDefinitions', () => ({ 
      actorInGame: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
    }));

    // Re-import to get the mocked version
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');

    // Set up potential interfering context properties
    workflowFSMContext.preCreationActor = {}; // This was causing issues before
    workflowFSMContext.postCreationActor = undefined;

    // Create the FSM with exact condition from shopping state
    const testFSM = realFinity.default
      .configure()
      .initialState('shopping')
      .state('shopping')
        .on(['shopping_complete'])
          .transitionTo('selecting_spells').withCondition((context) => {
            // Exact code from WorkflowStateMachine.js shopping state
            const currentActor = get(actorInGame);
            const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
            window.GAS.log.d('[FSM] shopping_complete -> selecting_spells condition (using actorInGame):', shouldShow);
            return shouldShow;
          })
          .transitionTo('completed')
      .state('selecting_spells')
      .state('completed')
      .start();

    expect(testFSM.getCurrentState()).toBe('shopping');

    // This should NOT throw "Unhandled event" error anymore
    expect(() => {
      testFSM.handle('shopping_complete');
    }).not.toThrow();

    // Should transition to selecting_spells for a bard
    expect(testFSM.getCurrentState()).toBe('selecting_spells');
  });

  it('should reproduce and fix the original user error scenario', async () => {
    const { createWorkflowStateMachine, WORKFLOW_EVENTS, workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Mock get to return our actor (as it would be in real workflow after character creation)
    const mockGet = vi.fn(() => mockActor);
    vi.doMock('svelte/store', () => ({ 
      writable: vi.fn(), 
      get: mockGet 
    }));
    vi.doMock('~/src/stores/storeDefinitions', () => ({ 
      actorInGame: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
    }));

    // Simulate the context state that might exist during shopping
    workflowFSMContext.preCreationActor = {}; // Potentially problematic state
    workflowFSMContext.actor = mockActor; // This might be different from actorInGame

    // Test the exact condition that was failing
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    
    const currentActor = get(actorInGame);
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    
    // With the fix, this should now return true even with problematic context
    expect(shouldShow).toBe(true);
    expect(currentActor).toBe(mockActor);
    
    console.log('Fixed condition result:', shouldShow);
  });
});
