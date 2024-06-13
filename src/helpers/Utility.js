
import { LOG_PREFIX, MODULE_ID } from "~/src/helpers/constants"
import DTPlugin from "~/src/plugins/donation-tracker";

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

export const importComponent = async (importPath, componentName) => {
  const { default: Component } = await import(
    /* @vite-ignore */ `../${importPath}${componentName}.svelte`
  );
  return Component;
};

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


export function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
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


export function extractItemsFromPacks(packs, keys) {
  const items = [];

  const DTpermissions = DTPlugin.getDTSettings();
  log.d('DTpermissions', DTpermissions)
  for (const pack of packs) {
    let entries = pack.index.entries()
    // @todo if DonationTracker enabled then https://github.com/geoidesic/foundryvtt-actor-studio/issues/32#issuecomment-2166888022
    if (game.settings.get(MODULE_ID, 'enable-donation-tracker')) {
      // get dt folder id's from this pack
      const dtFolderIds = DTPlugin.getAllowedDTFOlderIdsFromPack(pack)
      log.d('dtFolderIds', dtFolderIds)
      // filter the index.entries accordingly
      entries = entries.filter(([key, value]) => {
        log.d('value.folder', value.folder)
        return !value.folder || dtFolderIds.includes(value.folder)
      });
    }
    const packItems = extractMapIteratorObjectProperties(entries, keys);
    items.push(...packItems);
  }
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
      } else {
        newObj[k] = data[k];
      }
    });
    newObj.key = key;
    newArray.push(newObj);
  }
  return newArray;
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
  const filteredPackNames = settings[type];
  const packs = [];
  for (const packName of filteredPackNames) {
    packs.push(game.packs.get(packName));
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
  log.d('getAllPackIdsFromAllSettings', packs);
  return packs.map(p => {
    return p.collection
  });
}

export const getSelectItemsFromPacksArray = (packs, type) => {

}

export const update = ($doc, dispatch, path) => async (event) => {
  // console.log("event", event);
  // console.log("dispatch", dispatch);
  // console.log("path", path);
  // console.log("$doc", $doc);

  const updateParams = { [path]: event.target.value }

  // console.log('updateParams', updateParams)

  if ($doc && event.target.value) {
    await $doc.update(updateParams);
  }
  dispatch("input", event.target.value);
}

export function getAllAttributeValues() {
  const allValues = [];

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      allValues.push(...attributes[key]);
    }
  }

  return allValues;
}


export function isAttribute(val) {
  if (Object.keys(attributes).includes(val)) return true;
  return false;
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


export function getSubAttributeGroup(subAttribute) {
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].includes(subAttribute)) {
        return key;
      }
    }
  }
}


export function getActorOwner(actor) {
  const owners = getOwners(actor);
  if (owners.length === 0) {
    return game.user;
  }
  if (owners.length === 1) {
    return owners[0];
  }

  let owner = owners.reduce((owner, currentOwner) => {
    if (!currentOwner.isGM) {
      owner = currentOwner;
    }
    return owner;
  }, null);

  if (!owner) {
    if (game.user.isGM) {
      return game.user;
    }
  }

  if (!owner) {
    return game.user;
  }

  return owner;
}

export async function updateMessage(messageId, data) {
  // check if chat message owner is this user
  const message = game.messages.get(messageId);
  if (message.user.id !== game.user.id) {
    // emit to owner of message
    game.socket.emit(`system.${game.system.id}`, {
      type: "chatMessage",
      mode: "messageUpdate",
      messageId,
      data
    });
  } else {
    console.log('Current user is message owner');
    // update message
    await message.update(data)
  }
}

export function getOwners(actor) {
  return game.users.filter(u => actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
}

export function getGMs() {
  return game.users.filter(u => u.isGM).map(u => u.id)
}

export function getBookmarkedItems(Actor, limit = false) {
  // if limit is a number, then truncate the array to that number
  if (limit && typeof limit === 'number') {
    return Actor?.items?.filter((i) => i.system.bookmarked).slice(0, limit);
  } else {
    return Actor?.items?.filter((i) => i.system.bookmarked);
  }
};

/**
 * @param {*} actor 
 * @param {*} type 
 * @returns array of items of type
 */
export function getItemsByType(actor, type) {
  if (!actor || !actor.items) return [];
  const item = actor?.items?.filter(i => i.type === type);
  return item;
}
export function decodeUuidString(uuid) {
  return uuid.replace(/_/g, "\.");
}


/**
 * This is necessary because of a wierd context difference between foundry and svelte
 * Foundry's update method interprets dot notation as data nodes and so creates a nested data structure from it if you use it as a key
 * Svelte's stores do not, they use it as a string literal.
 * If you're trying to use actor uuid as a storage key then this conversion becomes necessary
 * @param {string} uuid 
 * @returns {string} replaces dots with underscores
 */
export function encodeUuidString(uuid) {
  return uuid.replace(/\./g, "_");
}

export function findKeysByValue(obj, value) {
  return Object.entries(obj)
    .filter(([key, val]) => val === value)
    .map(([key]) => key);
}

/**
 * Not surewhy we need the origin? Only reason I can think of is for effectsFilterQuery `type` filter – because `type` is only present on the original.
 * @param {object} effect 
 * @returns original item
 */
export function getEffectOrigin(effect) {
  if (!game.actors) return null;
  const origin = effect._source.origin;
  if (!origin) return null;
  const split = origin.split(".");
  let item = void 0;
  if (split.length == 4) {
    item = effect.parent.items.get(split[3]);
  } else {
    try {
      item = game.actors?.get(origin)
        || game.items?.get(origin)
        || game.packs?.get('effects');
    } catch (error) {
      console.warn('getEffectOrigin', effect, origin);
      throw error;
    }
  }
  return item;
}

// Example usage:
// log.level = log.DEBUG;
// log.d("This is a debug message.");

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export async function getCompendiumEffect(effect) {
  if (!effect) {
    console.trace()
    return null;
  }
  console.log('getCompendiumEffect effect', effect);

  const origin = fromUuid(effect._source.origin);
  console.log('getCompendiumEffect origin', origin);
  if (!origin) {
    console.error('Could not find effect origin')
    return null;
  }
  return origin;
}

export const addItemToCharacter = async ({ actor, itemData }) => {
  return await actor.sheet._onDropSingleItem(itemData);
}

export const isAdvancementsForLevelInItem = (level, item) => {
  // where structure is like system.advancement = [{level: 1, ...}]
  const adv = item.system.advancement.find(adv => adv.level === level)
  if (adv) return true;
  return false
}

// truncate string
export function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str;
}


export function isParentActor(item) {
  return item?.parent?.constructor?.name === 'SurgeActor';
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