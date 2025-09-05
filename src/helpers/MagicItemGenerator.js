// Magic Item Generator for D&D 5e
// Based on Dungeon Master's Guide treasure tables and custom CR-based generation

export class MagicItemGenerator {
  
  // DMG Hoard Magic Item Tables by tier (DMG page 136-139)
  static HOARD_MAGIC_ITEMS = {
    // Tier 1 (Levels 1-4)
    1: {
      common: { chance: 30, count: [1, 4] },
      uncommon: { chance: 15, count: [1, 2] },
      rare: { chance: 0, count: [0, 0] },
      veryRare: { chance: 0, count: [0, 0] },
      legendary: { chance: 0, count: [0, 0] }
    },
    // Tier 2 (Levels 5-10)
    2: {
      common: { chance: 30, count: [1, 4] },
      uncommon: { chance: 25, count: [1, 2] },
      rare: { chance: 15, count: [1, 2] },
      veryRare: { chance: 0, count: [0, 0] },
      legendary: { chance: 0, count: [0, 0] }
    },
    // Tier 3 (Levels 11-16)
    3: {
      common: { chance: 20, count: [1, 4] },
      uncommon: { chance: 30, count: [1, 2] },
      rare: { chance: 25, count: [1, 2] },
      veryRare: { chance: 15, count: [1, 2] },
      legendary: { chance: 0, count: [0, 0] }
    },
    // Tier 4 (Levels 17-20)
    4: {
      common: { chance: 15, count: [1, 4] },
      uncommon: { chance: 25, count: [1, 2] },
      rare: { chance: 30, count: [1, 2] },
      veryRare: { chance: 25, count: [1, 2] },
      legendary: { chance: 15, count: [1, 2] }
    }
  };

  // CR-based individual monster magic item chances
  static INDIVIDUAL_MAGIC_ITEMS = {
    // CR 0-4: Very low chance, gradual increase
    0: { common: 12, uncommon: 5, rare: 1, veryRare: 0, legendary: 0 },
    1: { common: 14, uncommon: 6, rare: 1, veryRare: 0, legendary: 0 },
    2: { common: 16, uncommon: 7, rare: 2, veryRare: 0, legendary: 0 },
    3: { common: 18, uncommon: 8, rare: 2, veryRare: 0, legendary: 0 },
    4: { common: 20, uncommon: 9, rare: 3, veryRare: 1, legendary: 0 },
    
    // CR 5-10: Low chance, steady progression
    5: { common: 22, uncommon: 11, rare: 4, veryRare: 1, legendary: 0 },
    6: { common: 24, uncommon: 13, rare: 5, veryRare: 2, legendary: 0 },
    7: { common: 26, uncommon: 15, rare: 6, veryRare: 2, legendary: 0 },
    8: { common: 28, uncommon: 17, rare: 7, veryRare: 3, legendary: 0 },
    9: { common: 30, uncommon: 19, rare: 8, veryRare: 3, legendary: 0 },
    10: { common: 32, uncommon: 21, rare: 9, veryRare: 4, legendary: 1 },
    
    // CR 11-16: Medium chance, accelerating progression
    11: { common: 34, uncommon: 23, rare: 11, veryRare: 5, legendary: 1 },
    12: { common: 36, uncommon: 25, rare: 13, veryRare: 6, legendary: 2 },
    13: { common: 38, uncommon: 27, rare: 15, veryRare: 7, legendary: 2 },
    14: { common: 40, uncommon: 29, rare: 17, veryRare: 8, legendary: 3 },
    15: { common: 42, uncommon: 31, rare: 19, veryRare: 9, legendary: 3 },
    16: { common: 44, uncommon: 33, rare: 21, veryRare: 10, legendary: 4 },
    
    // CR 17-22: High chance, continued acceleration
    17: { common: 46, uncommon: 35, rare: 23, veryRare: 12, legendary: 5 },
    18: { common: 48, uncommon: 37, rare: 25, veryRare: 14, legendary: 6 },
    19: { common: 50, uncommon: 39, rare: 27, veryRare: 16, legendary: 7 },
    20: { common: 52, uncommon: 41, rare: 29, veryRare: 18, legendary: 8 },
    21: { common: 54, uncommon: 43, rare: 31, veryRare: 20, legendary: 9 },
    22: { common: 56, uncommon: 45, rare: 33, veryRare: 22, legendary: 10 },
    
    // CR 23+: Very high chance, peak progression
    23: { common: 58, uncommon: 47, rare: 35, veryRare: 24, legendary: 11 },
    24: { common: 60, uncommon: 49, rare: 37, veryRare: 26, legendary: 12 },
    25: { common: 62, uncommon: 51, rare: 39, veryRare: 28, legendary: 13 },
    26: { common: 64, uncommon: 53, rare: 41, veryRare: 30, legendary: 14 },
    27: { common: 66, uncommon: 55, rare: 43, veryRare: 32, legendary: 15 },
    28: { common: 68, uncommon: 57, rare: 45, veryRare: 34, legendary: 16 },
    29: { common: 70, uncommon: 59, rare: 47, veryRare: 36, legendary: 17 },
    30: { common: 72, uncommon: 61, rare: 49, veryRare: 38, legendary: 18 }
  };

  // Magic item rarity definitions
  static RARITIES = {
    common: { label: 'Common', color: '#9b9b9b', weight: 1 },
    uncommon: { label: 'Uncommon', color: '#4caf50', weight: 2 },
    rare: { label: 'Rare', color: '#2196f3', weight: 4 },
    veryRare: { label: 'Very Rare', color: '#9c27b0', weight: 8 },
    legendary: { label: 'Legendary', color: '#ff9800', weight: 16 }
  };

  /**
   * Roll dice using Foundry's dice system
   * @param {number} numDice - Number of dice to roll
   * @param {number} diceSize - Size of dice (e.g., 4, 6, 8, 10, 12, 20)
   * @param {number} multiplier - Multiplier for the result (default 1)
   * @returns {number} - The rolled result
   */
  static rollDice(numDice, diceSize, multiplier = 1) {
    if (typeof game !== 'undefined' && game.dice) {
      // Use Foundry's dice system if available
      const roll = new Roll(`${numDice}d${diceSize}`);
      roll.evaluate({ async: false });
      return roll.total * multiplier;
    } else {
      // Fallback for testing or non-Foundry environments
      let total = 0;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSize) + 1;
      }
      return total * multiplier;
    }
  }

  /**
   * Get the CR value from an NPC
   * @param {Object} npc - The NPC document
   * @returns {number} - The challenge rating as a number
   */
  static getCRFromNPC(npc) {
    if (!npc || !npc.system) return 0;
    
    const cr = npc.system.details?.cr;
    if (!cr) return 0;
    
    // Handle fractional CRs
    if (typeof cr === 'string') {
      if (cr.includes('/')) {
        const [num, den] = cr.split('/').map(Number);
        return num / den;
      }
      return parseInt(cr) || 0;
    }
    
    return Number(cr) || 0;
  }

  /**
   * Get the appropriate tier for hoard generation based on party level
   * @param {number} partyLevel - Average party level
   * @returns {number} - The tier (1-4)
   */
  static getTierFromPartyLevel(partyLevel) {
    if (partyLevel <= 4) return 1;
    if (partyLevel <= 10) return 2;
    if (partyLevel <= 16) return 3;
    return 4;
  }

  /**
   * Find the appropriate CR key for the magic item table
   * @param {number} cr - The challenge rating
   * @returns {number} - The CR key to use for the magic item table
   */
  static findMagicItemTableCR(cr) {
    if (cr <= 4) return Math.floor(cr);
    if (cr <= 10) return Math.min(10, Math.max(5, Math.floor(cr)));
    if (cr <= 16) return Math.min(16, Math.max(11, Math.floor(cr)));
    return Math.min(30, Math.max(17, Math.floor(cr)));
  }

  /**
   * Generate magic items for a hoard based on party level
   * @param {number} partyLevel - Average party level
   * @returns {Array} - Array of magic items with rarity and count
   */
  static generateHoardMagicItems(partyLevel) {
    const tier = this.getTierFromPartyLevel(partyLevel);
    const tierData = this.HOARD_MAGIC_ITEMS[tier];
    
    if (!tierData) {
      console.warn(`No hoard magic item data found for tier ${tier}`);
      return [];
    }

    const results = [];
    
    // Check each rarity level
    for (const [rarity, data] of Object.entries(tierData)) {
      if (data.chance > 0) {
        // Roll percentage chance
        const roll = Math.random() * 100;
        if (roll <= data.chance) {
          // Roll for count
          const [min, max] = data.count;
          const count = this.rollDice(1, max - min + 1) + min - 1;
          
          if (count > 0) {
            results.push({
              rarity,
              count,
              label: this.RARITIES[rarity].label,
              color: this.RARITIES[rarity].color
            });
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Generate magic items for an individual monster based on CR
   * @param {Object} npc - The NPC document
   * @returns {Array} - Array of magic items with rarity and count
   */
  static generateIndividualMagicItems(npc) {
    const cr = this.getCRFromNPC(npc);
    const crKey = this.findMagicItemTableCR(cr);
    const crData = this.INDIVIDUAL_MAGIC_ITEMS[crKey];
    
    
    if (!crData) {
      console.warn(`No individual magic item data found for CR ${cr}`);
      return [];
    }

    const results = [];
    
    // Check each rarity level with chain reaction logic
    for (const [rarity, chance] of Object.entries(crData)) {
      if (chance > 0) {
        window.GAS.log.p(`=== Rolling for ${rarity} rarity ===`);
        
        // Keep rolling until we fail or hit a reasonable limit
        let itemsGenerated = 0;
        const maxItemsPerRarity = 5; // Prevent infinite loops
        
        while (itemsGenerated < maxItemsPerRarity) {
          // Roll percentage chance
          const roll = Math.random() * 100;
          window.GAS.log.p(`Roll ${itemsGenerated + 1} for ${rarity}: ${roll.toFixed(1)} vs ${chance}% chance`);
          
          if (roll <= chance) {
            window.GAS.log.p(`✅ ${rarity} passed the roll! Adding item ${itemsGenerated + 1}`);
            // Add the item and continue rolling
            results.push({
              rarity,
              count: 1,
              label: this.RARITIES[rarity].label,
              color: this.RARITIES[rarity].color
            });
            itemsGenerated++;
          } else {
            window.GAS.log.p(`❌ ${rarity} failed the roll. Stopping for this rarity.`);
            break; // Stop rolling for this rarity
          }
        }
        
        if (itemsGenerated >= maxItemsPerRarity) {
          conwindow.GAS.log.p(`⚠️ Reached maximum items limit (${maxItemsPerRarity}) for ${rarity} rarity`);
        }
        
        window.GAS.log.p(`Generated ${itemsGenerated} items for ${rarity} rarity`);
      }
    }
    
    window.GAS.log.p(`Final results:`, results);
    return results;
  }

  /**
   * Get all magic items from equipment packs (regardless of rarity)
   * @param {Array} packs - Array of compendium packs
   * @returns {Promise<Array>} - Array of all magic items
   */
  static async getAllMagicItems(packs) {
    try {
      window.GAS.log.p(`=== getAllMagicItems DEBUG ===`);
      window.GAS.log.p(`Packs:`, packs);
      
      // Import the utility function dynamically to avoid circular dependencies
      const { extractItemsFromPacksAsync } = await import('~/src/helpers/Utility.js');
      const items = await extractItemsFromPacksAsync(packs, [
        "name->label",
        "img",
        "type",
        "uuid->value",
        "_id"
      ], [
        "system.rarity",
        "system.properties"
      ]);
      
      window.GAS.log.p(`Raw items from extractItemsFromPacksAsync: ${items.length}`);
      if (items.length > 0) {
        window.GAS.log.p("Raw items - first 3:", items.slice(0, 3).map((item) => ({
          name: item.name || item.label,
          system: item.system,
          systemKeys: item.system ? Object.keys(item.system) : [],
          rarity: item.system?.rarity,
          properties: item.system?.properties,
          fullItem: item
        })));
      }
      
      // Filter to only magic items (regardless of rarity)
      const magicItems = items.filter((item) => {
        const isMagic = item.system?.properties?.includes("mgc");
        window.GAS.log.p(`Magic filter: ${item.name || item.label} - properties: ${item.system?.properties} - magic: ${isMagic}`);
        return isMagic;
      });
      
      window.GAS.log.p(`After magic filtering: ${magicItems.length} items`);
      return magicItems;
    } catch (error) {
      console.error("Error fetching all magic items:", error);
      return [];
    }
  }

  /**
   * Get magic items from equipment packs based on rarity
   * @param {Array} packs - Array of compendium packs
   * @param {string} rarity - The rarity to filter by
   * @returns {Promise<Array>} - Array of magic items
   */
  static async getMagicItemsByRarity(packs, rarity) {
    try {
      // Import the utility function dynamically to avoid circular dependencies
      const { extractItemsFromPacksAsync } = await import('~/src/helpers/Utility.js');
      
      const items = await extractItemsFromPacksAsync(packs, [
        "name->label",
        "img",
        "type",
        "uuid->value",
        "_id"
      ], [
        "system.rarity",
        "system.properties"
      ]);

      // Debug: Log the first few items to see their structure
      if (items.length > 0) {
        window.GAS.log.p('Items from packs - first 3:', items.slice(0, 3).map(item => ({
          name: item.name || item.label,
          system: item.system,
          systemKeys: item.system ? Object.keys(item.system) : [],
          rarity: item.system?.rarity,
          properties: item.system?.properties,
          fullItem: item
        })));
      }
      
      // Filter for magic items of the specified rarity
      return items.filter(item => {
        // Check if it's a magic item (has 'mgc' property)
        const isMagic = item.system?.properties?.includes('mgc');
        
        // Check rarity (some items might not have rarity set) - could be flat or nested
        const itemRarity = item['system.rarity'] || item.system?.rarity || 'common';
        
        // Debug: Check all possible rarity locations
        // const debugRarity = {
        //   'system.rarity': item.system?.rarity,
        //   'system.rarity.value': item.system?.rarity?.value,
        //   'rarity': item.rarity,
        //   'flatSystemRarity': item['system.rarity'],
        //   'allKeys': Object.keys(item)
        // };
        
        // window.GAS.log.p(`Filtering item ${item.name || item.label}: magic=${isMagic}, rarity=${itemRarity}, target=${rarity}`, debugRarity);
        
        return isMagic && itemRarity === rarity;
      });
    } catch (error) {
      console.error('Error fetching magic items:', error);
      return [];
    }
  }

  /**
   * Get a random magic item of a specific rarity
   * @param {Array} packs - Array of compendium packs
   * @param {string} rarity - The rarity to filter by
   * @returns {Promise<Object|null>} - Random magic item or null
   */
  static async getRandomMagicItem(packs, rarity) {
    const items = await this.getMagicItemsByRarity(packs, rarity);
    
    if (items.length === 0) {
      console.warn(`No magic items found for rarity: ${rarity}`);
      return null;
    }
    
    // Return a random item
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  /**
   * Generate actual magic item objects for a hoard
   * @param {number} partyLevel - Average party level
   * @param {Array} packs - Array of compendium packs
   * @returns {Promise<Array>} - Array of magic item objects
   */
  static async generateHoardMagicItemObjects(partyLevel, packs) {
    const rarityResults = this.generateHoardMagicItems(partyLevel);
    const actualItems = [];
    
    for (const result of rarityResults) {
      for (let i = 0; i < result.count; i++) {
        const item = await this.getRandomMagicItem(packs, result.rarity);
        if (item) {
          // Use the item's actual rarity, not the generated rarity
          const actualRarity = item['system.rarity'] || item.system?.rarity || 'common';
          window.GAS.log.p(`Generated item ${item.name || item.label}:`, {
            itemSystem: item.system,
            rarity: actualRarity,
            rarityLabel: this.RARITIES[actualRarity]?.label || actualRarity.toUpperCase(),
            rarityInMap: this.RARITIES[actualRarity],
            allRarityKeys: Object.keys(this.RARITIES)
          });
          actualItems.push({
            ...item,
            rarity: actualRarity,
            rarityLabel: this.RARITIES[actualRarity]?.label || actualRarity.toUpperCase(),
            rarityColor: this.RARITIES[actualRarity]?.color || '#666'
          });
        }
      }
    }
    
    return actualItems;
  }

  /**
   * Generate actual magic item objects for an individual monster
   * @param {Object} npc - The NPC document
   * @param {Array} packs - Array of compendium packs
   * @returns {Promise<Array>} - Array of magic item objects
   */
  static async generateIndividualMagicItemObjects(npc, packs) {
    const rarityResults = this.generateIndividualMagicItems(npc);
    const actualItems = [];
    
    for (const result of rarityResults) {
      const item = await this.getRandomMagicItem(packs, result.rarity);
              if (item) {
          // Use the item's actual rarity, not the generated rarity
          const actualRarity = item['system.rarity'] || item.system?.rarity || 'common';
          actualItems.push({
            ...item,
            rarity: actualRarity,
            rarityLabel: this.RARITIES[actualRarity]?.label || actualRarity.toUpperCase(),
            rarityColor: this.RARITIES[actualRarity]?.color || '#666'
          });
        }
    }
    
    return actualItems;
  }

  /**
   * Get a description of what magic items will be generated for a hoard
   * @param {number} partyLevel - Average party level
   * @returns {string} - Description of the magic item generation
   */
  static getHoardMagicItemDescription(partyLevel) {
    const tier = this.getTierFromPartyLevel(partyLevel);
    const tierData = this.HOARD_MAGIC_ITEMS[tier];
    
    if (!tierData) {
      return `No magic item data for tier ${tier}`;
    }
    
    const parts = [];
    for (const [rarity, data] of Object.entries(tierData)) {
      if (data.chance > 0) {
        const [min, max] = data.count;
        const countText = min === max ? `${min}` : `${min}-${max}`;
        parts.push(`${data.chance}% chance for ${countText} ${this.RARITIES[rarity].label}`);
      }
    }
    
    return `Tier ${tier} (Level ${partyLevel}): ${parts.join(', ')}`;
  }

  /**
   * Get a description of what magic items will be generated for an individual monster
   * @param {Object} npc - The NPC document
   * @returns {string} - Description of the magic item generation
   */
  static getIndividualMagicItemDescription(npc) {
    const cr = this.getCRFromNPC(npc);
    const crKey = this.findMagicItemTableCR(cr);
    const crData = this.INDIVIDUAL_MAGIC_ITEMS[crKey];
    
    if (!crData) {
      return `No magic item data for CR ${cr}`;
    }
    
    const parts = [];
    for (const [rarity, chance] of Object.entries(crData)) {
      if (chance > 0) {
        parts.push(`${chance}% chance for 1 ${this.RARITIES[rarity].label}`);
      }
    }
    
    return `CR ${cr}: ${parts.join(', ')}`;
  }

  /**
   * Generate magic items for an individual monster respecting treasure categories
   * @param {Object} npc - The NPC document
   * @param {Array} packs - Array of compendium packs
   * @param {Array} treasureCategories - Array of treasure category values
   * @returns {Promise<Array>} - Array of magic item objects filtered by categories
   */
  static async generateIndividualMagicItemObjectsWithCategories(npc, packs, treasureCategories) {
    const rarityResults = this.generateIndividualMagicItems(npc);
    const actualItems = [];
    
    for (const result of rarityResults) {
      const item = await this.getRandomMagicItemWithCategories(packs, result.rarity, treasureCategories);
              if (item) {
          // Use the item's actual rarity, not the generated rarity
          const actualRarity = item['system.rarity'] || item.system?.rarity || 'common';
        actualItems.push({
          ...item,
          rarity: actualRarity,
          rarityLabel: this.RARITIES[actualRarity]?.label || actualRarity.toUpperCase(),
          rarityColor: this.RARITIES[actualRarity]?.color || '#666'
        });
      }
    }
    
    return actualItems;
  }

  /**
   * Get a random magic item of a specific rarity that matches treasure categories
   * @param {Array} packs - Array of compendium packs
   * @param {string} rarity - The rarity to filter by
   * @param {Array} treasureCategories - Array of treasure category values
   * @returns {Promise<Object|null>} - Random magic item or null
   */
  static async getRandomMagicItemWithCategories(packs, rarity, treasureCategories) {
    // Import the TreasureCategoryMapper first
    const { TreasureCategoryMapper } = await import('~/src/helpers/TreasureCategoryMapper.js');
    
   
    // First, check if the requested rarity is compatible with the treasure categories
    const isRarityCompatible = TreasureCategoryMapper.isRarityCompatibleWithCategories(rarity, treasureCategories);
    
    if (!isRarityCompatible) {
      console.warn(`Rarity ${rarity} is incompatible with treasure categories:`, treasureCategories);
      window.GAS.log.p(`Skipping item fetching - no items can match both constraints`);
      return null;
    }
    
    
    // Get all magic items, then apply category filtering (which includes rarity constraints)
    const allItems = await this.getAllMagicItems(packs);
    
    if (!allItems || allItems.length === 0) {
      console.warn(`No magic items found in packs`);
      return null;
    }


    // Filter items by treasure categories first (this now includes rarity constraints)
    const categoryFilteredItems = TreasureCategoryMapper.filterItemsByCategories(allItems, treasureCategories);
    
    
    if (categoryFilteredItems.length === 0) {
      console.warn(`No magic items found for categories:`, treasureCategories);
      return null;
    }

    // Now filter by the requested rarity (we know it's compatible, so this should find items)
    const rarityFilteredItems = categoryFilteredItems.filter(item => {
      const itemRarity = item['system.rarity'] || item.system?.rarity || 'common';
      const matches = itemRarity === rarity;
      return matches;
    });
    
    
    if (rarityFilteredItems.length === 0) {
      console.warn(`No magic items found for rarity: ${rarity} after category filtering. This should not happen if rarity compatibility was checked.`);
      return null;
    }

    // Return a random item from the filtered list
    const randomIndex = Math.floor(Math.random() * rarityFilteredItems.length);
    return rarityFilteredItems[randomIndex];
  }
}
