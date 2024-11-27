import { MODULE_ID } from '~/src/helpers/constants';

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
    this.enabled = game.settings.get(MODULE_ID, 'enable-donation-tracker')
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
      .map(([key, rank]) => { return { permission: key, rank, folderName: game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`) } })
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
      .map(([key, _]) => game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`))
    // game.system.log.d('DTfolders', DTfolders)
    return DTfolders.length > 0
  }

  /**
   * Retrieves all folder names associated with donation tracker ranks.
   * @returns {Array<string>} - An array of folder names tied to donation tracker ranks.
   */
  getAllowedDTFolderNames() {
    const membershipRanks = game.membership.RANKS
    // game.system.log.d('membershipRanks', membershipRanks)
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);
    // game.system.log.d('membershipFolderArray', membershipFolderArray)
    const allowedMembershipFolderNames = membershipFolderArray.filter(([key, _]) =>
      {
        // game.system.log.d('key', key);
        return game.membership.hasPermission(key)
        //-@why: #102, unregistered = "member"
        || (
          game.membership.membershipLevel == -1
          && key == 'member'
        )
      }
    )
      .map(([key, _]) => game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`))
    // game.system.log.d('allowedMembershipFolderNames', allowedMembershipFolderNames)
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
      // game.system.log.d('folders', folders)
      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        //  game.system.log.d('folder.id', folder.id)

        allowedFolderIds.push(folder.id);

        // If the folder has subfolders, recursively add their IDs
        //  game.system.log.d(folder.id+'_folder.folders', folder.children)
        if (folder.children && folder.children.length > 0) {
          getFolderAndSubfolderIds(folder.children.map(f => f.folder));
        }

        // game.system.log.d('allowedFolderIds', allowedFolderIds)
      }
    };


    // game.system.log.d('>>>>>>>>>>>>> pack.name', pack.metadata.name)

    // game.system.log.d('filterByPermissions', filterByPermissions)
    //- Filter pack root folders based on the user's membership rank and get their IDs and subfolder IDs     
    const validRootFolderNames = this.getAllowedDTFolderNames();
    // game.system.log.d('id', pack.metadata.id);
    // game.system.log.d('this.getDTFolderNames()', this.getAllowedDTFolderNames());
    // game.system.log.d('validRootFolderNames', validRootFolderNames)
    // game.system.log.d('pack.folders', pack.folders)
    // game.system.log.d('pack.folders.filtered', pack.folders.filter(f => validRootFolderNames.includes(f.name)))

    if (filterByPermissions) {
      getFolderAndSubfolderIds(pack.folders.filter(f => validRootFolderNames.includes(f.name)));
    } else {
      getFolderAndSubfolderIds(Array.from(pack.folders));
    }
    // game.system.log.d('allowedFolderIds', allowedFolderIds)
    return allowedFolderIds;
  }
}

export default new plugin();