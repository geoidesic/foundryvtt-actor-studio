import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Debug workflowFSMContext _shouldShowSpellSelection', () => {
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

    // Create a complete bard actor
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

    // Mock minimal required modules
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

  it('should debug the exact issue with workflowFSMContext properties', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');

    console.log('=== Testing workflowFSMContext properties ===');
    console.log('workflowFSMContext.preCreationActor:', workflowFSMContext.preCreationActor);
    console.log('workflowFSMContext.postCreationActor:', workflowFSMContext.postCreationActor);
    console.log('workflowFSMContext.actor:', workflowFSMContext.actor);

    // Test the function with an actor parameter
    console.log('\n=== Testing _shouldShowSpellSelection with mockActor parameter ===');
    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    console.log('Result with mockActor parameter:', result);
    expect(result).toBe(true);

    // Now set preCreationActor and see if it overrides the parameter
    console.log('\n=== Setting workflowFSMContext.preCreationActor to undefined ===');
    workflowFSMContext.preCreationActor = undefined;
    const result2 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    console.log('Result with preCreationActor=undefined:', result2);
    expect(result2).toBe(true);

    // Test what happens with an invalid preCreationActor
    console.log('\n=== Setting workflowFSMContext.preCreationActor to empty object ===');
    workflowFSMContext.preCreationActor = {};
    const result3 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    console.log('Result with preCreationActor={}:', result3);
    // This should fail because the function will use the empty preCreationActor instead of mockActor
    expect(result3).toBe(false);
    
    // Test what happens with null 
    console.log('\n=== Setting workflowFSMContext.preCreationActor to null ===');
    workflowFSMContext.preCreationActor = null;
    const result4 = workflowFSMContext._shouldShowSpellSelection(mockActor);
    console.log('Result with preCreationActor=null:', result4);
    expect(result4).toBe(true);
  });

  it('should test the exact scenario from the shopping state condition', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');

    // Set the actor in the store as it would be in real usage
    actorInGame.set(mockActor);
    const currentActor = get(actorInGame);
    
    console.log('=== Testing exact shopping state scenario ===');
    console.log('currentActor from store:', currentActor);
    console.log('workflowFSMContext.preCreationActor:', workflowFSMContext.preCreationActor);
    
    // This is the exact call from the shopping state condition
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    console.log('shouldShow result:', shouldShow);
    
    // Test if the issue is a context property override
    if (workflowFSMContext.preCreationActor !== undefined) {
      console.log('preCreationActor is overriding the parameter!');
      console.log('preCreationActor value:', workflowFSMContext.preCreationActor);
    }
    
    // Test if the issue is the actor not being found in store
    if (!currentActor || Object.keys(currentActor).length === 0) {
      console.log('currentActor from store is empty or undefined');
    }

    // This should be true for a bard, but might be false due to context issues
    // Don't assert here - let's see what actually happens
    console.log('Final shouldShow result:', shouldShow);
  });

  it('should test the fix - ensuring context properties dont override the parameter', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');

    // Set the actor in the store
    actorInGame.set(mockActor);
    const currentActor = get(actorInGame);
    
    // Clear any context properties that might interfere
    workflowFSMContext.preCreationActor = undefined;
    workflowFSMContext.postCreationActor = undefined;
    
    console.log('=== Testing with cleared context properties ===');
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(currentActor);
    console.log('shouldShow with cleared context:', shouldShow);
    
    // This should work correctly now
    expect(shouldShow).toBe(true);
  });
});
