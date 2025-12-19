import { LOG_PREFIX, MODULE_ID, MODULE_CODE, LOG_PREFIX_COLOR, LOG_STYLES} from "~/src/helpers/constants"
import DTPlugin from "~/src/plugins/donation-tracker";
import { dropItemRegistry } from "~/src/stores/index";
import { get } from "svelte/store";
import { tick } from "svelte";

/**
 * Converts various collection types into a standard array
 * @param {Array|Collection|Set|Map|Object} collection - The collection to convert. Can be:
 *   - Array: returned as-is
 *   - Collection: contents property is returned if present
 *   - Set/Map/Object: converted to array via Array.from()
 * @returns {Array} The collection contents as a standard array
 */
export function getItemsArray(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (collection.contents) return collection.contents;
  try { return Array.from(collection); } catch (e) { return []; }
}

  /**
   * Get the current items from the actor in the correct format
   */
  export function getItemSourcesFromActor(doc) {
    try {
      const itemsCollection = doc?.items;
      if (!itemsCollection) return [];
      const list = Array.isArray(itemsCollection)
        ? itemsCollection
        : (itemsCollection.contents || Array.from(itemsCollection));
      return list.map((itemDoc) => itemDoc?.toObject ? itemDoc.toObject() : itemDoc);
    } catch (_) {
      return [];
    }
  }


export async function illuminatedDescription(html, store) {
  const enriched = await enrichHTML(html);
  if(!game.settings.get(MODULE_ID, 'illuminatedDescription')) {
    return enriched;
  }
  const jEnriched = jQuery(enriched);
  let content = enriched;
  
  // Check if the content is wrapped in a div
  if (jEnriched.length === 1 && jEnriched[0].nodeName === 'DIV') {
    content = jEnriched.html();
  }

  if (!content) return null;
  
  const richHTML = `
    <div class="illuminated-description">
      <div class="illuminated-initial" style="background-image: url('${store.img}')"></div>
      ${content}
    </div>
  `;
  return richHTML;
}

export function dnd5eModCalc(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculates the D&D 5e skill bonus for a given skill key.
 *
 * @param {object} actor - The actor document object.
 * @param {string} key - The abbreviation of the skill (e.g., 'acr', 'ath').
 * @returns {number|null} The calculated skill bonus, or null if the skill data is not found.
 */
export function skillBonus(actor, key) {
  const skill = actor?.system?.skills?.[key];
  if (!skill) return null;
  const ability = skill.ability || 'int';
  const abilityScore = actor?.system?.abilities?.[ability]?.value ?? 10;
  const mod = dnd5eModCalc(abilityScore);
  const tier = Number(skill.value) || 0; // 0/1/2
  const pb = pbForCR(actor?.system?.details?.cr ?? 0);
  return mod + (tier * pb);
}


// Standard D&D 5e size display map
export const SIZES = { tiny: 'Tiny', sm: 'Small', med: 'Medium', lg: 'Large', huge: 'Huge', grg: 'Gargantuan' };

// Normalize arrays that may sometimes be strings, Sets, or objects
export function normalizeList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val instanceof Set) return Array.from(val);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  if (typeof val === 'object') return Object.keys(val).filter(k => !!val[k]);
  return [];
}

// Utility proficiency bonus by CR (fallback for UI; prefer CRCalculator when available)
export function pbForCR(cr) {
  const n = Number(cr) ?? 0;
  if (n <= 4) return 2;
  if (n <= 8) return 3;
  if (n <= 12) return 4;
  if (n <= 16) return 5;
  if (n <= 20) return 6;
  if (n <= 24) return 7;
  if (n <= 28) return 8;
  return 9;
}

// Utility XP by CR (fallback for UI; prefer CRCalculator when available)
export function xpForCR(cr) {
  const table = {
    0: 10, 1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900,
    9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000,
    23: 50000, 24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
  };
  const n = Number(cr) ?? 0;
  return table[n] ?? 0;
}


export const log = {
  ASSERT: 1, ERROR: 2, WARN: 3, INFO: 4, DEBUG: 5, VERBOSE: 6,
  set level(level) {
    this.a = (level >= this.ASSERT) ? console.assert.bind(window.console, LOG_PREFIX) : () => { };
    this.e = (level >= this.ERROR) ? console.error.bind(window.console, LOG_PREFIX) : () => { };
    this.w = (level >= this.WARN) ? console.warn.bind(window.console, LOG_PREFIX) : () => { };
    this.i = (level >= this.INFO) ? console.info.bind(window.console, LOG_PREFIX) : () => { };
    this.d = (level >= this.DEBUG) ? console.debug.bind(window.console, LOG_PREFIX) : () => { };
    this.v = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX) : () => { };

    // Colorized log methods - short versions
    this.s = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.s) : () => { };
    this.q = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.q) : () => { };
    this.p = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.p) : () => { };
    this.g = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.g) : () => { };
    this.go = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.go) : () => { };
    this.r = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.r) : () => { };
    this.o = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.o) : () => { };
    this.b = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.b) : () => { };
    this.y = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.y) : () => { };
    this.c = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.c) : () => { };
    this.m = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.m) : () => { };
    this.gr = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.gr) : () => { };
    this.br = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.br) : () => { };
    this.pi = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.pi) : () => { };
    this.t = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.t) : () => { };

    // Colorized log methods - full name aliases
    this.goldenrod = this.s;
    this.steelblue = this.go;
    this.aqua = this.q;
    this.purple = this.p;
    this.green = this.g;
    this.red = this.r;
    this.orange = this.o;
    this.blue = this.b;
    this.yellow = this.y;
    this.cyan = this.c;
    this.magenta = this.m;
    this.gray = this.gr;
    this.brown = this.br;
    this.pink = this.pi;
    this.teal = this.t;

    this.loggingLevel = level;
  },
  get level() { return this.loggingLevel; }
};

export const getDnd5eVersion = () => {
  // Prefer the runtime-initialized value if present (set in hooks/init.js)
  if (typeof window !== 'undefined' && window.GAS && Number.isFinite(Number(window.GAS.dnd5eVersion))) {
    return Number(window.GAS.dnd5eVersion);
  }

  // Fallback: inspect the installed system at runtime if available
  try {
    const system = globalThis?.game?.system;
    if (!system || system.id !== 'dnd5e') return null;
    const major = Number(system.version?.split?.('.')?.[0]);
    return Number.isFinite(major) ? major : null;
  } catch (e) {
    return null;
  }
};

export const getDndRulesVersion = () => {
  const ver = (typeof window !== 'undefined' && window.GAS && Number.isFinite(Number(window.GAS.dnd5eVersion)))
    ? Number(window.GAS.dnd5eVersion)
    : getDnd5eVersion();

  if (ver === 3) return '2014';
  return game.settings.get('dnd5e', 'rulesVersion') === 'modern' ? '2024' : '2014';
};

/**
 * Checks if an actor was imported from D&D Beyond using the DDB Importer module
 * @param {Actor} actor - The actor to check
 * @returns {boolean} True if the actor was imported from D&D Beyond
 */
export function isDDBImportedCharacter(actor) {
  return actor?.flags?.ddbimporter?.dndbeyond?.characterId !== undefined 
    || 'ddbimporter' in (actor?.flags || {});
}

/**
 * Shows a warning dialog for DDB Importer characters and returns user's choice
 * @param {Actor} actor - The actor being leveled up
 * @returns {Promise<boolean>} True if user wants to proceed, false otherwise
 */
export async function showDDBImporterWarning(actor) {
  const characterId = actor?.flags?.ddbimporter?.dndbeyond?.characterId;
  const idText = characterId ? ` (Character ID: ${characterId})` : '';
  
  return Dialog.confirm({
    title: "D&D Beyond Imported Character Detected",
    content: `<p><strong>Warning:</strong> This character was imported from D&D Beyond using the DDB Importer module${idText}.</p>
              <p>Characters created with the DDB Importer may have incompatibilities with Actor Studio's advancement system, particularly around:</p>
              <ul>
                <li>Feature advancements and choices</li>
                <li>Spell selections</li>
                <li>Equipment assignments</li>
                <li>Class features and options</li>
              </ul>
              <p>It is recommended to use the DDB Importer's own level-up system for these characters.</p>
              <p><strong>Do you want to proceed with Actor Studio anyway?</strong></p>`,
    yes: () => true,
    no: () => false,
    defaultYes: false
  });
}

export function getLevelByDropType(actor, droppedItem) {
  // window.GAS.log.d('getLevelByDropType', droppedItem);
  // window.GAS.log.d('actor', actor);
  const currentDropItemRegistry = get(dropItemRegistry);
  // window.GAS.log.d('currentDropItemRegistry', currentDropItemRegistry);
  switch (droppedItem.type) {
    case 'class':
      return actor.classes[droppedItem.system.identifier].system.levels
    case 'subclass':
      return actor.classes[droppedItem.system.classIdentifier].system.levels
    case 'race':
    case 'background':
    default:
      return parseInt(actor.system.details.level) + 1
  }
}

/**
 * Gets a rules from a journal by ID and Page
 *
 * @export
 * @async
 * @param {object} rule
 * @param {string} rule.journalId
 * @param {string} rule.pageId
 * @returns {string}
 */
export async function getRules(rule) {
  const { journalId, pageId } = rule;
  const rules = await game.packs.get('dnd5e.rules');
  const journal = await rules?.getDocument(journalId);
  const text = (journal)?.pages?.get(pageId).text;
  if (!text) {
    console.error(`Unable to find rule journal on compendium ${DEFAULT_PACKS.RULES}`);
  }
  return text;
}

export function filterPackForDTPackItems(pack, entries) {
  // window.GAS.log.d('filterPackForDTPackItems', pack, entries);
  // window.GAS.log.d('filterPackForDTPackItems filter', entries.filter);
  if (game.modules.get('donation-tracker')?.active && game.settings.get(MODULE_ID, 'enable-donation-tracker')) {

    //- if the pack has no DT folders, include everything, @why: as this compendium is not managed by DT
    if (!DTPlugin.packHasDTFolders(pack)) {
      return entries;
    }
    // get dt folder id's from this pack
    const allowedDTFolderIds = DTPlugin.getDTFolderIdsFromPack(pack)
    const allDTFolderIds = DTPlugin.getDTFolderIdsFromPack(pack, false)

    const unregisteredAccess = game.settings.get(MODULE_ID, 'enable-donation-tracker-unregistered-access');

    // Game Masters should bypass donation tracker restrictions regardless of their login status
    if (game.user.isGM) return entries;
    // filter the index.entries accordingly
    entries = entries.filter(([key, value]) => {

      // window.GAS.log.d('key', key, value)
      //- if item is not in a folder
      // window.GAS.log.d(1)
      if (!value.folder) {
        return unregisteredAccess;
      }

      //- if the item is in a folder that is not a real folder (e.g. deleted folder)
      // window.GAS.log.d(2)
      if (!pack.folders.get(value.folder)) return false;

      //- if the item is in a DT folder tree, include it
      // window.GAS.log.d(4)
      if (allowedDTFolderIds.includes(value.folder)) return true;
      // window.GAS.log.d(5)

      //- if item is in a folder that is not a DT folder
      if (!allDTFolderIds.includes(value.folder)) {
        // window.GAS.log.d(6)
        return unregisteredAccess;
      }

      // window.GAS.log.d(7)

      return false;
    });
  }
  return entries;
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Extracts items from all compendium packs including subfolders.
 * Use this if you're happy with the default pack index.
 * @param {Array} packs compendium packs
 * @param {Array} keys pack data to extract
 * @returns {Array} extracted items
 */
export function extractItemsFromPacksSync(packs, keys) {
  const items = [];

  for (const pack of packs) {
    // window.GAS.log.d('extractItemsFromPacks pack.metadata', pack.metadata);

    // window.GAS.log.d('pack.metadata.name', pack.metadata.name);
    if (!pack.index) {
      ui.notifications.error(game.i18n.localize('GAS.Error.PackIndexNotFound'));
    }
    let entries = pack.index.entries()
    // window.GAS.log.d('entries', entries);
    // @todo if DonationTracker enabled then https://github.com/geoidesic/foundryvtt-actor-studio/issues/32#issuecomment-2166888022
    entries = filterPackForDTPackItems(pack, entries);
    window.GAS.log.d('entries post', entries);
    let packItems = extractMapIteratorObjectProperties(entries, keys);
    packItems = packItems.map(item => ({
      ...item,
      label: item.label,
      compoundLabel: `[${pack.metadata.label}] ${item.label}`,
      packName: pack.metadata.name,
      packId: pack.metadata.id,
      packLabel: pack.metadata.label,
      packType: pack.metadata.type,
      packPath: pack.metadata.path,
      packSystem: pack.metadata.system,
      sourceBook: pack.metadata?.flags?.dnd5e?.sourceBook || null
    }));
    // window.GAS.log.d('packItems', packItems);
    items.push(...packItems);
  }
  return items;
}

/**
 * Gets a localized string
 * @param {string} string - The string to localize
 * @return {string} The localized string
 */
export function localize(string) {
  if (typeof game === 'undefined') return string; //- avoid lint error
  return game.i18n.localize(`${MODULE_CODE}.${string}`);
}


/**
 * Extracts items from all compendium packs including subfolders.
 * Use this if you need extra index info (via async)
 * @param {Array} packs compendium packs
 * @param {Array} keys pack data to extract
 * @param {boolean|Array} nonIndexKeys pack data to extract that doesn't exist in the index, thus we need to generate a new index, which is an async process
 * @returns {Array} extracted items
 */
export async function extractItemsFromPacksAsync(packs, keys, nonIndexKeys = false) {
  const items = [];
  // window.GAS.log.d('extractItemsFromPacks packs', packs);
  // window.GAS.log.d('nonIndexKeys', nonIndexKeys);
  for (const pack of packs) {

    let index = await pack.getIndex({
      fields: nonIndexKeys,
    });

    if (!pack) continue;
    if (!index) {
      ui.notifications.error(game.i18n.localize('GAS.Error.PackIndexNotFound'));
    }

    // window.GAS.log.d('extractItemsFromPacks pack.metadata', pack.metadata);
    // window.GAS.log.d('extractItemsFromPacks pack.name', pack.metadata.name);
    // window.GAS.log.d('extractItemsFromPacks pack', pack);
    // window.GAS.log.d('extractItemsFromPacks packindex', index);
    let entries = index.entries()
    // window.GAS.log.d('extractItemsFromPacks entries', entries);
    entries = filterPackForDTPackItems(pack, entries);
    // window.GAS.log.d('extractItemsFromPacks entries post', entries);

    let packItems = extractMapIteratorObjectProperties(entries, [...keys, ...nonIndexKeys]);
    
    // Debug: Log the first few items to see the data structure
    if (packItems.length > 0) {
      // console.log('Enhanced index data structure sample:', {
      //   packName: pack.metadata.name,
      //   firstItem: packItems[0],
      //   keys: [...keys, ...nonIndexKeys],
      //   hasSystemFields: nonIndexKeys.some(key => key.startsWith('system.'))
      // });
    }
    
    packItems = packItems.map(item => ({
      ...item,
      packName: pack.metadata.name,
      packId: pack.metadata.id,
      packLabel: pack.metadata.label,
      packType: pack.metadata.type,
      packPath: pack.metadata.path,
      packSystem: pack.metadata.system,
    }));
    // window.GAS.log.d('packItems', packItems)
    items.push(...packItems);
  }
  // window.GAS.log.d('items', items)
  return items;
}

/**
 * Extracts properties from a map iterator object
 * @param {MapIterator} mapIterator - The map iterator object
 * @param {Array} keys - The keys to extract
 * @returns {Array} The extracted properties
 */
export function extractMapIteratorObjectProperties(mapIterator, keys) {
  const newArray = [];
  for (const [key, data] of mapIterator) {
    // window.GAS.log.b('extractMapIteratorObjectProperties', key, data);
    const newObj = {};
    
    // Debug: Log the first item to see the data structure
    if (newArray.length === 0) {
      // console.log('extractMapIteratorObjectProperties - First item data:', {
      //   key,
      //   data,
      //   keys,
      //   dataKeys: Object.keys(data),
      //   hasSystemFields: keys.some(k => k.startsWith('system.'))
      // });
    }
    
    keys.forEach((k) => {
      if (k.includes('->')) {
        const split = k.split('->');
        newObj[split[1]] = data[split[0]];
      } else if (k.includes('.')) {
        // For enhanced index data, the system fields are returned as flat properties
        // Check if the field exists directly in the data
        if (data.hasOwnProperty(k)) {
          newObj[k] = data[k];
        } else {
          // Fallback to nested property extraction for backward compatibility
          const value = getNestedProperty(data, k);
          setNestedProperty(newObj, k, value);
        }
        
        // Debug: Log system field extraction
        if (k.startsWith('system.')) {
          // console.log(`System field extraction: ${k} = ${newObj[k]}`, {
          //   sourceData: data,
          //   extractedValue: newObj[k],
          //   hasDirectProperty: data.hasOwnProperty(k)
          // });
        }
      } else {
        newObj[k] = data[k];
      }
    });
    newObj.key = key;
    newArray.push(newObj);
  }
  return newArray;
}

export function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

export function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const lastObj = keys.reduce((acc, key) => acc[key] = acc[key] || {}, obj);
  lastObj[lastKey] = value;
}

export function getFoldersFromMultiplePacks(packs, depth = 1) {
  const folders = [];
  for (const pack of packs) {
    const packFolders = getPackFolders(pack, depth);
    folders.push(...packFolders);
  }
  return folders;
}

export function getPackFolders(pack, depth = 1) {
  const allRootFolders = extractMapIteratorObjectProperties(pack.folders.entries(), ['depth', 'name', '_id']);
  const foldersAtDepth = allRootFolders.filter(x => x.depth === depth);
  return foldersAtDepth
}

export const getPacksFromSettings = (type) => {
  const settings = game.settings.get(MODULE_ID, 'compendiumSources');
  // Return empty array if settings or type doesn't exist
  if (!settings || !settings[type]) {
    return [];
  }

  let filteredPackNames = settings[type];
  const packs = [];

  filteredPackNames = filteredPackNames.filter(packName => {
    const pack = game.packs.get(packName);
    if (pack) {
      packs.push(pack);
      return true;
    }
    return false;
  });

  // Update settings if any packs were removed
  if (filteredPackNames.length !== settings[type].length) {
    settings[type] = filteredPackNames;
    // Only persist the settings after the game is ready; otherwise defer
    if (game.ready) {
      game.settings.set(MODULE_ID, 'compendiumSources', settings);
    } else {
      try {
        // Defer the write to the first 'ready' tick
        globalThis.Hooks?.once?.('ready', () => {
          try { game.settings.set(MODULE_ID, 'compendiumSources', settings); } catch (_) {}
        });
      } catch (_) {}
    }
  }

  return packs;
}

export const getAllPacksFromAllSettings = () => {
  const settings = game.settings.get(MODULE_ID, 'compendiumSources');
  const types = Object.keys(settings);
  const packs = [];
  for (const type of types) {
    const filteredPackNames = settings[type];
    for (const packName of filteredPackNames) {
      packs.push(game.packs.get(packName));
    }
  }
  return packs;
}

export const getAllPackIdsFromAllSettings = () => {
  const packs = getAllPacksFromAllSettings();
  // window.GAS.log.d('getAllPackIdsFromAllSettings', packs);
  return packs.map(p => {
    return p.collection
  });
}

export function getAdvancementValue(advancement, key) {
  if (game.version > 12) {
    return advancement[key] || null;
  } else {
    return advancement.configuration?.[key] || null
  }
}

export function ucfirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelCaseToTitleCase(camelCaseStr) {
  // Split the string at each uppercase letter
  const words = camelCaseStr.replace(/([A-Z])/g, ' $1').trim();

  // Capitalize the first letter of each word and join them with spaces
  const titleCaseStr = words.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return titleCaseStr;
}

export const getCompendiumSource = (item) => {
  // window.GAS.log.d('getCompendiumSource', item);
  let sourceId;
  if (game.version < 12) {
    sourceId = item.flags.core.sourceId;
  } else {
    sourceId = item._stats.compendiumSource;
  }
  // window.GAS.log.d('sourceId', sourceId);
  return sourceId;
}

/**
 * Resolve the sheet id for the core dnd5e character sheet in the current environment.
 * Returns something like `dnd5e.CharacterActorSheet` (v13/v4) or `dnd5e.ActorSheet5eCharacter2`/`dnd5e.ActorSheet5eCharacter` (older).
 * Falls back to the default registered sheet if a dnd5e sheet is not found.
 * @param {Actor} actor
 * @returns {string|undefined}
 */
function resolveDnd5eCoreCharacterSheetId(actor) {
  try {
    // We only care about character actors for this utility.
    const type = actor?.type ?? 'character';
    const config = CONFIG?.Actor?.sheetClasses?.[type] ?? {};
    const entries = Object.entries(config);
    if (!entries.length) return undefined;

    // Prefer V2 sheet first, then the newer V1, then legacy.
    const priority = [
      'dnd5e.CharacterActorSheet',
      'dnd5e.ActorSheet5eCharacter2',
      'dnd5e.ActorSheet5eCharacter'
    ];
    for (const id of priority) {
      if (config[id]) return id;
    }

    // Fallback: any sheet whose scope is dnd5e.
    const dnd5eEntry = entries.find(([id]) => id.startsWith('dnd5e.'));
    if (dnd5eEntry) return dnd5eEntry[0];

    // Last resort: current default sheet id for this subtype.
    const DSC = foundry?.applications?.apps?.DocumentSheetConfig;
    if (DSC) {
      const { defaultClass } = DSC.getSheetClassesForSubType('Actor', type);
      return defaultClass;
    }
  } catch (e) {
    window.GAS?.log?.w('resolveDnd5eCoreCharacterSheetId failed', e);
  }
  return undefined;
}

/**
 * Wait for the actor to have a sheet instance of a particular registered sheet id.
 * @param {Actor} actor
 * @param {string} sheetId
 * @param {number} [timeoutMs=1500]
 */
async function waitForSheetClass(actor, sheetId, timeoutMs = 1500) {
  const type = actor?.type ?? 'character';
  const cfg = CONFIG?.Actor?.sheetClasses?.[type]?.[sheetId];
  const Expected = cfg?.cls;
  if (!Expected) return;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    // Accessor ensures an instance exists
    const sheet = actor.sheet;
    if (sheet && sheet instanceof Expected) return;
    await delay(50);
  }
}

/**
 * Determine the actor's current effective sheet id: per-actor flag or default.
 * @param {Actor} actor
 * @returns {string|undefined}
 */
function getCurrentEffectiveSheetId(actor) {
  try {
    const DSC = foundry?.applications?.apps?.DocumentSheetConfig;
    const type = actor?.type ?? 'character';
    const currentFlag = actor.getFlag('core', 'sheetClass');
    if (currentFlag) return currentFlag;
    if (DSC) {
      const { defaultClass } = DSC.getSheetClassesForSubType('Actor', type);
      return defaultClass;
    }
  } catch (e) {
    window.GAS?.log?.w('getCurrentEffectiveSheetId failed', e);
  }
}

/**
 * Temporarily switch an Actor's sheet to a target sheet id, then provide a restore function to revert.
 * Uses the same mechanism as the UI: sets the `core.sheetClass` flag on the document.
 * If the current sheet is already the target, no change is made.
 * @param {Actor} actor
 * @param {string|undefined} targetSheetId
 * @returns {Promise<{currentSheetId:string, restore: function(): Promise<void>}>}
 */
async function switchActorSheetTemporarily(actor, targetSheetId) {
  const DSC = foundry?.applications?.apps?.DocumentSheetConfig;
  const type = actor?.type ?? 'character';
  const currentFlag = actor.getFlag('core', 'sheetClass');
  const wasOpen = !!actor.sheet?.rendered;
  let currentSheetId = currentFlag ?? '';
  if (!currentSheetId && DSC) {
    const { defaultClass } = DSC.getSheetClassesForSubType('Actor', type);
    currentSheetId = defaultClass;
  }

  // If no valid target or already on target, do nothing.
  if (!targetSheetId || targetSheetId === currentSheetId) {
    return {
      currentSheetId,
      restore: async () => {}
    };
  }

  // Apply the override to switch sheets, mirroring UI behavior (use blank string to clear; concrete id to set).
  await actor.setFlag('core', 'sheetClass', targetSheetId);
  // Force a sheet refresh to immediately instantiate the new class
  if (typeof actor._onSheetChange === 'function') {
    await actor._onSheetChange({ sheetOpen: wasOpen });
  }
  await waitForSheetClass(actor, targetSheetId);

  // Provide a restore function to revert the override.
  return {
    currentSheetId,
    restore: async () => {
      const revertTo = currentFlag ?? '';
      // wait briefly for any sheet changes scheduled by the drop handler to complete
      await delay(100);
      await actor.setFlag('core', 'sheetClass', revertTo);
      if (typeof actor._onSheetChange === 'function') {
        await actor._onSheetChange({ sheetOpen: wasOpen });
      }
      if (revertTo) {
        await waitForSheetClass(actor, revertTo);
      } else if (DSC) {
        // If we cleared the override, wait for the default class to settle
        const { defaultClass } = DSC.getSheetClassesForSubType('Actor', type);
        if (defaultClass) await waitForSheetClass(actor, defaultClass);
      }

      // Verify restoration; if not correct, retry once more.
      const expectedId = revertTo || (DSC ? DSC.getSheetClassesForSubType('Actor', type).defaultClass : undefined);
      const effectiveId = getCurrentEffectiveSheetId(actor);
      if (expectedId && effectiveId !== expectedId) {
        window.GAS?.log?.w('[UTILITY] Sheet restore mismatch; retrying', { expectedId, effectiveId });
        await delay(150);
        await actor.setFlag('core', 'sheetClass', revertTo);
        if (typeof actor._onSheetChange === 'function') {
          await actor._onSheetChange({ sheetOpen: wasOpen });
        }
        if (revertTo) await waitForSheetClass(actor, revertTo);
        else if (DSC) {
          const { defaultClass } = DSC.getSheetClassesForSubType('Actor', type);
          if (defaultClass) await waitForSheetClass(actor, defaultClass);
        }
      }
    }
  };
}

/**
 * Prepares an item for dropping onto an actor by creating a new Item instance from the provided data.
 * Handles both level-up and initial character creation scenarios differently:
 * - For level-up with multi-class: Uses the direct UUID of the item
 * - For regular level-up: Uses the compendium source of the item
 * - For initial character creation: Creates from the direct UUID
 * 
 * @param {Object} options
 * @param {Object} options.itemData - The source item data containing UUID and compendium information
 * @param {boolean} options.isLevelUp - Whether this is being called during level-up
 * @param {boolean} options.isNewMultiClass - Whether this is a multi-class level-up
 * @returns {Promise<Item|undefined>} The prepared Item instance, or undefined if item creation fails
 */
export const prepareItemForDrop = async ({ itemData, isLevelUp, isNewMultiClass }) => {
  // window.GAS.log.d('prepareItemForDrop');
  // window.GAS.log.d('isLevelUp? ', isLevelUp);
  // window.GAS.log.d('isNewMultiClass? ', isNewMultiClass);
  // window.GAS.log.d('itemData', itemData);

  let item
  if (isLevelUp && itemData.type === 'class') {
    if (isNewMultiClass) {
      item = await Item.implementation.fromDropData({ type: 'Item', uuid: itemData.uuid });
    } else {
      item = await Item.implementation.fromDropData({ type: 'Item', uuid: getCompendiumSource(itemData) });
    }

    if (!item) {
      log.e('Item not found in compendium', itemData._stats.compendiumSource);
      ui.notifications.error(game.i18n.localize('GAS.Error.ItemNotFoundInCompendium'));
      return
    }
  } else {
    const dropData = {
      type: 'Item',
      uuid: itemData.uuid,
    }
    // window.GAS.log.d('dropData', dropData);
    item = await Item.implementation.fromDropData(dropData);
    // window.GAS.log.d('item', item);
  }
  return item;
}


/** 
 * There are differences in how in-memory documents can be updated between versions of FoundryVTTv12 and v13
 * This function handles the differences and ensures the source is updated correctly.
 * THis is necessary because the TRL library doesn't support innate reactivity to the in-memory documents.
 * @param {Object} source - The source object to update
 * @param {Object} val - The value to update the source with
 * @returns {Promise<void>} A promise that resolves when the source is updated
 */
export const updateSource = async (source, val) => {
  if(source.uuid) {
    await source.update(val);
  } else {
    window.GAS.log.p('updateSource', source, val)
    await source.updateSource(val);
    await tick();
    if(source.render) {
      source.render();
      window.GAS.log.p('updated source', source)
    }
  }
};

export const deleteSource = async (source, key) => {
  for(const item of source[key]) {
    await source.items.delete(item.id);
  }
  await tick();
  if(source.render) {
    source.render();
  }
}

/**
 * This function is used to get the items from the selected NPC and set them on the in-memory actor.
 * This requires a degree of mapping and flagging because item uuids in the compendium are not 
 * the same as the uuids in the in-memory actor.
 * @param {Object} selectedNpcBase - The base NPC object from the compendium
 * @param {Object} actor - The in-memory actor object
 * @param {string} actorName - The name of the actor
 * @returns {Promise<void>} A promise that resolves when the items are set on the in-memory actor
 */
export const getAndSetActorItems = async (selectedNpcBase, actor, actorName) => {
  if (selectedNpcBase && actor) {
    // Convert embedded items to plain data for source update
    const items = [];
    try {
      const arr = selectedNpcBase.items && (selectedNpcBase.items.contents || Array.from(selectedNpcBase.items) || []);
      for (const it of arr) {
        if (!it) continue;
        const data = it.toObject();
        // Ensure a fresh ID is generated on the in-memory actor
        if (data && data._id) delete data._id;
        // Persist the original compendium UUID under our module namespace so later tabs can reference it
        try {
          const srcUuid = it?.uuid || it?.flags?.core?.sourceId || it?.system?.sourceId || null;
          if (srcUuid) {
            const fu = (globalThis?.foundry && globalThis.foundry.utils) ? globalThis.foundry.utils : undefined;
            if (fu?.setProperty) {
              fu.setProperty(data, `flags.${MODULE_ID}.sourceUuid`, srcUuid);
            } else {
              data.flags = data.flags || {};
              data.flags[MODULE_ID] = { ...(data.flags[MODULE_ID] || {}), sourceUuid: srcUuid };
            }
          }
        } catch (_) {}
        items.push(data);
      }
    } catch (_) {
      // no-op; fallback to empty items
    }
    // Update the in-memory actor source with type, name and items
    await deleteSource(actor, 'items');
    await updateSource(actor, {
      type: 'npc',
      name: actorName || selectedNpcBase.name,
      items
    });
    // Also update store used by NPC Features list
    try { itemsFromActor.set(items); } catch (_) {}
    // After source update, set module flags on the embedded Item documents as well
    try {
      const sourceUuidsByNameType = new Map(items.map(d => [`${d.name}::${d.type}`, d?.flags?.[MODULE_ID]?.sourceUuid]));
      const setFlags = [];
      actor.items?.forEach?.((doc) => {
        const key = `${doc?.name}::${doc?.type}`;
        const src = sourceUuidsByNameType.get(key);
        if (src && !doc.getFlag?.(MODULE_ID, 'sourceUuid')) {
          setFlags.push(doc.setFlag(MODULE_ID, 'sourceUuid', src));
        }
      });
      if (setFlags.length > 0) await Promise.allSettled(setFlags);
    } catch (_) {}
  }
}

/**
 * Copies NPC stats (ability scores, hit points, armor class, etc.) from the selected NPC base to the in-memory actor
 * @param {Object} selectedNpcBase - The selected NPC base document
 * @param {Object} actor - The in-memory actor object
 * @returns {Promise<void>} A promise that resolves when the stats are copied
 */
export const copyNpcStatsToActor = async (selectedNpcBase, actor) => {
  if (selectedNpcBase && actor) {
    try {
      // Get the NPC base data
      const npcData = selectedNpcBase.toObject();
      
      // Copy the core stats that should be preserved
      const statsToCopy = {
        system: {
          abilities: npcData.system?.abilities || {},
          attributes: npcData.system?.attributes || {},
          details: npcData.system?.details || {},
          traits: npcData.system?.traits || {},
          skills: npcData.system?.skills || {},
          resources: npcData.system?.resources || {},
          currency: npcData.system?.currency || {},
          inventory: npcData.system?.inventory || {},
          spells: npcData.system?.spells || {},
          effects: npcData.system?.effects || {},
          modifiers: npcData.system?.modifiers || {},
          profs: npcData.system?.profs || {},
          bonuses: npcData.system?.bonuses || {},
          saves: npcData.system?.saves || {},
          attributes: npcData.system?.attributes || {},
          ac: npcData.system?.ac || {},
          hp: npcData.system?.hp || {},
          speed: npcData.system?.speed || {},
          spellcasting: npcData.system?.spellcasting || {},
          level: npcData.system?.level || {},
          cr: npcData.system?.cr || {},
          xp: npcData.system?.xp || {},
          alignment: npcData.system?.alignment || {},
          size: npcData.system?.size || {},
          type: npcData.system?.type || {},
          subtype: npcData.system?.subtype || {},
          senses: npcData.system?.senses || {},
          languages: npcData.system?.languages || {},
          damage: npcData.system?.damage || {},
          resistances: npcData.system?.resistances || {},
          immunities: npcData.system?.immunities || {},
          vulnerabilities: npcData.system?.vulnerabilities || {},
          conditionImmunities: npcData.system?.conditionImmunities || {},
          legendary: npcData.system?.legendary || {},
          legendaryActions: npcData.system?.legendaryActions || {},
          lair: npcData.system?.lair || {},
          lairActions: npcData.system?.lairActions || {},
          regionalEffects: npcData.system?.regionalEffects || {},
          regionalEffectsEnd: npcData.system?.regionalEffectsEnd || {},
          environment: npcData.system?.environment || {},
          source: npcData.system?.source || {},
          page: npcData.system?.page || {},
          otherSources: npcData.system?.otherSources || {},
          additionalSources: npcData.system?.additionalSources || {},
          additionalSources2: npcData.system?.additionalSources2 || {},
          additionalSources3: npcData.system?.additionalSources3 || {},
          additionalSources4: npcData.system?.additionalSources4 || {},
          additionalSources5: npcData.system?.additionalSources5 || {},
          additionalSources6: npcData.system?.additionalSources6 || {},
          additionalSources7: npcData.system?.additionalSources7 || {},
          additionalSources8: npcData.system?.additionalSources8 || {},
          additionalSources9: npcData.system?.additionalSources9 || {},
          additionalSources10: npcData.system?.additionalSources10 || {}
        },
        flags: npcData.flags || {},
        img: npcData.img || '',
        token: npcData.token || {}
      };
      
      // Update the in-memory actor with the copied stats
      await updateSource(actor, statsToCopy);
      
      // Helpful debug output
      if (window?.GAS?.log?.g) {
        window.GAS.log.g('[NPC] In-memory actor stats copied from base NPC', actor);
      } else {
        console.log('[NPC] In-memory actor stats copied from base NPC', actor);
      }
    } catch (error) {
      window.GAS.log.e('[NPC] Error copying NPC stats to actor:', error);
    }
  }
};

//- used by dropItemRegistry
export const dropItemOnCharacter = async (actor, item) => {
  // window.GAS.log.d('dropItemOnCharacter');
  // window.GAS.log.d('dropItemOnCharacter item', item);
  // window.GAS.log.d('actor.sheet._onDropItemCreate fn', actor.sheet._onDropItemCreate);
  // window.GAS.log.d('actor.sheet._onDropItem fn', actor.sheet._onDropItem);

  // Track the item being dropped by adding it to the actor's flags
  try {
    const itemRecord = {
      name: item.name,
      uuid: item.uuid
    };
    const existingItems = actor.getFlag(MODULE_ID, `droppedItems.${item.type}`) || [];
    const updatedItems = [...existingItems, itemRecord];
    await actor.setFlag(MODULE_ID, `droppedItems.${item.type}`, updatedItems);
    // window.GAS.log.d(`Added ${item.name} to actor's ${item.type} tracking flags`);
  } catch (error) {
    window.GAS.log.e('Error updating actor flags for dropped item:', error);
  }

  window.GAS.log.g('actor.sheet', actor.sheet)

  // Ensure we are using the core dnd5e character sheet for drop handlers, then restore.
  const desiredSheetId = resolveDnd5eCoreCharacterSheetId(actor);
  const { currentSheetId, restore } = await switchActorSheetTemporarily(actor, desiredSheetId);

  try {
    // Proceed with adding the item to the actor using the active sheet's drop handlers
    if (game.version < 13) {
      // Use the older _onDropItemCreate for v11/v12
      // window.GAS.log.d('[UTILITY] Using _onDropItemCreate for v < 13');
      return await actor.sheet._onDropItemCreate(item);
    } else {
      // For v13+, simulate the drop event by calling _onDropItem
      // window.GAS.log.d('[UTILITY] Simulating _onDropItem for v >= 13');

      // Prepare a minimal mock event object
      const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: { closest: () => false }
      };

      await actor.sheet._onDropItem(mockEvent, item);
      return true; // Indicate successful simulation attempt
    }
  } catch (error) {
    window.GAS.log.e(`[UTILITY] Error calling sheet drop handler for actor ${actor.id} and item ${item.uuid}:`, error);
    ui.notifications.error(`Error adding item ${item.name} via simulated drop.`);
    return false; // Indicate failure
  } finally {
    // Always restore the original sheet (if it was different)
    try {
      await restore();
    } catch (restoreErr) {
      window.GAS.log.w('[UTILITY] Failed to restore original sheet class', {
        original: currentSheetId,
        attempted: desiredSheetId,
        error: restoreErr
      });
    }
  }
}

export function itemHasAdvancementChoices(item) {
  // window.GAS.log.d('Advancement check:', {
  //   itemName: item.name,
  //   itemType: item.type,
  //   hasSystemAdvancement: !!item.system?.advancement,
  //   hasDirectAdvancement: !!item.advancement,
  //   systemAdvLength: item.system?.advancement?.length,
  //   directAdvLength: Array.isArray(item.advancement) ? item.advancement.length : 0
  // });

  let hasAdvancementChoices = false;
  const advancements = [];

  // Collect advancements from both possible locations
  if (Array.isArray(item.advancement)) {
    advancements.push(...item.advancement);
  }
  if (Array.isArray(item.system?.advancement)) {
    advancements.push(...item.system.advancement);
  }

  if (!advancements.length) {
    window.GAS.log.i('No advancements found');
    return false;
  }

  // Check each advancement for choices
  for (const adv of advancements) {
    // window.GAS.log.d('Checking advancement:', {
    //   type: adv.type,
    //   hasChoices: !!(adv.choices || adv.configuration?.choices),
    //   choicesLocation: adv.choices ? 'direct' : adv.configuration?.choices ? 'configuration' : 'none'
    // });

    if (adv.choices || adv.configuration?.choices) {
      hasAdvancementChoices = true;
      break;
    }
  }

  return hasAdvancementChoices;
}

export const isAdvancementsForLevelInItem = (level, item) => {
  // where structure is like system.advancement = [{level: 1, ...}]
  const adv = item?.system?.advancement.find(adv => adv.level === level)
  if (adv) return true;
  return false
}

// truncate string
export function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str;
}

/** @todo: these were from HCT. None of these apply to the current version of Actor Studio */
export function userHasRightPermissions() {
  const userRole = game.user.role;

  // create actor (REQUIRED)
  if (!((game).permissions.ACTOR_CREATE).includes(userRole)) {
    ui.notifications?.error(game.i18n.localize('GAS.Permissions.NeedCreateActorError'));
    return false;
  }

  // create item (optional)
  // if (!((game).permissions.ITEM_CREATE).includes(userRole)) {
  //   ui.notifications?.warn(game.i18n.localize('GAS.Permissions.NeedCreateItemWarn'));
  // }

  // upload files (optional)
  // if (!((game).permissions.FILES_UPLOAD).includes(userRole)) {
  //   ui.notifications?.warn(game.i18n.localize('GAS.Permissions.NeedFileUploadWarn'));
  // }

  // browse files (optional)
  // if (!((game).permissions.FILES_BROWSE).includes(userRole)) {
  //   ui.notifications?.warn(game.i18n.localize('GAS.Permissions.NeedFileBrowseWarn'));
  // }
  return true;
}

/**
 * Determines the level at which a class gains its subclass
 * @param {Object} characterClass - The character class object
 * @param {string} MODULE_ID - The module ID constant
 * @returns {number|boolean} The level at which subclass is gained, or false if not found
 */
export function getSubclassLevel(characterClass, MODULE_ID) {
  // console.trace();
  // window.GAS.log.d('[getSubclassLevel] characterClass', characterClass)
  if (!characterClass) {
    // window.GAS.log.d('[getSubclassLevel] characterClass is false')
    return false;
  }

  // Check for dnd5e system 3.x flag
  const subclassFlag = characterClass.getFlag?.(MODULE_ID, "subclassLevel");
  if (subclassFlag) {
    // window.GAS.log.d('[getSubclassLevel] from subclassFlag', subclassFlag)
    return characterClass.getFlag(MODULE_ID, "subclassLevel");
  }

  // Check for dnd5e system 4.x advancement array
  // window.GAS.log.d('[getSubclassLevel] characterClass.system', characterClass.system.advancement)
  const subclassLevel = characterClass.system?.advancement
    ?.find(advancement => advancement.type === "Subclass")?.level;

  // window.GAS.log.d('[getSubclassLevel] subclassLevel from advancement', subclassLevel)
  return subclassLevel || false;
}

/**
 * Gets the appropriate TextEditor API for the current Foundry version
 * @returns {Object} The TextEditor API object
 */
export function getTextEditorAPI() {
  if (game.version >= 13) {
    // V13+ uses the new applications.ux.TextEditor.implementation path
    return foundry.applications.ux.TextEditor.implementation;
  } else {
    // V12 uses the global TextEditor
    return TextEditor;
  }
}

/**
 * Enriches HTML content using the appropriate TextEditor API for the current Foundry version
 * @param {string} content - The HTML content to enrich
 * @param {Object} options - Options for enrichment
 * @returns {Promise<string>} The enriched HTML content
 */
export async function enrichHTML(content, options = {}) {
  const textEditor = getTextEditorAPI();
  const enriched = await textEditor.enrichHTML(content, options);

  try {
    // Post-process the enriched HTML string to add a tooltip for broken links
    // that reference the Player's Handbook compendium. We operate on the
    // HTML string to avoid relying on the current document DOM.
    if (typeof enriched === 'string' && enriched.length) {
      // Create a temporary container to query and mutate elements
      const wrapper = document?.createElement ? document.createElement('div') : null;
      if (wrapper) {
        wrapper.innerHTML = enriched;

        // Find elements that are marked as broken content links.
        // In templates they may be rendered with class "content-link broken" or simply "broken".
        const brokenEls = wrapper.querySelectorAll('.content-link.broken, .broken');
        brokenEls.forEach(el => {
          // Search attributes and inner text for a Compendium UUID that includes the players handbook id
          // Commonly the uuid may appear in attributes like 'data-uuid', 'href', or inside the element text.
          const attrs = ['data-uuid', 'href', 'data-encoded-uuid', 'data-link'];
          let found = false;
          for (const a of attrs) {
            const val = el.getAttribute?.(a);
            if (val && val.includes && val.includes('Compendium.dnd-players-handbook')) { found = true; break; }
          }
          if (!found) {
            const txt = el.textContent || '';
            if (txt.includes && txt.includes('Compendium.dnd-players-handbook')) found = true;
          }
          if (found) {
            el.setAttribute('data-tooltip', "Requires D&D Player's Handbook module to be installed");
          }
        });

        return wrapper.innerHTML;
      }
    }
  } catch (err) {
    console.warn('enrichHTML post-process failed', err);
  }

  return enriched;
}

/**
 * Delete an item from an actor by ID
 * @param {Object} actor - The actor to delete the item from
 * @param {string} itemId - The ID of the item to delete
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise
 */
export const deleteActorItem = async (actor, itemId) => {
  try {
    if (!actor?.items?.delete) {
      console.error('Actor does not support item deletion');
      return false;
    }

    await actor.items.delete(itemId);
    
    // Force a refresh of the reactive statement
    await tick();
    if (actor.render) {
      actor.render();
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting item from actor:', error);
    return false;
  }
};

/**
 * Update a source object with new values
 * @param {Object} source - The source object to update
 * @param {Object} val - The value to update the source with
 * @returns {Promise<void>} A promise that resolves when the source is updated
 */

/**
 * Get filtered feats from configured compendium sources
 * @returns {Promise<Array>} Array of feat items with metadata
 */
export async function getFilteredFeats() {
  try {
    // Get feat compendium sources from settings
    const packs = getPacksFromSettings("feats");

    if (!packs || packs.length === 0) {
      window.GAS.log.d('[getFilteredFeats] No feat compendiums configured in settings');
      return [];
    }

    // Define the basic keys available in the default index
    const indexKeys = [
      "_id",
      "name",
      "img",
      "type",
      "uuid"
    ];

    // Define keys that are likely NOT in the index and need async loading
    const nonIndexKeys = [
      "system.prerequisites.level",
      "system.prerequisites.abilities",
      "system.prerequisites.features",
      "system.description.value"
    ];

    // Extract feat data using extractItemsFromPacksAsync
    let lightweightItems = await extractItemsFromPacksAsync(packs, indexKeys, nonIndexKeys);

    // Filter for feats only
    const feats = lightweightItems.filter(item => item.type === "feat");

    window.GAS.log.d(`[getFilteredFeats] Loaded ${feats.length} feats from ${packs.length} packs`);
    return feats;

  } catch (error) {
    window.GAS.log.e('[getFilteredFeats] Error loading feats:', error);
    return [];
  }
}

/**
 * Check if any sources are currently assigned in the compendium settings
 * @returns {boolean} True if any sources are assigned, false otherwise
 */
export function hasSourcesAssigned() {
  const settings = game.settings.get(MODULE_ID, 'compendiumSources');
  if (!settings) return false;
  
  // Check if any source type has packs assigned
  return Object.values(settings).some(packArray => Array.isArray(packArray) && packArray.length > 0);
}

/**
 * Auto-assign compendium packs to source categories based on their content types
 * Uses the same filtering logic as CompendiumSourcesSubmenu
 * @returns {Object} The auto-assigned sources object
 */
export function autoAssignSources() {
  const allItemPacks = game.packs.filter((p) => p.documentName === 'Item');
  const filterByName = game.settings.get(MODULE_ID, 'filterPackSourcesAppropriatelyByName');
  
  // Define the source type configurations with their inclusion/exclusion keywords
  const sourceConfigs = {
    races: { inclusions: ['race'], exclusions: [] },
    racialFeatures: { inclusions: ['race'], exclusions: [] },
    classes: { inclusions: ['class'], exclusions: ['subclass'] },
    subclasses: { inclusions: ['subclass'], exclusions: [] },
    backgrounds: { inclusions: ['background'], exclusions: [] },
    equipment: { inclusions: ['item', 'equipment'], exclusions: [] },
    spells: { inclusions: ['spell'], exclusions: [] },
    feats: { inclusions: ['feat'], exclusions: [] },
    items: { inclusions: ['item', 'equipment'], exclusions: [] },
  };

  const autoAssigned = {};

  // Process each source type
  for (const [sourceType, config] of Object.entries(sourceConfigs)) {
    autoAssigned[sourceType] = [];

    for (const pack of allItemPacks) {
      // Check inclusions
      const hasMatch = config.inclusions.some(inclusion =>
        pack.metadata.id.toLowerCase().includes(inclusion.toLowerCase()) ||
        pack.metadata.name.toLowerCase().includes(inclusion.toLowerCase()) ||
        pack.metadata.path.toLowerCase().includes(inclusion.toLowerCase()) ||
        pack.metadata.label.toLowerCase().includes(inclusion.toLowerCase())
      );

      // Check exclusions
      const hasExclusion = config.exclusions.some(exclusion =>
        pack.metadata.id.toLowerCase().includes(exclusion.toLowerCase()) ||
        pack.metadata.name.toLowerCase().includes(exclusion.toLowerCase()) ||
        pack.metadata.path.toLowerCase().includes(exclusion.toLowerCase()) ||
        pack.metadata.label.toLowerCase().includes(exclusion.toLowerCase())
      );

      // Only apply filtering by name if the setting is enabled
      if (filterByName) {
        if (hasMatch && !hasExclusion) {
          autoAssigned[sourceType].push(pack.collection);
        }
      } else {
        // If filtering is disabled, add all packs (but still respect exclusions for classes)
        if (sourceType === 'classes' && hasExclusion) {
          continue; // Skip subclasses when assigning to classes
        }
        if (sourceType === 'subclasses' && !hasMatch) {
          continue; // Only include subclass packs in subclasses
        }
        // For other types without filtering, include all Item packs
        if (config.inclusions.length === 0 || hasMatch) {
          autoAssigned[sourceType].push(pack.collection);
        }
      }
    }
  }

  window.GAS.log.d('[autoAssignSources] Auto-assigned sources:', autoAssigned);
  return autoAssigned;
}