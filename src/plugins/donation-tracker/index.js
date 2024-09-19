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

  packHasDTFolders(pack) {
    return pack.folders.some(f => this.getAllowedDTFolderNames().includes(f.name))
  }

  /**
   * Retrieves all folder names associated with donation tracker ranks.
   * 
   * @returns {Array<string>} - An array of folder names tied to donation tracker ranks.
   */
  getAllowedDTFolderNames() {
    const membershipRanks = game.membership.RANKS
    game.system.log.d('membershipRanks', membershipRanks)
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);
    game.system.log.d('membershipFolderArray', membershipFolderArray)
    const allowedMembershipFolderNames = membershipFolderArray.filter(([key, _]) => game.membership.hasPermission(key))
      .map(([key, _]) => game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`))
      game.system.log.d('allowedMembershipFolderNames', allowedMembershipFolderNames)
    return allowedMembershipFolderNames
  }



  /**
   * Retrieves the root-level and subfolder DT folder IDs from a compendium pack that are allowed for the current user.
   * 
   * @param {Object} pack - The compendium pack to search.
   * @returns {Array<string>} - An array of allowed folder IDs including subfolders.
   */
  getAllowedDTFOlderIdsFromPack(pack) {
    let allowedFolderIds = [];

    /**
     * Recursively retrieves folder IDs including subfolders.
     * 
     * @param {Array<Object>} folders - An array of folder objects to search.
     * @returns {Array<string>} - An array of allowed folder IDs.
     */
    const getFolderAndSubfolderIds = (folders) => {
      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        game.system.log.d('folder', folder)

        allowedFolderIds.push(folder.id);

        // If the folder has subfolders, recursively add their IDs
        game.system.log.d(folder.id+'_folder.folders', folder.children)
        if (folder.children && folder.children.length > 0) {
          getFolderAndSubfolderIds(folder.children.map(f => f.folder));
        }
      }
    };


    //- Filter pack root folders based on the user's membership rank and get their IDs and subfolder IDs     
    const validRootFolderNames = this.getAllowedDTFolderNames()
    ;
    game.system.log.d('>>>>>>>>>>>>> pack.name', pack.metadata.name)
    game.system.log.d('this.getDTFolderNames()', this.getAllowedDTFolderNames());
    game.system.log.d('validRootFolderNames', validRootFolderNames)
    getFolderAndSubfolderIds(pack.folders.filter(f => validRootFolderNames.includes(f.name)));
    game.system.log.d('allowedFolderIds', allowedFolderIds)
    return allowedFolderIds;
  }
}

export default new plugin();