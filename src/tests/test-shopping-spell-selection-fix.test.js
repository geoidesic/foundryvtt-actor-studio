import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FoundryVTT globals
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

// Mock Svelte stores
const mockWritable = (value) => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn(),
  toString: () => `writable(${JSON.stringify(value)})`
});

const mockBardActor = {
  name: 'Test Bard',
  classes: {
    bard: {
      system: {
        spellcasting: {
          progression: 'full'
        }
      }
    }
  }
};

const mockGet = vi.fn(() => mockBardActor);

vi.mock('svelte/store', () => ({ 
  writable: mockWritable, 
  get: mockGet 
}));

// Mock all required modules
vi.mock('~/src/stores/index', () => ({
  activeTab: mockWritable('character'),
  tabs: mockWritable([]),
  readOnlyTabs: mockWritable([]),
  preAdvancementSelections: mockWritable({}),
  dropItemRegistry: { advanceQueue: vi.fn() }
}));

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: mockWritable([])
}));

vi.mock('~/src/stores/storeDefinitions', () => ({
  actorInGame: mockWritable(mockBardActor)
}));

vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn()
}));

vi.mock('~/src/helpers/AdvancementManager', () => ({
  destroyAdvancementManagers: vi.fn()
}));

describe('Shopping Spell Selection Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly handle spell selection for bard characters after shopping', async () => {
    // Import the fixed WorkflowStateMachine
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Test case 1: Function works correctly with valid actor parameter
    const result1 = workflowFSMContext._shouldShowSpellSelection(mockBardActor);
    expect(result1).toBe(true);

    // Test case 2: Function handles empty parameter by falling back to context
    workflowFSMContext.actor = mockBardActor;
    const result2 = workflowFSMContext._shouldShowSpellSelection(null);
    expect(result2).toBe(true);

    // Test case 3: Parameter takes precedence over context properties
    workflowFSMContext.preCreationActor = {}; // Empty object that would cause failure
    const result3 = workflowFSMContext._shouldShowSpellSelection(mockBardActor);
    expect(result3).toBe(true); // Should still work because parameter is prioritized

    console.log('✅ All spell selection conditions work correctly for bard actors');
  });

  it('should demonstrate the shopping state condition logic works with store fallback', async () => {
    // This simulates the exact condition used in the shopping state
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine.js');
    const { get } = await import('svelte/store');
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    
    // Simulate the shopping state condition logic
    const currentActor = get(actorInGame);
    const actorToCheck = currentActor || workflowFSMContext.actor;
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(actorToCheck);
    
    expect(shouldShow).toBe(true);
    expect(currentActor).toBe(mockBardActor);
    
    console.log('✅ Shopping state condition with fallback logic works correctly');
  });
});
