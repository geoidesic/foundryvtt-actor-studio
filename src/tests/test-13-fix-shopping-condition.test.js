import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Fix Shopping State Condition - Real Store Behavior', () => {
  let mockGame, mockActor, mockBardClass;

  beforeEach(() => {
    // Set up FoundryVTT globals
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          if (key === 'enableSpellSelection') return true;
          return false;
        })
      }
    };

    global.window = global;
    global.window.GAS = { log: { d: vi.fn() } };

    // Create a complete bard actor as it would exist after creation
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
      classes: {
        bard: mockBardClass
      },
      sheet: { render: vi.fn() }
    };

    // Don't mock svelte/store - let it work normally
    // This way we can test the real store behavior

    // Mock the modules that import stores
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
    vi.doMock('~/src/lib/workflow.js');
    vi.doMock('~/src/helpers/AdvancementManager');
    vi.doMock('~/src/helpers/constants');
  });

  it('should test shopping state condition with real store behavior', async () => {
    // Import real stores and get functions
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Simulate what happens in the real workflow - set the actor in the store
    actorInGame.set(mockActor);

    // Test the condition as it runs in the shopping state
    const currentActor = get(actorInGame);
    console.log('Real store - currentActor:', currentActor);
    expect(currentActor).toBe(mockActor);
    expect(currentActor.id).toBe('actor-123');

    // Test the spell selection function
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    console.log('Real store - shouldShow:', shouldShow);

    // Debug the function step by step
    console.log('classes:', currentActor.classes);
    const classes = currentActor.classes || {};
    const classKeys = Object.keys(classes);
    console.log('classKeys:', classKeys);

    expect(classKeys.length).toBeGreaterThan(0);
    expect(shouldShow).toBe(true);
  });

  it('should test the Finity condition with real stores', async () => {
    const realFinity = await import('finity');
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Set up the actor in the store as it would be in real usage
    actorInGame.set(mockActor);

    // Create the exact FSM condition from shopping state
    const testFSM = realFinity.default
      .configure()
      .initialState('shopping')
      .state('shopping')
        .on(['shopping_complete'])
          .transitionTo('selecting_spells').withCondition((context) => {
            // Exact code from WorkflowStateMachine.js line ~169-175
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

    // This should work without throwing "Unhandled event"
    testFSM.handle('shopping_complete');

    // Should transition to selecting_spells for a bard
    expect(testFSM.getCurrentState()).toBe('selecting_spells');
  });

  it('should test that the issue is not in the store but in the condition function', async () => {
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    // Set up the actor in the store
    actorInGame.set(mockActor);
    const currentActor = get(actorInGame);
    
    // Test each step of the _shouldShowSpellSelection function
    console.log('=== Testing _shouldShowSpellSelection step by step ===');
    
    // Step 1: Check settings
    const enableSpellSelection = global.game.settings.get('foundryvtt-actor-studio', 'enableSpellSelection');
    console.log('enableSpellSelection:', enableSpellSelection);
    expect(enableSpellSelection).toBe(true);

    // Step 2: Check actor
    console.log('currentActor:', currentActor);
    expect(currentActor).toBeDefined();

    // Step 3: Check classes
    const classes = currentActor.classes || {};
    console.log('classes:', classes);
    expect(Object.keys(classes).length).toBeGreaterThan(0);

    // Step 4: Check spellcasting progression
    const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
      const progression = classData?.system?.spellcasting?.progression;
      console.log(`Class ${className} progression:`, progression);
      return { className, progression, isSpellcaster: progression && progression !== "none" };
    });
    console.log('spellcastingInfo:', spellcastingInfo);

    const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
    console.log('isSpellcaster:', isSpellcaster);
    
    // Call the function and see what happens
    const result = workflowFSMContext._shouldShowSpellSelection(currentActor);
    console.log('Final result:', result);
    
    expect(result).toBe(true);
  });
});
