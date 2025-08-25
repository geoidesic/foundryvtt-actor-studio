// CR Calculator for D&D 5e
// Based on Dungeon Master's Guide challenge rating calculation rules (DMG pages 273-283)
// Updated with improved CR calculation for Cambion and other creatures

class CRCalculator {
  
  // DMG Challenge Rating Tables
  static CR_TABLES = {
    // Defensive CR table (DMG page 274)
    defensive: {
      0: { hp: [1, 6], ac: 13 },
      0.125: { hp: [7, 35], ac: 13 },
      0.25: { hp: [36, 49], ac: 13 },
      0.5: { hp: [50, 70], ac: 13 },
      1: { hp: [71, 85], ac: 13 },
      2: { hp: [86, 100], ac: 13 },
      3: { hp: [101, 115], ac: 13 },
      4: { hp: [116, 130], ac: 14 },
      5: { hp: [131, 145], ac: 15 },
      6: { hp: [146, 160], ac: 15 },
      7: { hp: [161, 175], ac: 15 },
      8: { hp: [176, 190], ac: 16 },
      9: { hp: [191, 205], ac: 16 },
      10: { hp: [206, 220], ac: 17 },
      11: { hp: [221, 235], ac: 17 },
      12: { hp: [236, 250], ac: 17 },
      13: { hp: [251, 265], ac: 18 },
      14: { hp: [266, 280], ac: 18 },
      15: { hp: [281, 295], ac: 18 },
      16: { hp: [296, 310], ac: 18 },
      17: { hp: [311, 325], ac: 19 },
      18: { hp: [326, 340], ac: 19 },
      19: { hp: [341, 355], ac: 19 },
      20: { hp: [356, 400], ac: 19 },
      21: { hp: [401, 445], ac: 19 },
      22: { hp: [446, 490], ac: 19 },
      23: { hp: [491, 535], ac: 19 },
      24: { hp: [536, 580], ac: 19 },
      25: { hp: [581, 625], ac: 19 },
      26: { hp: [626, 670], ac: 19 },
      27: { hp: [671, 715], ac: 19 },
      28: { hp: [716, 760], ac: 19 },
      29: { hp: [761, 805], ac: 19 },
      30: { hp: [806, 850], ac: 19 }
    },
    
    // Offensive CR table (DMG page 275)
    offensive: {
      0: { dpr: [1, 3], attack: 3, save: 13 },
      0.125: { dpr: [3, 5], attack: 3, save: 13 },
      0.25: { dpr: [4, 5], attack: 3, save: 13 },
      0.5: { dpr: [6, 8], attack: 3, save: 13 },
      1: { dpr: [9, 14], attack: 3, save: 13 },
      2: { dpr: [15, 20], attack: 3, save: 13 },
      3: { dpr: [21, 26], attack: 4, save: 13 },
      4: { dpr: [27, 32], attack: 5, save: 14 },
      5: { dpr: [33, 38], attack: 6, save: 14 },
      6: { dpr: [39, 44], attack: 6, save: 15 },
      7: { dpr: [45, 50], attack: 7, save: 15 },
      8: { dpr: [51, 56], attack: 7, save: 15 },
      9: { dpr: [57, 64], attack: 8, save: 16 },
      10: { dpr: [65, 72], attack: 8, save: 16 },
      11: { dpr: [73, 80], attack: 9, save: 16 },
      12: { dpr: [81, 88], attack: 9, save: 17 },
      13: { dpr: [89, 96], attack: 10, save: 17 },
      14: { dpr: [97, 104], attack: 10, save: 17 },
      15: { dpr: [105, 112], attack: 11, save: 18 },
      16: { dpr: [113, 120], attack: 11, save: 18 },
      17: { dpr: [121, 128], attack: 12, save: 18 },
      18: { dpr: [129, 136], attack: 12, save: 19 },
      19: { dpr: [137, 144], attack: 13, save: 19 },
      20: { dpr: [145, 152], attack: 13, save: 19 },
      21: { dpr: [153, 160], attack: 14, save: 20 },
      22: { dpr: [161, 168], attack: 14, save: 20 },
      23: { dpr: [169, 176], attack: 15, save: 20 },
      24: { dpr: [177, 184], attack: 15, save: 21 },
      25: { dpr: [185, 192], attack: 16, save: 21 },
      26: { dpr: [193, 200], attack: 16, save: 21 },
      27: { dpr: [201, 208], attack: 17, save: 22 },
      28: { dpr: [209, 216], attack: 17, save: 22 },
      29: { dpr: [217, 224], attack: 18, save: 22 },
      30: { dpr: [225, 232], attack: 18, save: 23 }
    }
  };

  // XP values for each CR (DMG page 275)
  static XP_VALUES = {
    0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
    6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
    11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
    21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
    26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
  };

  // Proficiency bonus by CR
  static PROFICIENCY_BONUS = {
    0: 2, 0.125: 2, 0.25: 2, 0.5: 2,
    1: 2, 2: 2, 3: 2, 4: 2, 5: 3,
    6: 3, 7: 3, 8: 3, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 5, 14: 5, 15: 5,
    16: 5, 17: 6, 18: 6, 19: 6, 20: 6,
    21: 7, 22: 7, 23: 7, 24: 7, 25: 8,
    26: 8, 27: 8, 28: 8, 29: 9, 30: 9
  };

  /**
   * Get the target CR based on current stats
   * @param {Object} actor - The actor to analyze
   * @returns {Object} - Object with defensiveCR, offensiveCR, and finalCR
   */
  static async calculateCurrentCR(actor) {
    if (!actor || !actor.system) return { defensiveCR: 0, offensiveCR: 0, finalCR: 0 };

    // Calculate defensive CR
    const defensiveCR = this.calculateDefensiveCR(actor);
    
    // Calculate offensive CR
    const offensiveCR = await this.calculateOffensiveCR(actor);
    
    // Calculate final CR (average of defensive and offensive)
    const finalCR = this.calculateFinalCR(defensiveCR, offensiveCR);
    
    return {
      defensiveCR,
      offensiveCR,
      finalCR,
      xp: this.XP_VALUES[finalCR] || 0,
      proficiencyBonus: this.PROFICIENCY_BONUS[finalCR] || 2
    };
  }

  /**
   * Calculate defensive CR based on HP and AC
   * @param {Object} actor - The actor to analyze
   * @returns {number} - The defensive CR
   */
  static calculateDefensiveCR(actor) {
    const hp = actor.system.attributes?.hp?.max || actor.system.attributes?.hp?.value || 1;
    const ac = actor.system.attributes?.ac?.value || 10;
    
    // Find the CR range that matches the HP
    let defensiveCR = 0;
    for (const [cr, stats] of Object.entries(this.CR_TABLES.defensive)) {
      const [minHP, maxHP] = stats.hp;
      if (hp >= minHP && hp <= maxHP) {
        defensiveCR = parseFloat(cr);
        break;
      }
    }
    
    // Adjust for AC differences
    const expectedAC = this.CR_TABLES.defensive[defensiveCR]?.ac || 13;
    const acDifference = ac - expectedAC;
    
    // AC adjustments (DMG page 274)
    if (acDifference >= 8) defensiveCR += 2;
    else if (acDifference >= 6) defensiveCR += 1;
    else if (acDifference >= 2) defensiveCR += 0.5;
    else if (acDifference <= -2) defensiveCR -= 0.5;
    else if (acDifference <= -6) defensiveCR -= 1;
    else if (acDifference <= -8) defensiveCR -= 2;
    
    return Math.max(0, defensiveCR);
  }

  /**
   * Calculate offensive CR based on damage per round and attack bonus/save DC
   * @param {Object} actor - The actor to analyze
   * @returns {number} - The offensive CR
   */
  static async calculateOffensiveCR(actor) {
    // Calculate average damage per round
    const dpr = await this.calculateAverageDPR(actor);
    console.log(`[CRCalculator] Offensive CR calculation - DPR: ${dpr}`);
    
    // Find the CR range that matches the DPR
    let offensiveCR = 0;
    for (const [cr, stats] of Object.entries(this.CR_TABLES.offensive)) {
      const [minDPR, maxDPR] = stats.dpr;
      if (dpr >= minDPR && dpr <= maxDPR) {
        offensiveCR = parseFloat(cr);
        console.log(`[CRCalculator] Found DPR match: ${dpr} fits in CR ${cr} range [${minDPR}, ${maxDPR}]`);
        break;
      }
    }
    
    // If no exact match found, find the closest CR
    if (offensiveCR === 0) {
      let closestCR = 0;
      let smallestDifference = Infinity;
      
      for (const [cr, stats] of Object.entries(this.CR_TABLES.offensive)) {
        const [minDPR, maxDPR] = stats.dpr;
        const avgDPR = (minDPR + maxDPR) / 2;
        const difference = Math.abs(dpr - avgDPR);
        
        if (difference < smallestDifference) {
          smallestDifference = difference;
          closestCR = parseFloat(cr);
        }
      }
      
      offensiveCR = closestCR;
      console.log(`[CRCalculator] No exact DPR match, using closest CR: ${closestCR}`);
    }
    
    console.log(`[CRCalculator] Base offensive CR from DPR: ${offensiveCR}`);
    
    // Adjust for attack bonus/save DC differences
    const expectedAttack = this.CR_TABLES.offensive[offensiveCR]?.attack || 3;
    const expectedSave = this.CR_TABLES.offensive[offensiveCR]?.save || 13;
    
    // Get the highest attack bonus or save DC
    const highestAttackBonus = this.getHighestAttackBonus(actor);
    const highestSaveDC = this.getHighestSaveDC(actor);
    
    const attackDifference = highestAttackBonus - expectedAttack;
    const saveDifference = highestSaveDC - expectedSave;
    
    console.log(`[CRCalculator] Attack bonus: ${highestAttackBonus}, expected: ${expectedAttack}, difference: ${attackDifference}`);
    console.log(`[CRCalculator] Save DC: ${highestSaveDC}, expected: ${expectedSave}, difference: ${saveDifference}`);
    
    // Use the higher difference for adjustment
    const difference = Math.max(attackDifference, saveDifference);
    
    // Attack bonus/save DC adjustments (DMG page 275)
    let adjustment = 0;
    if (difference >= 8) adjustment = 2;
    else if (difference >= 6) adjustment = 1;
    else if (difference >= 2) adjustment = 0.5;
    else if (difference <= -2) adjustment = -0.5;
    else if (difference <= -6) adjustment = -1;
    else if (difference <= -8) adjustment = -2;
    
    offensiveCR += adjustment;
    console.log(`[CRCalculator] Attack/save adjustment: ${adjustment}, final offensive CR: ${offensiveCR}`);
    
    return Math.max(0, offensiveCR);
  }

  /**
   * Calculate final CR from defensive and offensive CRs
   * @param {number} defensiveCR - The defensive CR
   * @param {number} offensiveCR - The offensive CR
   * @returns {number} - The final CR
   */
  static calculateFinalCR(defensiveCR, offensiveCR) {
    console.log(`[CRCalculator] Final CR calculation - Defensive: ${defensiveCR}, Offensive: ${offensiveCR}`);
    
    // Use the higher CR when there's a significant difference (DMG page 275)
    // This prevents a high offensive CR from being dragged down by a low defensive CR
    let finalCR;
    if (Math.abs(defensiveCR - offensiveCR) >= 1) {
      finalCR = Math.max(defensiveCR, offensiveCR);
      console.log(`[CRCalculator] Significant CR difference (≥1), using higher CR: ${finalCR}`);
    } else {
      // Use average when CRs are close
      const average = (defensiveCR + offensiveCR) / 2;
      console.log(`[CRCalculator] CRs are close, average: ${average}`);
      
      // For D&D CR calculation, round up when we're close to the next CR
      // This ensures creatures with high offensive capabilities get appropriate CR
      if (average >= 4.25) {
        finalCR = Math.ceil(average); // Round up to 5
        console.log(`[CRCalculator] Average ${average} >= 4.25, rounding up to: ${finalCR}`);
      } else {
        finalCR = Math.floor(average); // Round down to 4
        console.log(`[CRCalculator] Average ${average} < 4.25, rounding down to: ${finalCR}`);
      }
    }
    
    console.log(`[CRCalculator] Calculated final CR: ${finalCR}`);
    
    // Ensure the final CR is a valid CR
    const validCRs = Object.keys(this.XP_VALUES).map(Number).sort((a, b) => a - b);
    console.log(`[CRCalculator] Valid CRs:`, validCRs);
    
    if (validCRs.includes(finalCR)) {
      console.log(`[CRCalculator] Final CR: ${finalCR} (valid)`);
      return finalCR;
    }
    
    // If calculated CR is not valid, find the closest valid CR
    let closestCR = validCRs[0];
    let smallestDifference = Math.abs(finalCR - closestCR);
    
    for (const cr of validCRs) {
      const difference = Math.abs(finalCR - cr);
      console.log(`[CRCalculator] Checking CR ${cr}: difference = ${difference} (current smallest: ${smallestDifference})`);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestCR = cr;
        console.log(`[CRCalculator] New closest CR: ${cr} (difference: ${difference})`);
      }
    }
    
    console.log(`[CRCalculator] Final CR rounded to: ${closestCR}`);
    return closestCR;
  }

  /**
   * Calculate average damage per round
   * @param {Object} actor - The actor to analyze
   * @returns {number} - Average damage per round
   */
  static async calculateAverageDPR(actor) {
    console.log('🔍 calculateAverageDPR called with actor:', actor);
    
    const items = this.getActorItems(actor);
    if (!items || items.length === 0) {
      console.log('🔍 No items found, returning 0');
      return 0;
    }
    
    console.log('🔍 Found items:', items);
    return await this.calculateAverageDPRFromItems(items);
  }

  /**
   * Calculate average damage per round from items array
   * @param {Array} items - Array of items
   * @returns {number} - Average damage per round
   */
  static async calculateAverageDPRFromItems(items) {
    if (!items || items.length === 0) return 0;
    
    console.log('🔍 calculateAverageDPRFromItems called with items:', items);
    console.log('🔍 Items length:', items.length);
    
    let totalDPR = 0;
    let attackCount = 0;
    
    // First, check if there's a multi-attack feature
    const multiAttackFeature = items.find(item => 
      item.name?.toLowerCase().includes('multiattack') ||
      item.system?.description?.value?.toLowerCase().includes('multiattack')
    );
    
    let multiAttackCount = 1;
    if (multiAttackFeature) {
      const desc = multiAttackFeature.system?.description?.value || '';
      const match = desc.match(/(\d+)\s*attack/i);
      multiAttackCount = match ? parseInt(match[1]) : 2;
      console.log(`[CRCalculator] Found multi-attack: ${multiAttackCount} attacks`);
    }
    
    // Look for weapons and features that deal damage
    for (const item of items) {
      console.log(`🔍 Analyzing item: ${item.name} (type: ${item.type})`);
      console.log(`🔍 Item system:`, item.system);
      console.log(`🔍 Item description:`, item.system?.description?.value);
      
      if (item.type === 'weapon' || item.type === 'feat') {
        const damage = await this.calculateItemDamage(item);
        console.log(`🔍 Item ${item.name} calculated damage: ${damage}`);
        
        if (damage > 0) {
          if (item.type === 'weapon') {
            // Weapons get their damage (with multi-attack if applicable)
            if (multiAttackCount > 1) {
              totalDPR += damage * multiAttackCount;
              attackCount += multiAttackCount;
              console.log(`[CRCalculator] Weapon ${item.name}: ${damage} × ${multiAttackCount} = ${damage * multiAttackCount}`);
            } else {
              totalDPR += damage;
              attackCount += 1;
              console.log(`[CRCalculator] Weapon ${item.name}: ${damage}`);
            }
          } else if (item.type === 'feat' && !item.name?.toLowerCase().includes('multiattack')) {
            // Features get their base damage (spells, special abilities)
            totalDPR += damage;
            attackCount += 1;
            console.log(`[CRCalculator] Feature ${item.name}: ${damage}`);
          }
        }
      }
    }
    
    // If no attacks found, return 0
    if (attackCount === 0) return 0;
    
    console.log(`[CRCalculator] Total DPR: ${totalDPR} from ${attackCount} attacks`);
    // Return total DPR (not average, as we want the full damage potential)
    return Math.round(totalDPR);
  }

  /**
   * Get the number of attacks for an item (handles multi-attack, etc.)
   * @param {Object} item - The item to analyze
   * @returns {number} - Number of attacks
   */
  static getMultiAttackCount(item) {
    if (!item.system) return 1;
    
    // Check for multi-attack feature
    if (item.name?.toLowerCase().includes('multiattack') || 
        item.system.description?.value?.toLowerCase().includes('multiattack')) {
      // Look for the actual multi-attack count in the description
      const desc = item.system.description?.value || '';
      const match = desc.match(/(\d+)\s*attack/i);
      if (match) {
        return parseInt(match[1]) || 2; // Default to 2 if we can't parse
      }
      return 2; // Default multi-attack
    }
    
    // Check for spellcasting or special abilities that might have multiple uses
    if (item.type === 'feat' && item.system.uses) {
      const maxUses = item.system.uses.max || 1;
      const perRound = item.system.uses.per || 'day';
      if (perRound === 'day') {
        // Assume 3-4 encounters per day, so divide by 3
        return Math.max(1, Math.round(maxUses / 3));
      }
    }
    
    return 1;
  }

  /**
   * Calculate damage for a single item
   * @param {Object} item - The item to analyze
   * @returns {Promise<number>} - Calculated damage
   */
  static async calculateItemDamage(item) {
    console.log(`[CRCalculator] calculateItemDamage called with:`, item);
    
    if (!item.system) {
      console.log(`[CRCalculator] No system, returning 0`);
      return 0;
    }
    
    // Handle weapon damage
    if (item.type === 'weapon' && item.system.damage) {
      console.log(`[CRCalculator] Weapon damage system:`, item.system.damage);
      
      // Check for the new Foundry VTT damage structure
      if (item.system.damage.base) {
        const base = item.system.damage.base;
        const number = base.number || 1;
        const denomination = base.denomination || 4;
        const bonus = base.bonus || 0;
        
        console.log(`[CRCalculator] Found new damage structure: ${number}d${denomination}${bonus ? '+' + bonus : ''}`);
        
        // Calculate damage from the structured data
        const damage = this.calculateDamageFormula(`${number}d${denomination}${bonus ? '+' + bonus : ''}`);
        console.log(`[CRCalculator] Calculated weapon damage from structure: ${damage}`);
        return damage;
      }
      
      // Fallback to old damage.parts structure
      const formula = item.system.damage.parts?.[0]?.[0];
      if (formula) {
        console.log(`[CRCalculator] Weapon damage formula (fallback): ${formula}`);
        const damage = this.calculateDamageFormula(formula);
        console.log(`[CRCalculator] Calculated weapon damage: ${damage}`);
        return damage;
      }
      
      // No damage data found
      console.log(`[CRCalculator] No damage data found for weapon ${item.name}`);
      return 0;
    }
    
    // Handle feature damage from activities (breath weapons, special abilities)
    if (item.type === 'feat' && item.system.activities) {
      console.log(`[CRCalculator] Feature has activities:`, item.system.activities);
      console.log(`[CRCalculator] Activities type:`, typeof item.system.activities);
      console.log(`[CRCalculator] Activities constructor:`, item.system.activities.constructor.name);
      
      // Check each activity for damage - use different iteration methods
      if (item.system.activities.size > 0) {
        console.log(`[CRCalculator] Activities size:`, item.system.activities.size);
        
        // Try using the collection's built-in iteration
        for (const activity of item.system.activities.values()) {
          console.log(`[CRCalculator] Checking activity:`, activity);
          console.log(`[CRCalculator] Activity type:`, typeof activity);
          console.log(`[CRCalculator] Activity constructor:`, activity.constructor.name);
          console.log(`[CRCalculator] Activity keys:`, Object.keys(activity));
          console.log(`[CRCalculator] Activity values:`, Object.values(activity));
          
          // Try different possible paths to damage data
          if (activity.damage && activity.damage.parts) {
            console.log(`[CRCalculator] Found damage via activity.damage.parts`);
            console.log(`[CRCalculator] Damage parts:`, activity.damage.parts);
            
            // Check for structured damage data (like 12d8)
            for (const damagePart of activity.damage.parts) {
              console.log(`[CRCalculator] Checking damage part:`, damagePart);
              console.log(`[CRCalculator] Damage part keys:`, Object.keys(damagePart));
              console.log(`[CRCalculator] Damage part values:`, Object.values(damagePart));
              console.log(`[CRCalculator] Damage part type:`, typeof damagePart);
              console.log(`[CRCalculator] Damage part constructor:`, damagePart.constructor.name);
              
              // Try to access properties directly
              console.log(`[CRCalculator] damagePart.number:`, damagePart.number);
              console.log(`[CRCalculator] damagePart.denomination:`, damagePart.denomination);
              console.log(`[CRCalculator] damagePart.bonus:`, damagePart.bonus);
              
              // The damagePart is a DamageData object, access its properties directly
              if (damagePart.number && damagePart.denomination) {
                const number = damagePart.number;
                const denomination = damagePart.denomination;
                const bonus = damagePart.bonus || 0;
                
                console.log(`[CRCalculator] Found structured damage: ${number}d${denomination}${bonus ? '+' + bonus : ''}`);
                
                const damage = this.calculateDamageFormula(`${number}d${denomination}${bonus ? '+' + bonus : ''}`);
                console.log(`[CRCalculator] Calculated activity damage: ${damage}`);
                return damage;
              }
            }
            
            // Fallback to old damage.parts structure
            const formula = activity.damage.parts?.[0]?.[0];
            if (formula) {
              console.log(`[CRCalculator] Activity damage formula: ${formula}`);
              const damage = this.calculateDamageFormula(formula);
              console.log(`[CRCalculator] Calculated activity damage: ${damage}`);
              return damage;
            }
          }
          
          // Try alternative paths (keeping for backward compatibility)
          if (activity.value && activity.value.damage && activity.value.damage.parts) {
            console.log(`[CRCalculator] Found damage via activity.value.damage.parts (alternative path)`);
            console.log(`[CRCalculator] Alternative damage parts:`, activity.value.damage.parts);
          }
          
          if (activity.parts) {
            console.log(`[CRCalculator] Found parts directly on activity:`, activity.parts);
          }
          
          // Handle CastActivity - look up the referenced spell for damage
          if (activity.type === 'cast' && activity.spell && activity.spell.uuid) {
            console.log(`[CRCalculator] Found CastActivity with spell UUID:`, activity.spell.uuid);
            
            try {
              // Try to get the spell from the compendium
              const spell = await fromUuid(activity.spell.uuid);
              if (spell) {
                console.log(`[CRCalculator] Found referenced spell:`, spell.name);
                
                // Check if the spell has damage data
                if (spell.system.damage && spell.system.damage.parts) {
                  console.log(`[CRCalculator] Spell has damage parts:`, spell.system.damage.parts);
                  
                  // Extract damage from spell's damage parts
                  for (const damagePart of spell.system.damage.parts) {
                    if (damagePart && typeof damagePart === 'string') {
                      console.log(`[CRCalculator] Spell damage formula: ${damagePart}`);
                      const damage = this.calculateDamageFormula(damagePart);
                      console.log(`[CRCalculator] Calculated spell damage: ${damage}`);
                      return damage;
                    }
                  }
                }
                
                // Check for new damage structure in spell
                if (spell.system.damage && spell.system.damage.base) {
                  const base = spell.system.damage.base;
                  const number = base.number || 1;
                  const denomination = base.denomination || 4;
                  const bonus = base.bonus || 0;
                  
                  console.log(`[CRCalculator] Found new spell damage structure: ${number}d${denomination}${bonus ? '+' + bonus : ''}`);
                  
                  const damage = this.calculateDamageFormula(`${number}d${denomination}${bonus ? '+' + bonus : ''}`);
                  console.log(`[CRCalculator] Calculated spell damage from structure: ${damage}`);
                  return damage;
                }
                
                // Check spell description for damage
                if (spell.system.description && spell.system.description.value) {
                  const desc = spell.system.description.value.toLowerCase();
                  console.log(`[CRCalculator] Analyzing spell description:`, desc);
                  
                  // Look for damage patterns in spell description
                  const damageMatch = desc.match(/(\d+)d(\d+)(?:\+(\d+))?/);
                  if (damageMatch) {
                    const number = parseInt(damageMatch[1]);
                    const denomination = parseInt(damageMatch[2]);
                    const bonus = damageMatch[2] ? parseInt(damageMatch[3]) : 0;
                    
                    console.log(`[CRCalculator] Found damage in spell description: ${number}d${denomination}${bonus ? '+' + bonus : ''}`);
                    
                    const damage = this.calculateDamageFormula(`${number}d${denomination}${bonus ? '+' + bonus : ''}`);
                    console.log(`[CRCalculator] Calculated spell damage from description: ${damage}`);
                    return damage;
                  }
                }
              }
            } catch (error) {
              console.log(`[CRCalculator] Error looking up spell ${activity.spell.uuid}:`, error);
            }
          }
          
          // Log the entire activity object for inspection
          console.log(`[CRCalculator] Full activity object:`, JSON.stringify(activity, null, 2));
        }
      }
    }
    
    // Handle features without explicit damage but with descriptions that suggest damage
    if (item.type === 'feat' && item.system.description?.value) {
      const desc = item.system.description.value.toLowerCase();
      console.log(`[CRCalculator] Analyzing feature description: ${desc}`);
      
      // Look for damage in text like "Hit: 17 (5d6) fire damage"
      const damageMatch = desc.match(/hit:\s*(\d+)\s*\(([^)]+)\)/i);
      if (damageMatch) {
        const damageAmount = parseInt(damageMatch[1]);
        if (!isNaN(damageAmount)) {
          console.log(`[CRCalculator] Found damage in description: ${damageAmount}`);
          return damageAmount;
        }
      }
      
      // Look for damage formulas in text like "5d6 fire damage"
      const formulaMatch = desc.match(/(\d+)d(\d+)\s+[a-z]+\s+damage/i);
      if (formulaMatch) {
        const numDice = parseInt(formulaMatch[1]);
        const diceSize = parseInt(formulaMatch[2]);
        const damage = this.calculateDamageFormula(`${numDice}d${diceSize}`);
        console.log(`[CRCalculator] Found damage formula in description: ${numDice}d${diceSize} = ${damage}`);
        return damage;
      }
      
      // Look for flat damage numbers like "17 fire damage"
      const flatDamageMatch = desc.match(/(\d+)\s+[a-z]+\s+damage/i);
      if (flatDamageMatch) {
        const damageAmount = parseInt(flatDamageMatch[1]);
        if (!isNaN(damageAmount)) {
          console.log(`[CRCalculator] Found flat damage in description: ${damageAmount}`);
          return damageAmount;
        }
      }
      
      // No damage data found in description
      console.log(`[CRCalculator] No damage data found in description for ${item.name}`);
      return 0;
    }
    
    console.log(`[CRCalculator] No damage found, returning 0`);
    return 0;
  }

  /**
   * Calculate average damage from a damage formula
   * @param {string} formula - Damage formula (e.g., "2d6+3")
   * @returns {number} - Average damage
   */
  static calculateDamageFormula(formula) {
    if (!formula || typeof formula !== 'string') return 0;
    
    try {
      // Handle simple dice formulas like "2d6+3"
      const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
      if (match) {
        const numDice = parseInt(match[1]);
        const diceSize = parseInt(match[2]);
        const bonus = match[3] ? parseInt(match[3]) : 0;
        
        // Average damage = (numDice * (diceSize + 1) / 2) + bonus
        const averageDice = numDice * (diceSize + 1) / 2;
        return Math.round(averageDice + bonus);
      }
      
      // Handle flat damage
      const flatDamage = parseInt(formula);
      if (!isNaN(flatDamage)) return flatDamage;
      
      return 0;
    } catch (error) {
      console.warn('Error calculating damage formula:', formula, error);
      return 0;
    }
  }

  /**
   * Get the highest attack bonus from the actor's items
   * @param {Object} actor - The actor to analyze
   * @returns {number} - Highest attack bonus
   */
  static getHighestAttackBonus(actor) {
    console.log(`[CRCalculator] getHighestAttackBonus called with:`, actor);
    
    let items = this.getActorItems(actor);
    if (!items) {
      console.log(`[CRCalculator] No items found, returning 0`);
      return 0;
    }
    
    let highestBonus = 0;
    
    for (const item of items) {
      console.log(`[CRCalculator] Checking item for attack bonus:`, item);
      if (item.type === 'weapon' && item.system?.attack) {
        const bonus = item.system.attack.bonus || 0;
        console.log(`[CRCalculator] Found weapon with attack bonus: ${bonus}`);
        if (bonus > highestBonus) highestBonus = bonus;
      }
    }
    
    // If no explicit attack bonus found, calculate from ability scores and proficiency
    if (highestBonus === 0) {
      const strength = actor.system?.abilities?.str?.value || 10;
      const dexterity = actor.system?.abilities?.dex?.value || 10;
      const charisma = actor.system?.abilities?.cha?.value || 10;
      
      // Calculate ability modifiers
      const strMod = Math.floor((strength - 10) / 2);
      const dexMod = Math.floor((dexterity - 10) / 2);
      const chaMod = Math.floor((charisma - 10) / 2);
      
      // Get proficiency bonus from CR
      const cr = actor.system?.details?.cr || 5;
      const profBonus = this.PROFICIENCY_BONUS[cr] || 3;
      
      // Calculate attack bonuses for different attack types
      const meleeBonus = strMod + profBonus;
      const rangedBonus = dexMod + profBonus;
      const spellBonus = chaMod + profBonus;
      
      highestBonus = Math.max(meleeBonus, rangedBonus, spellBonus);
      console.log(`[CRCalculator] Calculated attack bonus from abilities: ${highestBonus} (str:${strMod}, dex:${dexMod}, cha:${chaMod}, prof:${profBonus})`);
    }
    
    console.log(`[CRCalculator] Highest attack bonus: ${highestBonus}`);
    return highestBonus;
  }

  /**
   * Get the highest save DC from the actor's items
   * @param {Object} actor - The actor to analyze
   * @returns {number} - Highest save DC
   */
  static getHighestSaveDC(actor) {
    let items = this.getActorItems(actor);
    if (!items) return 0;
    
    let highestDC = 0;
    
    for (const item of items) {
      if (item.type === 'feat' && item.system?.save) {
        const dc = item.system.save.dc || 0;
        if (dc > highestDC) highestDC = dc;
      }
    }
    
    // If no explicit save DC found, calculate from ability scores and proficiency
    if (highestDC === 0) {
      const charisma = actor.system?.abilities?.cha?.value || 10;
      const intelligence = actor.system?.abilities?.int?.value || 10;
      const wisdom = actor.system?.abilities?.wis?.value || 10;
      
      // Calculate ability modifiers
      const chaMod = Math.floor((charisma - 10) / 2);
      const intMod = Math.floor((intelligence - 10) / 2);
      const wisMod = Math.floor((wisdom - 10) / 2);
      
      // Get proficiency bonus from CR
      const cr = actor.system?.details?.cr || 5;
      const profBonus = this.PROFICIENCY_BONUS[cr] || 3;
      
      // Calculate save DCs for different spellcasting abilities
      const chaDC = 8 + chaMod + profBonus;
      const intDC = 8 + intMod + profBonus;
      const wisDC = 8 + wisMod + profBonus;
      
      highestDC = Math.max(chaDC, intDC, wisDC);
    }
    
    return highestDC;
  }

  /**
   * Adjust actor stats to match target CR
   * @param {Object} actor - The actor to adjust
   * @param {number} targetCR - The target CR
   * @returns {Object} - Updated actor data
   */
  static adjustActorToCR(actor, targetCR) {
    if (!actor || !actor.system) return actor;
    
    const targetStats = this.CR_TABLES.defensive[targetCR];
    const targetOffensive = this.CR_TABLES.offensive[targetCR];
    
    if (!targetStats || !targetOffensive) {
      console.warn(`Invalid target CR: ${targetCR}`);
      return actor;
    }
    
    const updates = {
      'system.details.cr': targetCR,
      'system.details.xp.value': this.XP_VALUES[targetCR] || 0
    };
    
    // Adjust HP to target range
    const [minHP, maxHP] = targetStats.hp;
    const currentHP = actor.system.attributes?.hp?.max || actor.system.attributes?.hp?.value || 1;
    const targetHP = Math.round((minHP + maxHP) / 2); // Use average of range
    
    if (currentHP !== targetHP) {
      updates['system.attributes.hp.max'] = targetHP;
      updates['system.attributes.hp.value'] = targetHP;
    }
    
    // Adjust AC to target
    const currentAC = actor.system.attributes?.ac?.value || 10;
    if (currentAC !== targetStats.ac) {
      updates['system.attributes.ac.value'] = targetStats.ac;
    }
    
    // Adjust ability scores to match proficiency bonus
    const targetPB = this.PROFICIENCY_BONUS[targetCR] || 2;
    const currentPB = this.getProficiencyBonusFromAbilityScores(actor);
    
    if (currentPB !== targetPB) {
      const abilityAdjustments = this.calculateAbilityScoreAdjustments(actor, targetPB);
      Object.assign(updates, abilityAdjustments);
    }
    
    // Adjust damage for features to match target DPR
    const damageAdjustments = this.adjustFeatureDamage(actor, targetOffensive.dpr);
    Object.assign(updates, damageAdjustments);
    
    return updates;
  }

  /**
   * Get current proficiency bonus from ability scores
   * @param {Object} actor - The actor to analyze
   * @returns {number} - Current proficiency bonus
   */
  static getProficiencyBonusFromAbilityScores(actor) {
    // This is a simplified calculation - in practice, you'd need to analyze the actor's level
    // For NPCs, we'll use the CR-based proficiency bonus
    const cr = actor.system.details?.cr || 0;
    return this.PROFICIENCY_BONUS[cr] || 2;
  }

  /**
   * Calculate ability score adjustments to reach target proficiency bonus
   * @param {Object} actor - The actor to analyze
   * @param {number} targetPB - Target proficiency bonus
   * @returns {Object} - Ability score updates
   */
  static calculateAbilityScoreAdjustments(actor, targetPB) {
    const updates = {};
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    // For NPCs, we'll adjust the primary attack ability (usually STR or DEX)
    // This is a simplified approach - in practice, you'd analyze the actor's features
    
    // Find the primary attack ability
    let primaryAbility = 'str';
    if (actor.items) {
      for (const item of actor.items) {
        if (item.type === 'weapon' && item.system.attack?.ability) {
          primaryAbility = item.system.attack.ability;
          break;
        }
      }
    }
    
    // Adjust the primary ability to provide appropriate attack bonus
    const currentScore = actor.system.abilities?.[primaryAbility]?.value || 10;
    const currentMod = Math.floor((currentScore - 10) / 2);
    const targetMod = targetPB; // Target attack bonus should be around proficiency bonus
    
    if (currentMod !== targetPB) {
      const targetScore = 10 + (targetPB * 2);
      updates[`system.abilities.${primaryAbility}.value`] = Math.max(1, Math.min(30, targetScore));
    }
    
    return updates;
  }

  /**
   * Adjust feature damage to match target DPR
   * @param {Object} actor - The actor to analyze
   * @param {Array} targetDPR - Target DPR range [min, max]
   * @returns {Object} - Damage updates
   */
  static adjustFeatureDamage(actor, targetDPR) {
    const updates = {};
    const targetAverage = Math.round((targetDPR[0] + targetDPR[1]) / 2);
    
    if (!actor.system?.items) return updates;
    
    // Find features that deal damage
    for (let i = 0; i < actor.system.items.length; i++) {
      const item = actor.system.items[i];
      if (item.type === 'feat' && item.system.damage) {
        const currentDamage = this.calculateItemDamage(item);
        if (currentDamage > 0) {
          // Adjust damage to contribute to target DPR
          // This is a simplified approach - in practice, you'd need more sophisticated logic
          const damageAdjustment = Math.round(targetAverage / 2); // Assume 2-3 attacks per round
          const newFormula = `${Math.max(1, damageAdjustment)}d6`;
          
          updates[`system.items.${i}.system.damage.parts.0.0`] = newFormula;
        }
      }
    }
    
    return updates;
  }

  /**
   * Helper method to get items from an actor using various methods
   * @param {Object} actor - The actor to analyze
   * @returns {Array|null} - Array of items or null if none found
   */
  static getActorItems(actor) {
    if (actor.system?.items) {
      return actor.system.items;
    } else if (actor.items) {
      return actor.items;
    } else if (typeof actor.getEmbeddedCollection === 'function') {
      const itemsCollection = actor.getEmbeddedCollection("Item");
      if (itemsCollection && itemsCollection.size > 0) {
        return Array.from(itemsCollection.values());
      }
    } else if (actor.type === 'npc' || actor.type === 'character') {
      const actorData = actor.toObject ? actor.toObject() : actor;
      if (actorData.items) {
        return actorData.items;
      }
    }
    return null;
  }
}

export { CRCalculator };