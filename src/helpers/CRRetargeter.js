import { CRCalculator } from '~/src/helpers/CRCalculator';
import { ensureNumberCR } from '~/src/lib/cr.js';

/**
 * CRRetargeter: computes a minimal update plan to move an actor toward a target CR.
 * Non-invasive skeleton: adjusts details.cr, HP (to band median), AC (to expected),
 * and prepares hooks for offensive scaling to be filled in next steps.
 */
export class CRRetargeter {
  /**
   * Analyze the current actor using CRCalculator
   * @param {object} actor Like Actor.toObject() shape (system + items)
   */
  static async analyze(actor) {
    const cr = await CRCalculator.calculateCurrentCR(actor);
    return cr;
  }

  /**
   * Compute a basic defensive plan for a target CR
   * @param {number} targetCR
   */
  static planDefense(targetCR) {
    const def = CRCalculator.CR_TABLES.defensive[targetCR];
    if (!def) return null;
    const [minHP, maxHP] = def.hp;
    const hpTarget = Math.round((minHP + maxHP) / 2);
    return { hpTarget, acTarget: def.ac };
  }

  /**
   * Compute a placeholder offensive plan (to be expanded): DPR target band
   * @param {number} targetCR
   */
  static planOffense(targetCR) {
    const off = CRCalculator.CR_TABLES.offensive[targetCR];
    if (!off) return null;
    const [minDPR, maxDPR] = off.dpr;
    const dprTarget = Math.round((minDPR + maxDPR) / 2);
    return { dprTarget, expectedAttack: off.attack, expectedSave: off.save };
  }

  /**
   * Produce a minimal update patch moving actor toward targetCR
   * @param {object} actor
   * @param {number} targetCR
   * @returns {object} flat update object
   */
  static async computeUpdates(actor, targetCR) {
    const updates = {};
    const defense = this.planDefense(targetCR);
    const offense = this.planOffense(targetCR);
    if (!defense || !offense) return updates;

  // Set details.cr and xp (ensure numeric)
  updates['system.details.cr'] = ensureNumberCR(targetCR, 0);
    updates['system.details.xp.value'] = CRCalculator.XP_VALUES[targetCR] || 0;

    // HP to band median
    const curHP = actor?.system?.attributes?.hp?.max ?? actor?.system?.attributes?.hp?.value;
    if (typeof curHP === 'number' && curHP !== defense.hpTarget) {
      updates['system.attributes.hp.max'] = defense.hpTarget;
      updates['system.attributes.hp.value'] = defense.hpTarget;
    }

    // AC to expected (if present)
    const curAC = actor?.system?.attributes?.ac?.value;
    if (typeof curAC === 'number' && curAC !== defense.acTarget) {
      updates['system.attributes.ac.value'] = defense.acTarget;
    }

    // Offensive adjustments will be implemented in the next steps.
    // First adapter: scale new-style weapon damage (system.damage.base)
    try {
      const items = Array.isArray(actor?.items) ? actor.items : [];
      // Build candidate list (any item that presents damage fields: weapons, spells, features, etc.)
      const candidates = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it || !it.system) continue;
        // Exclude obvious non-damaging utility items unless they expose damage shapes
        // limited-use detection (downweight later)
        const usesPer = it.system?.uses?.per;
        const limited = !!usesPer && usesPer !== 'none';
        // base
        if (it.system.damage?.base) {
          const base = it.system.damage.base;
          const denom = Number(base.denomination || 6);
          const bonus = Number(base.bonus || 0);
          const number = Number(base.number || 1);
          candidates.push({ kind: 'base', index: i, denom, bonus, number, limited });
          continue;
        }
        // legacy parts
  const parts = it.system.damage?.parts;
        const first = Array.isArray(parts) && parts[0];
        const formula = Array.isArray(first) ? first[0] : undefined;
        const m = typeof formula === 'string' && formula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
        if (m) {
          candidates.push({ kind: 'parts', index: i, denom: Number(m[2]), bonus: m[3] ? Number(m[3]) : 0, number: Number(m[1]), limited });
          continue;
        }
        // activities
        const activities = it.system.activities;
        if (activities && typeof activities === 'object') {
          for (const [key, act] of Object.entries(activities)) {
            const dparts = act?.damage?.parts;
            if (Array.isArray(dparts) && dparts[0] && typeof dparts[0] === 'object') {
              const dp = dparts[0];
              candidates.push({ kind: 'activity', index: i, actKey: key, denom: Number(dp.denomination || 6), bonus: Number(dp.bonus || 0), number: Number(dp.number || 1), limited });
              break;
            }
          }
        }
      }

      if (candidates.length > 0) {
        // Weights based on current damage; fallback to uniform; apply heuristics
        const currentDamages = candidates.map(c => c.number * ((c.denom + 1) / 2) + c.bonus);
        const weightSum = currentDamages.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
        let weights = (weightSum > 0 ? currentDamages : candidates.map(_ => 1)).slice();
        // Multiattack heuristic: presence of a feat named Multiattack → boost strongest by 2x
        const hasMultiattack = items.some(it => it?.type === 'feat' && /multiattack/i.test(it?.name || ''));
        if (hasMultiattack && currentDamages.length > 0) {
          const maxVal = Math.max(...currentDamages);
          const idx = currentDamages.indexOf(maxVal);
          if (idx >= 0) weights[idx] *= 2;
        }
        // Downweight limited-use items
        weights = weights.map((w, i) => w * (candidates[i].limited ? 0.2 : 1));
        const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

        const targetDPR = Math.max(1, offense.dprTarget);

        // Initial assignment
        let assigned = candidates.map((c, idx) => {
          const share = weights[idx] / totalWeight;
          const tgt = share * targetDPR;
          const dieAvg = (c.denom + 1) / 2;
          let num = Math.round((tgt - c.bonus) / dieAvg);
          if (!Number.isFinite(num) || num < 1) num = 1;
          num = Math.min(num, 30);
          return { ...c, newNumber: num };
        });

        const predictTotal = arr => arr.reduce((sum, c) => sum + (c.newNumber * ((c.denom + 1) / 2) + c.bonus), 0);

        // Convergence: up to 3 iterations with damping
        for (let iter = 0; iter < 3; iter++) {
          const predicted = predictTotal(assigned);
          const ratio = targetDPR / Math.max(1, predicted);
          if (Math.abs(predicted - targetDPR) <= 2) break;
          const damped = Math.max(0.85, Math.min(1.15, ratio));
          assigned = assigned.map(c => {
            let num = Math.round(c.newNumber * damped);
            if (num < 1) num = 1;
            if (num > 30) num = 30;
            return { ...c, newNumber: num };
          });
        }

        // Emit updates
        for (const c of assigned) {
          if (c.kind === 'base') {
            updates[`items.${c.index}.system.damage.base.number`] = c.newNumber;
            updates[`items.${c.index}.system.damage.base.denomination`] = c.denom;
            updates[`items.${c.index}.system.damage.base.bonus`] = c.bonus;
          } else if (c.kind === 'parts') {
            const bonusStr = c.bonus ? (c.bonus > 0 ? `+${c.bonus}` : `${c.bonus}`) : '';
            const newFormula = `${c.newNumber}d${c.denom}${bonusStr}`;
            updates[`items.${c.index}.system.damage.parts.0.0`] = newFormula;
          } else if (c.kind === 'activity') {
            updates[`items.${c.index}.system.activities.${c.actKey}.damage.parts.0.number`] = c.newNumber;
            updates[`items.${c.index}.system.activities.${c.actKey}.damage.parts.0.denomination`] = c.denom;
            updates[`items.${c.index}.system.activities.${c.actKey}.damage.parts.0.bonus`] = c.bonus;
          }
        }
      }
    } catch (_) {
      // Ignore offensive rewrite errors in early stage
    }

    return updates;
  }
}

export default CRRetargeter;
