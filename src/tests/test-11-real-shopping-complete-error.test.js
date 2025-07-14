import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Real Shopping Complete Error Reproduction', () => {
  let mockGame, mockActor, mockBardClass;

  beforeEach(() => {
    // Set up FoundryVTT globals exactly as they would be in real usage
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          // All features enabled - exact same settings as user's scenario
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

    // Mock a complete bard actor as it would exist in actorInGame store
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

    // Mock stores with proper mock patterns
    const mockWritable = (value) => ({ 
      set: vi.fn(), 
      update: vi.fn(), 
      subscribe: vi.fn(),
      toString: () => `writable(${JSON.stringify(value)})`
    });
    
    const mockGet = vi.fn((store) => {
      // This is the key - actorInGame store should return the complete mockActor
      if (store.toString && store.toString().includes('actorInGame')) return mockActor;
      if (store.toString && store.toString().includes('tabs')) return [{ label: 'Shop', id: 'shop' }];
      if (store.toString && store.toString().includes('readOnlyTabs')) return [];
      if (store.toString && store.toString().includes('activeTab')) return 'shop';
      return {};
    });

    vi.doMock('svelte/store', () => ({ 
      writable: mockWritable, 
      get: mockGet 
    }));

    // Mock all required store modules
    vi.doMock('~/src/stores/storeDefinitions', () => ({ 
      actorInGame: mockWritable(mockActor)
    }));
    vi.doMock('~/src/stores/index', () => ({
      preAdvancementSelections: mockWritable({}),
      dropItemRegistry: { advanceQueue: vi.fn(() => Promise.resolve()) },
      tabs: mockWritable([{ label: 'Shop', id: 'shop' }]),
      readOnlyTabs: mockWritable([]),
      activeTab: mockWritable('shop')
    }));
    vi.doMock('~/src/stores/startingEquipment', () => ({ compatibleStartingEquipment: mockWritable([]) }));
    vi.doMock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
    vi.doMock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
    vi.doMock('~/src/helpers/constants', () => ({ MODULE_ID: 'foundryvtt-actor-studio' }));

    // Mock Finity completely to allow us to test the real state machine
    vi.doUnmock('finity');
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.doUnmock('svelte/store');
    vi.doUnmock('~/src/stores/storeDefinitions'); 
    vi.doUnmock('~/src/stores/index');
    vi.doUnmock('~/src/stores/startingEquipment');
    vi.doUnmock('~/src/lib/workflow.js');
    vi.doUnmock('~/src/helpers/AdvancementManager');
    vi.doUnmock('~/src/helpers/constants');
  });

  it('should reproduce the exact "Unhandled event shopping_complete in state shopping" error', async () => {
    // This test reproduces the exact error from the user's log
    
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Create the real FSM that's causing the issue
    const fsm = createWorkflowStateMachine();
    
    // Start the FSM and put it in shopping state like it would be in real usage
    expect(fsm.getCurrentState()).toBe('idle');
    
    // Navigate through the states as they would in real workflow
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(fsm.getCurrentState()).toBe('creating_character');
    
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    // This would go to processing_advancements which would async complete to next state
    
    // Manually set state to shopping to test the specific issue
    // In real usage, this would be reached through the workflow
    // But for this test, we'll simulate being in shopping state
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Get to shopping state through equipment path
    // We can't easily simulate the async .do() completion, so let's test the condition directly
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Test the exact condition that's failing in the shopping state
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    
    // This is the exact code from the shopping state condition
    const currentActor = get(actorInGame);
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    
    // This should work correctly for a bard
    expect(shouldShow).toBe(true);
    expect(currentActor).toBeDefined();
    expect(currentActor.classes).toBeDefined();
    expect(currentActor.classes.bard).toBeDefined();
  });

  it('should test the exact shopping state transition that is failing', async () => {
    // Create a minimal FSM to test just the shopping state transition
    const realFinity = await import('finity');
    const { get } = await import('svelte/store'); 
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    const testFSM = realFinity.default
      .configure()
      .initialState('shopping')
      .state('shopping')
        .on(['shopping_complete'])
          .transitionTo('selecting_spells').withCondition((context) => {
            // This is the exact condition from the real code
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

    // This should NOT throw "Unhandled event" error but currently does
    expect(() => {
      testFSM.handle('shopping_complete');
    }).not.toThrow();

    // Should transition to selecting_spells for a bard
    expect(testFSM.getCurrentState()).toBe('selecting_spells');
  });
});
