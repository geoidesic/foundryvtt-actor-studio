import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Shop item loading regression - flattened price fields', () => {
  beforeEach(() => {
    vi.resetModules();

    global.window = {
      GAS: {
        log: {
          d: vi.fn(),
          i: vi.fn(),
          w: vi.fn(),
          e: vi.fn()
        }
      }
    };

    global.foundry = { utils: { fromUuid: vi.fn() } };

    const testPack = {
      metadata: {
        name: 'dnd5e.items',
        id: 'dnd5e.items',
        label: 'Items',
        type: 'Item',
        path: 'packs/items.db',
        system: 'dnd5e'
      },
      folders: new Map(),
      getIndex: vi.fn(async () => {
        return new Map([
          ['rations-id', {
            _id: 'rations-id',
            name: 'Rations',
            img: 'icons/commodities/food/bowl-rice-steaming.webp',
            type: 'consumable',
            uuid: 'Compendium.dnd5e.items.Item.rations-id',
            'system.price.value': 5,
            'system.price.denomination': 'sp',
            'system.quantity': 1
          }]
        ]);
      })
    };

    global.game = {
      i18n: { localize: vi.fn((key) => key) },
      user: { isGM: false },
      modules: { get: vi.fn(() => ({ active: false })) },
      settings: {
        settings: {
          has: vi.fn((fullKey) => fullKey === 'foundryvtt-actor-studio.compendiumSources')
        },
        get: vi.fn((moduleId, key) => {
          if (moduleId === 'foundryvtt-actor-studio' && key === 'compendiumSources') {
            return { equipment: ['dnd5e.items'] };
          }
          return false;
        })
      },
      packs: new Map([['dnd5e.items', testPack]])
    };
  });

  it('loads flattened index price fields into nested item.system.price and keeps item', async () => {
    const equipmentShop = await import('../stores/equipmentShop.js');

    await equipmentShop.loadShopItems();

    expect(equipmentShop.shopItems.set).toHaveBeenCalled();
    const loadedItems = equipmentShop.shopItems.set.mock.calls.at(-1)[0];

    expect(Array.isArray(loadedItems)).toBe(true);
    expect(loadedItems).toHaveLength(1);
    expect(loadedItems[0].name).toBe('Rations');
    expect(loadedItems[0].system?.price?.value).toBe(5);
    expect(loadedItems[0].system?.price?.denomination).toBe('sp');
    expect(loadedItems[0].enrichedName).toContain('Compendium.dnd5e.items.Item.rations-id');
  });
});
