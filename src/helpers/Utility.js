
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

  for (const pack of packs) {
    let entries = pack.index.entries()
    // @todo if DonationTracker enabled then https://github.com/geoidesic/foundryvtt-actor-studio/issues/32#issuecomment-2166888022
    if (game.modules.get('donation-tracker')?.active && game.settings.get(MODULE_ID, 'enable-donation-tracker')) {
      // get dt folder id's from this pack
      const dtFolderIds = DTPlugin.getAllowedDTFOlderIdsFromPack(pack)
      // filter the index.entries accordingly
      entries = entries.filter(([_, value]) => {
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

export function camelCaseToTitleCase(camelCaseStr) {
  // Split the string at each uppercase letter
  const words = camelCaseStr.replace(/([A-Z])/g, ' $1').trim();

  // Capitalize the first letter of each word and join them with spaces
  const titleCaseStr = words.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return titleCaseStr;
}

export const addItemToCharacter = async ({ actor, itemData }) => {
  return await actor.sheet._onDropItemCreate(itemData);
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