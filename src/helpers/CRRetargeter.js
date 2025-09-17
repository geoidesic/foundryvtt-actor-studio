import { CRCalculator } from '~/src/helpers/CRCalculator';
import { ensureNumberCR } from '~/src/lib/cr.js';
import { get } from 'svelte/store';
import { checkIfSpellcaster } from '~/src/lib/workflow.js';

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
    const itemAnalysis = await this.analyzeActorItems(actor);
    const adjustments = this.calculateAdjustments(currentStats, plan, targetCR, actor);

    // Apply defensive adjustments
    console.log('[CRRetargeter] Before defensive adjustments:', { adjustments, updates: Object.keys(updates) });
    this.applyDefensiveAdjustments(updates, actor, adjustments, plan);
    console.log('[CRRetargeter] After defensive adjustments:', { updates: Object.keys(updates) });

    // Apply ability score adjustments
    this.applyAbilityAdjustments(updates, actor, adjustments, plan);
    console.log('[CRRetargeter] After ability adjustments:', { updates: Object.keys(updates) });

    // Apply offensive adjustments
    await this.applyOffensiveAdjustments(updates, actor, adjustments, plan);
    console.log('[CRRetargeter] After offensive adjustments:', { updates: Object.keys(updates) });

    // Add metadata about changes
    const changes = this.summarizeChanges(updates, currentStats, plan, adjustments);
    console.log('[CRRetargeter] Generated changes:', changes);
    
    updates._metadata = {
      targetCR,
      changes: changes,
      weights: plan.weights,
      itemAnalysis: itemAnalysis
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
    
    // Get the actual current CR from the actor's system data
    const actualCurrentCR = actorData?.system?.details?.cr || 0;
    console.log('[CRRetargeter] Actual current CR from actor.system.details.cr:', actualCurrentCR);
    
    // Calculate the breakdown for reference, but use the actual CR
    const crBreakdown = await CRCalculator.calculateCurrentCR(actorData);
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
      currentCR: actualCurrentCR, // Use the actual CR from the actor
      defensiveCR: crBreakdown.defensiveCR,
      offensiveCR: crBreakdown.offensiveCR,
      hp,
      ac,
      abilities,
      items: items || [],
      dpr: await this.calculateCurrentDPR(items)
    };
  }

  /**
   * Analyze all actor items and their current CR impact
   */
  static async analyzeActorItems(actor) {
    console.log('[CRRetargeter] Analyzing all actor items for CR impact');
    const actorData = get(actor);
    const items = this.getActorItems(actor);
    
    console.log('[CRRetargeter] Found items:', items.length);
    
    const itemAnalysis = [];
    
    for (const item of items) {
      const analysis = {
        name: item.name || 'Unnamed Item',
        type: item.type || 'unknown',
        currentCRImpact: 0,
        details: {},
        suggestions: []
      };
      
      // Analyze based on item type
      switch (item.type) {
        case 'weapon':
          analysis.details = this.analyzeWeaponDetails(item);
          analysis.currentCRImpact = this.calculateWeaponCRImpact(item);
          break;
        case 'feat':
          analysis.details = this.analyzeFeatDetails(item);
          analysis.currentCRImpact = this.calculateFeatCRImpact(item);
          break;
        case 'spell':
          analysis.details = this.analyzeSpellDetails(item);
          analysis.currentCRImpact = this.calculateSpellCRImpact(item);
          break;
        case 'equipment':
          analysis.details = this.analyzeEquipmentDetails(item);
          analysis.currentCRImpact = this.calculateEquipmentCRImpact(item);
          break;
        default:
          analysis.details = { description: 'Unknown item type' };
          analysis.currentCRImpact = 0;
      }
      
      itemAnalysis.push(analysis);
      console.log('[CRRetargeter] Item analysis:', analysis);
    }
    
    return itemAnalysis;
  }

  /**
   * Analyze weapon details for CR impact
   */
  static analyzeWeaponDetails(weapon) {
    const details = {
      damage: 'None',
      attackBonus: 0,
      range: 'Melee',
      properties: []
    };
    
    if (weapon.system?.damage?.base) {
      const base = weapon.system.damage.base;
      details.damage = `${base.number || 1}d${base.denomination || 6}${base.bonus ? `+${base.bonus}` : ''}`;
    }
    
    if (weapon.system?.attack?.bonus) {
      details.attackBonus = weapon.system.attack.bonus;
    }
    
    if (weapon.system?.range) {
      details.range = weapon.system.range.value || 'Melee';
    }
    
    if (weapon.system?.properties) {
      details.properties = Object.keys(weapon.system.properties).filter(p => weapon.system.properties[p]);
    }
    
    return details;
  }

  /**
   * Calculate weapon CR impact
   */
  static calculateWeaponCRImpact(weapon) {
    let impact = 0;
    
    if (weapon.system?.damage?.base) {
      const base = weapon.system.damage.base;
      const avgDamage = (base.number || 1) * ((base.denomination || 6) + 1) / 2 + (base.bonus || 0);
      impact += Math.floor(avgDamage / 10); // Rough CR impact from damage
    }
    
    if (weapon.system?.attack?.bonus) {
      impact += Math.floor(weapon.system.attack.bonus / 4); // Rough CR impact from attack bonus
    }
    
    return impact;
  }

  /**
   * Analyze feat details for CR impact
   */
  static analyzeFeatDetails(feat) {
    const details = {
      description: feat.system?.description?.value || 'No description',
      type: 'Passive',
      benefits: []
    };
    
    const name = feat.name?.toLowerCase() || '';
    const desc = details.description.toLowerCase();
    
    if (name.includes('spellcasting') || desc.includes('spell')) {
      details.type = 'Spellcasting';
      details.benefits.push('Spell access');
    }
    
    if (name.includes('resistance') || desc.includes('resistance')) {
      details.type = 'Defensive';
      details.benefits.push('Damage resistance');
    }
    
    if (name.includes('immunity') || desc.includes('immunity')) {
      details.type = 'Defensive';
      details.benefits.push('Damage immunity');
    }
    
    return details;
  }

  /**
   * Calculate feat CR impact
   */
  static calculateFeatCRImpact(feat) {
    let impact = 0;
    const name = feat.name?.toLowerCase() || '';
    const desc = (feat.system?.description?.value || '').toLowerCase();
    
    if (name.includes('spellcasting') || desc.includes('spell')) {
      impact += 2; // Spellcasting is significant
    }
    
    if (name.includes('resistance') || desc.includes('resistance')) {
      impact += 1; // Resistance is moderate
    }
    
    if (name.includes('immunity') || desc.includes('immunity')) {
      impact += 2; // Immunity is significant
    }
    
    return impact;
  }

  /**
   * Analyze spell details for CR impact
   */
  static analyzeSpellDetails(spell) {
    const details = {
      level: spell.system?.level || 0,
      school: spell.system?.school || 'Unknown',
      components: [],
      damage: 'None',
      save: 'None'
    };
    
    if (spell.system?.components) {
      details.components = Object.keys(spell.system.components).filter(c => spell.system.components[c]);
    }
    
    if (spell.system?.damage?.parts) {
      const damageParts = spell.system.damage.parts.map(part => 
        `${part.number || 1}d${part.denomination || 6}${part.bonus ? `+${part.bonus}` : ''}`
      );
      details.damage = damageParts.join(' + ');
    }
    
    if (spell.system?.save?.ability) {
      details.save = `${spell.system.save.ability.toUpperCase()} ${spell.system.save.dc || 0}`;
    }
    
    return details;
  }

  /**
   * Calculate spell CR impact
   */
  static calculateSpellCRImpact(spell) {
    let impact = 0;
    const level = spell.system?.level || 0;
    
    // Base impact from spell level
    impact += level;
    
    // Additional impact from damage
    if (spell.system?.damage?.parts) {
      for (const part of spell.system.damage.parts) {
        const avgDamage = (part.number || 1) * ((part.denomination || 6) + 1) / 2 + (part.bonus || 0);
        impact += Math.floor(avgDamage / 15); // Spells scale differently
      }
    }
    
    return impact;
  }

  /**
   * Analyze equipment details for CR impact
   */
  static analyzeEquipmentDetails(equipment) {
    const details = {
      type: 'Misc',
      purpose: 'Unknown',
      properties: []
    };
    
    // Check if it's actual armor
    if (equipment.system?.armor?.type) {
      details.type = 'Armor';
      details.purpose = `Provides ${equipment.system.armor.value || 0} AC`;
    }
    // Check if it's an arcane focus
    else if (equipment.name?.toLowerCase().includes('focus') || 
             equipment.name?.toLowerCase().includes('component')) {
      details.type = 'Arcane Focus';
      details.purpose = 'Spellcasting component';
    }
    // Check if it's a magic item
    else if (equipment.name?.toLowerCase().includes('ring') || 
             equipment.name?.toLowerCase().includes('amulet') ||
             equipment.name?.toLowerCase().includes('cloak')) {
      details.type = 'Magic Item';
      details.purpose = 'Magical enhancement';
    }
    // Check for other properties
    else if (equipment.system?.properties) {
      details.properties = Object.keys(equipment.system.properties).filter(p => equipment.system.properties[p]);
    }
    
    return details;
  }

  /**
   * Calculate equipment CR impact
   */
  static calculateEquipmentCRImpact(equipment) {
    let impact = 0;
    
    // Only actual armor contributes to CR
    if (equipment.system?.armor?.type) {
      impact += Math.floor(equipment.system.armor.value / 2); // AC bonus impact
    }
    
    // Arcane focuses don't contribute to CR - they're just tools
    if (equipment.name?.toLowerCase().includes('focus') || 
        equipment.name?.toLowerCase().includes('component')) {
      return 0;
    }
    
    // Magic items might contribute to CR
    if (equipment.name?.toLowerCase().includes('ring') || 
        equipment.name?.toLowerCase().includes('amulet') ||
        equipment.name?.toLowerCase().includes('cloak')) {
      impact += 1; // Minor magic item
    }
    
    return impact;
  }

  /**
   * Calculate what adjustments are needed - smarter approach
   */
  static calculateAdjustments(currentStats, plan, targetCR, actor) {
    console.log('[CRRetargeter] Calculating smart adjustments for:', currentStats);
    
    // Analyze actor type and determine priorities
    const actorData = get(actor);
    const actorAnalysis = this.analyzeActorType(currentStats, actorData);
    console.log('[CRRetargeter] Actor analysis:', actorAnalysis);
    
    // Calculate CR deficit and distribute changes more conservatively
    const crDeficit = targetCR - currentStats.currentCR;
    console.log('[CRRetargeter] CR deficit:', crDeficit, 'targetCR:', targetCR, 'currentCR:', currentStats.currentCR);
    
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
    // Scale adjustments based on CR deficit - no arbitrary limits
    const hpIncrease = Math.max(1, Math.floor(crDeficit * 15)); // 15 HP per CR, minimum 1
    const acIncrease = Math.max(1, Math.floor(crDeficit * 0.5)); // 0.5 AC per CR, minimum 1
    
    // Always make changes for any CR increase
    adjustments.hp.target = currentStats.hp + hpIncrease;
    adjustments.hp.change = hpIncrease;
    
    adjustments.ac.target = currentStats.ac + acIncrease;
    adjustments.ac.change = acIncrease;

    // For spellcasters, boost primary casting ability
    if (actorAnalysis.isSpellcaster) {
      const castingAbility = actorAnalysis.primaryCastingAbility;
      const currentCasting = currentStats.abilities[castingAbility];
      const castingIncrease = Math.floor(crDeficit * 1.5); // 1.5 points per CR
      
      if (castingIncrease > 0) {
        adjustments.abilities[castingAbility] = {
          current: currentCasting,
          target: Math.min(30, currentCasting + castingIncrease),
          change: castingIncrease
        };
      }
    }

    // Consider CON for HP increases
    if (hpIncrease > 20) {
      const conIncrease = Math.floor(hpIncrease / 30); // 1 CON per 30 HP
      if (conIncrease > 0) {
        adjustments.abilities.con = {
          current: currentStats.abilities.con,
          target: Math.min(30, currentStats.abilities.con + conIncrease),
          change: conIncrease
        };
      }
    }

    // Analyze features and suggest appropriate additions
    this.analyzeFeaturesForCR(adjustments, currentStats, actorAnalysis, crDeficit);
  }

  /**
   * Analyze features and suggest CR-appropriate additions
   */
  static analyzeFeaturesForCR(adjustments, currentStats, actorAnalysis, crDeficit) {
    const items = currentStats.items || [];
    
    console.log('[CRRetargeter] Analyzing items for CR adjustments:', items.length, 'items');
    
    // Analyze each item and suggest improvements
    for (const item of items) {
      this.analyzeItemForCR(item, adjustments, crDeficit, actorAnalysis);
    }
    
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
   * Analyze individual item for CR improvements
   */
  static analyzeItemForCR(item, adjustments, crDeficit, actorAnalysis) {
    console.log('[CRRetargeter] Analyzing item:', item.name, item.type);
    
    // Only suggest changes if there's a meaningful CR deficit
    if (crDeficit < 1) {
      console.log('[CRRetargeter] No CR deficit, skipping item changes');
      return;
    }
    
    switch (item.type) {
      case 'weapon':
        this.analyzeWeaponForCR(item, adjustments, crDeficit);
        break;
      case 'feat':
        this.analyzeFeatForCR(item, adjustments, crDeficit, actorAnalysis);
        break;
      case 'spell':
        this.analyzeSpellForCR(item, adjustments, crDeficit);
        break;
      case 'equipment':
        this.analyzeEquipmentForCR(item, adjustments, crDeficit);
        break;
    }
  }

  /**
   * Analyze weapon for CR improvements
   */
  static analyzeWeaponForCR(weapon, adjustments, crDeficit) {
    if (!weapon.system?.damage) return;
    
    const damage = weapon.system.damage;
    const currentDamage = (damage.base?.number || 1) * (damage.base?.denomination || 6) + (damage.base?.bonus || 0);
    const damageIncrease = Math.floor(crDeficit * 2); // 2 damage per CR
    
    // Only suggest changes if the increase is meaningful (at least 2 damage)
    if (damageIncrease >= 2) {
      adjustments.weaponChanges = adjustments.weaponChanges || [];
      adjustments.weaponChanges.push({
        name: weapon.name,
        type: 'damage',
        from: `${currentDamage} damage`,
        to: `${currentDamage + damageIncrease} damage`,
        change: damageIncrease
      });
    }
    
    // Suggest weapon enhancement for higher CR
    if (crDeficit >= 3) {
      adjustments.weaponChanges = adjustments.weaponChanges || [];
      adjustments.weaponChanges.push({
        name: weapon.name,
        type: 'enhancement',
        from: 'Basic weapon',
        to: 'Magic weapon (+1 to hit)',
        change: 1
      });
    }
  }

  /**
   * Analyze feat for CR improvements
   */
  static analyzeFeatForCR(feat, adjustments, crDeficit, actorAnalysis) {
    const featName = feat.name?.toLowerCase() || '';
    
    // Check for spellcasting feats
    if (featName.includes('spellcasting') || featName.includes('spell')) {
      // Suggest higher level spells for higher CR
      if (crDeficit >= 2) {
        adjustments.spellChanges = adjustments.spellChanges || [];
        adjustments.spellChanges.push({
          name: feat.name,
          type: 'spell_level',
          from: 'Current level',
          to: `+${Math.floor(crDeficit / 2)} levels`,
          change: Math.floor(crDeficit / 2)
        });
      }
    }
    
    // Check for resistance/immunity feats
    if (featName.includes('resistance') || featName.includes('immunity')) {
      // Suggest additional resistances
      if (crDeficit >= 3) {
        adjustments.resistances.push('poison', 'psychic');
      }
    }
    
    // Check for multiattack feats - suggest improving them
    if (featName.includes('multiattack') || featName.includes('multi-attack')) {
      if (crDeficit >= 2) {
        adjustments.features.push('Additional attack per turn');
      }
    }
  }

  /**
   * Analyze spell for CR improvements
   */
  static analyzeSpellForCR(spell, adjustments, crDeficit) {
    const spellLevel = spell.system?.level || 0;
    const levelIncrease = Math.floor(crDeficit / 3); // 1 level per 3 CR
    
    // Only suggest changes if the increase is meaningful (at least 1 level) and the spell is significant
    if (levelIncrease >= 1 && spellLevel > 0 && spellLevel <= 5) {
      adjustments.spellChanges = adjustments.spellChanges || [];
      adjustments.spellChanges.push({
        name: spell.name,
        type: 'spell_level',
        from: `Level ${spellLevel} spell`,
        to: `Level ${spellLevel + levelIncrease} spell`,
        change: levelIncrease
      });
    }
    
    // Suggest additional spell slots for higher CR
    if (crDeficit >= 4 && spellLevel > 0) {
      adjustments.spellChanges = adjustments.spellChanges || [];
      adjustments.spellChanges.push({
        name: spell.name,
        type: 'slots',
        from: '1 use per day',
        to: '2 uses per day',
        change: 1
      });
    }
  }

  /**
   * Analyze equipment for CR improvements
   */
  static analyzeEquipmentForCR(equipment, adjustments, crDeficit) {
    // Check for actual armor
    if (equipment.system?.armor?.type) {
      const currentAC = equipment.system.armor.value || 0;
      const acIncrease = Math.floor(crDeficit / 2); // 1 AC per 2 CR
      
      // Only suggest changes if the increase is meaningful (at least 1 AC)
      if (acIncrease >= 1) {
        adjustments.equipmentChanges = adjustments.equipmentChanges || [];
        adjustments.equipmentChanges.push({
          name: equipment.name,
          type: 'armor',
          from: `${currentAC} AC`,
          to: `${currentAC + acIncrease} AC`,
          change: acIncrease
        });
      }
    }
    
    // Check for arcane focus - these are just tools, not magic items
    if (equipment.system?.type === 'equipment' && 
        (equipment.name?.toLowerCase().includes('focus') || 
         equipment.name?.toLowerCase().includes('component'))) {
      // Arcane focuses don't get CR improvements - they're just tools
      console.log('[CRRetargeter] Skipping arcane focus - no CR impact');
      return;
    }
    
    // Check for actual magic items (rings, amulets, etc.)
    if (equipment.system?.type === 'equipment' && 
        (equipment.name?.toLowerCase().includes('ring') || 
         equipment.name?.toLowerCase().includes('amulet') ||
         equipment.name?.toLowerCase().includes('cloak'))) {
      if (crDeficit >= 3) {
        adjustments.equipmentChanges = adjustments.equipmentChanges || [];
        adjustments.equipmentChanges.push({
          name: equipment.name,
          type: 'enhancement',
          from: 'Basic item',
          to: 'Magic item (+1 to saves)',
          change: 1
        });
      }
    }
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
  static analyzeActorType(currentStats, actor) {
    const items = currentStats.items || [];
    const abilities = currentStats.abilities;
    
    // Use existing spellcaster detection
    const isSpellcaster = checkIfSpellcaster(actor);
    
    // Determine primary casting ability
    let primaryCastingAbility = 'int';
    
    if (isSpellcaster) {
      // Check for spellcasting features to determine ability
      for (const item of items) {
        const itemName = item.name?.toLowerCase() || '';
        const itemDesc = item.system?.description?.value?.toLowerCase() || '';
        
        if (item.type === 'feat' && (itemName.includes('spellcasting') || itemName.includes('spell'))) {
          if (itemDesc.includes('charisma')) primaryCastingAbility = 'cha';
          else if (itemDesc.includes('intelligence')) primaryCastingAbility = 'int';
          else if (itemDesc.includes('wisdom')) primaryCastingAbility = 'wis';
          break;
        }
      }
      
      // Fallback: if high INT, assume wizard
      if (abilities.int >= 15) {
        primaryCastingAbility = 'int';
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
      isSpellcaster,
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
    // First try to get from the actor data directly
    const actorData = get(actor);
    console.log('[CRRetargeter] Getting items from actor:', actorData);
    
    if (actorData?.system?.items) {
      console.log('[CRRetargeter] Found items in system.items:', actorData.system.items.length);
      return actorData.system.items;
    }
    
    if (actorData?.items) {
      console.log('[CRRetargeter] Found items in items:', actorData.items.length);
      return actorData.items;
    }
    
    // Try the embedded collection method
    if (typeof actor?.getEmbeddedCollection === 'function') {
      try {
      const itemsCollection = actor.getEmbeddedCollection("Item");
      if (itemsCollection && itemsCollection.size > 0) {
          console.log('[CRRetargeter] Found items in embedded collection:', itemsCollection.size);
        return Array.from(itemsCollection.values());
        }
      } catch (err) {
        console.log('[CRRetargeter] Error getting embedded collection:', err);
      }
    }
    
    console.log('[CRRetargeter] No items found');
    return [];
  }

  /**
   * Summarize changes for preview
   */
  static summarizeChanges(updates, currentStats, plan, adjustments = {}) {
    console.log('[CRRetargeter] summarizeChanges called with:', { updates, currentStats, plan, adjustments });
    console.log('[CRRetargeter] Updates keys:', Object.keys(updates));
    console.log('[CRRetargeter] Updates values:', updates);
    const changes = [];
    
    // Always add CR change
    if (updates['system.details.cr']) {
      changes.push({
        type: 'cr',
        label: 'Challenge Rating',
        from: currentStats.currentCR,
        to: updates['system.details.cr'],
        impact: 'overall'
      });
    }
    
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

    // Add weapon changes
    if (adjustments.weaponChanges && adjustments.weaponChanges.length > 0) {
      for (const weaponChange of adjustments.weaponChanges) {
        changes.push({
          type: 'weapon',
          label: weaponChange.name,
          from: weaponChange.from,
          to: weaponChange.to,
          impact: 'offensive'
        });
      }
    }

    // Add spell changes
    if (adjustments.spellChanges && adjustments.spellChanges.length > 0) {
      for (const spellChange of adjustments.spellChanges) {
        changes.push({
          type: 'spell',
          label: spellChange.name,
          from: spellChange.from,
          to: spellChange.to,
          impact: 'offensive'
        });
      }
    }

    // Add equipment changes
    if (adjustments.equipmentChanges && adjustments.equipmentChanges.length > 0) {
      for (const equipmentChange of adjustments.equipmentChanges) {
        changes.push({
          type: 'equipment',
          label: equipmentChange.name,
          from: equipmentChange.from,
          to: equipmentChange.to,
          impact: 'defensive'
        });
      }
    }

    return changes;
  }
}

export default CRRetargeter;
