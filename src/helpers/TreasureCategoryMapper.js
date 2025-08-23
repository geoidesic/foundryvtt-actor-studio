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
      weight: 1
    },
    
    arcana: {
      label: 'Arcana',
      description: 'Magical items, scrolls, potions, spell components',
      itemTypes: ['consumable', 'equipment', 'loot'],
      properties: ['mgc'], // Magic items and spell-related
      weight: 1.2
    },
    
    armaments: {
      label: 'Armaments', 
      description: 'Weapons, armor, shields',
      itemTypes: ['weapon', 'armor'],
      properties: ['mgc'], // Magic weapons/armor
      weight: 1.1
    },
    
    implements: {
      label: 'Implements',
      description: 'Tools, instruments, magical foci',
      itemTypes: ['tool', 'equipment'],
      properties: ['mgc', 'foc'], // Magic tools and foci
      weight: 1.0
    },
    
    individual: {
      label: 'Individual',
      description: 'Personal items, jewelry, coins',
      itemTypes: ['loot', 'equipment'],
      properties: ['mgc'], // Magic jewelry, etc.
      weight: 0.9
    },
    
    relics: {
      label: 'Relics',
      description: 'Ancient artifacts, powerful magical items',
      itemTypes: ['weapon', 'armor', 'equipment', 'loot'],
      properties: ['mgc'], // Magic items, especially rare+
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
    console.log(`Checking item ${item.name} (type: ${itemType}) against category ${category} (allowed types: ${categoryData.itemTypes.join(', ')})`);
    
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
      if (!hasRequiredProperty) return false;
    }

    return true;
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
