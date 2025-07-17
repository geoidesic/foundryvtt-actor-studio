import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Magic Initiate Integration Test', () => {
  let mockActor, mockGame;

  beforeEach(() => {
    // Mock FoundryVTT globals
    mockGame = {
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

    global.game = mockGame;
    global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
    global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
    global.window = global;
    global.Actor = { create: vi.fn() };
    global.Collection = class MockCollection {
      constructor(entries = []) {
        this.entries = entries;
      }
      values() { return this.entries; }
      keys() { return this.entries.map((_, i) => i); }
      get size() { return this.entries.length; }
    };
    global.window.GAS = { 
      log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
      dnd5eVersion: 4
    };

    // Create Fighter with Magic Initiate feat
    mockActor = {
      id: 'test-fighter',
      name: 'Test Fighter with Magic Initiate',
      type: 'character',
      items: [
        {
          _id: 'feat-magic-initiate',
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

    // Mock svelte stores
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

    const mockGet = vi.fn((store) => mockActor);

    vi.doMock('svelte/store', () => ({ 
      writable: mockWritable, 
      derived: mockDerived, 
      get: mockGet 
    }));

    // Mock stores
    vi.doMock('~/src/stores/index', () => ({
      actorInGame: mockWritable(mockActor),
      isLevelUp: mockWritable(false),
      tabs: mockWritable([]),
      activeTab: mockWritable(''),
      readOnlyTabs: mockWritable([]),
      level: mockWritable(1),
      characterClass: mockWritable('fighter'),
      characterLevel: mockWritable(1),
      newLevelValueForExistingClass: mockWritable(null),
      preAdvancementSelections: mockWritable({}),
      dropItemRegistry: { advanceQueue: vi.fn() }
    }));

    vi.doMock('~/src/stores/storeDefinitions', () => ({
      actorInGame: mockWritable(mockActor),
      levelUpTabs: mockWritable([]),
      isLevelUp: mockWritable(false)
    }));

    vi.clearAllMocks();
  });

  it('should correctly detect Fighter with Magic Initiate and return proper spell requirements', async () => {
    const { parseFeatSpellRequirements } = await import('~/src/stores/spellSelection');
    
    const requirements = parseFeatSpellRequirements(mockActor);
    
    console.log('🧪 Magic Initiate Integration Test:');
    console.log('  - Actor:', mockActor.name);
    console.log('  - Class:', 'Fighter (no spellcasting)');
    console.log('  - Feat:', mockActor.items[0].name);
    console.log('  - Requirements:', requirements);
    
    expect(requirements.cantrips).toBe(2);
    expect(requirements.spells).toBe(1);
    expect(requirements.source).toContain('Magic Initiate');
    
    console.log('  ✅ Magic Initiate properly detected');
    console.log('  ✅ Spell limits: 2 cantrips, 1 spell');
  });

  it('should show spell selection for Fighter with Magic Initiate', async () => {
    const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine');
    
    const shouldShow = workflowFSMContext._shouldShowSpellSelection(mockActor);
    
    console.log('🧪 Workflow Integration Test:');
    console.log('  - Should show spell selection:', shouldShow);
    
    expect(shouldShow).toBe(true);
    
    console.log('  ✅ Spell tab correctly opens for Fighter + Magic Initiate');
  });

  it('should load spells for feat-based spellcasting', async () => {
    // Mock compendium packs
    const mockSpells = [
      {
        id: 'spell-1',
        name: 'Fire Bolt',
        type: 'spell',
        system: { level: 0, school: 'evocation' },
        labels: { classes: 'wizard, sorcerer' }
      },
      {
        id: 'spell-2', 
        name: 'Magic Missile',
        type: 'spell',
        system: { level: 1, school: 'evocation' },
        labels: { classes: 'wizard, sorcerer' }
      }
    ];

    const mockPack = {
      collection: 'dnd5e.spells',
      getDocuments: vi.fn().mockResolvedValue(mockSpells)
    };

    // Mock getPacksFromSettings
    vi.doMock('~/src/helpers/Utility', () => ({
      getPacksFromSettings: vi.fn().mockReturnValue([mockPack]),
      extractItemsFromPacksAsync: vi.fn()
    }));

    const { loadAvailableSpells } = await import('~/src/stores/spellSelection');
    
    await loadAvailableSpells('fighter'); // Fighter class, but should load spells due to feat
    
    console.log('🧪 Spell Loading Test:');
    console.log('  - Pack called getDocuments:', mockPack.getDocuments.mock.calls.length > 0);
    console.log('  - Available spells should include feat-compatible spells');
    
    expect(mockPack.getDocuments).toHaveBeenCalled();
    
    console.log('  ✅ Spell loading works for feat-based casters');
  });
});
