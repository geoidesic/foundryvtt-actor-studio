import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal globals
global.window = global;
global.ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };

// Mock foundry utils
global.foundry = { utils: { deepClone: (o) => JSON.parse(JSON.stringify(o)) } };

describe('Cleric finalizeSpellSelection - adds beyond existing domain spells', () => {
  let spellModule;

  beforeEach(async () => {
    vi.resetModules();

    // Mock svelte/store get
    vi.doMock('svelte/store', async () => {
      const actual = await vi.importActual('svelte/store');
      return {
        ...actual,
        get: (store) => {
          let value;
          const unsub = store.subscribe((v) => { value = v; });
          unsub();
          return value;
        }
      };
    });

    spellModule = await import('~/src/stores/spellSelection.js');
  });

  it('should create selected spells when actor already has 2 domain spells', async () => {
    // Actor with 2 existing domain spells (pre-added by advancements)
    const actor = {
      name: 'Test Cleric',
      id: 'actor-1',
      items: [
        { name: 'Aura of Life', type: 'spell' },
        { name: 'Aura of Purity', type: 'spell' }
      ],
      createEmbeddedDocuments: vi.fn(async (type, items) => items)
    };

    // Selected spells include both existing and new ones
    const spellsToSelect = [
      { _id: 's3', name: 'Banishment', type: 'spell', system: { level: 4 } },
      { _id: 's4', name: 'Control Water', type: 'spell', system: { level: 4 } },
      { _id: 's5', name: 'Death Ward', type: 'spell', system: { level: 4 } },
    ];

    // Seed selectedSpells map
    spellModule.selectedSpells.set(new Map(
      spellsToSelect.map(s => [s._id, { itemData: s }])
    ));

    const ok = await spellModule.finalizeSpellSelection(actor);
    expect(ok).toBe(true);

    // Should attempt to create all 3 new spells
    expect(actor.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    const args = actor.createEmbeddedDocuments.mock.calls[0];
    expect(args[0]).toBe('Item');
    const payload = args[1];
    expect(payload.map(i => i.name)).toEqual(['Banishment', 'Control Water', 'Death Ward']);
  });
});
