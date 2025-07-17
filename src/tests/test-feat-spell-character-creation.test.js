import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FoundryVTT globals
global.game = {
  settings: { 
    get: vi.fn((module, key) => {
      if (key === 'enableSpellSelection') return true;
      if (key === 'enabledSpellPacks') return ['dnd5e.spells'];
      return true;
    })
  },
  i18n: { localize: vi.fn((key) => key) },
  packs: new Map()
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.window = global;
global.Actor = { create: vi.fn() };
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };

// Mock Svelte stores
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
  toString: () => 'derived()'
});
const mockGet = vi.fn((store) => {
  if (store.toString?.().includes('actorInGame')) {
    return mockActor;
  }
  if (store.toString?.().includes('isLevelUp')) {
    return false; // Character creation workflow
  }
  return {};
});

vi.mock('svelte/store', () => ({ 
  writable: mockWritable, 
  derived: mockDerived, 
  get: mockGet 
}));

// Mock required stores
vi.mock('~/src/stores/storeDefinitions', () => ({
  actorInGame: mockWritable(null),
  levelUpTabs: mockWritable([]),
  isLevelUp: mockWritable(false)
}));

vi.mock('~/src/stores/index', () => ({
  actorInGame: mockWritable(null),
  isLevelUp: mockWritable(false),
  tabs: mockWritable([]),
  activeTab: mockWritable(''),
  readOnlyTabs: mockWritable([])
}));

// Mock other dependencies
vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: mockWritable([])
}));

vi.mock('~/src/stores/advancements', () => ({
  dropItemRegistry: { advanceQueue: vi.fn() }
}));

vi.mock('~/src/helpers/AdvancementManager', () => ({
  destroyAdvancementManagers: vi.fn()
}));

vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn()
}));

// Mock Finity
const mockFsm = { 
  handle: vi.fn(), 
  getCurrentState: vi.fn(() => 'idle'), 
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
  start: vi.fn(() => mockFsm)
};
vi.mock('finity', () => ({ default: mockFinity }));

// Create mock actor with Magic Initiate feat
const mockActor = {
  id: 'test-actor',
  name: 'Test Fighter',
  type: 'character',
  items: [
    {
      _id: 'feat-1',
      type: 'feat',
      name: 'Magic Initiate (Wizard)',
      system: {
        description: {
          value: '<p>Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class\'s spell list.</p><p>In addition, choose one 1st-level spell from that same list. You learn that spell and can cast it at its lowest level.</p>'
        }
      }
    }
  ],
  classes: {
    fighter: {
      name: 'Fighter',
      system: {
        spellcasting: { progression: 'none' }
      }
    }
  }
};

describe('Feat Spell Support for Character Creation', () => {
  let shouldShowFeatSpellSelection, parseFeatSpellRequirements;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import the functions we want to test
    const parser = await import('~/src/helpers/FeatSpellParser');
    shouldShowFeatSpellSelection = parser.shouldShowFeatSpellSelection;
    parseFeatSpellRequirements = parser.parseFeatSpellRequirements;
  });

  it('should detect when character has spell-granting feats', () => {
    const result = shouldShowFeatSpellSelection(mockActor);
    expect(result).toBe(true);
  });

  it('should parse Magic Initiate feat requirements', () => {
    const feats = mockActor.items.filter(item => item.type === 'feat');
    const requirements = parseFeatSpellRequirements(feats);
    
    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toMatchObject({
      featName: 'Magic Initiate (Wizard)',
      type: 'magic-initiate',
      spellCount: 3,
      cantrips: 2,
      choiceCount: 3,
      spellSources: ['wizard']
    });
  });

  it('should not show feat spells for actors without spell-granting feats', () => {
    const actorWithoutFeats = {
      ...mockActor,
      items: []
    };
    
    const result = shouldShowFeatSpellSelection(actorWithoutFeats);
    expect(result).toBe(false);
  });

  it('should work with character creation workflow', async () => {
    // Import workflow state machine  
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine');
    
    // Test the helper function
    const result = workflowFSMContext._shouldShowFeatSpellSelection(mockActor);
    expect(result).toBe(true);
  });
});
