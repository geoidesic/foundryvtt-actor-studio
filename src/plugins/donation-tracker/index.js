/**
 * @file donation-tracker/index.js
 * @description This file contains the plugin for the Donation Tracker.
 * @author geoidesic
 * @version 1.0.0
 * @license MIT
 * 
 * by configuring those 3 attributes you can configure the way you want in devMode
 * 
 * Default Membership levels for Developer Mode.
 * ```js
 * DEVELOPER_LEVELS = ['member', 'benefactor', 'benefactorOfKnowledge'];
 * ```
 * Default Membership for Developer Mode.
 * ```js
 * DEVELOPER_MEMBERSHIP = 'member';
 * ```
 * Default Admin status for Developer Mode.
 * ```js
 * DEVELOPER_IS_ADMIN = false;
 * ```
 * ```js
 * game.membership.DEVELOPER_MEMBERSHIP = 'member' ?
 * ```
 */
import { MODULE_ID } from '~/src/helpers/constants';
import { safeGetSetting } from '~/src/helpers/Utility';

class plugin {

  enabled
  constructor() {
    this.enabled = false
  }

  /**
   * Initializes the plugin by checking if Donation Tracker is enabled in settings.
   * Sets up a hook to notify when the GAS Plugin is loaded.
   */
  init() {
    this.enabled = safeGetSetting(MODULE_ID, 'enable-donation-tracker', false)
    // @todo: https://github.com/geoidesic/foundryvtt-actor-studio/issues/32#issuecomment-2166888022
    Hooks.on('gas-plugin', () => {
      alert('GAS Plugin Loaded')
    })
  }


  /**
   * Retrieves the settings for each donation tracker rank, including the folder name and permission.
   * 
   * @returns {Array<Object>} - An array of objects containing permission, rank, and folderName.
   */
  getDTSettings() {
    const membershipRanks = game.membership.RANKS
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);
    const settings = membershipFolderArray
      .map(([key, rank]) => { return { permission: key, rank, folderName: safeGetSetting(MODULE_ID, `donation-tracker-rank-${key}`, '') } })
    return settings
  }

  /**
   * Checks if the current pack has DT folders or not.
   * Ignored rank access permissions.
   * @param {object} pack 
   * @returns boolean
   */
  packHasDTFolders(pack) {
    const membershipRanks = game.membership.RANKS
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);

    const DTfolders = membershipFolderArray
      .map(([key, _]) => safeGetSetting(MODULE_ID, `donation-tracker-rank-${key}`, ''))
    
    console.log('[GAS] DT folder names from settings:', DTfolders);
    console.log('[GAS] Pack folder names:', pack.folders.map(f => f.name));
    
    // Check if any of the configured DT folder names actually exist in this pack
    const hasDTFolders = DTfolders.some(dtFolderName => 
      pack.folders.some(packFolder => packFolder.name === dtFolderName)
    );
    
    console.log('[GAS] Pack has DT folders:', hasDTFolders);
    return hasDTFolders;
  }

  /**
   * Retrieves all folder names associated with donation tracker ranks.
   * @returns {Array<string>} - An array of folder names tied to donation tracker ranks.
   */
  getAllowedDTFolderNames() {
    const membershipRanks = game.membership.RANKS
    // window.GAS.log.d('membershipRanks', membershipRanks)
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);
    // window.GAS.log.d('membershipFolderArray', membershipFolderArray)
    const allowedMembershipFolderNames = membershipFolderArray.filter(([key, _]) => {
      // window.GAS.log.d('key', key);
      return game.membership.hasPermission(key)
        //-@why: #102, unregistered = "member"
        || (
          game.membership.membershipLevel == -1
          && key == 'member'
        )
    }
    )
      .map(([key, _]) => safeGetSetting(MODULE_ID, `donation-tracker-rank-${key}`, ''))
    // window.GAS.log.d('allowedMembershipFolderNames', allowedMembershipFolderNames)
    return allowedMembershipFolderNames
  }


  /**
   * Retrieves the root-level and subfolder DT folder IDs from a compendium pack that are allowed for the current user.
   * 
   * @param {Object} pack - The compendium pack to search.
   * @returns {Array<string>} - An array of allowed folder IDs including subfolders.
   */
  getDTFolderIdsFromPack(pack, filterByPermissions = true) {
    let allowedFolderIds = [];
    /**
     * Recursively retrieves folder IDs including subfolders.
     * 
     * @param {Array<Object>} folders - An array of folder objects to search.
     * @returns {Array<string>} - An array of allowed folder IDs.
    */
    const getFolderAndSubfolderIds = (folders) => {
      // window.GAS.log.d('folders', folders)
      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        //  window.GAS.log.d('folder.id', folder.id)

        allowedFolderIds.push(folder.id);

        // If the folder has subfolders, recursively add their IDs
        //  window.GAS.log.d(folder.id+'_folder.folders', folder.children)
        if (folder.children && folder.children.length > 0) {
          getFolderAndSubfolderIds(folder.children.map(f => f.folder));
        }

        // window.GAS.log.d('allowedFolderIds', allowedFolderIds)
      }
    };


    // window.GAS.log.d('>>>>>>>>>>>>> pack.name', pack.metadata.name)

    // window.GAS.log.d('filterByPermissions', filterByPermissions)
    //- Filter pack root folders based on the user's membership rank and get their IDs and subfolder IDs     
    const validRootFolderNames = this.getAllowedDTFolderNames();
    // window.GAS.log.d('id', pack.metadata.id);
    // window.GAS.log.d('this.getDTFolderNames()', this.getAllowedDTFolderNames());
    // window.GAS.log.d('validRootFolderNames', validRootFolderNames)
    // window.GAS.log.d('pack.folders', pack.folders)
    // window.GAS.log.d('pack.folders.filtered', pack.folders.filter(f => validRootFolderNames.includes(f.name)))

    if (filterByPermissions) {
      getFolderAndSubfolderIds(pack.folders.filter(f => validRootFolderNames.includes(f.name)));
    } else {
      getFolderAndSubfolderIds(Array.from(pack.folders));
    }
    // window.GAS.log.d('allowedFolderIds', allowedFolderIds)
    return allowedFolderIds;
  }
}

export default new plugin();