import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksAsync } from '~/src/helpers/Utility';
import { readOnlyTabs, characterClass, isLevelUp, newLevelValueForExistingClass } from '~/src/stores/index';

// Import spellsKnown data for determining spell limits
import spellsKnownData from './spellsKnown.json';

// Safe logging shim to avoid test failures when certain log methods (g/p) are missing
if (typeof window !== 'undefined') {
  window.GAS = window.GAS || {};
  window.GAS.log = window.GAS.log || {};
  const l = window.GAS.log;
  // Preserve existing spies if present
  l.d = l.d || ((...args) => console.debug(...args));
  l.w = l.w || ((...args) => console.warn(...args));
  l.e = l.e || ((...args) => console.error(...args));
  // General / pretty fallbacks map to debug by default
  l.g = l.g || l.d;
  l.p = l.p || l.d;
}

// Helper: produce a small, safe summary of a `_lazy.classes` object to avoid
// printing large prototypes or causing getters to run. Returns null when empty.
function safeInspectLazyClasses(lazy) {
  try {
    if (!lazy || typeof lazy !== 'object') return null;
    const keys = Object.keys(lazy || {}).slice(0, 10);
    const samples = keys.map(k => {
      const v = lazy[k];
      const type = v?.type || v?.constructor?.name || null;
      const id = v?.system?.identifier || v?.system?.id || v?._id || v?.uuid || null;
      const name = v?.name || v?.system?.name || null;
      return { key: k, type, id, name };
    });
    return { count: Object.keys(lazy).length, keys, samples };
  } catch (e) {
    return { error: String(e) };
  }
}

// Helper: summarize class information found on a spell document (labels, system, _lazy)
function inspectSpellClasses(doc) {
  try {
    const labels = doc.labels?.classes ?? null;
    const systemClasses = (() => {
      const sc = doc.system?.classes;
      if (!sc) return null;
      // system.classes may be an object with a `value` string or other shapes
      if (typeof sc === 'object' && sc.value) return sc.value;
      return sc;
    })();
    const lazySummary = safeInspectLazyClasses(doc._lazy?.classes || null);
    const lazyKeys = doc._lazy?.classes ? Object.keys(doc._lazy.classes).slice(0, 10) : [];
    return { labels, systemClasses, lazySummary, lazyKeys };
  } catch (e) {
    return { error: String(e) };
  }
}

// Store for managing the state of spell selection

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
  [currentCharacter, isLevelUp, newLevelValueForExistingClass],
  ([$currentCharacter, $isLevelUp, $newLevelValueForExistingClass]) => {
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
  [characterClass, isLevelUp, newLevelValueForExistingClass],
  ([$characterClass, $isLevelUp, $newLevelValueForExistingClass]) => {
    // Calculate the effective character level for spell selection
    // For character creation: Always use level 1
    // For level-up: Use the new level value
    const effectiveCharacterLevel = $isLevelUp && $newLevelValueForExistingClass
      ? $newLevelValueForExistingClass
      : 1; // Character creation is always level 1

    if (!$characterClass || !effectiveCharacterLevel) {
      return { cantrips: 0, spells: 0 };
    }

    const className = $characterClass.name || $characterClass.label || $characterClass;

    // For level-up scenarios, calculate the difference between old and new levels
    if ($isLevelUp && $newLevelValueForExistingClass) {
      const oldLevel = $newLevelValueForExistingClass - 1; // Current level is new level - 1
      const newLevel = $newLevelValueForExistingClass;

      // Get spell data for both levels
      const oldLevelData = spellsKnownData.levels.find(l => l.level === oldLevel);
      const newLevelData = spellsKnownData.levels.find(l => l.level === newLevel);

      if (!oldLevelData || !newLevelData || !oldLevelData[className] || !newLevelData[className]) {
        return { cantrips: 0, spells: 0 };
      }

      // Parse old level limits
      const [oldCantrips, oldSpells] = oldLevelData[className].split(' / ');
      const oldCantripCount = parseInt(oldCantrips) || 0;
      const oldSpellCount = parseInt(oldSpells) || 0;
      const oldHasAllSpells = oldSpells === 'All';

      // Parse new level limits
      const [newCantrips, newSpells] = newLevelData[className].split(' / ');
      const newCantripCount = parseInt(newCantrips) || 0;
      const newSpellCount = parseInt(newSpells) || 0;
      const newHasAllSpells = newSpells === 'All';

      // Calculate the difference (new spells gained on level up)
      const cantripDifference = Math.max(0, newCantripCount - oldCantripCount);
      const spellDifference = oldHasAllSpells || newHasAllSpells ? 0 : Math.max(0, newSpellCount - oldSpellCount);

      return {
        cantrips: cantripDifference,
        spells: spellDifference,
        hasAllSpells: newHasAllSpells
      };
    } else {
      // Character creation scenario - use total spells for level 1
      const levelData = spellsKnownData.levels.find(l => l.level === 1);
      if (!levelData || !levelData[className]) {
        return { cantrips: 0, spells: 0 };
      }

      const [cantrips, spells] = levelData[className].split(' / ');
      return {
        cantrips: parseInt(cantrips) || 0,
        spells: parseInt(spells) || 0,
        hasAllSpells: spells === 'All'
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
  [spellLimits, currentSpellCounts, isLevelUp, characterClass, newLevelValueForExistingClass],
  ([$spellLimits, $currentSpellCounts, $isLevelUp, $characterClass, $newLevelValueForExistingClass]) => {
    // For classes that get "All" spells, only cantrips are required choices
    const hasAllSpells = $spellLimits.hasAllSpells;

    let totalRequired, totalSelected, progressPercentage, isComplete;

    // Special case: Level-up with no spell level increases for "All spells" classes
    if ($isLevelUp && hasAllSpells && $characterClass && $newLevelValueForExistingClass) {
      const className = $characterClass.name || $characterClass.label || $characterClass;

      // Calculate max spell levels for old and new levels
      const getMaxSpellLevelForClass = (level, className) => {
        const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
        const halfCasters = ['Paladin', 'Ranger'];
        const thirdCasters = ['Arcane Trickster', 'Eldritch Knight'];
        const warlockProgression = ['Warlock'];

        if (fullCasters.includes(className)) {
          return Math.min(9, Math.ceil(level / 2));
        } else if (halfCasters.includes(className)) {
          return Math.min(5, Math.ceil((level - 1) / 4));
        } else if (thirdCasters.includes(className)) {
          return Math.min(4, Math.ceil((level - 2) / 6));
        } else if (warlockProgression.includes(className)) {
          if (level >= 17) return 5;
          if (level >= 11) return 3;
          if (level >= 7) return 2;
          if (level >= 1) return 1;
          return 0;
        } else if (className === 'Artificer') {
          if (level < 2) return 0;
          return Math.min(5, Math.ceil((level - 1) / 4));
        }
        return 0;
      };

      const oldMaxSpellLevel = getMaxSpellLevelForClass($newLevelValueForExistingClass - 1, className);
      const newMaxSpellLevel = getMaxSpellLevelForClass($newLevelValueForExistingClass, className);

      // If no new spell levels gained AND no new cantrips to select, mark as complete automatically
      if (newMaxSpellLevel <= oldMaxSpellLevel && $spellLimits.cantrips === 0) {
        return {
          totalRequired: 0,
          totalSelected: 0,
          progressPercentage: 100,
          isComplete: true,
          limits: $spellLimits,
          counts: $currentSpellCounts,
          hasAllSpells,
          noUpdatesNeeded: true
        };
      }
    }

    if (hasAllSpells) {
      // Classes with all spells: only count cantrips as required for progress
      // since they automatically get access to all other spells
      totalRequired = $spellLimits.cantrips;
      totalSelected = $currentSpellCounts.cantrips;

      if (totalRequired > 0) {
        progressPercentage = Math.round((totalSelected / totalRequired) * 100);
        isComplete = totalSelected >= totalRequired;
      } else {
        progressPercentage = 100;
        isComplete = true;
      }
    } else {
      // Regular spellcasters: count both cantrips and spells as required
      totalRequired = $spellLimits.cantrips + $spellLimits.spells;
      totalSelected = $currentSpellCounts.total;

      if (totalRequired > 0) {
        progressPercentage = Math.round((totalSelected / totalRequired) * 100);
        isComplete = totalSelected >= totalRequired;
      } else {
        progressPercentage = 100;
        isComplete = true;
      }
    }

    return {
      totalRequired,
      totalSelected,
      progressPercentage,
      isComplete,
      limits: $spellLimits,
      counts: $currentSpellCounts,
      hasAllSpells,
      noUpdatesNeeded: false
    };
  }
);

// Function to initialize character data for spell selection
export function initializeSpellSelection(actor) {
  try {
    // Clear previous spell selections to prevent persistence across characters
    selectedSpells.set(new Map());
    window.GAS.log.d('[SPELLS DEBUG] Cleared previous spell selections');

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

    window.GAS.log.d('[SPELLS DEBUG] Initialized spell selection for level:', level);
    return level;
  } catch (error) {
    console.error('[SPELLS DEBUG] Error initializing spell selection:', error);
    return 1;
  }
}

// Function to fetch spells from compendiums with hybrid approach for class filtering
export async function loadAvailableSpells(characterClassName = null) {
  try {
    // Get spell compendium sources from settings
    const packs = getPacksFromSettings("spells");

    // window.GAS.log.d('[SPELLS DEBUG] loadAvailableSpells called:', {
    //   characterClassName,
    //   packsFound: packs?.length || 0,
    //   packs: packs?.map(p => p.collection) || 'No packs',
    //   dnd5eVersion: window.GAS?.dnd5eVersion,
    //   willUseClassFiltering: window.GAS?.dnd5eVersion >= 4 && characterClassName
    // });

    if (!packs || packs.length === 0) {
      availableSpells.set([]);
      console.warn("[SPELLS DEBUG] No spell compendiums configured in settings");
      // window.GAS.log.d("[SPELLS DEBUG] No spell compendiums configured");
      return;
    }

    // window.GAS.log.d('[SPELLS DEBUG] Loading spells, character class:', characterClassName);

    let allSpells = [];

    for (const pack of packs) {
      // window.GAS.log.d('[SPELLS DEBUG] Processing pack:', pack.collection);

      if (characterClassName) {
        // VERSION-BASED APPROACH: D&D 5e v4+ has class data, v3.x does not
        if (window.GAS?.dnd5eVersion >= 4) {
          // D&D 5e v4+ - USE CLASS FILTERING (class data exists on spells)
          window.GAS.log.d(`[SPELLS DEBUG] D&D 5e v4+ - Processing pack with class filtering: ${pack.collection}`);

          // Load all documents from the pack
          const allDocs = await pack.getDocuments();
          window.GAS.log.d(`[SPELLS DEBUG] Loaded ${allDocs.length} documents from ${pack.collection}`);

          const filteredSpells = [];

          // Filter by class and convert to our format
          for (const doc of allDocs) {
            if (doc.type === "spell") {
              // window.GAS.log.d(`[SPELLS DEBUG] Checking spell: ${doc.name}`);
              // Check multiple possible locations for class information
              let spellClasses = null;
              let availableToClass = false;

              // Check doc.labels.classes (2024 style)
              if (doc.labels?.classes) {
                spellClasses = doc.labels.classes;
                if (typeof spellClasses === 'string') {
                  availableToClass = spellClasses.includes(characterClassName) ||
                    spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                    spellClasses.trim().length === 0;
                } else if (Array.isArray(spellClasses)) {
                  // labels.classes is sometimes an array of class names
                  availableToClass = spellClasses.some(s => typeof s === 'string' && (
                    s === characterClassName ||
                    s.toLowerCase() === characterClassName.toLowerCase() ||
                    s.toLowerCase().includes(characterClassName.toLowerCase())
                  ));
                } else {
                  availableToClass = false;
                }
                // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] labels.classes found: ${JSON.stringify(spellClasses)}, availableToClass: ${availableToClass}`);
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
                  // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] system.classes.value found: ${spellClasses}, availableToClass: ${availableToClass}`);
                } else {
                  // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] system.classes present but value missing or not object`);
                  window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] system.classes present but value missing or not object`);
                }
              }
              // If still not available, check for lazy-loaded class items directly (some compendia store class refs under _lazy)
              if (!availableToClass && doc._lazy?.classes) {
                try {
                  const lazyClasses = doc._lazy.classes;
                  // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] _lazy.classes present, keys=${Object.keys(lazyClasses).slice(0, 5).join(',')}`);
                  if (typeof lazyClasses === 'object') {
                    const keys = Object.keys(lazyClasses);
                    // Quick key match (slug keys like 'bard')
                    if (keys.some(k => k.toLowerCase() === characterClassName.toLowerCase() || k.toLowerCase().includes(characterClassName.toLowerCase()))) {
                      availableToClass = true;
                      spellClasses = keys.join(', ');
                    } else {
                      // Inspect values (ItemDocuments or prototypes)
                      for (const val of Object.values(lazyClasses)) {
                        // Handle Item-like shapes (Item5e) where type==='class' and system.identifier exists
                        const valType = val?.type || val?.constructor?.name || '';
                        const identifier = val?.system?.identifier || val?.system?.id || '';
                        const candidateName = val?.name || val?.system?.name || '';

                        // Exact slug/identifier match (most robust)
                        if (identifier && identifier.toLowerCase() === characterClassName.toLowerCase()) {
                          availableToClass = true;
                          spellClasses = identifier;
                          break;
                        }

                        // If the lazy value is an Item5e class descriptor, check its type and name
                        if (valType === 'class' || valType.toLowerCase().includes('class')) {
                          if (typeof candidateName === 'string' && candidateName.toLowerCase() === characterClassName.toLowerCase()) {
                            availableToClass = true;
                            spellClasses = candidateName;
                            break;
                          }
                          if (typeof candidateName === 'string' && candidateName.toLowerCase().includes(characterClassName.toLowerCase())) {
                            availableToClass = true;
                            spellClasses = candidateName;
                            break;
                          }
                        }

                        // Fallback: substring match on identifier or name
                        if ((typeof identifier === 'string' && identifier.toLowerCase().includes(characterClassName.toLowerCase())) ||
                          (typeof candidateName === 'string' && candidateName.toLowerCase().includes(characterClassName.toLowerCase()))) {
                          availableToClass = true;
                          spellClasses = identifier || candidateName;
                          break;
                        }
                      }
                    }
                    // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] _lazy.classes resolved: ${spellClasses}, availableToClass=${availableToClass}`);
                  }
                } catch (e) {
                  window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] Error inspecting _lazy.classes: ${e}`);
                }
              }

              if (availableToClass) {
                // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] Spell is available to class: ${characterClassName}`);
                // Create spell object with enhanced data
                // Avoid accessing the deprecated SpellData#preparation getter. Prefer new
                // fields `method` and `prepared` when present, otherwise fall back to
                // raw source (`_source`) if available, or a safe default.
                const sys = doc.system || {};
                const prepObj = (() => {
                  // New API: method + prepared
                  if (sys.method !== undefined || sys.prepared !== undefined) {
                    return { mode: sys.method ?? 'prepared', prepared: sys.prepared ?? false };
                  }
                  // Avoid doc.system.preparation getter; inspect raw packed source if present
                  const rawPrep = doc._source?.system?.preparation;
                  if (rawPrep) {
                    return { mode: rawPrep.mode ?? 'prepared', prepared: rawPrep.prepared ?? false };
                  }
                  // Fallback default
                  return { mode: 'prepared', prepared: false };
                })();

                const spellObj = {
                  _id: doc.id,
                  name: doc.name,
                  img: doc.img,
                  type: doc.type,
                  uuid: doc.uuid,
                  system: {
                    level: sys.level,
                    school: sys.school,
                    preparation: prepObj,
                    components: sys.components,
                    description: sys.description,
                    activation: sys.activation
                  },
                  labels: doc.labels
                };
                filteredSpells.push(spellObj);
              } else {
                // window.GAS.log.d(`[SPELLS DEBUG] [${doc.name}] Spell is NOT available to class: ${characterClassName}`);
                // Detailed diagnostic for why this spell was filtered out
                try {
                  // window.GAS.log.p(`[SPELLS DEBUG] [FILTERED] ${doc.name}`, {
                  //   pack: pack.collection,
                  //   uuid: doc.uuid,
                  //   name: doc.name,
                  //   level: doc.system?.level,
                  //   itemClasses: doc.labels.classes,
                  //   available: availableToClass,
                  //   characterClassName: characterClassName, 
                  // });
                } catch (e) {
                  // Fallback to simple log if structured logging fails
                  // window.GAS.log.p(`[SPELLS DEBUG] [FILTERED] ${doc.name} pack=${pack.collection} uuid=${doc.uuid} level=${doc.system?.level} labels=${String(doc.labels?.classes)} system=${String(doc.system?.classes)} available=${availableToClass}`);
                }
              }
            } else {
              // window.GAS.log.p(`[SPELLS DEBUG] filtered out ${doc.name} because doc type is not spell: ${doc.type}`)
            }
          }

          allSpells.push(...filteredSpells);
          // window.GAS.log.d(`[SPELLS DEBUG] Filtered ${filteredSpells.length} spells for class ${characterClassName} from ${pack.collection}`);

        } else {
          // D&D 5e v3.x - NO CLASS FILTERING (class data doesn't exist on spells)
          // window.GAS.log.d('[SPELLS DEBUG] Skipping class filtering for D&D 5e v3.x (class data not available on spells)');
          // window.GAS.log.d(`[SPELLS DEBUG] Processing pack without class filtering: ${pack.collection}`);

          // Use index approach for better performance
          const index = await pack.getIndex({ fields: ['system.level', 'system.school'] });
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
                preparation: { mode: 'prepared', prepared: false }, // Default for compatibility
                components: {},
                description: { value: '' },
                activation: {}
              },
              labels: {} // Empty labels for v3.x compatibility
            }));

          allSpells.push(...spells);
          // window.GAS.log.d(`[SPELLS DEBUG] Loaded ${spells.length} spells (no class filtering) from ${pack.collection}`);
          if (spells.length === 0) {
            // Provide more context when index yields no spells
            try {
              const sampleTypes = indexEntries.slice(0, 5).map(e => ({ name: e.name, type: e.type }));
              // window.GAS.log.p(`[SPELLS DEBUG] [INDEX EMPTY] pack=${pack.collection} indexEntries=${indexEntries.length} sample=${JSON.stringify(sampleTypes)}`);
            } catch (e) {
              window.GAS.log.p(`[SPELLS DEBUG] [INDEX EMPTY] pack=${pack.collection} indexEntries=${indexEntries.length}`);
            }
          }
        }
      } else {
        // NO CLASS FILTERING: Use index data only (much faster)
        // window.GAS.log.d('[SPELLS DEBUG] Using index-only approach (no class filtering)');

        // Get basic index with system properties (these ARE indexable)
        const index = await pack.getIndex({ fields: ['system.level', 'system.school'] });

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
        // window.GAS.log.d(`[SPELLSDEBUG ] Loaded ${spells.length} spells (index only) from ${pack.collection}`);
        if (spells.length === 0) {
          try {
            const sampleTypes = indexEntries.slice(0, 5).map(e => ({ name: e.name, type: e.type }));
            // window.GAS.log.p(`[SPELLS DEBUG] [INDEX ONLY EMPTY] pack=${pack.collection} indexEntries=${indexEntries.length} sample=${JSON.stringify(sampleTypes)}`);
          } catch (e) {
            window.GAS.log.p(`[SPELLS DEBUG] [INDEX ONLY EMPTY] pack=${pack.collection} indexEntries=${indexEntries.length}`);
          }
        }
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
        window.GAS.log.d(`[SPELLS DEBUG] Skipping duplicate spell: ${spell.name} (uuid: ${spell.uuid})`);
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
    // window.GAS.log.d('[SPELLS] Final loaded spells:', uniqueSpells.length);
    // window.GAS.log.d('[SPELLS DEBUG] FINAL RESULT: Set availableSpells store with', uniqueSpells.length, 'spells');
    if (uniqueSpells.length === 0) {
      // When no spells survive filtering, dump helpful state
      try {
        // window.GAS.log.p('[SPELLS DEBUG] [NO_SPELLS] All spells filtered out', {
        //   packs: packs?.map(p => p.collection) || [],
        //   packsFound: packs?.length || 0,
        //   characterClassName
        // });
      } catch (e) {
        window.GAS.log.p('[SPELLS DEBUG] [NO_SPELLS] All spells filtered out packs=' + (packs?.map(p => p.collection).join(',') || '') + ' class=' + String(characterClassName));
      }
    }

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

    // Try to get full spell data via fromUuid first
    let fullSpellData = null;
    if (spell.uuid) {
      try {
        const fromUuid = foundry.utils?.fromUuid || globalThis.fromUuid;
        if (fromUuid) {
          fullSpellData = await fromUuid(spell.uuid);
        }
      } catch (error) {
        window.GAS.log.w('[SPELLS] fromUuid failed for', spell.name, error);
      }
    }

    // If fromUuid failed, use the spell data we already have
    if (!fullSpellData) {
      window.GAS.log.d('[SPELLS] Using direct spell data for', spell.name);
      // The spell object from availableSpells already has all the data we need
      fullSpellData = spell;
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
  // window.GAS.log.d('[SPELLS] finalizeSpellSelection called with actor:', actor?.name);

  if (!actor) {
    ui.notifications.error("No active character");
    return false;
  }

  try {
    const spells = get(selectedSpells);
    try {
      const actorDebug = {
        name: actor?.name,
        id: actor?.id,
        hasCreateEmbeddedDocuments: typeof actor?.createEmbeddedDocuments === 'function',
        itemsType: actor?.items ? (actor.items.constructor?.name || typeof actor.items) : 'none',
        itemsCount: (() => {
          try {
            if (!actor?.items) return 0;
            if (typeof actor.items.size === 'number') return actor.items.size;
            if (Array.isArray(actor.items)) return actor.items.length;
            if (typeof actor.items === 'object') return Object.keys(actor.items).length;
            return -1;
          } catch { return -1; }
        })()
      };
      window.GAS.log.d('[SPELLS][finalize] Starting finalizeSpellSelection', actorDebug);
      window.GAS.log.d('[SPELLS][finalize] Selected spells map size:', spells?.size ?? 0);
    } catch (e) {
      // best-effort logging only
    }
  window.GAS.log.d('[SPELLS][finalize] spells selected and to be added', spells);
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

  window.GAS.log.d('[SPELLS][finalize] Creating', spellItems.length, 'spell items:', spellItems.map(s => s.name));

    // Check for existing spells and handle duplicates similar to shop
    const itemsToCreate = [];

    // Resolve various actor shapes: Actor Document with .items Collection/Array/Map or a plain POJO
    const resolveActorItems = (act) => {
      // If actor has Collection-like .items with .find, return as-is
      if (act.items && typeof act.items.find === 'function') return act.items;
      // If items is a Map or an object, convert to array
      if (act.items && typeof act.items === 'object') return Array.isArray(act.items) ? act.items : Object.values(act.items);
      // If actor appears to be a lightweight data object, try to locate live Actor document by id
      if (act.id && typeof game?.actors?.get === 'function') {
        const live = game.actors.get(act.id);
        if (live) return live.items;
      }
      // Fallback: empty array
      return [];
    };

    const actorItems = resolveActorItems(actor);
    try {
      const existingNames = (() => {
        try {
          if (!actorItems) return [];
          if (typeof actorItems.map === 'function') return actorItems.map(i => i?.name).filter(Boolean);
          return [];
        } catch { return []; }
      })();
      window.GAS.log.d('[SPELLS][finalize] Actor existing items (names):', existingNames);
    } catch {}

    for (const spellItem of spellItems) {
      // Normalize lookup against different item shapes
      let existingSpell = null;
      try {
        if (actorItems && typeof actorItems.find === 'function') {
          existingSpell = actorItems.find(i => i.name === spellItem.name && i.type === "spell");
        } else if (Array.isArray(actorItems)) {
          existingSpell = actorItems.find(i => i.name === spellItem.name && i.type === "spell");
        }
      } catch (e) {
        window.GAS.log.w('[SPELLS] Error while searching actor items for duplicates:', e);
      }

      if (existingSpell) {
        window.GAS.log.d('[SPELLS][finalize] Found existing spell on actor, skipping:', spellItem.name);
        continue;
      }

      window.GAS.log.d('[SPELLS][finalize] New spell, will create:', spellItem.name);
      itemsToCreate.push(spellItem);
    }

    // Create new spells in a single batch if possible
    if (itemsToCreate.length > 0) {
      try {
        window.GAS.log.d('[SPELLS][finalize] About to create items. Using actor.createEmbeddedDocuments? ', typeof actor.createEmbeddedDocuments === 'function');
        if (typeof actor.createEmbeddedDocuments === 'function') {
          const createdSpells = await actor.createEmbeddedDocuments("Item", itemsToCreate);
          window.GAS.log.d('[SPELLS][finalize] Created spells via createEmbeddedDocuments:', createdSpells?.length ?? itemsToCreate.length);
        } else if (typeof Item === 'function' && typeof Item.create === 'function') {
          // Fallback: create each item with Item.create({ parent: actor })
          const created = [];
          for (const data of itemsToCreate) {
            try {
              const createdItem = await Item.create(data, { parent: actor });
              created.push(createdItem);
            } catch (e) {
              window.GAS.log.w('[SPELLS] Failed to create item via Item.create:', data.name, e);
            }
          }
          window.GAS.log.d('[SPELLS][finalize] Created spells via Item.create fallback:', created.length);
        } else {
          window.GAS.log.w('[SPELLS][finalize] No API available to create embedded items on actor');
        }
      } catch (e) {
        window.GAS.log.e('[SPELLS][finalize] Error creating spell items:', e);
        throw e;
      }
    }

    // Clear the selection
    selectedSpells.set(new Map());

    // Make the spells tab readonly
    readOnlyTabs.update(tabs => [...tabs, 'spells']);

    // Check if we're in level-up mode and handle workflow accordingly
    const isLevelUpMode = get(isLevelUp);
    if (isLevelUpMode) {
      window.GAS.log.d('[SPELLS][finalize] Level-up mode detected, triggering LevelUp workflow completion');
      // Import and trigger the LevelUp workflow completion
      const { handleSpellsCompleteLevelUp } = await import('~/src/lib/workflow');
      await handleSpellsCompleteLevelUp();
    }

    ui.notifications?.info(`Added ${itemsToCreate.length} spells to character`);
    window.GAS.log.d('[SPELLS][finalize] Completed finalizeSpellSelection. itemsToCreate:', itemsToCreate.length);
    return true;

  } catch (error) {
    console.error("Error finalizing spell selection:", error);
    ui.notifications?.error("Error adding spells to character: " + error.message);
    return false;
  }
}

// Function to auto-populate all spells for classes that get access to all spells
export async function autoPopulateAllSpells(characterClassName, maxSpellLevel, actor, isLevelUp = false, oldMaxSpellLevel = 0) {
  try {
    // window.GAS.log.d('[SPELLS] Auto-populating spells for', characterClassName, 'up to level', maxSpellLevel, 'isLevelUp:', isLevelUp, 'oldMaxSpellLevel:', oldMaxSpellLevel);

    // Get current available spells
    const currentSpells = get(availableSpells);
    const currentLimits = get(spellLimits);

    if (currentSpells.length === 0) {
      ui.notifications?.warn("No spells available to auto-populate");
      return false;
    }

    // For level-up scenarios, only add spells of the NEW maximum level
    // For character creation, add all spells up to max level
    let spellsToAdd;
    if (isLevelUp && oldMaxSpellLevel > 0) {
      // Level-up: add spells for any newly accessible levels (greater than oldMaxSpellLevel
      // and less than or equal to the new maxSpellLevel). Previously this only added
      // spells exactly at maxSpellLevel which could miss spells at intermediate levels.
      spellsToAdd = currentSpells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        return spellLevel > oldMaxSpellLevel && spellLevel <= maxSpellLevel;
      });
    } else {
      // Character creation: add all spells up to max level (excluding cantrips)
      spellsToAdd = currentSpells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        return spellLevel > 0 && spellLevel <= maxSpellLevel;
      });
    }

    if (spellsToAdd.length === 0) {
      if (isLevelUp) {
        ui.notifications?.info("No new spells available for this level up");
      } else {
        ui.notifications?.warn("No spells to auto-populate for this level");
      }
      return false;
    }

    // Create appropriate dialog content based on context
    let dialogContent;
    if (isLevelUp && oldMaxSpellLevel > 0) {
      dialogContent = `
        <p><strong>${characterClassName}s</strong> have access to all spells of appropriate level.</p>
        <p>Would you like to automatically add all ${spellsToAdd.length} new level ${maxSpellLevel} spells to your spellbook?</p>
        <p><em>Note: This will only add spells of the new maximum level (${maxSpellLevel}) that you gained access to.</em></p>
      `;
    } else {
      dialogContent = `
        <p><strong>${characterClassName}s</strong> have access to all spells of appropriate level.</p>
        <p>Would you like to automatically add all ${spellsToAdd.length} spells (levels 1-${maxSpellLevel}) to your spellbook?</p>
        <p><em>Note: You'll still need to select your cantrips manually, as those are limited and cannot be changed later.</em></p>
      `;
    }

    // Ask user for confirmation
    const confirmed = await Dialog.confirm({
      title: `Auto-populate ${characterClassName} Spells`,
      content: dialogContent,
      yes: () => true,
      no: () => false,
      defaultYes: true
    });

    if (!confirmed) {
      return false;
    }

    // Add all spells to selection
    let addedCount = 0;
    for (const spell of spellsToAdd) {
      try {
        await addSpell(spell);
        addedCount++;
      } catch (error) {
        console.warn(`Failed to add spell ${spell.name}:`, error);
      }
    }

    ui.notifications?.info(`Auto-populated ${addedCount} spells for ${characterClassName}`);
    // window.GAS.log.d('[SPELLS] Auto-populated', addedCount, 'spells');

    return true;

  } catch (error) {
    console.error("Error auto-populating spells:", error);
    ui.notifications?.error("Error auto-populating spells: " + error.message);
    return false;
  }
}

// Make the stores globally available for other components to access
if (typeof window !== 'undefined') {
  if (!window.GAS) window.GAS = {};
  window.GAS.availableSpells = availableSpells;
  window.GAS.selectedSpells = selectedSpells;
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
  window.GAS.autoPopulateAllSpells = autoPopulateAllSpells;
}
