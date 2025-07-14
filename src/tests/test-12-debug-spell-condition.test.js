import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Debug Shopping Spell Selection Condition', () => {
  let mockGame, mockActor, mockBardClass, mockGet;

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

    // Mock a complete bard actor exactly as it would be persisted
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

    // Mock get function to return our actor from actorInGame store
    mockGet = vi.fn((store) => {
      console.log('mockGet called with store:', store);
      if (store.toString && store.toString().includes('actorInGame')) {
        console.log('Returning mockActor for actorInGame:', mockActor);
        return mockActor;
      }
      return {};
    });

    const mockWritable = (value) => ({ 
      set: vi.fn(), 
      update: vi.fn(), 
      subscribe: vi.fn(),
      toString: () => `writable(${JSON.stringify(value)})`
    });

    vi.doMock('svelte/store', () => ({ 
      writable: mockWritable, 
      get: mockGet 
    }));

    vi.doMock('~/src/stores/storeDefinitions', () => ({ 
      actorInGame: mockWritable(mockActor)
    }));

    // Mock other required modules
    vi.doMock('~/src/stores/index', () => ({
      preAdvancementSelections: mockWritable({}),
      dropItemRegistry: { advanceQueue: vi.fn(() => Promise.resolve()) },
      tabs: mockWritable([]),
      readOnlyTabs: mockWritable([]),
      activeTab: mockWritable('shop')
    }));
    vi.doMock('~/src/stores/startingEquipment', () => ({ compatibleStartingEquipment: mockWritable([]) }));
    vi.doMock('~/src/lib/workflow.js', () => ({ handleAdvancementCompletion: vi.fn() }));
    vi.doMock('~/src/helpers/AdvancementManager', () => ({ destroyAdvancementManagers: vi.fn() }));
    vi.doMock('~/src/helpers/constants', () => ({ MODULE_ID: 'foundryvtt-actor-studio' }));
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

  it('should debug exactly what happens in the _shouldShowSpellSelection function', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');

    // Step 1: Check if enableSpellSelection is working
    const enableSpellSelection = global.game.settings.get('foundryvtt-actor-studio', 'enableSpellSelection');
    console.log('enableSpellSelection:', enableSpellSelection);
    expect(enableSpellSelection).toBe(true);

    // Step 2: Check if get(actorInGame) returns our mock actor
    const currentActor = get(actorInGame);
    console.log('currentActor from get(actorInGame):', currentActor);
    expect(currentActor).toBeDefined();
    expect(currentActor.id).toBe('actor-123');

    // Step 3: Test the _shouldShowSpellSelection function directly
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    console.log('shouldShow result:', shouldShow);
    
    // Debug the function step by step
    console.log('currentActor.classes:', currentActor.classes);
    console.log('Object.keys(currentActor.classes):', Object.keys(currentActor.classes || {}));
    
    const classes = currentActor.classes || {};
    const classKeys = Object.keys(classes);
    console.log('classKeys:', classKeys);
    
    if (classKeys.length > 0) {
      const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
        const progression = classData?.system?.spellcasting?.progression;
        console.log(`Class ${className} progression:`, progression);
        return { className, progression, isSpellcaster: progression && progression !== "none" };
      });
      console.log('spellcastingInfo:', spellcastingInfo);
      
      const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
      console.log('isSpellcaster from progression:', isSpellcaster);
      
      if (!isSpellcaster) {
        const knownSpellcastingClasses = [
          'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
          'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
        ];
        const hasKnownSpellcastingClass = classKeys.some(className => knownSpellcastingClasses.includes(className.toLowerCase()));
        console.log('hasKnownSpellcastingClass:', hasKnownSpellcastingClass);
      }
    }

    // This should be true for a bard
    expect(shouldShow).toBe(true);
  });

  it('should test the exact condition as used in the shopping state', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');

    // This is the exact condition from the shopping state
    const currentActor = get(actorInGame);
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    
    console.log('Shopping state condition - currentActor:', currentActor);
    console.log('Shopping state condition - shouldShow:', shouldShow);
    
    // Debug the mockGet function behavior
    expect(mockGet).toHaveBeenCalled();
    console.log('mockGet call count:', mockGet.mock.calls.length);
    console.log('mockGet calls:', mockGet.mock.calls);

    expect(shouldShow).toBe(true);
  });
});
