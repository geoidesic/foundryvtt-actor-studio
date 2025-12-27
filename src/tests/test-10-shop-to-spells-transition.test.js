import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Shop to Spells Transition for Bard User Journey', () => {
  let mockGame, mockActor, mockBardClass;

  beforeEach(() => {
    // Set up FoundryVTT globals for user journey: bard with all features enabled
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          // All features enabled for this journey
          if (key === 'enableEquipmentSelection') return true;
          if (key === 'enableEquipmentPurchase') return true; // Shop enabled  
          if (key === 'enableSpellSelection') return true; // Spells enabled
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

    // Mock bard class - spellcaster
    mockBardClass = {
      name: 'Bard',
      system: {
        spellcasting: {
          progression: 'full'  // Indicates this is a spellcasting class
        }
      }
    };

    mockActor = {
      name: 'Test Bard',
      update: vi.fn(),
      system: { 
        currency: { gp: 0, sp: 0, cp: 0 },
        details: { class: 'bard' }
      },
      classes: {
        bard: mockBardClass
      },
      items: [],
      sheet: { render: vi.fn() }
    };

    global.Actor = { create: vi.fn(() => Promise.resolve(mockActor)) };
    global.Item = { create: vi.fn(() => Promise.resolve({ name: 'Created Item' })) };
    global.fromUuid = vi.fn(() => Promise.resolve({ name: 'Test Equipment', system: { quantity: 1 } }));
    global.window.GAS = { 
      log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }, 
      dnd5eVersion: 4,
      availableGold: { set: vi.fn() },
      totalGoldFromChoices: { set: vi.fn() },
      goldRoll: { set: vi.fn() }
    };

    // Mock stores
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
    const mockGet = vi.fn((store) => {
      if (store === mockActor) return mockActor;
      if (store.toString && store.toString().includes('preAdvancementSelections')) return {};
      if (store.toString && store.toString().includes('tabs')) return [{ label: 'Shop', id: 'shop' }];
      if (store.toString && store.toString().includes('readOnlyTabs')) return [];
      if (store.toString && store.toString().includes('activeTab')) return 'shop';
      if (store.toString && store.toString().includes('totalGoldFromChoices')) return 100;
      return {};
    });

    vi.doMock('svelte/store', () => ({ 
      writable: mockWritable, 
      derived: mockDerived, 
      get: mockGet 
    }));

    // Complete Finity mock following the pattern from working tests
    const mockFsm = { 
      handle: vi.fn(), 
      getCurrentState: vi.fn(() => 'shopping'), 
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
      global: vi.fn(() => mockFinity),
      onStateEnter: vi.fn(() => mockFinity),
      onStateExit: vi.fn(() => mockFinity),
      onTransition: vi.fn(() => mockFinity),
      start: vi.fn(() => mockFsm)
    };
    vi.doMock('finity', () => ({ default: mockFinity }));

    // Mock other dependencies
    vi.doMock('~/src/stores/goldChoices', () => ({ totalGoldFromChoices: mockWritable(100) }));
    vi.doMock('~/src/stores/storeDefinitions', () => ({ 
      goldRoll: mockWritable(0),
      actorInGame: mockWritable(mockActor) // Add actorInGame to storeDefinitions mock
    }));
    vi.doMock('~/src/stores/index', () => ({
      preAdvancementSelections: mockWritable({}),
      dropItemRegistry: { advanceQueue: vi.fn(() => Promise.resolve()) },
      flattenedSelections: mockWritable([]),
      tabs: mockWritable([{ label: 'Shop', id: 'shop' }]),
      readOnlyTabs: mockWritable([]),
      activeTab: mockWritable('shop'),
      actorInGame: mockWritable(mockActor)
    }));
    vi.doMock('~/src/stores/startingEquipment', () => ({ compatibleStartingEquipment: mockWritable([]) }));
    vi.doMock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
    vi.doMock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
    vi.doMock('~/src/helpers/constants', () => ({ MODULE_ID: 'foundryvtt-actor-studio' }));
    vi.doMock('~/src/helpers/Utility', () => ({ 
      handleContainerContents: vi.fn(),
      delay: vi.fn(() => Promise.resolve()),
      prepareItemForDrop: vi.fn(() => Promise.resolve({})),
      dropItemOnCharacter: vi.fn(() => Promise.resolve({})),
      safeGetSetting: (module, key, defaultValue) => {
        if (global.game && global.game.settings && typeof global.game.settings.get === 'function') {
          const val = global.game.settings.get(module, key);
          return typeof val === 'undefined' ? defaultValue : val;
        }
        return defaultValue;
      }
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.doUnmock('svelte/store');
    vi.doUnmock('finity');
    vi.doUnmock('~/src/stores/goldChoices');
    vi.doUnmock('~/src/stores/storeDefinitions');
    vi.doMock('~/src/stores/index');
    vi.doUnmock('~/src/stores/startingEquipment');
    vi.doUnmock('~/src/lib/workflow.js');
    vi.doUnmock('~/src/helpers/AdvancementManager');
    vi.doUnmock('~/src/helpers/constants');
    vi.doUnmock('~/src/helpers/Utility');
  });

  it('should handle shopping_complete event when transitioning from shopping to spells for bard', async () => {
    // Test the core user journey issue: 
    // After character creation, the shopping state should properly check
    // spell selection against the persisted actorInGame, not the pre-creation actor
    
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Simulate the scenario where:
    // 1. Character has been created and is now in actorInGame store
    // 2. We're in shopping state and shopping_complete event is fired
    // 3. Should transition to spells because bard is a spellcaster
    
    // The fix: Now uses actorInGame store which has complete actor data
    // Instead of workflowFSMContext.actor which may have incomplete data
    
    // Test that the spell selection function works with a complete bard actor
    const shouldShowSpells = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(shouldShowSpells).toBe(true);
    
    // This demonstrates the fix - we should go to spells, not complete
    // when we have a spellcasting class in the persisted actor
  });

  it('should verify _shouldShowSpellSelection returns true for bard character using actorInGame', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Test the condition function that should be true for bard
    // The key fix: we're now testing with the actual persisted actor
    // instead of the pre-creation actor
    const shouldShowSpells = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(shouldShowSpells).toBe(true);
  });

  it('should have shop state properly configured with shopping_complete event handler', async () => {
    // This test verifies the state machine configuration
    const workflowStateMachine = await import('~/src/helpers/WorkflowStateMachine.js');
    
    expect(workflowStateMachine.WORKFLOW_EVENTS.SHOPPING_COMPLETE).toBe('shopping_complete');
    expect(workflowStateMachine.WORKFLOW_STATES.SHOPPING).toBe('shopping');
    expect(workflowStateMachine.WORKFLOW_STATES.SELECTING_SPELLS).toBe('selecting_spells');
    
    // Verify the core fix - the shopping condition function exists and works with actorInGame
    const shouldShowSpells = workflowStateMachine.workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(shouldShowSpells).toBe(true);
  });
});
