import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FoundryVTT globals
global.game = {
  settings: { get: vi.fn() },
  i18n: { localize: vi.fn((key) => key) }
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.window = global;
global.Actor = { create: vi.fn() };
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };

// Mock FoundryVTT Collection class
global.Collection = class Collection {
  constructor(entries = []) {
    this.entries = entries;
  }
  
  values() {
    return this.entries;
  }
  
  get size() {
    return this.entries.length;
  }
};

// Mock MODULE_ID
vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

// Mock store dependencies
const mockWritable = (value) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });
const mockDerived = (stores, fn) => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() });
const mockGet = vi.fn(() => ({}));

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  derived: mockDerived,
  get: mockGet
}));

// Mock all the required modules
vi.mock('~/src/helpers/Utility', () => ({
  getPacksFromSettings: vi.fn(() => []),
  extractItemsFromPacksAsync: vi.fn(() => [])
}));

vi.mock('~/src/stores/index', () => ({
  readOnlyTabs: mockWritable([]),
  characterClass: mockWritable({ name: 'Fighter' }),
  level: mockWritable(1),
  isLevelUp: mockWritable(false),
  newLevelValueForExistingClass: mockWritable(null)
}));

vi.mock('~/src/helpers/AdvancementManager', () => ({
  destroyAdvancementManagers: vi.fn()
}));

describe('Magic Initiate Detection', () => {
  let workflowFSMContext;

  beforeEach(() => {
    // Enable spell selection setting by default
    global.game.settings.get.mockReturnValue(true);
    
    // Import the WorkflowStateMachine to get the context
    return import('~/src/helpers/WorkflowStateMachine.js').then((module) => {
      workflowFSMContext = module.workflowFSMContext;
    });
  });

  it('should detect Magic Initiate feat correctly', () => {
    // Mock FoundryVTT Collection-like structure
    const mockItems = [
      {
        type: 'feat',
        name: 'Magic Initiate',
        system: {
          description: {
            value: '<p>Choose a class: Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard. You learn two cantrips of your choice from that class\'s spell list.</p>'
          }
        }
      }
    ];

    // Create actual Collection instance for proper testing
    const mockCollection = new global.Collection(mockItems);
    
    // Mock actor with Collection-like items
    const mockActor = {
      items: mockCollection,
      classes: {} // Ensure no class-based spellcasting
    };

    // Test the spell detection function
    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    
    expect(result).toBe(true);
  });

  it('should detect Magic Initiate with different case variations', () => {
    const mockItems = [
      {
        type: 'feat',
        name: 'magic initiate',  // lowercase
        system: {
          description: {
            value: '<p>You learn two cantrips of your choice.</p>'
          }
        }
      }
    ];

    const mockActor = {
      items: new global.Collection(mockItems),
      classes: {}
    };

    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result).toBe(true);
  });

  it('should detect Magic Initiate from description text', () => {
    const mockItems = [
      {
        type: 'feat',
        name: 'Custom Feat Name',
        system: {
          description: {
            value: '<p>This is a magic initiate style feat. You learn two cantrips of your choice.</p>'
          }
        }
      }
    ];

    const mockActor = {
      items: new global.Collection(mockItems),
      classes: {}
    };

    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result).toBe(true);
  });

  it('should detect other spell-granting feats', () => {
    const spellGrantingFeats = [
      'Ritual Caster',
      'Fey Touched', 
      'Shadow Touched',
      'Telekinetic',
      'Telepathic',
      'Eldritch Adept',
      'Aberrant Dragonmark'
    ];

    spellGrantingFeats.forEach(featName => {
      const mockItems = [
        {
          type: 'feat',
          name: featName,
          system: {
            description: {
              value: '<p>This feat grants spells.</p>'
            }
          }
        }
      ];

      const mockActor = {
        items: new global.Collection(mockItems),
        classes: {}
      };

      const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
      expect(result).toBe(true);
    });
  });

  it('should detect feats with "you learn...spell" pattern', () => {
    const mockItems = [
      {
        type: 'feat',
        name: 'Custom Spell Feat',
        system: {
          description: {
            value: '<p>At 3rd level, you learn the misty step spell and can cast it once without expending a spell slot.</p>'
          }
        }
      }
    ];

    const mockActor = {
      items: new global.Collection(mockItems),
      classes: {}
    };

    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result).toBe(true);
  });

  it('should not detect non-spell feats', () => {
    const mockItems = [
      {
        type: 'feat',
        name: 'Great Weapon Master',
        system: {
          description: {
            value: '<p>You can make melee attacks with two-handed weapons.</p>'
          }
        }
      }
    ];

    const mockActor = {
      items: new global.Collection(mockItems),
      classes: {}
    };

    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result).toBe(false);
  });

  it('should handle actors with no feats', () => {
    const mockActor = {
      items: new global.Collection([]),
      classes: {}
    };

    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result).toBe(false);
  });

  it('should handle spell detection settings being disabled', () => {
    // Mock spell selection being disabled
    global.game.settings.get.mockReturnValue(false);
    
    const mockItems = [
      {
        type: 'feat',
        name: 'Magic Initiate',
        system: {
          description: {
            value: '<p>You learn two cantrips.</p>'
          }
        }
      }
    ];

    const mockActor = {
      items: new global.Collection(mockItems),
      classes: {}
    };

    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);
    expect(result).toBe(false);
  });
});
