import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Druid auto-populate spells', () => {
  let spellModule;

  beforeEach(async () => {
    global.ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
    global.window = globalThis;
    window.GAS = { log: { d: vi.fn(), p: vi.fn(), e: vi.fn(), w: vi.fn() } };

    global.Dialog = { confirm: vi.fn(() => Promise.resolve(true)) };

    vi.doMock('svelte/store', async () => {
      const actual = await vi.importActual('svelte/store');
      return {
        ...actual,
        get: vi.fn((store) => {
          let value;
          const unsubscribe = store.subscribe((v) => {
            value = v;
          });
          unsubscribe();
          return value;
        })
      };
    });

    spellModule = await import('~/src/stores/spellSelection.js');
    spellModule.selectedSpells.set(new Map());
  });

  it('should auto-populate all druid spells at character creation (levels 1-2)', async () => {
    const mockSpells = [];
    for (let level = 1; level <= 2; level++) {
      for (let i = 0; i < 5; i++) {
        const id = `druid-l${level}-${i}`;
        mockSpells.push({
          _id: id,
          id,
          uuid: `Compendium.dnd5e.spells.${id}`,
          name: `Druid Spell L${level}-${i}`,
          system: { level },
          toObject: () => ({ _id: id, name: `Druid Spell L${level}-${i}`, type: 'spell', system: { level } })
        });
      }
    }

    spellModule.availableSpells.set(mockSpells);
    global.foundry = { utils: { fromUuid: vi.fn(async (u) => mockSpells.find((s) => s.uuid === u)) } };

    const result = await spellModule.autoPopulateAllSpells('Druid', 2, null, false, 0);

    expect(result).toBe(true);
    const selected = (await import('svelte/store')).get(spellModule.selectedSpells);
    expect(selected.size).toBe(10);
  });

  it('should auto-populate all newly accessible druid spell levels on level-up', async () => {
    const mockSpells = [];
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 8; i++) {
        const id = `druid-l${level}-${i}`;
        mockSpells.push({
          _id: id,
          id,
          uuid: `Compendium.dnd5e.spells.${id}`,
          name: `Druid Spell L${level}-${i}`,
          system: { level },
          toObject: () => ({ _id: id, name: `Druid Spell L${level}-${i}`, type: 'spell', system: { level } })
        });
      }
    }

    spellModule.availableSpells.set(mockSpells);
    global.foundry = { utils: { fromUuid: vi.fn(async (u) => mockSpells.find((s) => s.uuid === u)) } };

    const result = await spellModule.autoPopulateAllSpells('Druid', 2, null, true, 1);

    expect(result).toBe(true);

    const selected = (await import('svelte/store')).get(spellModule.selectedSpells);
    const addedSpells = Array.from(selected.values());

    expect(addedSpells.length).toBe(8);

    const allLevel2 = addedSpells.every((s) => {
      const level = s.itemData.system?.level || s.itemData.toObject().system.level;
      return level === 2;
    });
    expect(allLevel2).toBe(true);
  });
});