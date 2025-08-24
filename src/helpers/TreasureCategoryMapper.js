// Treasure Category Mapper for D&D 5e
// Maps treasure categories to item types for NPC treasure generation

export class TreasureCategoryMapper {
  
  // Map treasure categories to FoundryVTT item types and properties
  static TREASURE_CATEGORIES = {
    any: {
      label: 'Any',
      description: 'Can have any type of treasure',
      itemTypes: ['weapon', 'armor', 'equipment', 'consumable', 'tool', 'backpack', 'loot'],
      properties: [], // No restrictions
      minRarity: null, // No minimum rarity
      maxRarity: null, // No maximum rarity
      weight: 1
    },
    
    arcana: {
      label: 'Arcana',
      description: 'Magical items, scrolls, potions, spell components',
      itemTypes: ['consumable', 'equipment', 'loot'],
      properties: ['mgc'], // Magic items and spell-related
      minRarity: null, // No minimum rarity
      maxRarity: null, // No maximum rarity
      weight: 1.2
    },
    
    armaments: {
      label: 'Armaments', 
      description: 'Weapons, armor, shields',
      itemTypes: ['weapon', 'armor'],
      properties: ['mgc'], // Magic weapons/armor
      minRarity: null, // No minimum rarity
      maxRarity: null, // No maximum rarity
      weight: 1.1
    },
    
    implements: {
      label: 'Implements',
      description: 'Tools, instruments, magical foci',
      itemTypes: ['tool', 'equipment'],
      properties: ['mgc', 'foc'], // Magic tools and foci
      minRarity: null, // No minimum rarity
      maxRarity: 'uncommon', // Maximum of uncommon
      weight: 1.0
    },
    
    individual: {
      label: 'Individual',
      description: 'Personal items, jewelry, coins',
      itemTypes: ['loot', 'equipment'],
      properties: ['mgc'], // Magic jewelry, etc.
      minRarity: null, // No minimum rarity
      maxRarity: null, // No maximum rarity
      weight: 0.9
    },
    
    relics: {
      label: 'Relics',
      description: 'Ancient artifacts, powerful magical items',
      itemTypes: ['weapon', 'armor', 'equipment', 'loot'],
      properties: ['mgc'], // Magic items, especially rare+
      minRarity: 'veryRare', // Minimum of very rare
      maxRarity: null, // No maximum rarity
      weight: 1.5
    }
  };

  /**
   * Get all available treasure categories
   * @returns {Array} Array of category objects with value, label, and description
   */
  static getTreasureCategories() {
    return Object.entries(this.TREASURE_CATEGORIES).map(([value, category]) => ({
      value,
      label: category.label,
      description: category.description
    }));
  }

  /**
   * Check if an item matches a specific treasure category
   * @param {Object} item - The item to check
   * @param {string} category - The treasure category to match against
   * @returns {boolean} True if the item matches the category
   */
  static itemMatchesCategory(item, category) {
    if (!category || category === 'any') return true;
    
    const categoryData = this.TREASURE_CATEGORIES[category];
    if (!categoryData) return false;

    // Check item type - D&D 5e uses system.type.value
    const itemType = item.system?.type?.value || item.type;
    const itemRarity = item['system.rarity'] || item.system?.rarity || 'common';
    
    console.log(`Checking item ${item.name} (type: ${itemType}, rarity: ${itemRarity}) against category ${category} (allowed types: ${categoryData.itemTypes.join(', ')})`);
    
    if (!categoryData.itemTypes.includes(itemType)) {
      console.log(`  ❌ Item type ${itemType} not in allowed types for ${category}`);
      return false;
    }

    // Check properties if specified
    if (categoryData.properties.length > 0) {
      const itemProperties = item.system?.properties || [];
      const hasRequiredProperty = categoryData.properties.some(prop => 
        itemProperties.includes(prop)
      );
      if (!hasRequiredProperty) {
        console.log(`  ❌ Item missing required properties for ${category}: needs one of [${categoryData.properties.join(', ')}], has [${itemProperties.join(', ')}]`);
        return false;
      }
    }

    // Check rarity constraints if specified
    if (categoryData.minRarity || categoryData.maxRarity) {
      const rarityOrder = ['common', 'uncommon', 'rare', 'veryRare', 'legendary'];
      const itemRarityIndex = rarityOrder.indexOf(itemRarity);
      
      // Check minimum rarity
      if (categoryData.minRarity) {
        const minRarityIndex = rarityOrder.indexOf(categoryData.minRarity);
        if (itemRarityIndex < minRarityIndex) {
          console.log(`  ❌ Item rarity ${itemRarity} too low for ${category} (needs ${categoryData.minRarity}+)`);
          return false;
        }
      }
      
      // Check maximum rarity
      if (categoryData.maxRarity) {
        const maxRarityIndex = rarityOrder.indexOf(categoryData.maxRarity);
        if (itemRarityIndex > maxRarityIndex) {
          console.log(`  ❌ Item rarity ${itemRarity} too high for ${category} (max ${categoryData.maxRarity})`);
          return false;
        }
      }
    }

    console.log(`  ✅ Item matches category ${category}`);
    return true;
  }

  /**
   * Check if a rarity is compatible with the given treasure categories
   * @param {string} rarity - The rarity to check
   * @param {Array|Set} categories - Array or Set of treasure category values
   * @returns {boolean} True if the rarity is compatible with at least one category
   */
  static isRarityCompatibleWithCategories(rarity, categories) {
    if (!categories || categories.length === 0) {
      return true; // No categories means no restrictions
    }
    
    // Convert categories to array if it's a Set
    const categoryArray = Array.isArray(categories) ? categories : Array.from(categories);
    
    // Check if any category is compatible with the rarity
    return categoryArray.some(category => {
      if (category === 'any') return true; // 'any' category accepts all rarities
      
      const categoryData = this.TREASURE_CATEGORIES[category];
      if (!categoryData) return false;
      
      // If no rarity constraints, accept all rarities
      if (!categoryData.minRarity && !categoryData.maxRarity) return true;
      
      const rarityOrder = ['common', 'uncommon', 'rare', 'veryRare', 'legendary'];
      const rarityIndex = rarityOrder.indexOf(rarity);
      
      // Check minimum rarity constraint
      if (categoryData.minRarity) {
        const minRarityIndex = rarityOrder.indexOf(categoryData.minRarity);
        if (rarityIndex < minRarityIndex) return false;
      }
      
      // Check maximum rarity constraint
      if (categoryData.maxRarity) {
        const maxRarityIndex = rarityOrder.indexOf(categoryData.maxRarity);
        if (rarityIndex > maxRarityIndex) return false;
      }
      
      return true;
    });
  }

  /**
   * Filter a list of items by treasure categories
   * @param {Array} items - Array of items to filter
   * @param {Array} categories - Array of treasure category values
   * @returns {Array} Filtered array of items that match any of the categories
   */
  static filterItemsByCategories(items, categories) {
    if (!categories || categories.length === 0) {
      console.log('No categories specified, returning all items');
      return items;
    }
    
    // Convert categories to array if it's not already (could be Set, etc.)
    const categoryArray = Array.isArray(categories) ? categories : Array.from(categories);
    
    console.log(`Filtering ${items.length} items by categories: ${categoryArray.join(', ')}`);
    const filtered = items.filter(item => 
      categoryArray.some(category => this.itemMatchesCategory(item, category))
    );
    console.log(`Filtered to ${filtered.length} items`);
    return filtered;
  }

  /**
   * Get weighted random category for treasure generation
   * @param {Array} categories - Array of available treasure categories
   * @returns {string} Randomly selected category value
   */
  static getRandomCategory(categories) {
    if (!categories || categories.length === 0) return 'any';
    
    // Calculate total weight
    const totalWeight = categories.reduce((sum, category) => {
      return sum + (this.TREASURE_CATEGORIES[category]?.weight || 1);
    }, 0);
    
    // Generate random number
    const random = Math.random() * totalWeight;
    
    // Find the category based on weight
    let currentWeight = 0;
    for (const category of categories) {
      const categoryWeight = this.TREASURE_CATEGORIES[category]?.weight || 1;
      currentWeight += categoryWeight;
      if (random <= currentWeight) {
        return category;
      }
    }
    
    // Fallback to first category
    return categories[0];
  }

  /**
   * Generate treasure description based on categories
   * @param {Array} categories - Array of treasure category values
   * @returns {string} Human-readable description of what treasure will be generated
   */
  static getTreasureDescription(categories) {
    if (!categories || categories.length === 0) {
      return 'No specific treasure categories set';
    }
    
    if (categories.includes('any')) {
      return 'Can generate any type of treasure';
    }
    
    const descriptions = categories.map(category => 
      this.TREASURE_CATEGORIES[category]?.description || category
    );
    
    if (descriptions.length === 1) {
      return descriptions[0];
    } else if (descriptions.length === 2) {
      return `${descriptions[0]} and ${descriptions[1]}`;
    } else {
      const last = descriptions.pop();
      return `${descriptions.join(', ')}, and ${last}`;
    }
  }

  /**
   * Get recommended treasure categories for different NPC types
   * @param {string} npcType - The type of NPC (e.g., 'bandit', 'mage', 'noble')
   * @returns {Array} Array of recommended treasure category values
   */
  static getRecommendedCategories(npcType) {
    const recommendations = {
      bandit: ['armaments', 'individual'],
      mage: ['arcana', 'implements'],
      noble: ['individual', 'relics'],
      warrior: ['armaments', 'individual'],
      merchant: ['individual', 'implements'],
      priest: ['arcana', 'implements', 'relics'],
      rogue: ['individual', 'implements'],
      dragon: ['any'], // Dragons can have anything
      undead: ['relics', 'arcana'],
      construct: ['armaments', 'implements'],
      beast: ['individual'], // Usually just coins/jewelry
      fiend: ['arcana', 'relics'],
      celestial: ['relics', 'arcana']
    };
    
    return recommendations[npcType] || ['any'];
  }
}
