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
    // CR 0-4: Very low chance
    0: { common: 15, uncommon: 8, rare: 2, veryRare: 0, legendary: 0 },
    1: { common: 15, uncommon: 8, rare: 2, veryRare: 0, legendary: 0 },
    2: { common: 15, uncommon: 8, rare: 2, veryRare: 0, legendary: 0 },
    3: { common: 15, uncommon: 8, rare: 2, veryRare: 0, legendary: 0 },
    4: { common: 15, uncommon: 8, rare: 2, veryRare: 0, legendary: 0 },
    
    // CR 5-10: Low chance
    5: { common: 25, uncommon: 15, rare: 8, veryRare: 2, legendary: 0 },
    6: { common: 25, uncommon: 15, rare: 8, veryRare: 2, legendary: 0 },
    7: { common: 25, uncommon: 15, rare: 8, veryRare: 2, legendary: 0 },
    8: { common: 25, uncommon: 15, rare: 8, veryRare: 2, legendary: 0 },
    9: { common: 25, uncommon: 15, rare: 8, veryRare: 2, legendary: 0 },
    10: { common: 25, uncommon: 15, rare: 8, veryRare: 2, legendary: 0 },
    
    // CR 11-16: Medium chance
    11: { common: 35, uncommon: 25, rare: 15, veryRare: 8, legendary: 2 },
    12: { common: 35, uncommon: 25, rare: 15, veryRare: 8, legendary: 2 },
    13: { common: 35, uncommon: 25, rare: 15, veryRare: 8, legendary: 2 },
    14: { common: 35, uncommon: 25, rare: 15, veryRare: 8, legendary: 2 },
    15: { common: 35, uncommon: 25, rare: 15, veryRare: 8, legendary: 2 },
    16: { common: 35, uncommon: 25, rare: 15, veryRare: 8, legendary: 2 },
    
    // CR 17+: High chance
    17: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    18: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    19: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    20: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    21: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    22: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    23: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    24: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    25: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    26: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    27: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    28: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    29: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 },
    30: { common: 45, uncommon: 35, rare: 25, veryRare: 15, legendary: 8 }
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
    
    // Check each rarity level
    for (const [rarity, chance] of Object.entries(crData)) {
      if (chance > 0) {
        // Roll percentage chance
        const roll = Math.random() * 100;
        if (roll <= chance) {
          // Individual monsters typically get 1 item of each rarity that passes
          results.push({
            rarity,
            count: 1,
            label: this.RARITIES[rarity].label,
            color: this.RARITIES[rarity].color
          });
        }
      }
    }
    
    return results;
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
      const { extractItemsFromPacksAsync } = await import('./Utility.js');
      
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
        console.log('Items from packs - first 3:', items.slice(0, 3).map(item => ({
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
        const debugRarity = {
          'system.rarity': item.system?.rarity,
          'system.rarity.value': item.system?.rarity?.value,
          'rarity': item.rarity,
          'flatSystemRarity': item['system.rarity'],
          'allKeys': Object.keys(item)
        };
        
        console.log(`Filtering item ${item.name || item.label}: magic=${isMagic}, rarity=${itemRarity}, target=${rarity}`, debugRarity);
        
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
          console.log(`Generated item ${item.name || item.label}:`, {
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
    const items = await this.getMagicItemsByRarity(packs, rarity);
    
    if (!items || items.length === 0) {
      console.warn(`No magic items found for rarity: ${rarity}`);
      return null;
    }

    // Import the TreasureCategoryMapper
    const { TreasureCategoryMapper } = await import('./TreasureCategoryMapper.js');
    
    // Filter items by treasure categories
    const filteredItems = TreasureCategoryMapper.filterItemsByCategories(items, treasureCategories);
    
    if (filteredItems.length === 0) {
      console.warn(`No magic items found for rarity: ${rarity} and categories: ${treasureCategories.join(', ')}`);
      return null;
    }

    // Return a random item from the filtered list
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    return filteredItems[randomIndex];
  }
}
