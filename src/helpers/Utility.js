import { LOG_PREFIX, MODULE_ID } from "~/src/helpers/constants"
import DTPlugin from "~/src/plugins/donation-tracker";
import { dropItemRegistry } from "~/src/stores/index";
import { get } from "svelte/store";

export const getDnd5eVersion = () => {
  const system = game.system;
  if (system.id !== 'dnd5e') return null;
  return Number(system.version.split('.')[0]); // Returns 3 or 4
};

export const log = {
  ASSERT: 1, ERROR: 2, WARN: 3, INFO: 4, DEBUG: 5, VERBOSE: 6,
  set level(level) {
    this.a = (level >= this.ASSERT) ? console.assert.bind(window.console, LOG_PREFIX) : () => { };
    this.e = (level >= this.ERROR) ? console.error.bind(window.console, LOG_PREFIX) : () => { };
    this.w = (level >= this.WARN) ? console.warn.bind(window.console, LOG_PREFIX) : () => { };
    this.i = (level >= this.INFO) ? console.info.bind(window.console, LOG_PREFIX) : () => { };
    this.d = (level >= this.DEBUG) ? console.debug.bind(window.console, LOG_PREFIX) : () => { };
    this.v = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX) : () => { };
    this.loggingLevel = level;
  },
  get level() { return this.loggingLevel; }
};

export function getLevelByDropType(actor, droppedItem) {
  window.GAS.log.d('getLevelByDropType', droppedItem);
  window.GAS.log.d('actor', actor);
  const currentDropItemRegistry = get(dropItemRegistry);
  window.GAS.log.d('currentDropItemRegistry', currentDropItemRegistry);
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
      // window.GAS.log.d('packHasDTFolders false');
      return true;
    }
    // get dt folder id's from this pack
    const allowedDTFolderIds = DTPlugin.getDTFolderIdsFromPack(pack)
    // window.GAS.log.d('allowedDTFolderIds', allowedDTFolderIds);
    const allDTFolderIds = DTPlugin.getDTFolderIdsFromPack(pack, false)
    // window.GAS.log.d('allDTFolderIds', allDTFolderIds);

    const unregisteredAccess = game.settings.get(MODULE_ID, 'enable-donation-tracker-unregistered-access');

    if (game.user.isGM && game.membership.DEVELOPER_IS_ADMIN) return entries;
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
    window.GAS.log.d('pack.metadata.name', pack.metadata.name);
    if (!pack.index) {
      ui.notifications.error(game.i18n.localize('GAS.Error.PackIndexNotFound'));
    }
    let entries = pack.index.entries()
    // @todo if DonationTracker enabled then https://github.com/geoidesic/foundryvtt-actor-studio/issues/32#issuecomment-2166888022
    entries = filterPackForDTPackItems(pack, entries);
    const packItems = extractMapIteratorObjectProperties(entries, keys);
    // window.GAS.log.d('packItems', packItems);
    items.push(...packItems);
  }
  return items;
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

    // window.GAS.log.d('extractItemsFromPacks pack.name', pack.metadata.name);
    // window.GAS.log.d('extractItemsFromPacks pack', pack);
    // window.GAS.log.d('extractItemsFromPacks packindex', index);
    let entries = index.entries()
    // window.GAS.log.d('extractItemsFromPacks entries', entries);
    entries = filterPackForDTPackItems(pack, entries);
    // window.GAS.log.d('extractItemsFromPacks entries post', entries);

    const packItems = extractMapIteratorObjectProperties(entries, [...keys, ...nonIndexKeys]);
    items.push(...packItems);
  }
  window.GAS.log.d('items', items)
  return items;
}

export function extractMapIteratorObjectProperties(mapIterator, keys) {
  const newArray = [];
  for (const [key, data] of mapIterator) {
    const newObj = {};
    keys.forEach((k) => {
      if (k.includes('->')) {
        const split = k.split('->');
        newObj[split[1]] = data[split[0]];
      } else if (k.includes('.')) {
        setNestedProperty(newObj, k, getNestedProperty(data, k))
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
    game.settings.set(MODULE_ID, 'compendiumSources', settings);
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
 * Prepares an item for dropping onto an actor by creating a new Item instance from the provided data.
 * Handles both level-up and initial character creation scenarios differently:
 * - For level-up with multi-class: Uses the direct UUID of the item
 * - For regular level-up: Uses the compendium source of the item
 * - For initial character creation: Creates from the direct UUID
 * 
 * @param {Object} options
 * @param {Object} options.itemData - The source item data containing UUID and compendium information
 * @param {boolean} options.isLevelUp - Whether this is being called during level-up
 * @param {boolean} options.isMultiClass - Whether this is a multi-class level-up
 * @returns {Promise<Item|undefined>} The prepared Item instance, or undefined if item creation fails
 */
export const prepareItemForDrop = async ({ itemData, isLevelUp, isMultiClass }) => {
  window.GAS.log.d('prepareItemForDrop');
  window.GAS.log.d('isLevelUp? ', isLevelUp);
  window.GAS.log.d('isMultiClass? ', isMultiClass);
  window.GAS.log.d('itemData', itemData);

  let item
  if (isLevelUp && itemData.type === 'class') {
    if (isMultiClass) {
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
    window.GAS.log.d('dropData', dropData);
    item = await Item.implementation.fromDropData(dropData);
    window.GAS.log.d('item', item);
  }
  return item;
}

//- used by dropItemRegistry
export const dropItemOnCharacter = async (actor, item) => {
  window.GAS.log.d('dropItemOnCharacter');
  window.GAS.log.d('dropItemOnCharacter item', item);
  window.GAS.log.d('actor.sheet._onDropItemCreate fn', actor.sheet._onDropItemCreate);
  return await actor.sheet._onDropItemCreate(item);
}

export function itemHasAdvancementChoices(item) {
  window.GAS.log.d('Advancement check:', {
    itemName: item.name,
    itemType: item.type,
    hasSystemAdvancement: !!item.system?.advancement,
    hasDirectAdvancement: !!item.advancement,
    systemAdvLength: item.system?.advancement?.length,
    directAdvLength: Array.isArray(item.advancement) ? item.advancement.length : 0
  });

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
    window.GAS.log.d('No advancements found');
    return false;
  }

  // Check each advancement for choices
  for (const adv of advancements) {
    window.GAS.log.d('Checking advancement:', {
      type: adv.type,
      hasChoices: !!(adv.choices || adv.configuration?.choices),
      choicesLocation: adv.choices ? 'direct' : adv.configuration?.choices ? 'configuration' : 'none'
    });

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