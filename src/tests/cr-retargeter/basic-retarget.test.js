import { describe, it, expect } from 'vitest';
import CRRetargeter from '~/src/helpers/CRRetargeter';

describe('CRRetargeter.computeUpdates (defensive skeleton)', () => {
  it('returns HP/AC/xp updates for a simple NPC to reach target CR', async () => {
    const actor = {
      type: 'npc',
      system: {
        details: { cr: 1, xp: { value: 200 } },
        attributes: { hp: { value: 12, max: 12 }, ac: { value: 12 } }
      },
      items: []
    };

    const targetCR = 3; // defensive table has hp band and ac
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);

    expect(updates['system.details.cr']).toBe(targetCR);
    expect(typeof updates['system.details.xp.value']).toBe('number');
    // Defensive plan: median HP + expected AC
    expect(updates['system.attributes.hp.max']).toBeDefined();
    expect(updates['system.attributes.hp.value']).toBeDefined();
    expect(updates['system.attributes.ac.value']).toBeDefined();
  });

  it('scales new-style weapon damage (system.damage.base) toward target DPR', async () => {
    const actor = {
      type: 'npc',
      system: {
        details: { cr: 1, xp: { value: 200 } },
        attributes: { hp: { value: 12, max: 12 }, ac: { value: 12 } }
      },
      items: [
        {
          name: 'Shortsword',
          type: 'weapon',
          system: { damage: { base: { number: 1, denomination: 6, bonus: 0 } } }
        }
      ]
    };

    const targetCR = 3; // DPR median for CR3 is around 23-24
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);

    // Should include an item damage.base.number update for index 0
    expect(updates['items.0.system.damage.base.number']).toBeDefined();
    const newNum = updates['items.0.system.damage.base.number'];
    // With d6 average 3.5, expect ~7 dice for ~24 DPR
    expect(newNum).toBeGreaterThanOrEqual(5);
  });

  it('rewrites legacy damage.parts[0][0] formula toward target DPR', async () => {
    const actor = {
      type: 'npc',
      system: {
        details: { cr: 1, xp: { value: 200 } },
        attributes: { hp: { value: 12, max: 12 }, ac: { value: 12 } }
      },
      items: [
        {
          name: 'Mace',
          type: 'weapon',
          system: { damage: { parts: [[ '1d6+1', 'bludgeoning' ]] } }
        }
      ]
    };
    const targetCR = 2; // DPR median approx 18
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);
    expect(updates['items.0.system.damage.parts.0.0']).toMatch(/\d+d6\+1/);
  });

  it('updates activities DamageData parts to reach target DPR slice', async () => {
    const actor = {
      type: 'npc',
      system: {
        details: { cr: 1, xp: { value: 200 } },
        attributes: { hp: { value: 12, max: 12 }, ac: { value: 12 } }
      },
      items: [
        {
          name: 'Breath',
          type: 'weapon',
          system: {
            activities: {
              cone: { damage: { parts: [ { number: 1, denomination: 8, bonus: 0 } ] } }
            }
          }
        }
      ]
    };
    const targetCR = 4; // DPR target ~30
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);
    expect(updates['items.0.system.activities.cone.damage.parts.0.number']).toBeDefined();
    expect(updates['items.0.system.activities.cone.damage.parts.0.number']).toBeGreaterThan(1);
  });
});
