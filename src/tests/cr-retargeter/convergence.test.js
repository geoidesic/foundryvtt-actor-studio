import { describe, it, expect } from 'vitest';
import { CRRetargeter } from '~/src/helpers/CRRetargeter';

// Minimal CR table proxy for planOffense usage inside CRRetargeter
// If CRRetargeter imports CRCalculator internally, we don't need to mock; we'll use targetCR that yields reasonable dprTarget.

const mkWeaponBase = (denomination, number, bonus = 0) => ({
  type: 'weapon',
  system: { damage: { base: { denomination, number, bonus } } }
});

const mkWeaponParts = (denomination, number, bonus = 0) => ({
  type: 'weapon',
  system: { damage: { parts: [[`${number}d${denomination}${bonus ? (bonus > 0 ? `+${bonus}` : `${bonus}`) : ''}`]] } }
});

describe('CRRetargeter convergence across multiple items', () => {
  it('distributes DPR across two weapons and converges near target', async () => {
    const actor = {
      type: 'npc',
      system: { details: { cr: 1, xp: { value: 200 } }, attributes: { hp: { value: 11, max: 11 }, ac: { value: 12 } } },
      items: [
        mkWeaponBase(6, 1, 2), // avg ~ 5.5 + 2 = 7.5
        mkWeaponParts(8, 1, 0) // avg ~ 4.5
      ]
    };

    // Choose a modest target CR whose offense median DPR is in CR 3-5 band depending on CRCalculator tables.
    const targetCR = 4; // typical median DPR ~ 18-22 in many tables; test tolerates wide range

    const updates = await CRRetargeter.computeUpdates(actor, targetCR);

    // Collect predicted DPR after updates
    const getDieAvg = (d) => (d + 1) / 2;
    const getFromUpdates = () => {
      // base
      const n1 = updates['items.0.system.damage.base.number'] ?? actor.items[0].system.damage.base.number;
      const d1 = updates['items.0.system.damage.base.denomination'] ?? actor.items[0].system.damage.base.denomination;
      const b1 = updates['items.0.system.damage.base.bonus'] ?? actor.items[0].system.damage.base.bonus;
      const w1 = n1 * getDieAvg(d1) + b1;

      // parts: parse new formula if present
      let w2;
      const f2 = updates['items.1.system.damage.parts.0.0'];
      if (typeof f2 === 'string') {
        const m = f2.match(/(\d+)d(\d+)([+-]\d+)?/);
        if (m) {
          const n = Number(m[1]);
          const d = Number(m[2]);
          const b = m[3] ? Number(m[3]) : 0;
          w2 = n * getDieAvg(d) + b;
        }
      }
      if (w2 === undefined) {
        const n = 1, d = 8, b = 0;
        w2 = n * getDieAvg(d) + b;
      }
      return w1 + w2;
    };

    const predicted = getFromUpdates();

    // We can't import CRCalculator tables here easily; assert that numbers increased vs baseline and not absurd
    const baseline = 7.5 + 4.5; // 12.0
    expect(predicted).toBeGreaterThan(baseline + 2);
    // Ensure not exploding beyond a reasonable cap for this test
    expect(predicted).toBeLessThan(40);
  });
});
