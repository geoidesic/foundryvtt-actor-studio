import { describe, it, expect } from 'vitest';

import { MODULE_ID } from '~/src/helpers/constants';
import { collectTcrSpellClassUuids } from '~/src/helpers/tcrSpellClassUuids';

describe('collectTcrSpellClassUuids', () => {
  it('collects selected, actor-owned, and dropped-item aliases for TCR matching', () => {
    const selectedClass = {
      uuid: 'Compendium.world.classes.Item.cleric-selected',
      flags: { core: { sourceId: 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000' } }
    };
    const selectedSubClass = {
      uuid: 'Compendium.world.subclasses.Item.life-domain',
      _stats: { compendiumSource: 'Compendium.dnd-players-handbook.subclasses.Item.life-domain-uuid' }
    };
    const actor = {
      items: [
        {
          type: 'class',
          uuid: 'Actor.abc.Item.class-owned',
          flags: { core: { sourceId: 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000' } }
        },
        {
          type: 'subclass',
          uuid: 'Actor.abc.Item.subclass-owned',
          _stats: { compendiumSource: 'Compendium.dnd-players-handbook.subclasses.Item.life-domain-uuid' }
        }
      ],
      getFlag(moduleId, key) {
        if (moduleId !== MODULE_ID || key !== 'droppedItems') return null;
        return {
          class: {
            type: 'class',
            uuid: 'Compendium.world.classes.Item.cleric-dropped',
            flags: { core: { sourceId: 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000' } }
          },
          subclass: [{
            type: 'subclass',
            uuid: 'Compendium.world.subclasses.Item.life-dropped',
            flags: { core: { sourceId: 'Compendium.dnd-players-handbook.subclasses.Item.life-domain-uuid' } }
          }]
        };
      }
    };

    const result = collectTcrSpellClassUuids({
      actor,
      selectedClass,
      selectedSubClass,
      levelUpClassUuid: 'Actor.abc.Item.class-owned'
    });

    expect(result).toContain('Compendium.world.classes.Item.cleric-selected');
    expect(result).toContain('Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000');
    expect(result).toContain('Compendium.world.subclasses.Item.life-domain');
    expect(result).toContain('Compendium.dnd-players-handbook.subclasses.Item.life-domain-uuid');
    expect(result).toContain('Actor.abc.Item.class-owned');
    expect(result).toContain('Actor.abc.Item.subclass-owned');
    expect(result).toContain('Compendium.world.classes.Item.cleric-dropped');
    expect(result).toContain('Compendium.world.subclasses.Item.life-dropped');
  });

  it('deduplicates aliases collected from multiple sources', () => {
    const repeatedSourceId = 'Compendium.dnd5e.classes.Item.same-source';

    const result = collectTcrSpellClassUuids({
      selectedClass: {
        uuid: 'Actor.1.Item.1',
        flags: { core: { sourceId: repeatedSourceId } }
      },
      levelUpClass: {
        uuid: 'Actor.1.Item.1',
        flags: { core: { sourceId: repeatedSourceId } }
      },
      levelUpClassUuid: 'Actor.1.Item.1'
    });

    expect(result.filter((entry) => entry === 'Actor.1.Item.1')).toHaveLength(1);
    expect(result.filter((entry) => entry === repeatedSourceId)).toHaveLength(1);
  });
});