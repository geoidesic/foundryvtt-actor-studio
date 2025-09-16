import { CRCalculator } from '~/src/helpers/CRCalculator';
import { ensureNumberCR } from '~/src/lib/cr.js';

/**
 * CRRetargeter: Comprehensive CR adjustment system that spreads changes across
 * multiple aspects (HP, AC, abilities, damage) to achieve target CR with minimal disruption.
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
   * Compute a comprehensive adjustment plan for a target CR
   * @param {number} targetCR
   * @param {object} options Adjustment options with weights
   */
  static planAdjustments(targetCR, options = {}) {
    const def = CRCalculator.CR_TABLES.defensive[targetCR];
    const off = CRCalculator.CR_TABLES.offensive[targetCR];
    if (!def || !off) return null;

    const [minHP, maxHP] = def.hp;
    const [minDPR, maxDPR] = off.dpr;
    
    return {
      defensive: {
        hpTarget: Math.round((minHP + maxHP) / 2),
        acTarget: def.ac,
        hpRange: [minHP, maxHP],
        acRange: [def.ac - 2, def.ac + 2]
      },
      offensive: {
        dprTarget: Math.round((minDPR + maxDPR) / 2),
        dprRange: [minDPR, maxDPR],
        attackTarget: off.attack,
        saveTarget: off.save,
        attackRange: [off.attack - 2, off.attack + 2],
        saveRange: [off.save - 2, off.save + 2]
      },
      weights: {
        hp: options.hpWeight || 0.3,
        ac: options.acWeight || 0.2,
        abilities: options.abilitiesWeight || 0.2,
        damage: options.damageWeight || 0.3
      }
    };
  }

  /**
   * Compute comprehensive updates to achieve target CR
   * @param {object} actor
   * @param {number} targetCR
   * @param {object} options Adjustment options
   * @returns {object} flat update object with detailed change information
   */
  static async computeUpdates(actor, targetCR, options = {}) {
    const updates = {};
    const plan = this.planAdjustments(targetCR, options);
    if (!plan) return updates;

    // Always set CR and XP
    updates['system.details.cr'] = ensureNumberCR(targetCR, 0);
    updates['system.details.xp.value'] = CRCalculator.XP_VALUES[targetCR] || 0;

    // Calculate current stats
    const currentStats = await this.analyzeCurrentStats(actor);
    const adjustments = this.calculateAdjustments(currentStats, plan);

    // Apply defensive adjustments
    this.applyDefensiveAdjustments(updates, actor, adjustments, plan);

    // Apply ability score adjustments
    this.applyAbilityAdjustments(updates, actor, adjustments, plan);

    // Apply offensive adjustments
    await this.applyOffensiveAdjustments(updates, actor, adjustments, plan);

    // Add metadata about changes
    updates._metadata = {
      targetCR,
      changes: this.summarizeChanges(updates, currentStats, plan),
      weights: plan.weights
    };

    return updates;
  }

  /**
   * Analyze current actor stats
   */
  static async analyzeCurrentStats(actor) {
    const currentCR = await CRCalculator.calculateCurrentCR(actor);
    const items = this.getActorItems(actor);
    
    return {
      currentCR: currentCR.calculatedCR,
      defensiveCR: currentCR.defensiveCR,
      offensiveCR: currentCR.offensiveCR,
      hp: actor?.system?.attributes?.hp?.max ?? actor?.system?.attributes?.hp?.value ?? 1,
      ac: actor?.system?.attributes?.ac?.value ?? 10,
      abilities: {
        str: actor?.system?.abilities?.str?.value ?? 10,
        dex: actor?.system?.abilities?.dex?.value ?? 10,
        con: actor?.system?.abilities?.con?.value ?? 10,
        int: actor?.system?.abilities?.int?.value ?? 10,
        wis: actor?.system?.abilities?.wis?.value ?? 10,
        cha: actor?.system?.abilities?.cha?.value ?? 10
      },
      items: items || [],
      dpr: await this.calculateCurrentDPR(items)
    };
  }

  /**
   * Calculate what adjustments are needed
   */
  static calculateAdjustments(currentStats, plan) {
    const adjustments = {
      hp: { current: currentStats.hp, target: plan.defensive.hpTarget, change: 0 },
      ac: { current: currentStats.ac, target: plan.defensive.acTarget, change: 0 },
      dpr: { current: currentStats.dpr, target: plan.offensive.dprTarget, change: 0 },
      abilities: {}
    };

    // Calculate changes
    adjustments.hp.change = plan.defensive.hpTarget - currentStats.hp;
    adjustments.ac.change = plan.defensive.acTarget - currentStats.ac;
    adjustments.dpr.change = plan.offensive.dprTarget - currentStats.dpr;

    // Calculate ability adjustments based on attack/save targets
    const targetAttack = plan.offensive.attackTarget;
    const targetSave = plan.offensive.saveTarget;
    const currentProf = CRCalculator.PROFICIENCY_BONUS[currentStats.currentCR] || 2;

    // Find primary abilities for attack and save
    const primaryAttackAbility = this.findPrimaryAttackAbility(currentStats.items);
    const primarySaveAbility = this.findPrimarySaveAbility(currentStats.items);

    // Calculate required ability modifiers
    const requiredAttackMod = targetAttack - currentProf;
    const requiredSaveMod = targetSave - 8 - currentProf;

    adjustments.abilities[primaryAttackAbility] = {
      current: currentStats.abilities[primaryAttackAbility],
      target: Math.max(1, Math.min(30, 10 + (requiredAttackMod * 2))),
      change: 0
    };

    adjustments.abilities[primarySaveAbility] = {
      current: currentStats.abilities[primarySaveAbility],
      target: Math.max(1, Math.min(30, 10 + (requiredSaveMod * 2))),
      change: 0
    };

    // Calculate actual changes
    for (const [ability, adj] of Object.entries(adjustments.abilities)) {
      adj.change = adj.target - adj.current;
    }

    return adjustments;
  }

  /**
   * Apply defensive adjustments (HP, AC)
   */
  static applyDefensiveAdjustments(updates, actor, adjustments, plan) {
    // HP adjustment
    if (adjustments.hp.change !== 0) {
      const newHP = Math.max(1, adjustments.hp.target);
      updates['system.attributes.hp.max'] = newHP;
      updates['system.attributes.hp.value'] = newHP;
    }

    // AC adjustment
    if (adjustments.ac.change !== 0) {
      updates['system.attributes.ac.value'] = adjustments.ac.target;
    }
  }

  /**
   * Apply ability score adjustments
   */
  static applyAbilityAdjustments(updates, actor, adjustments, plan) {
    for (const [ability, adj] of Object.entries(adjustments.abilities)) {
      if (adj.change !== 0) {
        updates[`system.abilities.${ability}.value`] = adj.target;
      }
    }
  }

  /**
   * Apply offensive adjustments (damage scaling)
   */
  static async applyOffensiveAdjustments(updates, actor, adjustments, plan) {
    if (adjustments.dpr.change === 0) return;

    const items = this.getActorItems(actor);
    const damageCandidates = this.findDamageCandidates(items);
    
    if (damageCandidates.length === 0) return;

    // Calculate scaling factor
    const currentDPR = adjustments.dpr.current;
    const targetDPR = adjustments.dpr.target;
    const scaleFactor = currentDPR > 0 ? targetDPR / currentDPR : 1;

    // Apply scaling to each damage source
    for (const candidate of damageCandidates) {
      const newDamage = this.scaleDamage(candidate, scaleFactor);
      this.applyDamageUpdate(updates, candidate, newDamage);
    }
  }

  /**
   * Find all damage-dealing items
   */
  static findDamageCandidates(items) {
    const candidates = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item?.system) continue;

      // Check for weapon damage
      if (item.type === 'weapon' && item.system.damage?.base) {
        const base = item.system.damage.base;
        candidates.push({
          type: 'weapon',
          index: i,
          path: 'system.damage.base',
          current: {
            number: base.number || 1,
            denomination: base.denomination || 6,
            bonus: base.bonus || 0
          }
        });
        continue;
      }

      // Check for feature damage in activities
      if (item.type === 'feat' && item.system.activities) {
        for (const [activityKey, activity] of Object.entries(item.system.activities)) {
          if (activity.damage?.parts) {
            for (let j = 0; j < activity.damage.parts.length; j++) {
              const part = activity.damage.parts[j];
              if (part.number && part.denomination) {
                candidates.push({
                  type: 'activity',
                  index: i,
                  activityKey,
                  partIndex: j,
                  path: `system.activities.${activityKey}.damage.parts.${j}`,
                  current: {
                    number: part.number,
                    denomination: part.denomination,
                    bonus: part.bonus || 0
                  }
                });
              }
            }
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Scale damage based on factor
   */
  static scaleDamage(candidate, scaleFactor) {
    const { current } = candidate;
    const newNumber = Math.max(1, Math.round(current.number * scaleFactor));
    const newDenomination = current.denomination;
    const newBonus = Math.round(current.bonus * scaleFactor);

    return {
      number: Math.min(newNumber, 30), // Cap at 30 dice
      denomination: newDenomination,
      bonus: newBonus
    };
  }

  /**
   * Apply damage update to the updates object
   */
  static applyDamageUpdate(updates, candidate, newDamage) {
    const { path } = candidate;
    
    if (candidate.type === 'weapon') {
      updates[`items.${candidate.index}.${path}.number`] = newDamage.number;
      updates[`items.${candidate.index}.${path}.denomination`] = newDamage.denomination;
      updates[`items.${candidate.index}.${path}.bonus`] = newDamage.bonus;
    } else if (candidate.type === 'activity') {
      updates[`items.${candidate.index}.${path}.number`] = newDamage.number;
      updates[`items.${candidate.index}.${path}.denomination`] = newDamage.denomination;
      updates[`items.${candidate.index}.${path}.bonus`] = newDamage.bonus;
    }
  }

  /**
   * Calculate current DPR from items
   */
  static async calculateCurrentDPR(items) {
    if (!items || items.length === 0) return 0;
    
    let totalDPR = 0;
    for (const item of items) {
      const damage = await CRCalculator.calculateItemDamage(item);
      totalDPR += damage;
    }
    
    return Math.round(totalDPR);
  }

  /**
   * Find primary attack ability
   */
  static findPrimaryAttackAbility(items) {
    // Look for weapons to determine primary attack ability
    for (const item of items) {
      if (item.type === 'weapon' && item.system?.attack?.ability) {
        return item.system.attack.ability;
      }
    }
    return 'str'; // Default to strength
  }

  /**
   * Find primary save ability
   */
  static findPrimarySaveAbility(items) {
    // Look for spellcasting features to determine primary save ability
    for (const item of items) {
      if (item.type === 'feat' && item.name?.toLowerCase().includes('spellcasting')) {
        // Check for common spellcasting ability indicators
        const desc = item.system?.description?.value?.toLowerCase() || '';
        if (desc.includes('charisma')) return 'cha';
        if (desc.includes('intelligence')) return 'int';
        if (desc.includes('wisdom')) return 'wis';
      }
    }
    return 'cha'; // Default to charisma
  }

  /**
   * Get actor items using various methods
   */
  static getActorItems(actor) {
    if (actor?.system?.items) return actor.system.items;
    if (actor?.items) return actor.items;
    if (typeof actor?.getEmbeddedCollection === 'function') {
      const itemsCollection = actor.getEmbeddedCollection("Item");
      if (itemsCollection && itemsCollection.size > 0) {
        return Array.from(itemsCollection.values());
      }
    }
    return [];
  }

  /**
   * Summarize changes for preview
   */
  static summarizeChanges(updates, currentStats, plan) {
    const changes = [];
    
    // HP changes
    if (updates['system.attributes.hp.max']) {
      changes.push({
        type: 'hp',
        label: 'Hit Points',
        from: currentStats.hp,
        to: updates['system.attributes.hp.max'],
        impact: 'defensive'
      });
    }

    // AC changes
    if (updates['system.attributes.ac.value']) {
      changes.push({
        type: 'ac',
        label: 'Armor Class',
        from: currentStats.ac,
        to: updates['system.attributes.ac.value'],
        impact: 'defensive'
      });
    }

    // Ability changes
    for (const [ability, value] of Object.entries(updates)) {
      if (ability.startsWith('system.abilities.') && ability.endsWith('.value')) {
        const abilityName = ability.split('.')[2];
        changes.push({
          type: 'ability',
          label: abilityName.toUpperCase(),
          from: currentStats.abilities[abilityName],
          to: value,
          impact: 'offensive'
        });
      }
    }

    // Damage changes
    const damageChanges = Object.keys(updates).filter(k => 
      k.includes('damage') && (k.includes('number') || k.includes('bonus'))
    );
    if (damageChanges.length > 0) {
      changes.push({
        type: 'damage',
        label: 'Damage Output',
        from: currentStats.dpr,
        to: plan.offensive.dprTarget,
        impact: 'offensive',
        details: `${damageChanges.length} damage sources adjusted`
      });
    }

    return changes;
  }
}

export default CRRetargeter;
