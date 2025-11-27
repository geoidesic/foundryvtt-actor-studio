/**
 * Helper class for detecting and managing spell grants from feats, fighting styles, and other items.
 * Identifies ItemChoice advancements with spell restrictions, as well as hardcoded and parsed spell grants.
 */

/**
 * Hardcoded spell grant definitions for known feats and fighting styles
 * Format: identifier -> grant configuration
 */
const HARDCODED_SPELL_GRANTS = {
  // Fighting Styles (2024 Rules)
  'druidic-warrior': {
    name: 'Druidic Warrior',
    count: 2,
    spellList: 'druid',
    maxLevel: 0, // Cantrips only
    description: 'Select 2 Druid cantrips',
    sourceType: 'fightingStyle'
  },
  'blessed-warrior': {
    name: 'Blessed Warrior',
    count: 2,
    spellList: 'cleric',
    maxLevel: 0,
    description: 'Select 2 Cleric cantrips',
    sourceType: 'fightingStyle'
  }
  
  // Note: Magic Initiate is NOT hardcoded because it's a single generic feat
  // with no recorded spell list choice. It's detected via description parsing instead.
  // See _parseDescriptionForGrants() method.,
  // Add more as needed...
};

export class SpellGrantDetection {
  /**
   * Detect if an item grants spell choices via advancement, hardcoded definitions, or description parsing
   * @param {Item5e} item - The item to check (feat, class feature, etc.)
   * @returns {SpellGrantInfo[] | null} Array of spell grant information, or null if none
   */
  static detectSpellGrant(item) {
    if (!item) return null;
    
    const grants = [];
    
    // Method 1: Check hardcoded spell grants by identifier
    const hardcodedGrant = this._checkHardcodedGrant(item);
    if (hardcodedGrant) {
      grants.push(...hardcodedGrant);
    }
    
    // Method 2: Check ItemChoice advancements (original method)
    const advancementGrants = this._checkAdvancementGrants(item);
    if (advancementGrants) {
      grants.push(...advancementGrants);
    }
    
    // Method 3: Parse description for spell grant patterns
    const parsedGrants = this._parseDescriptionForGrants(item);
    if (parsedGrants) {
      grants.push(...parsedGrants);
    }
    
    return grants.length > 0 ? grants : null;
  }
  
  /**
   * Check if item matches a hardcoded spell grant definition
   * @private
   */
  static _checkHardcodedGrant(item) {
    const identifier = item.system?.identifier || item.flags?.dnd5e?.sourceId;
    
    if (!identifier) return null;
    
    // Extract the identifier (handle compendium paths)
    const cleanIdentifier = identifier.includes('.') 
      ? identifier.split('.').pop()
      : identifier;
    
    // Debug logging
    if (typeof window !== 'undefined' && window.GAS?.log) {
      window.GAS.log.d('[SpellGrantDetection] Checking hardcoded grant:', {
        itemName: item.name,
        rawIdentifier: identifier,
        cleanIdentifier: cleanIdentifier,
        hasDefinition: !!HARDCODED_SPELL_GRANTS[cleanIdentifier],
        availableIdentifiers: Object.keys(HARDCODED_SPELL_GRANTS)
      });
    }
    
    const definition = HARDCODED_SPELL_GRANTS[cleanIdentifier];
    
    if (!definition) return null;
    
    // Convert hardcoded definition to SpellGrantInfo format
    return [{
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      itemUuid: item.uuid,
      advancementId: `hardcoded-${cleanIdentifier}`,
      level: item.system?.prerequisites?.level || 1,
      sourceType: definition.sourceType,
      configuration: {
        choices: [{ count: definition.count }],
        allowDrops: true,
        type: 'spell',
        restriction: {
          type: 'spell',
          level: {
            min: definition.minLevel || 0,
            max: definition.maxLevel
          },
          spellList: definition.spellList
        },
        breakdown: definition.breakdown // For complex grants like Magic Initiate
      },
      description: definition.description
    }];
  }
  
  /**
   * Check ItemChoice advancements (original detection method)
   * @private
   */
  static _checkAdvancementGrants(item) {
    if (!item?.system?.advancement) return null;

    const advancements = Array.isArray(item.system.advancement) 
      ? item.system.advancement 
      : Object.values(item.system.advancement);

    // Debug logging
    if (typeof window !== 'undefined' && window.GAS?.log) {
      window.GAS.log.d('[SpellGrantDetection] Checking advancements:', {
        itemName: item.name,
        advancementCount: advancements.length,
        advancementTypes: advancements.map(a => a.type)
      });
    }

    // Find ItemChoice advancements that grant spells
    const spellChoiceAdvancements = advancements.filter(advancement => {
      const isSpellChoice = advancement.type === 'ItemChoice' 
        && advancement.configuration?.restriction?.type === 'spell';
      
      if (typeof window !== 'undefined' && window.GAS?.log && advancement.type === 'ItemChoice') {
        window.GAS.log.d('[SpellGrantDetection] Found ItemChoice advancement:', {
          itemName: item.name,
          isSpellChoice: isSpellChoice,
          restrictionType: advancement.configuration?.restriction?.type,
          configuration: advancement.configuration
        });
      }
      
      return isSpellChoice;
    });

    if (spellChoiceAdvancements.length === 0) return null;

    // Map each advancement to spell grant info
    return spellChoiceAdvancements.map(advancement => ({
      itemId: item.id,
      itemName: item.name,
      itemType: item.type, // 'feat', 'class', etc.
      itemUuid: item.uuid,
      advancementId: advancement.id || advancement._id,
      level: advancement.level || 1,
      sourceType: this._determineSourceType(item, advancement.configuration),
      configuration: {
        choices: advancement.configuration.choices,
        allowDrops: advancement.configuration.allowDrops ?? true,
        type: advancement.configuration.type, // 'spell'
        restriction: advancement.configuration.restriction,
        spell: advancement.configuration.spell // Spell configuration (level, school, etc.)
      },
      // Extract user-friendly description
      description: this._buildDescriptionFromAdvancement(item, advancement)
    }));
  }
  
  /**
   * Parse item description for spell grant patterns
   * @private
   */
  static _parseDescriptionForGrants(item) {
    const description = item.system?.description?.value;
    if (!description) return null;
    
    // Debug logging
    if (typeof window !== 'undefined' && window.GAS?.log) {
      window.GAS.log.d('[SpellGrantDetection] Parsing description for:', {
        itemName: item.name,
        identifier: item.system?.identifier,
        hasDescription: !!description
      });
    }
    
    // Special case: Magic Initiate feat (2024 rules)
    // Pattern: "You learn two cantrips of your choice from the [Class], [Class], or [Class] spell list"
    if (item.name === 'Magic Initiate' || item.system?.identifier === 'magic-initiate') {
      // Extract spell lists from @UUID links in description
      const spellListPattern = /@UUID\[Compendium\.dnd-players-handbook\.content\.JournalEntry\.phbSpells0000000\.JournalEntryPage\.\w+\]\{(\w+)\}/g;
      const spellLists = [];
      let match;
      while ((match = spellListPattern.exec(description)) !== null) {
        spellLists.push(match[1].toLowerCase());
      }
      
      if (spellLists.length > 0) {
        if (typeof window !== 'undefined' && window.GAS?.log) {
          window.GAS.log.d('[SpellGrantDetection] Detected Magic Initiate with spell lists:', spellLists);
        }
        
        // Magic Initiate: 2 cantrips + 1 level 1 spell from Cleric, Druid, or Wizard
        // Since system doesn't record which list was chosen, show all three
        return [{
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
          itemUuid: item.uuid,
          advancementId: `parsed-magic-initiate-${item.id}`,
          level: item.system?.prerequisites?.level || 1,
          sourceType: 'feat',
          configuration: {
            choices: [{ count: 3 }], // Total: 2 cantrips + 1 spell
            allowDrops: true,
            type: 'spell',
            restriction: {
              type: 'spell',
              level: { min: 0, max: 1 },
              spellList: spellLists // Array of allowed lists: ['cleric', 'druid', 'wizard']
            },
            breakdown: [
              { count: 2, maxLevel: 0, description: 'cantrips' },
              { count: 1, maxLevel: 1, minLevel: 1, description: 'level 1 spell' }
            ]
          },
          description: `Select 2 cantrips and 1 level 1 spell from Cleric, Druid, or Wizard spell lists`
        }];
      }
    }
    
    // Pattern 1: "learn X [Class] cantrips"
    const cantripPattern = /learn (\w+) (\w+) cantrips?/i;
    const cantripMatch = description.match(cantripPattern);
    
    if (cantripMatch) {
      const [_, countStr, className] = cantripMatch;
      const count = this._parseNumber(countStr);
      
      if (count && className) {
        return [{
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
          itemUuid: item.uuid,
          advancementId: `parsed-cantrip-${item.id}`,
          level: item.system?.prerequisites?.level || 1,
          sourceType: 'feat',
          configuration: {
            choices: [{ count }],
            allowDrops: true,
            type: 'spell',
            restriction: {
              type: 'spell',
              level: { min: 0, max: 0 },
              spellList: className.toLowerCase()
            }
          },
          description: `Select ${count} ${className} cantrip${count > 1 ? 's' : ''}`
        }];
      }
    }
    
    // Pattern 2: "learn X [Class] spell of Xth level or lower"
    const spellPattern = /learn (\w+) (\w+) spells? of (?:(\d+)(?:st|nd|rd|th)|1st) level/i;
    const spellMatch = description.match(spellPattern);
    
    if (spellMatch) {
      const [_, countStr, className, levelStr] = spellMatch;
      const count = this._parseNumber(countStr);
      const maxLevel = parseInt(levelStr) || 1;
      
      if (count && className) {
        return [{
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
          itemUuid: item.uuid,
          advancementId: `parsed-spell-${item.id}`,
          level: item.system?.prerequisites?.level || 1,
          sourceType: 'feat',
          configuration: {
            choices: [{ count }],
            allowDrops: true,
            type: 'spell',
            restriction: {
              type: 'spell',
              level: { min: 0, max: maxLevel },
              spellList: className.toLowerCase()
            }
          },
          description: `Select ${count} ${className} spell${count > 1 ? 's' : ''} of ${maxLevel}${this._ordinalSuffix(maxLevel)} level or lower`
        }];
      }
    }
    
    return null;
  }
  
  /**
   * Parse number words to integers
   * @private
   */
  static _parseNumber(str) {
    const numberMap = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    return numberMap[str.toLowerCase()] || parseInt(str);
  }
  
  /**
   * Get ordinal suffix for numbers
   * @private
   */
  static _ordinalSuffix(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  }
  
  /**
   * Determine source type from item and configuration
   * @private
   */
  static _determineSourceType(item, config) {
    if (item.type === 'feat') return 'feat';
    if (item.type === 'class') return 'class';
    if (item.name?.toLowerCase().includes('fighting style')) return 'fightingStyle';
    if (config?.spell) return 'spellcasting';
    return 'other';
  }

  /**
   * Build a human-readable description from advancement data
   * @private
   */
  static _buildDescriptionFromAdvancement(item, advancement) {
    const config = advancement.configuration;
    const restriction = config?.restriction || {};
    
    // Calculate total number of spells to choose
    let totalCount = 0;
    if (config.choices) {
      if (Array.isArray(config.choices)) {
        totalCount = config.choices.reduce((sum, choice) => {
          return sum + (typeof choice === 'object' ? (choice.count || 1) : choice);
        }, 0);
      } else {
        totalCount = config.choices;
      }
    }
    
    let description = `Choose ${totalCount} spell${totalCount > 1 ? 's' : ''}`;
    
    // Add spell level restriction
    if (restriction?.level) {
      const minLevel = restriction.level.min ?? 0;
      const maxLevel = restriction.level.max ?? 9;
      
      if (minLevel === 0 && maxLevel === 0) {
        description += ' (cantrip only)';
      } else if (minLevel === maxLevel) {
        if (maxLevel === 0) {
          description += ' (cantrip)';
        } else {
          description += ` (${this._ordinal(maxLevel)} level only)`;
        }
      } else if (minLevel === 0) {
        description += ` (up to ${this._ordinal(maxLevel)} level)`;
      } else {
        description += ` (${this._ordinal(minLevel)} to ${this._ordinal(maxLevel)} level)`;
      }
    }
    
    // Add spell list restriction
    if (restriction?.spellList) {
      const listName = restriction.spellList.charAt(0).toUpperCase() + restriction.spellList.slice(1);
      description += ` from the ${listName} spell list`;
    }
    
    return description;
  }

  /**
   * Convert number to ordinal (1st, 2nd, 3rd, etc.)
   * @private
   */
  static _ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /**
   * Get all spell grants from the advancement queue (dropItemRegistry)
   * @param {Array} queueArray - The drop item registry array
   * @returns {SpellGrantInfo[]} Array of spell grant information
   */
  static getSpellGrantsFromQueue(queueArray) {
    const grants = [];
    
    if (!queueArray || !Array.isArray(queueArray)) {
      return grants;
    }
    
    for (const itemData of queueArray) {
      const item = itemData.item || itemData;
      const spellGrants = this.detectSpellGrant(item);
      
      if (spellGrants) {
        grants.push(...spellGrants.map(grant => ({
          ...grant,
          queuedAt: itemData.timestamp || Date.now()
        })));
      }
    }
    
    return grants;
  }

  /**
   * Check if a specific advancement level has spell grants
   * @param {Actor5e} actor - The actor being built
   * @param {number} level - The class level to check
   * @param {string} classId - The class item ID
   * @returns {SpellGrantInfo[]} Array of spell grants available at this level
   */
  static getSpellGrantsForLevel(actor, level, classId) {
    if (!actor?.items) return [];
    
    const classItem = actor.items.get(classId);
    if (!classItem) return [];

    const grants = this.detectSpellGrant(classItem);
    if (!grants) return [];

    // Filter to grants available at this level
    return grants.filter(grant => grant.level === level);
  }

  /**
   * Validate spell selections against grant requirements
   * @param {SpellGrantInfo} grantInfo - The spell grant configuration
   * @param {Item5e[]} selectedSpells - The spells selected by the user
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validateSpellSelection(grantInfo, selectedSpells) {
    const errors = [];
    const config = grantInfo.configuration;
    const restriction = config.restriction || {};

    // Calculate expected count
    let expectedCount = 0;
    if (config.choices) {
      if (Array.isArray(config.choices)) {
        expectedCount = config.choices.reduce((sum, choice) => {
          return sum + (typeof choice === 'object' ? (choice.count || 1) : choice);
        }, 0);
      } else {
        expectedCount = config.choices;
      }
    }

    // Check count
    if (selectedSpells.length !== expectedCount) {
      errors.push(`Expected ${expectedCount} spell(s), got ${selectedSpells.length}`);
    }

    // Validate each spell
    for (const spell of selectedSpells) {
      if (!spell?.system) {
        errors.push(`Invalid spell object: ${spell?.name || 'unknown'}`);
        continue;
      }

      // Check spell level
      if (restriction?.level) {
        const maxLevel = restriction.level.max ?? 9;
        const minLevel = restriction.level.min ?? 0;
        const spellLevel = spell.system.level ?? 0;
        
        if (spellLevel > maxLevel || spellLevel < minLevel) {
          errors.push(`${spell.name} is not the correct spell level (requires ${minLevel}-${maxLevel})`);
        }
      }

      // Check spell list/class
      if (restriction?.spellList) {
        const spellLists = spell.system.sourceClass || [];
        const hasCorrectList = Array.isArray(spellLists) 
          ? spellLists.includes(restriction.spellList)
          : spellLists === restriction.spellList;
          
        if (!hasCorrectList) {
          errors.push(`${spell.name} is not from the ${restriction.spellList} spell list`);
        }
      }

      // Check spell school if restricted
      if (restriction?.school && restriction.school.length > 0) {
        const schools = Array.isArray(restriction.school) ? restriction.school : [restriction.school];
        if (!schools.includes(spell.system.school)) {
          errors.push(`${spell.name} is not from an allowed school`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * @typedef {Object} SpellGrantInfo
 * @property {string} itemId - The item granting the spells
 * @property {string} itemName - Name of the granting item
 * @property {string} itemType - Type of item (feat, class, etc.)
 * @property {string} itemUuid - UUID of the granting item
 * @property {string} advancementId - ID of the advancement
 * @property {number} level - Level at which this grant becomes available
 * @property {Object} configuration - The advancement configuration
 * @property {string} description - Human-readable description
 * @property {number} [queuedAt] - Timestamp if from drop queue
 */
