import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksAsync } from '~/src/helpers/Utility';
import { readOnlyTabs, characterClass, level as characterLevel, isLevelUp, newLevelValueForExistingClass } from '~/src/stores/index';

/**
 * Parse feat descriptions to extract spell requirements
 * This dynamically detects spell limits from feat text instead of hardcoded tables
 */
export function parseFeatSpellRequirements(actor) {
  if (!actor?.items) return { cantrips: 0, spells: 0, source: 'none' };

  const items = actor.items instanceof Collection ? Array.from(actor.items.values()) : Object.values(actor.items || {});
  let totalCantrips = 0;
  let totalSpells = 0;
  const sources = [];

  for (const item of items) {
    if (item.type === 'feat') {
      const featName = (item.name || '').toLowerCase();
      const description = (item?.system?.description?.value || '').toLowerCase();
      
      // Magic Initiate parsing
      if (featName.includes('magic initiate') || description.includes('magic initiate')) {
        window.GAS.log.d('[SPELLS] Parsing Magic Initiate feat:', {
          featName: item.name,
          description: description.substring(0, 200)
        });
        
        // "You learn two cantrips of your choice from that class's spell list"
        const cantripMatch = description.match(/(?:learn|gain)\s+(\w+)\s+cantrips?/i);
        // More flexible spell matching patterns
        const spellMatch = description.match(/(?:learn|gain)\s+(?:one|1|a)\s+(?:1st-level\s+)?spells?/i) ||
                          description.match(/(?:one|1)\s+(?:1st-level\s+)?spells?/i) ||
                          description.match(/choose\s+one\s+1st-level\s+spell/i) ||
                          /1st-level\s+spell/i.test(description);
        
        if (cantripMatch) {
          const cantripCount = cantripMatch[1] === 'two' ? 2 : parseInt(cantripMatch[1]) || 2;
          totalCantrips += cantripCount;
          sources.push(`${item.name} (${cantripCount} cantrips)`);
          window.GAS.log.d('[SPELLS] Magic Initiate cantrips found:', cantripCount);
        }
        
        if (spellMatch) {
          totalSpells += 1;
          sources.push(`${item.name} (1 spell)`);
          window.GAS.log.d('[SPELLS] Magic Initiate spell found: 1');
          window.GAS.log.d('[SPELLS] spellMatch details:', spellMatch);
        } else {
          window.GAS.log.d('[SPELLS] Magic Initiate spell NOT found. spellMatch:', spellMatch);
          window.GAS.log.d('[SPELLS] Description for spell matching:', description);
          window.GAS.log.d('[SPELLS] Testing individual patterns:');
          window.GAS.log.d('  - Pattern 1:', description.match(/(?:learn|gain)\s+(?:one|1|a)\s+(?:1st-level\s+)?spells?/i));
          window.GAS.log.d('  - Pattern 2:', description.match(/(?:one|1)\s+(?:1st-level\s+)?spells?/i));
          window.GAS.log.d('  - Pattern 3:', description.includes('1st-level spell'));
          window.GAS.log.d('  - Pattern 4 (inclusive):', /1st.*spell/i.test(description));
          window.GAS.log.d('  - Pattern 5 (spell.*1st):', /spell.*1st/i.test(description));
        }
        
        // Default fallback for Magic Initiate if no specific match
        if (!cantripMatch && !spellMatch) {
          totalCantrips += 2; // Standard Magic Initiate
          totalSpells += 1;
          sources.push(`${item.name} (default: 2 cantrips, 1 spell)`);
          window.GAS.log.d('[SPELLS] Magic Initiate using default values: 2 cantrips, 1 spell');
        }
      }
      
      // Fey Touched / Shadow Touched parsing
      else if (featName.includes('fey touched') || featName.includes('shadow touched')) {
        // "You learn the misty step spell and one 1st-level spell"
        totalSpells += 2; // Misty Step + one 1st level spell
        sources.push(`${item.name} (2 spells)`);
      }
      
      // Ritual Caster parsing
      else if (featName.includes('ritual caster')) {
        // "You learn two 1st-level spells"
        totalSpells += 2;
        sources.push(`${item.name} (2 ritual spells)`);
      }
      
      // Telekinetic / Telepathic parsing
      else if (featName.includes('telekinetic') || featName.includes('telepathic')) {
        // "You learn the mage hand cantrip" or "You can cast detect thoughts"
        if (description.includes('cantrip')) {
          totalCantrips += 1;
          sources.push(`${item.name} (1 cantrip)`);
        }
        if (description.includes('spell') && !description.includes('cantrip')) {
          totalSpells += 1;
          sources.push(`${item.name} (1 spell)`);
        }
      }
      
      // Eldritch Adept parsing
      else if (featName.includes('eldritch adept')) {
        // "You learn one Eldritch Invocation"
        // May grant spells depending on invocation chosen
        if (description.includes('cantrip')) {
          totalCantrips += 1;
          sources.push(`${item.name} (1 cantrip)`);
        }
        if (description.includes('spell')) {
          totalSpells += 1;
          sources.push(`${item.name} (1 spell)`);
        }
      }
      
      // Generic "you learn...spell" pattern parsing
      else if (description.includes('you learn') && description.includes('spell')) {
        // Try to extract numbers from description
        const cantripMatches = description.match(/(?:learn|gain)\s+(\w+|\d+)\s+cantrips?/gi);
        const spellMatches = description.match(/(?:learn|gain)\s+(\w+|\d+)\s+(?:\d+(?:st|nd|rd|th)-level\s+)?spells?/gi);
        
        if (cantripMatches) {
          for (const match of cantripMatches) {
            const numberMatch = match.match(/(\w+|\d+)/);
            if (numberMatch) {
              const count = numberMatch[1] === 'one' ? 1 : 
                           numberMatch[1] === 'two' ? 2 :
                           numberMatch[1] === 'three' ? 3 :
                           parseInt(numberMatch[1]) || 1;
              totalCantrips += count;
              sources.push(`${item.name} (${count} cantrips)`);
            }
          }
        }
        
        if (spellMatches) {
          for (const match of spellMatches) {
            const numberMatch = match.match(/(\w+|\d+)/);
            if (numberMatch) {
              const count = numberMatch[1] === 'one' ? 1 : 
                           numberMatch[1] === 'two' ? 2 :
                           numberMatch[1] === 'three' ? 3 :
                           parseInt(numberMatch[1]) || 1;
              totalSpells += count;
              sources.push(`${item.name} (${count} spells)`);
            }
          }
        }
      }
    }
  }

  window.GAS.log.d('[SPELLS] Parsed feat spell requirements:', {
    totalCantrips,
    totalSpells,
    sources,
    actor: actor.name
  });

  return {
    cantrips: totalCantrips,
    spells: totalSpells,
    source: sources.length > 0 ? sources.join(', ') : 'none'
  };
}

/**
 * Get spell progression for a class level
 * This combines class-based progression with feat-based requirements
 */
function getSpellProgression(className, level, actor = null) {
  // First check for feat-based spell requirements
  const featRequirements = actor ? parseFeatSpellRequirements(actor) : { cantrips: 0, spells: 0 };
  
  if (featRequirements.cantrips > 0 || featRequirements.spells > 0) {
    window.GAS.log.d('[SPELLS] Using feat-based progression:', featRequirements);
    return featRequirements;
  }

  // Fallback to class-based progression for actual spellcasters
  if (!className || !level) return { cantrips: 0, spells: 0, source: 'none' };
  
  const normalizedClass = className.toLowerCase();
  
  // Class spell progression based on D&D 5e rules
  const progressions = {
    'bard': {
      cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spells: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
    },
    'cleric': {
      cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      spells: 'All' // Prepared spells, unlimited known
    },
    'druid': {
      cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spells: 'All' // Prepared spells, unlimited known
    },
    'sorcerer': {
      cantrips: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      spells: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
    },
    'warlock': {
      cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spells: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
    },
    'wizard': {
      cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      spells: [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 44]
    },
    'artificer': {
      cantrips: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
      spells: 'All' // Prepared spells, unlimited known
    }
  };

  const progression = progressions[normalizedClass];
  if (!progression) return { cantrips: 0, spells: 0, source: 'none' };

  const levelIndex = Math.max(0, Math.min(level - 1, 19)); // Clamp to valid array indices
  const cantrips = progression.cantrips[levelIndex] || 0;
  const spells = progression.spells === 'All' ? 999 : (progression.spells[levelIndex] || 0);

  return { cantrips, spells, source: `${className} class` };
}

// List of spells available for selection, fetched from selected compendiums
export const availableSpells = writable([]);

// Spells currently selected (Map<spellId, { itemData }>)
export const selectedSpells = writable(new Map());

// Current character for spellcasting detection
export const currentCharacter = writable(null);

// Derived store to check if character is a spellcaster
export const isSpellcaster = derived(
  [currentCharacter],
  ([$currentCharacter]) => {
    if (!$currentCharacter) return false;

    const actorData = $currentCharacter.system || $currentCharacter.data?.data;
    if (!actorData) return false;

    // Check for spellcasting in the actor system
    return actorData.spellcasting && Object.keys(actorData.spellcasting).length > 0;
  }
);

// Derived store to get maximum spell level character can cast
export const maxSpellLevel = derived(
  [currentCharacter, characterLevel],
  ([$currentCharacter, $characterLevel]) => {
    if (!$currentCharacter) return 0;

    const actorData = $currentCharacter.system || $currentCharacter.data?.data;
    if (!actorData?.spellcasting) return 0;

    // Find the highest spell level available based on spellcasting progression
    let maxLevel = 0;
    Object.values(actorData.spellcasting).forEach(spellcastingData => {
      if (spellcastingData.slots) {
        Object.keys(spellcastingData.slots).forEach(slot => {
          const slotLevel = parseInt(slot.replace('spell', ''));
          if (slotLevel > maxLevel && spellcastingData.slots[slot].max > 0) {
            maxLevel = slotLevel;
          }
        });
      }
    });

    return maxLevel;
  }
);

// Derived store for spell limits based on character class and level
export const spellLimits = derived(
  [characterClass, characterLevel, isLevelUp, newLevelValueForExistingClass, currentCharacter],
  ([$characterClass, $characterLevel, $isLevelUp, $newLevelValueForExistingClass, $currentCharacter]) => {
    if (!$characterLevel) {
      return { cantrips: 0, spells: 0, source: 'none' };
    }

    const className = $characterClass?.name || $characterClass?.label || $characterClass;
    
    // For level-up scenarios, calculate the difference between old and new levels
    if ($isLevelUp && $newLevelValueForExistingClass) {
      const oldLevel = $newLevelValueForExistingClass - 1; // Current level is new level - 1
      const newLevel = $newLevelValueForExistingClass;
      
      // Get spell progression for both levels (pass actor for feat parsing)
      const oldProgression = getSpellProgression(className, oldLevel, $currentCharacter);
      const newProgression = getSpellProgression(className, newLevel, $currentCharacter);
      
      // Calculate the difference (new spells gained on level up)
      const cantripDifference = Math.max(0, newProgression.cantrips - oldProgression.cantrips);
      const spellDifference = oldProgression.spells === 999 || newProgression.spells === 999 ? 999 : Math.max(0, newProgression.spells - oldProgression.spells);
      
      window.GAS.log.d('[SPELLS] Level-up spell calculation:', {
        className,
        oldLevel,
        newLevel,
        oldLimits: oldProgression,
        newLimits: newProgression,
        difference: { cantrips: cantripDifference, spells: spellDifference }
      });
      
      return {
        cantrips: cantripDifference,
        spells: spellDifference,
        source: newProgression.source
      };
    } else {
      // Character creation scenario - use total spells for current level (pass actor for feat parsing)
      const progression = getSpellProgression(className, $characterLevel, $currentCharacter);
      
      return {
        cantrips: progression.cantrips,
        spells: progression.spells,
        source: progression.source
      };
    }
  }
);

// Derived store for current spell counts
export const currentSpellCounts = derived(
  [selectedSpells],
  ([$selectedSpells]) => {
    const selectedSpellsList = Array.from($selectedSpells.values());
    const currentCantrips = selectedSpellsList.filter(s => (s.itemData.system?.level || 0) === 0).length;
    const currentSpells = selectedSpellsList.filter(s => (s.itemData.system?.level || 0) > 0).length;

    return {
      cantrips: currentCantrips,
      spells: currentSpells,
      total: currentCantrips + currentSpells
    };
  }
);

// Derived store for spell selection progress
export const spellProgress = derived(
  [spellLimits, currentSpellCounts, isLevelUp],
  ([$spellLimits, $currentSpellCounts, $isLevelUp]) => {
    const totalRequired = $spellLimits.cantrips + ($spellLimits.spells === 999 ? 0 : $spellLimits.spells);
    const totalSelected = $currentSpellCounts.total;
    
    // In level-up mode, spell selection is optional (can be skipped), so always show 100%
    // In character creation mode, show actual progress
    let progressPercentage = 100;
    let isComplete = true;
    
    if (!$isLevelUp && totalRequired > 0) {
      // Character creation: require actual spell selection
      progressPercentage = Math.round((totalSelected / totalRequired) * 100);
      isComplete = totalSelected >= totalRequired;
    }
    // Level-up mode: always 100% since spells can be skipped

    return {
      totalRequired,
      totalSelected,
      progressPercentage,
      isComplete,
      limits: $spellLimits,
      counts: $currentSpellCounts
    };
  }
);

// Function to initialize character data for spell selection
export function initializeSpellSelection(actor) {
  try {
    window.GAS.log.d('[SPELLS] initializeSpellSelection called with actor:', {
      actorName: actor?.name,
      actorId: actor?.id,
      hasItems: !!actor?.items,
      itemCount: actor?.items?.size || actor?.items?.length || Object.keys(actor?.items || {}).length
    });
    
    currentCharacter.set(actor);

    // Determine character level - check classes or use a default
    const actorData = actor.system || actor.data?.data;
    let level = 1;

    if (actorData.details?.level) {
      level = actorData.details.level;
    } else if (actorData.classes) {
      // Sum up class levels
      level = Object.values(actorData.classes).reduce((total, cls) => {
        return total + (cls.levels || cls.system?.levels || 0);
      }, 0);
    }

    window.GAS.log.d('[SPELLS] Initialized spell selection for level:', level);
    return level;
  } catch (error) {
    console.error('[SPELLS] Error initializing spell selection:', error);
    return 1;
  }
}

// Function to fetch spells from compendiums with hybrid approach for class filtering
export async function loadAvailableSpells(characterClassName = null, actor = null) {
  try {
    // Get spell compendium sources from settings
    const packs = getPacksFromSettings("spells");

    console.log('[SPELLS DEBUG] loadAvailableSpells called:', {
      characterClassName,
      actorProvided: !!actor,
      packsFound: packs?.length || 0,
      packs: packs?.map(p => p.collection) || 'No packs',
      dnd5eVersion: window.GAS?.dnd5eVersion,
      willUseClassFiltering: window.GAS?.dnd5eVersion >= 4 && characterClassName
    });

    if (!packs || packs.length === 0) {
      availableSpells.set([]);
      console.warn("[SPELLS] No spell compendiums configured in settings");
      window.GAS.log.d("[SPELLS] No spell compendiums configured");
      return;
    }

    window.GAS.log.d('[SPELLS] Loading spells, character class:', characterClassName);

    // Check if character has feat-based spellcasting (like Magic Initiate)
    // Use provided actor first, then fall back to currentCharacter store
    const currentActor = actor || get(currentCharacter);
    const featRequirements = currentActor ? parseFeatSpellRequirements(currentActor) : { cantrips: 0, spells: 0 };
    const hasFeatSpells = featRequirements.cantrips > 0 || featRequirements.spells > 0;

    window.GAS.log.d('[SPELLS] Feat spell check:', {
      actorName: currentActor?.name,
      actorId: currentActor?.id,
      featRequirements,
      hasFeatSpells,
      providedActor: !!actor,
      storeActor: !!get(currentCharacter)
    });

    let allSpells = [];

    for (const pack of packs) {
      console.log('[SPELLS DEBUG] Processing pack:', pack.collection);
      
      // If character has feat-based spells (like Magic Initiate), load all spells or use specific class rules
      if (hasFeatSpells) {
        window.GAS.log.d('[SPELLS] Character has feat-based spells, loading broader spell selection');
        
        if (window.GAS?.dnd5eVersion >= 4) {
          // D&D 5e v4+ - For feat spells, we often need access to multiple class spell lists
          // Magic Initiate allows choosing from Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard
          const allowedClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
          
          // Load all documents from the pack
          const allDocs = await pack.getDocuments();
          window.GAS.log.d(`[SPELLS DEBUG] Loaded ${allDocs.length} documents from pack for feat-based spells`);
          
          const filteredSpells = [];
          
          for (const doc of allDocs) {
            if (doc.type === "spell") {
              // Check if spell is available to any of the allowed classes for Magic Initiate
              let spellClasses = null;
              let availableToFeatClasses = false;
              
              // Check doc.labels.classes (2024 style)
              if (doc.labels?.classes) {
                spellClasses = doc.labels.classes.toLowerCase();
                availableToFeatClasses = allowedClasses.some(cls => 
                  spellClasses.includes(cls) || spellClasses.trim().length === 0
                );
              }
              
              // Check doc.system.classes (potential 2014 style)
              if (!availableToFeatClasses && doc.system?.classes?.value) {
                spellClasses = doc.system.classes.value.toLowerCase();
                availableToFeatClasses = allowedClasses.some(cls => 
                  spellClasses.includes(cls) || spellClasses.trim().length === 0
                );
              }
              
              // For Magic Initiate and similar feats, we need to be more permissive
              // Include spells that don't specify classes or have empty class lists
              if (!availableToFeatClasses) {
                // Check if spell has no class restrictions (should be available to feat-based casters)
                const hasNoClassRestrictions = !doc.labels?.classes || doc.labels.classes.trim() === '' ||
                                             !doc.system?.classes?.value || doc.system.classes.value.trim() === '';
                if (hasNoClassRestrictions) {
                  availableToFeatClasses = true;
                  window.GAS.log.d(`[SPELLS] Including spell with no class restrictions: ${doc.name}`);
                }
              }
              
              if (availableToFeatClasses) {
                // Create spell object with enhanced data
                const spellObj = {
                  _id: doc.id,
                  name: doc.name,
                  img: doc.img,
                  type: doc.type,
                  uuid: doc.uuid,
                  system: {
                    level: doc.system.level,
                    school: doc.system.school,
                    preparation: doc.system.preparation,
                    components: doc.system.components,
                    description: doc.system.description,
                    activation: doc.system.activation
                  },
                  labels: doc.labels
                };
                filteredSpells.push(spellObj);
              }
            }
          }
          
          allSpells.push(...filteredSpells);
          window.GAS.log.d(`[SPELLS] Loaded ${filteredSpells.length} spells for feat-based casting from ${pack.collection}`);
          console.log(`[SPELLS DEBUG] Filtered ${filteredSpells.length} spells for feat-based casting from ${pack.collection}`);
        } else {
          // D&D 5e v3.x - Load all spells since class filtering isn't available
          window.GAS.log.d('[SPELLS] Loading all spells for feat-based casting (v3.x)');
          const index = await pack.getIndex({fields: ['system.level', 'system.school']});
          const indexEntries = Array.from(index.values());
          
          const spells = indexEntries
            .filter(entry => entry.type === "spell")
            .map(entry => ({
              _id: entry._id,
              name: entry.name,
              img: entry.img,
              type: entry.type,
              uuid: entry.uuid,
              system: {
                level: entry.system?.level || 0,
                school: entry.system?.school || 'unknown',
                preparation: { mode: 'prepared' },
                components: {},
                description: { value: '' },
                activation: {}
              },
              labels: {}
            }));
            
          allSpells.push(...spells);
          window.GAS.log.d(`[SPELLS] Loaded ${spells.length} spells for feat-based casting from ${pack.collection}`);
        }
      }
      // Original class-based filtering for normal spellcasters
      else if (characterClassName) {
        // VERSION-BASED APPROACH: D&D 5e v4+ has class data, v3.x does not
        if (window.GAS?.dnd5eVersion >= 4) {
          // D&D 5e v4+ - USE CLASS FILTERING (class data exists on spells)
          window.GAS.log.d('[SPELLS] Using class filtering for D&D 5e v4+ (class data available)');
          console.log(`[SPELLS DEBUG] Processing pack with class filtering: ${pack.collection}`);
          
          // Load all documents from the pack
          const allDocs = await pack.getDocuments();
          window.GAS.log.d(`[SPELLS DEBUG] Loaded ${allDocs.length} documents from pack`);
          console.log(`[SPELLS DEBUG] Loaded ${allDocs.length} documents from ${pack.collection}`);
          
          const filteredSpells = [];
          
          // Filter by class and convert to our format
          for (const doc of allDocs) {
            if (doc.type === "spell") {
              // Check multiple possible locations for class information
              let spellClasses = null;
              let availableToClass = false;
              
              // Check doc.labels.classes (2024 style)
              if (doc.labels?.classes) {
                spellClasses = doc.labels.classes;
                availableToClass = typeof spellClasses === 'string'
                  ? spellClasses.includes(characterClassName) ||
                    spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                    spellClasses.trim().length === 0
                  : false;
              }
              
              // Check doc.system.classes (potential 2014 style)
              if (!availableToClass && doc.system?.classes) {
                const systemClasses = doc.system.classes;
                if (typeof systemClasses === 'object' && systemClasses.value) {
                  spellClasses = systemClasses.value;
                  availableToClass = typeof spellClasses === 'string'
                    ? spellClasses.includes(characterClassName) ||
                      spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                      spellClasses.trim().length === 0
                    : false;
                }
              }
              
              if (availableToClass) {
                // Create spell object with enhanced data
                const spellObj = {
                  _id: doc.id,
                  name: doc.name,
                  img: doc.img,
                  type: doc.type,
                  uuid: doc.uuid,
                  system: {
                    level: doc.system.level,
                    school: doc.system.school,
                    preparation: doc.system.preparation,
                    components: doc.system.components,
                    description: doc.system.description,
                    activation: doc.system.activation
                  },
                  labels: doc.labels
                };
                filteredSpells.push(spellObj);
              }
            }
          }
          
          allSpells.push(...filteredSpells);
          window.GAS.log.d(`[SPELLS] Loaded ${filteredSpells.length} spells for class ${characterClassName} from ${pack.collection}`);
          console.log(`[SPELLS DEBUG] Filtered ${filteredSpells.length} spells for class ${characterClassName} from ${pack.collection}`);
          
        } else {
          // D&D 5e v3.x - NO CLASS FILTERING (class data doesn't exist on spells)
          window.GAS.log.d('[SPELLS] Skipping class filtering for D&D 5e v3.x (class data not available on spells)');
          console.log(`[SPELLS DEBUG] Processing pack without class filtering: ${pack.collection}`);
          
          // Use index approach for better performance
          const index = await pack.getIndex({fields: ['system.level', 'system.school']});
          const indexEntries = Array.from(index.values());
          
          const spells = indexEntries
            .filter(entry => entry.type === "spell")
            .map(entry => ({
              _id: entry._id,
              name: entry.name,
              img: entry.img,
              type: entry.type,
              uuid: entry.uuid,
              system: {
                level: entry.system?.level || 0,
                school: entry.system?.school || 'unknown',
                preparation: { mode: 'prepared' }, // Default for compatibility
                components: {},
                description: { value: '' },
                activation: {}
              },
              labels: {} // Empty labels for v3.x compatibility
            }));
            
          allSpells.push(...spells);
          window.GAS.log.d(`[SPELLS] Loaded ${spells.length} spells (no class filtering) from ${pack.collection}`);
          console.log(`[SPELLS DEBUG] Added ${spells.length} spells (no class filtering) from ${pack.collection}`);
        }
      } else {
        // NO CLASS FILTERING: Use index data only (much faster)
        window.GAS.log.d('[SPELLS] Using index-only approach (no class filtering)');
        
        // Get basic index with system properties (these ARE indexable)
        const index = await pack.getIndex({fields: ['system.level', 'system.school']});
        
        // Convert index to array for processing
        const indexEntries = Array.from(index.values());
        
        const spells = indexEntries
          .filter(entry => entry.type === "spell")
          .map(entry => ({
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
          
        allSpells.push(...spells);
        window.GAS.log.d(`[SPELLS] Loaded ${spells.length} spells (index only) from ${pack.collection}`);
        console.log(`[SPELLS DEBUG] Loaded ${spells.length} spells (index only) from ${pack.collection}`);
      }
    }

    // Handle duplicates - keep only the first instance of each spell name
    const seenSpells = new Map();
    const uniqueSpells = [];
    for (const spell of allSpells) {
      const uniqueKey = spell.name.toLowerCase();
      if (!seenSpells.has(uniqueKey)) {
        uniqueSpells.push(spell);
        seenSpells.set(uniqueKey, true);
      } else {
        window.GAS.log.d(`[SPELLS] Skipping duplicate spell: ${spell.name} (uuid: ${spell.uuid})`);
      }
    }

    // Sort spells by level, then by name
    uniqueSpells.sort((a, b) => {
      const levelA = a.system?.level || 0;
      const levelB = b.system?.level || 0;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      return a.name.localeCompare(b.name);
    });

    // Update the store with spells
    availableSpells.set(uniqueSpells);
    window.GAS.log.d('[SPELLS] Final loaded spells:', uniqueSpells.length);
    console.log('[SPELLS DEBUG] FINAL RESULT: Set availableSpells store with', uniqueSpells.length, 'spells');

  } catch (error) {
    console.error("Error loading available spells:", error);
    availableSpells.set([]);
  }
}

// Function to add a spell to selected spells
export async function addSpell(spell) {
  try {
    const spellId = spell.id || spell._id;

    if (!spellId) {
      console.error("Spell has no id:", spell);
      ui.notifications?.warn("Spell has no ID");
      return;
    }

    const fromUuid = foundry.utils?.fromUuid || globalThis.fromUuid;
    const fullSpellData = await fromUuid(spell.uuid);
    if (!fullSpellData) {
      console.error("Could not load full spell data for UUID:", spell.uuid);
      ui.notifications?.warn("Error loading spell data");
      return;
    }

    selectedSpells.update(spells => {
      const newSpells = new Map(spells);
      newSpells.set(spellId, { itemData: fullSpellData });
      return newSpells;
    });

  } catch (error) {
    console.error("Error adding spell:", error);
    ui.notifications?.warn("Error adding spell");
  }
}

// Function to remove a spell from selected spells
export function removeSpell(spellId) {
  try {
    selectedSpells.update(spells => {
      const newSpells = new Map(spells);
      newSpells.delete(spellId);
      return newSpells;
    });
  } catch (error) {
    console.error("Error removing spell:", error);
    ui.notifications?.warn("Error removing spell");
  }
}

// Function to finalize spell selection and add them to the character
export async function finalizeSpellSelection(actor) {
  window.GAS.log.d('[SPELLS] finalizeSpellSelection called with actor:', actor?.name);
  
  if (!actor) {
    ui.notifications.error("No active character");
    return false;
  }

  try {
    const spells = get(selectedSpells);

    if (spells.size === 0) {
      ui.notifications.warn("No spells selected");
      return false;
    }

    // Convert selected spells to items that can be added to the character
    const spellItems = Array.from(spells.values()).map(({ itemData }) => {
      const spellObject = typeof itemData.toObject === 'function' 
        ? itemData.toObject() 
        : foundry.utils.deepClone(itemData);
      return spellObject;
    });

    window.GAS.log.d('[SPELLS] Creating', spellItems.length, 'spell items');

    // Check for existing spells and handle duplicates similar to shop
    const itemsToCreate = [];
    const itemsToUpdate = [];

    for (const spellItem of spellItems) {
      // Check if actor already has this spell by name
      const existingSpell = actor.items.find(i => i.name === spellItem.name && i.type === "spell");
      
      if (existingSpell) {
        window.GAS.log.d('[SPELLS] Found existing spell, skipping:', spellItem.name);
        // For spells, we typically don't update quantities, just skip duplicates
        continue;
      } else {
        window.GAS.log.d('[SPELLS] New spell, will create:', spellItem.name);
        itemsToCreate.push(spellItem);
      }
    }

    // Create new spells in a single batch
    if (itemsToCreate.length > 0) {
      const createdSpells = await actor.createEmbeddedDocuments("Item", itemsToCreate);
      window.GAS.log.d('[SPELLS] Created spells:', createdSpells.length);
    }

    // Clear the selection
    selectedSpells.set(new Map());

    // Make the spells tab readonly
    readOnlyTabs.update(tabs => [...tabs, 'spells']);

    // Check if we're in level-up mode and handle workflow accordingly
    const isLevelUpMode = get(isLevelUp);
    if (isLevelUpMode) {
      window.GAS.log.d('[SPELLS] Level-up mode detected, triggering LevelUp workflow completion');
      // Import and trigger the LevelUp workflow completion
      const { handleSpellsCompleteLevelUp } = await import('~/src/lib/workflow');
      await handleSpellsCompleteLevelUp();
    }

    ui.notifications?.info(`Added ${itemsToCreate.length} spells to character`);
    return true;

  } catch (error) {
    console.error("Error finalizing spell selection:", error);
    ui.notifications?.error("Error adding spells to character: " + error.message);
    return false;
  }
}

// Make the stores globally available for other components to access
if (typeof window !== 'undefined') {
  if (!window.GAS) window.GAS = {};
  window.GAS.availableSpells = availableSpells;
  window.GAS.selectedSpells = selectedSpells;
  window.GAS.characterLevel = characterLevel;
  window.GAS.isSpellcaster = isSpellcaster;
  window.GAS.maxSpellLevel = maxSpellLevel;
  window.GAS.spellLimits = spellLimits;
  window.GAS.currentSpellCounts = currentSpellCounts;
  window.GAS.spellProgress = spellProgress;
  window.GAS.initializeSpellSelection = initializeSpellSelection;
  window.GAS.loadAvailableSpells = loadAvailableSpells;
  window.GAS.addSpell = addSpell;
  window.GAS.removeSpell = removeSpell;
  window.GAS.finalizeSpellSelection = finalizeSpellSelection;
}
