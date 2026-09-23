import { describe, it, expect } from 'vitest';

import { MODULE_ID } from '~/src/helpers/constants';
import { collectTcrSpellClassUuids } from '~/src/helpers/tcrSpellClassUuids';

describe('collectTcrSpellClassUuids', () => {
  it('collects actor-owned and source aliases during level-up', () => {
    const actor = {
      items: [
        {
          type: 'class',
          uuid: 'Actor.abc.Item.class-owned',
          flags: { core: { sourceId: 'Compendium.dnd5e.classes.Item.wizard' }
          }
        },
        {
          type: 'subclass',
          uuid: 'Actor.abc.Item.subclass-owned',
          _stats: { compendiumSource: 'Compendium.world.subclasses.Item.school' }
        }
      ],
      getFlag(moduleId, key) {
        if (moduleId !== MODULE_ID || key !== 'droppedItems') return null;
        return {
          class: { type: 'class', uuid: 'Compendium.world.classes.Item.wizard' },
          subclass: { type: 'subclass', uuid: 'Compendium.world.subclasses.Item.school' }
        };
      }
    };

    const result = collectTcrSpellClassUuids({
      actor,
      levelUpClassUuid: 'Actor.abc.Item.class-owned'
    });

    expect(result).toContain('Actor.abc.Item.class-owned');
    expect(result).toContain('Compendium.dnd5e.classes.Item.wizard');
    expect(result).toContain('Actor.abc.Item.subclass-owned');
    expect(result).toContain('Compendium.world.subclasses.Item.school');
  });

  it('deduplicates aliases from selected and actor-owned documents', () => {
    const sourceId = 'Compendium.dnd5e.classes.Item.wizard';
    const result = collectTcrSpellClassUuids({
      selectedClass: {
        uuid: 'Actor.abc.Item.class-owned',
        flags: { core: { sourceId } }
      },
      levelUpClassUuid: 'Actor.abc.Item.class-owned'
    });

    expect(result.filter((entry) => entry === 'Actor.abc.Item.class-owned')).toHaveLength(1);
    expect(result.filter((entry) => entry === sourceId)).toHaveLength(1);
  });
});