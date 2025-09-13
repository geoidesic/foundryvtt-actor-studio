import { describe, it, expect } from 'vitest';
import CRRetargeter from '~/src/helpers/CRRetargeter';

describe('CRRetargeter includes features/spells in offensive scaling', () => {
  it('updates a feature with activity damage and a spell with legacy parts', async () => {
    const actor = {
      type: 'npc',
      system: {
        details: { cr: 2, xp: { value: 450 } },
        attributes: { hp: { value: 45, max: 45 }, ac: { value: 13 } }
      },
      items: [
        {
          name: 'Arcane Burst',
          type: 'feature',
          system: {
            activities: {
              blast: { damage: { parts: [ { number: 1, denomination: 8, bonus: 0 } ] } }
            }
          }
        },
        {
          name: 'Fire Bolt',
          type: 'spell',
          system: { damage: { parts: [[ '1d10', 'fire' ]] } }
        }
      ]
    };

    const targetCR = 5; // DPR target in the low 30s
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);

    // Feature activity damage should be updated
    const actKeys = Object.keys(updates).filter(k => k.includes('.activities.') && k.endsWith('.number'));
    expect(actKeys.length).toBeGreaterThan(0);

    // Spell legacy parts should be rewritten
    expect(updates['items.1.system.damage.parts.0.0']).toMatch(/\d+d10/);
  });
});
