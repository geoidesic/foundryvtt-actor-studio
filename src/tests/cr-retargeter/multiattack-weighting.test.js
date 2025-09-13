import { describe, it, expect } from 'vitest';
import { CRRetargeter } from '~/src/helpers/CRRetargeter';

const mkFeat = (name) => ({ type: 'feat', name });
const mkWeaponBase = (d, n, b = 0) => ({ type: 'weapon', system: { damage: { base: { denomination: d, number: n, bonus: b } } } });

describe('multiattack weighting', () => {
  it('boosts strongest weapon when Multiattack feat present', async () => {
    const actor = {
      type: 'npc',
      system: { details: { cr: 2 }, attributes: { hp: { value: 10, max: 10 }, ac: { value: 12 } } },
      items: [
        mkWeaponBase(4, 1, 0), // avg 2.5
        mkWeaponBase(8, 1, 0), // avg 4.5 (stronger)
        mkFeat('Multiattack')
      ]
    };

    const targetCR = 5; // higher DPR target
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);
    const n0 = updates['items.0.system.damage.base.number'] ?? 1;
    const n1 = updates['items.1.system.damage.base.number'] ?? 1;
    // Stronger weapon should get equal or higher dice count than weaker
    expect(n1).toBeGreaterThanOrEqual(n0);
  });

  it('downweights limited-use weapons', async () => {
    const actor = {
      type: 'npc',
      system: { details: { cr: 2 }, attributes: { hp: { value: 10, max: 10 }, ac: { value: 12 } } },
      items: [
        { type: 'weapon', system: { damage: { base: { denomination: 6, number: 1, bonus: 0 } }, uses: { per: 'rounds' } } }, // limited
        { type: 'weapon', system: { damage: { base: { denomination: 6, number: 1, bonus: 0 } }, uses: { per: 'none' } } }
      ]
    };
    const targetCR = 5;
    const updates = await CRRetargeter.computeUpdates(actor, targetCR);
    const nLimited = updates['items.0.system.damage.base.number'] ?? 1;
    const nAtWill = updates['items.1.system.damage.base.number'] ?? 1;
    expect(nAtWill).toBeGreaterThanOrEqual(nLimited);
  });
});
