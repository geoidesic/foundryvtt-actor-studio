import { CRCalculator } from '~/src/helpers/CRCalculator';
import { ensureNumberCR } from '~/src/lib/cr.js';
import { get } from 'svelte/store';

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
    console.log('[CRRetargeter] Computing updates for actor:', actor);
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
      changes: this.summarizeChanges(updates, currentStats, plan, adjustments),
      weights: plan.weights
    };

    return updates;
  }

  /**
   * Analyze current actor stats
   */
  static async analyzeCurrentStats(actor) {
    console.log('[CRRetargeter] Analyzing current stats for actor:', actor);
    const actorData = get(actor);
    console.log('[CRRetargeter] Actor data from store:', actorData);
    console.log('[CRRetargeter] Actor system:', actorData?.system);
    console.log('[CRRetargeter] Actor system.attributes:', actorData?.system?.attributes);
    console.log('[CRRetargeter] Actor system.abilities:', actorData?.system?.abilities);
    
    const currentCR = await CRCalculator.calculateCurrentCR(actor);
    const items = this.getActorItems(actor);
    
    const hp = actorData?.system?.attributes?.hp?.max ?? actorData?.system?.attributes?.hp?.value ?? 1;
    const ac = actorData?.system?.attributes?.ac?.value ?? 10;
    const abilities = {
      str: actorData?.system?.abilities?.str?.value ?? 10,
      dex: actorData?.system?.abilities?.dex?.value ?? 10,
      con: actorData?.system?.abilities?.con?.value ?? 10,
      int: actorData?.system?.abilities?.int?.value ?? 10,
      wis: actorData?.system?.abilities?.wis?.value ?? 10,
      cha: actorData?.system?.abilities?.cha?.value ?? 10
    };
    
    console.log('[CRRetargeter] Extracted values:', { hp, ac, abilities });
    
    return {
      currentCR: currentCR.calculatedCR,
      defensiveCR: currentCR.defensiveCR,
      offensiveCR: currentCR.offensiveCR,
      hp,
      ac,
      abilities,
      items: items || [],
      dpr: await this.calculateCurrentDPR(items)
    };
  }

  /**
   * Calculate what adjustments are needed - smarter approach
   */
  static calculateAdjustments(currentStats, plan) {
    console.log('[CRRetargeter] Calculating smart adjustments for:', currentStats);
    
    // Analyze actor type and determine priorities
    const actorAnalysis = this.analyzeActorType(currentStats);
    console.log('[CRRetargeter] Actor analysis:', actorAnalysis);
    
    // Calculate CR deficit and distribute changes more conservatively
    const crDeficit = plan.targetCR - currentStats.currentCR;
    console.log('[CRRetargeter] CR deficit:', crDeficit);
    
    const adjustments = {
      hp: { current: currentStats.hp, target: currentStats.hp, change: 0 },
      ac: { current: currentStats.ac, target: currentStats.ac, change: 0 },
      dpr: { current: currentStats.dpr, target: currentStats.dpr, change: 0 },
      abilities: {},
      features: [],
      resistances: [],
      immunities: []
    };

    // Make conservative adjustments based on CR deficit
    this.calculateConservativeAdjustments(adjustments, currentStats, plan, actorAnalysis, crDeficit);

    return adjustments;
  }

  /**
   * Calculate conservative adjustments based on CR deficit
   */
  static calculateConservativeAdjustments(adjustments, currentStats, plan, actorAnalysis, crDeficit) {
    // For a 3 CR increase, make modest adjustments
    const hpIncrease = Math.min(40, Math.floor(crDeficit * 15)); // Max 40 HP increase
    const acIncrease = Math.min(2, Math.floor(crDeficit)); // Max 2 AC increase
    
    adjustments.hp.target = currentStats.hp + hpIncrease;
    adjustments.hp.change = hpIncrease;
    
    adjustments.ac.target = currentStats.ac + acIncrease;
    adjustments.ac.change = acIncrease;

    // For spellcasters, boost primary casting ability modestly
    if (actorAnalysis.isSpellcaster) {
      const castingAbility = actorAnalysis.primaryCastingAbility;
      const currentCasting = currentStats.abilities[castingAbility];
      const castingIncrease = Math.min(4, Math.floor(crDeficit * 1.5)); // Max 4 point increase
      
      adjustments.abilities[castingAbility] = {
        current: currentCasting,
        target: Math.min(30, currentCasting + castingIncrease),
        change: castingIncrease
      };
    }

    // Consider CON for HP increases
    if (hpIncrease > 20) {
      const conIncrease = Math.min(2, Math.floor(hpIncrease / 30)); // 1 CON per 30 HP
      adjustments.abilities.con = {
        current: currentStats.abilities.con,
        target: Math.min(30, currentStats.abilities.con + conIncrease),
        change: conIncrease
      };
    }

    // Analyze features and suggest appropriate additions
    this.analyzeFeaturesForCR(adjustments, currentStats, actorAnalysis, crDeficit);
  }

  /**
   * Analyze features and suggest CR-appropriate additions
   */
  static analyzeFeaturesForCR(adjustments, currentStats, actorAnalysis, crDeficit) {
    const items = currentStats.items || [];
    
    // Look for existing resistances/immunities
    const existingResistances = this.findResistances(items);
    const existingImmunities = this.findImmunities(items);
    
    // Suggest new features based on CR increase
    if (crDeficit >= 2) {
      // For significant CR increases, suggest resistances
      if (existingResistances.length < 2) {
        adjustments.resistances.push('fire', 'cold'); // Common resistances
      }
    }
    
    if (crDeficit >= 3) {
      // For major CR increases, suggest legendary actions or other features
      adjustments.features.push('Legendary Resistance (3/day)');
    }
    
    console.log('[CRRetargeter] Feature suggestions:', {
      resistances: adjustments.resistances,
      immunities: adjustments.immunities,
      features: adjustments.features
    });
  }

  /**
   * Find existing resistances in items
   */
  static findResistances(items) {
    const resistances = [];
    for (const item of items) {
      if (item.system?.resistance) {
        resistances.push(item.system.resistance);
      }
    }
    return resistances;
  }

  /**
   * Find existing immunities in items
   */
  static findImmunities(items) {
    const immunities = [];
    for (const item of items) {
      if (item.system?.immunity) {
        immunities.push(item.system.immunity);
      }
    }
    return immunities;
  }

  /**
   * Analyze actor type and determine stat priorities
   */
  static analyzeActorType(currentStats) {
    const items = currentStats.items || [];
    const abilities = currentStats.abilities;
    
    // Determine primary casting ability
    let primaryCastingAbility = 'int';
    for (const item of items) {
      if (item.type === 'feat' && item.name?.toLowerCase().includes('spellcasting')) {
        const desc = item.system?.description?.value?.toLowerCase() || '';
        if (desc.includes('charisma')) primaryCastingAbility = 'cha';
        else if (desc.includes('intelligence')) primaryCastingAbility = 'int';
        else if (desc.includes('wisdom')) primaryCastingAbility = 'wis';
        break;
      }
    }

    // Determine if it's a melee or ranged combatant
    let combatStyle = 'ranged';
    for (const item of items) {
      if (item.type === 'weapon') {
        const weaponType = item.system?.weaponType || '';
        if (weaponType.includes('melee') || weaponType.includes('unarmed')) {
          combatStyle = 'melee';
          break;
        }
      }
    }

    // Find highest ability scores to prioritize
    const abilityScores = Object.entries(abilities).map(([name, value]) => ({ name, value }));
    abilityScores.sort((a, b) => b.value - a.value);
    
    return {
      primaryCastingAbility,
      combatStyle,
      topAbilities: abilityScores.slice(0, 3).map(a => a.name),
      isSpellcaster: items.some(item => item.type === 'feat' && item.name?.toLowerCase().includes('spellcasting')),
      hasWeapons: items.some(item => item.type === 'weapon'),
      hasArmor: items.some(item => item.type === 'equipment' && item.system?.armor?.type),
      currentHP: currentStats.hp,
      currentAC: currentStats.ac
    };
  }


  /**
   * Apply defensive adjustments (HP dice, AC)
   */
  static applyDefensiveAdjustments(updates, actor, adjustments, plan) {
    // HP adjustment - use dice instead of raw HP
    if (adjustments.hp.change !== 0) {
      const actorData = get(actor);
      const currentHD = actorData?.system?.attributes?.hp?.hd || 1;
      const currentHDSides = actorData?.system?.attributes?.hp?.hdSides || 8;
      
      // Calculate new hit dice based on HP change
      const hpPerDie = Math.floor(currentHDSides / 2) + 1; // Average HP per die
      const additionalDice = Math.max(1, Math.ceil(adjustments.hp.change / hpPerDie));
      const newHD = Math.max(1, currentHD + additionalDice);
      
      updates['system.attributes.hp.hd'] = newHD;
      updates['system.attributes.hp.max'] = adjustments.hp.target;
      updates['system.attributes.hp.value'] = adjustments.hp.target;
      
      console.log('[CRRetargeter] HP adjustment:', {
        currentHD,
        newHD,
        additionalDice,
        hpChange: adjustments.hp.change
      });
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
  static summarizeChanges(updates, currentStats, plan, adjustments = {}) {
    console.log('[CRRetargeter] summarizeChanges called with:', { updates, currentStats, plan, adjustments });
    const changes = [];
    
    // HP changes
    if (updates['system.attributes.hp.max']) {
      console.log('[CRRetargeter] HP change:', { from: currentStats.hp, to: updates['system.attributes.hp.max'] });
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

    // Add feature changes from adjustments
    if (adjustments.resistances && adjustments.resistances.length > 0) {
      changes.push({
        type: 'feature',
        label: 'Resistances',
        from: 'None',
        to: adjustments.resistances.join(', '),
        impact: 'defensive'
      });
    }

    if (adjustments.features && adjustments.features.length > 0) {
      changes.push({
        type: 'feature',
        label: 'New Features',
        from: 'None',
        to: adjustments.features.join(', '),
        impact: 'offensive'
      });
    }

    return changes;
  }
}

export default CRRetargeter;
