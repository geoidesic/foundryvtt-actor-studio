import { MODULE_ID } from '~/src/helpers/constants';

/**
 * Gets spell packs from settings - helper function  
 */
function getSpellPacksFromSettings() {
  try {
    return game.settings.get(MODULE_ID, 'enabledSpellPacks') || [
      'dnd5e.spells',
      'dnd-players-handbook.spells'
    ];
  } catch (error) {
    return [
      'dnd5e.spells', 
      'dnd-players-handbook.spells'
    ];
  }
}

/**
 * Parses feat descriptions to extract spell selection requirements
 * @param {Array} feats - Array of feat items from the character
 * @returns {Array} Array of feat spell requirements
 */
export function parseFeatSpellRequirements(feats) {
  if (!feats || !Array.isArray(feats)) {
    return [];
  }

  const featSpellRequirements = [];

  for (const feat of feats) {
    if (feat.type !== 'feat') continue;

    const featName = feat.name;
    const description = feat.system?.description?.value || '';
    
    window.GAS.log.d('[FEAT PARSER] Analyzing feat:', featName);
    
    // Parse different feat types that grant spells
    const requirement = parseFeatDescription(featName, description, feat);
    
    if (requirement) {
      featSpellRequirements.push(requirement);
      window.GAS.log.d('[FEAT PARSER] Found spell requirement for feat:', featName, requirement);
    }
  }

  return featSpellRequirements;
}

/**
 * Parses a single feat's description to extract spell requirements
 * @param {string} featName - Name of the feat
 * @param {string} description - HTML description of the feat
 * @param {Object} feat - The complete feat item
 * @returns {Object|null} Spell requirement object or null if no spells granted
 */
function parseFeatDescription(featName, description, feat) {
  // Remove HTML tags for easier parsing
  const cleanText = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Fey-Touched pattern
  if (featName.toLowerCase().includes('fey-touched')) {
    return {
      featId: feat._id,
      featName: featName,
      type: 'fey-touched',
      spellCount: 2, // Misty Step + 1 choice
      spellSources: ['divination', 'enchantment'], // Schools
      levelRestriction: 1, // Level 1 spells only
      fixedSpells: ['Misty Step'], // Always includes Misty Step
      choiceCount: 1, // Choose 1 additional spell
      description: 'Choose one level 1 spell from the Divination or Enchantment school. You always have that spell and Misty Step prepared.'
    };
  }

  // Shadow-Touched pattern
  if (featName.toLowerCase().includes('shadow-touched')) {
    return {
      featId: feat._id,
      featName: featName,
      type: 'shadow-touched',
      spellCount: 2, // Invisibility + 1 choice
      spellSources: ['illusion', 'necromancy'], // Schools
      levelRestriction: 1, // Level 1 spells only
      fixedSpells: ['Invisibility'], // Always includes Invisibility
      choiceCount: 1, // Choose 1 additional spell
      description: 'Choose one level 1 spell from the Illusion or Necromancy school. You always have that spell and Invisibility prepared.'
    };
  }

  // Magic Initiate pattern
  if (featName.toLowerCase().includes('magic initiate')) {
    window.GAS.log.d('[FEAT PARSER] Magic Initiate detected:', featName);
    window.GAS.log.d('[FEAT PARSER] Description:', description);
    window.GAS.log.d('[FEAT PARSER] Clean text:', cleanText);
    
    // Try to extract the class from the feat name or description
    let spellClass = null;
    
    // First try to extract from feat name like "Magic Initiate (Wizard)"
    const nameMatch = featName.match(/magic initiate \((\w+)\)/i);
    window.GAS.log.d('[FEAT PARSER] Name match:', nameMatch);
    
    if (nameMatch) {
      spellClass = nameMatch[1].toLowerCase();
    } else {
      // Fallback to description patterns
      const classMatch = cleanText.match(/(?:from the|choose.*from|magic initiate \()(\w+)(?:\s+spell list|\))/i);
      window.GAS.log.d('[FEAT PARSER] Description match:', classMatch);
      spellClass = classMatch ? classMatch[1].toLowerCase() : null;
    }
    
    window.GAS.log.d('[FEAT PARSER] Extracted spell class:', spellClass);
    
    if (spellClass) {
      // Magic Initiate with specific class (e.g., "Magic Initiate (Wizard)")
      const requirement = {
        featId: feat._id,
        featName: featName,
        type: 'magic-initiate',
        spellCount: 3, // 2 cantrips + 1 level 1 spell
        spellSources: [spellClass], // Specific class spell list
        levelRestriction: 1, // Cantrips and 1st level
        cantrips: 2, // MUST select 2 cantrips
        spells: 1, // MUST select 1 level 1 spell
        choiceCount: 3, // Choose 2 cantrips + 1 level 1 spell
        description: `Choose two cantrips and one level 1 spell from the ${spellClass} spell list.`
      };
      window.GAS.log.d('[FEAT PARSER] Returning Magic Initiate requirement:', requirement);
      return requirement;
    } else {
      // D&D 2024 style Magic Initiate without specific class - user must choose class first
      window.GAS.log.d('[FEAT PARSER] Magic Initiate without specific class detected - requires class selection');
      const requirement = {
        featId: feat._id,
        featName: featName,
        type: 'magic-initiate-generic',
        spellCount: 3, // 2 cantrips + 1 level 1 spell
        spellSources: [], // Will be set after class selection
        levelRestriction: 1, // Cantrips and 1st level
        cantrips: 2, // MUST select 2 cantrips
        spells: 1, // MUST select 1 level 1 spell
        choiceCount: 3, // Choose 2 cantrips + 1 level 1 spell
        requiresClassSelection: true, // Flag that class must be chosen first
        availableClasses: ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'],
        description: 'Choose a class (Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard), then choose two cantrips and one level 1 spell from that class spell list.'
      };
      window.GAS.log.d('[FEAT PARSER] Returning generic Magic Initiate requirement:', requirement);
      return requirement;
    }
  }

  // Telekinetic pattern (Mage Hand cantrip)
  if (featName.toLowerCase().includes('telekinetic')) {
    return {
      featId: feat._id,
      featName: featName,
      type: 'telekinetic',
      spellCount: 1,
      fixedSpells: ['Mage Hand'], // Always includes Mage Hand
      choiceCount: 0, // No choices, just Mage Hand
      description: 'You learn the Mage Hand cantrip.'
    };
  }

  // Telepathic pattern (Message cantrip)
  if (featName.toLowerCase().includes('telepathic')) {
    return {
      featId: feat._id,
      featName: featName,
      type: 'telepathic',
      spellCount: 1,
      fixedSpells: ['Message'], // Always includes Message
      choiceCount: 0, // No choices, just Message
      description: 'You learn the Message cantrip.'
    };
  }

  // Metamagic Adept (Sorcerer spells)
  if (featName.toLowerCase().includes('metamagic adept')) {
    return {
      featId: feat._id,
      featName: featName,
      type: 'metamagic-adept',
      spellCount: 1,
      spellSources: ['sorcerer'], // Sorcerer spell list
      levelRestriction: 1, // Level 1 spell
      choiceCount: 1,
      description: 'Choose one sorcerer spell of 1st level.'
    };
  }

  // Ritual Caster pattern
  if (featName.toLowerCase().includes('ritual caster')) {
    const classMatch = cleanText.match(/ritual caster \((\w+)\)/i);
    const spellClass = classMatch ? classMatch[1].toLowerCase() : null;
    
    if (spellClass) {
      return {
        featId: feat._id,
        featName: featName,
        type: 'ritual-caster',
        spellCount: 2, // 2 ritual spells initially
        spellSources: [spellClass], // Specific class spell list
        levelRestriction: 1, // 1st level ritual spells
        ritualOnly: true, // Must have ritual tag
        choiceCount: 2,
        description: `Choose two 1st-level spells that have the ritual tag from the ${spellClass} spell list.`
      };
    }
  }

  // Eldritch Adept pattern (Warlock invocations that grant spells)
  if (featName.toLowerCase().includes('eldritch adept')) {
    // This is more complex as it depends on which invocation was chosen
    // For now, we'll return a generic requirement that can be refined
    return {
      featId: feat._id,
      featName: featName,
      type: 'eldritch-adept',
      spellCount: 0, // Variable based on invocation
      description: 'Spells granted depend on the chosen Eldritch Invocation.',
      requiresManualReview: true // Flag for manual handling
    };
  }

  // Check for generic patterns in description
  if (cleanText.match(/learn.*spell|gain.*spell|always have.*prepared/i)) {
    // Extract spell names from description if possible
    const spellMatches = cleanText.match(/@UUID\[Compendium[^\]]*\]{([^}]+)}/g);
    const extractedSpells = spellMatches ? spellMatches.map(match => {
      const nameMatch = match.match(/\]{([^}]+)}/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean) : [];

    if (extractedSpells.length > 0) {
      return {
        featId: feat._id,
        featName: featName,
        type: 'generic',
        spellCount: extractedSpells.length,
        fixedSpells: extractedSpells,
        choiceCount: 0,
        description: `This feat grants the following spells: ${extractedSpells.join(', ')}`
      };
    }
  }

  return null;
}

/**
 * Gets available spells for a feat requirement
 * @param {Object} requirement - Spell requirement object from parseFeatDescription
 * @param {Object} actor - The actor to check for existing spells
 * @returns {Promise<Array>} Array of available spells
 */
export async function getAvailableSpellsForFeat(requirement, actor) {
  if (!requirement || requirement.choiceCount === 0) {
    return []; // No choices needed
  }

  try {
    // Get spell compendiums based on requirement
    const spellPacks = getSpellPacksForRequirement(requirement);
    
    let availableSpells = [];
    
    window.GAS.log.d('[FEAT PARSER] Loading spells for requirement:', requirement.type, 'from packs:', spellPacks);
    
    for (const packId of spellPacks) {
      const pack = game.packs.get(packId);
      if (!pack) continue;
      
      // Use index data first for performance like spellSelection.js does
      const index = await pack.getIndex({fields: ['system.level', 'system.school']});
      const indexEntries = Array.from(index.values());
      
      window.GAS.log.d(`[FEAT PARSER] Processing ${indexEntries.length} spells from ${packId}`);
      
      // Filter using index data first (much faster)
      const filteredIndexEntries = indexEntries.filter(entry => {
        if (entry.type !== "spell") return false;
        
        // Filter by spell level using index data
        const spellLevel = entry.system?.level;
        if (spellLevel !== undefined) {
          if (requirement.type === 'magic-initiate' || requirement.type === 'magic-initiate-generic') {
            // Magic initiate allows cantrips (level 0) and 1st level
            if (spellLevel > 1) return false;
          } else if (requirement.levelRestriction !== undefined && spellLevel > requirement.levelRestriction) {
            return false;
          }
        }
        
        // Filter by spell school using index data (for non-class-based feats)
        if (requirement.type !== 'magic-initiate' && requirement.type !== 'magic-initiate-generic') {
          if (requirement.spellSources && requirement.spellSources.length > 0) {
            const school = entry.system?.school;
            if (school && !requirement.spellSources.includes(school)) {
              return false;
            }
          }
        }
        
        return true;
      });
      
      window.GAS.log.d(`[FEAT PARSER] After index filtering: ${filteredIndexEntries.length} spells remain`);
      
      // For class-based filtering (Magic Initiate), we need full documents
      // But only load the ones that passed the basic filters
      if (requirement.type === 'magic-initiate' || requirement.type === 'magic-initiate-generic') {
        if (requirement.spellSources && requirement.spellSources.length > 0) {
          // Load full documents for class filtering
          for (const indexEntry of filteredIndexEntries) {
            try {
              const spell = await pack.getDocument(indexEntry._id);
              const spellData = spell.toObject();
              
              // Filter by class using full document data
              const spellClasses = spellData.system?.classes;
              if (spellClasses) {
                const classString = typeof spellClasses === 'string' ? spellClasses : 
                                  spellClasses.labels || JSON.stringify(spellClasses) || '';
                const hasMatchingClass = requirement.spellSources.some(source => 
                  classString.toLowerCase().includes(source.toLowerCase())
                );
                if (!hasMatchingClass) continue;
              } else if (spell.labels?.classes) {
                // Check D&D 2024 style class data
                const hasMatchingClass = requirement.spellSources.some(source => 
                  spell.labels.classes.toLowerCase().includes(source.toLowerCase())
                );
                if (!hasMatchingClass) continue;
              }
              
              // Add spell to available list
              availableSpells.push({
                _id: spell._id,
                name: spell.name,
                img: spell.img,
                type: spell.type,
                uuid: spell.uuid,
                system: {
                  level: spellData.system?.level || 0,
                  school: spellData.system?.school || 'unknown',
                  activation: spellData.system?.activation || {},
                  components: spellData.system?.components || {},
                  description: spellData.system?.description || { value: '' }
                },
                labels: spell.labels || {}
              });
              
            } catch (spellError) {
              window.GAS.log.w('[FEAT PARSER] Error loading spell:', indexEntry.name, spellError);
            }
          }
        } else {
          // No class specified yet, convert index entries to spell objects
          availableSpells = filteredIndexEntries.map(entry => ({
            _id: entry._id,
            name: entry.name,
            img: entry.img,
            type: entry.type,
            uuid: entry.uuid,
            system: {
              level: entry.system?.level || 0,
              school: entry.system?.school || 'unknown'
            }
          }));
        }
      } else {
        // For non-class-based feats, we can use index data directly (much faster)
        // Only load full documents if we need ritual filtering
        if (requirement.ritualOnly) {
          for (const indexEntry of filteredIndexEntries) {
            try {
              const spell = await pack.getDocument(indexEntry._id);
              const spellData = spell.toObject();
              
              // Filter by ritual tag
              const properties = spellData.system?.properties || [];
              if (!properties.includes('ritual')) continue;
              
              // Add spell to available list
              availableSpells.push({
                _id: spell._id,
                name: spell.name,
                img: spell.img,
                type: spell.type,
                uuid: spell.uuid,
                system: {
                  level: spellData.system?.level || 0,
                  school: spellData.system?.school || 'unknown',
                  activation: spellData.system?.activation || {},
                  components: spellData.system?.components || {},
                  description: spellData.system?.description || { value: '' }
                },
                labels: spell.labels || {}
              });
              
            } catch (spellError) {
              window.GAS.log.w('[FEAT PARSER] Error loading spell:', indexEntry.name, spellError);
            }
          }
        } else {
          // Use index data directly for maximum performance
          availableSpells = filteredIndexEntries.map(entry => ({
            _id: entry._id,
            name: entry.name,
            img: entry.img,
            type: entry.type,
            uuid: entry.uuid,
            system: {
              level: entry.system?.level || 0,
              school: entry.system?.school || 'unknown'
            }
          }));
        }
      }
    }
    
    window.GAS.log.d(`[FEAT PARSER] Before deduplication: ${availableSpells.length} spells`);
    
    // Remove duplicates and spells already known by the actor
    availableSpells = removeDuplicateSpells(availableSpells);
    availableSpells = await removeKnownSpells(availableSpells, actor);
    
    window.GAS.log.d(`[FEAT PARSER] Final result: ${availableSpells.length} spells`);
    
    return availableSpells;
    
  } catch (error) {
    window.GAS.log.e('[FEAT PARSER] Error getting available spells:', error);
    return [];
  }
}

/**
 * Gets spell packs based on feat requirement
 * @param {Object} requirement - Spell requirement object
 * @returns {Array} Array of spell pack IDs
 */
function getSpellPacksForRequirement(requirement) {
  const defaultPacks = getSpellPacksFromSettings();
  
  // For class-specific requirements, we might want to add class-specific packs
  if (requirement.spellSources && requirement.spellSources.length > 0) {
    const source = requirement.spellSources[0];
    
    // Map class names to potential additional packs
    const classPackMap = {
      'bard': defaultPacks,
      'cleric': [...defaultPacks],
      'druid': [...defaultPacks],
      'paladin': [...defaultPacks],
      'ranger': [...defaultPacks],
      'sorcerer': [...defaultPacks],
      'warlock': [...defaultPacks],
      'wizard': [...defaultPacks],
      'artificer': [...defaultPacks]
    };
    
    return classPackMap[source] || defaultPacks;
  }
  
  return defaultPacks;
}

/**
 * Removes duplicate spells from array
 * @param {Array} spells - Array of spell objects
 * @returns {Array} Array with duplicates removed
 */
function removeDuplicateSpells(spells) {
  const seen = new Set();
  return spells.filter(spell => {
    const key = `${spell.name}-${spell.system?.level || 0}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Removes spells already known by the actor
 * @param {Array} spells - Array of available spells
 * @param {Object} actor - The actor to check
 * @returns {Promise<Array>} Array with known spells removed
 */
async function removeKnownSpells(spells, actor) {
  if (!actor || !actor.items) {
    return spells;
  }
  
  const knownSpellNames = actor.items
    .filter(item => item.type === 'spell')
    .map(spell => spell.name.toLowerCase());
  
  return spells.filter(spell => 
    !knownSpellNames.includes(spell.name.toLowerCase())
  );
}

/**
 * Checks if a character has feats that require spell selection
 * @param {Object} actor - The actor to check
 * @returns {boolean} True if feat spell selection is needed
 */
export function shouldShowFeatSpellSelection(actor) {
  if (!actor || !actor.items) {
    return false;
  }
  
  const feats = actor.items.filter(item => item.type === 'feat');
  const requirements = parseFeatSpellRequirements(feats);
  
  // Show if there are choices to make OR fixed spells to add
  return requirements.some(req => 
    req.choiceCount > 0 || 
    (req.fixedSpells && req.fixedSpells.length > 0)
  );
}
