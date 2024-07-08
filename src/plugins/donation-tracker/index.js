import { MODULE_ID } from '~/src/helpers/constants';
import { log } from '../../helpers/Utility';

class plugin {

  enabled
  constructor() {
    this.enabled = false
  }

  init() {
    this.enabled = game.settings.get(MODULE_ID, 'enable-donation-tracker')
    // @todo: https://github.com/geoidesic/foundryvtt-actor-studio/issues/32#issuecomment-2166888022
    Hooks.on('gas-plugin', () => {
      alert('GAS Plugin Loaded')
    })
  }

  itemIsInFolder(item) {
    if (!item.folder || !this.enabled) return false;
    const membershipRanks = game.membership.RANKS
    const membershipFolderNames = Object.keys(membershipRanks).map(rank => game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
    const folderIsDt = item.folder.find(f => membershipFolderNames.includes(f.name))
    return Boolean(folderIsDt);
  }

  canViewItem(item) {
    if (!item.folder || !this.enabled) return true;
    const membershipRanks = game.membership.RANKS

    const membershipFolderArray = Object.entries(membershipRanks).filter(([key, value]) => value !== -1);
    log.d('membershipFolderArray', membershipFolderArray)
    const membershipFolderNames = membershipFolderArray
      .map(([key, value]) => game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`))
      log.d('membershipFolderNames', membershipFolderNames)
      log.d(item)
    const folderIsDt = item.folder.find(f => membershipFolderNames.includes(f.name))
    if(!folderIsDt) return true;
    const canView = game.membership.hasPermission(folderIsDt.name)
    log.d('canView', canView)
    return canView;
  }

  getDTFolderNames() {
    const membershipRanks = game.membership.RANKS
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);
    const membershipFolderNames = membershipFolderArray
    .map(([key, _]) => game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`))
    return membershipFolderNames
  }

  getDTSettings() {
    const membershipRanks = game.membership.RANKS
    const membershipFolderArray = Object.entries(membershipRanks).filter(([_, value]) => value !== -1);
    const settings = membershipFolderArray
    .map(([key, rank]) => { return {permission: key, rank, folderName: game.settings.get(MODULE_ID, `donation-tracker-rank-${key}`) }})
    return settings
  }

  getDTPermissionFromFolderName(folderName) {
    const membershipRanks = game.membership.RANKS
    log.d('membershipRanks', membershipRanks)

  }

  folderIsAllowed(folderName) {
    const settings = this.getDTSettings()
    const setting = settings.find(s => s.folderName === folderName)
    return game.membership.hasPermission(setting.permission) || game.user.isGM
  }

  getDTFolderIdsFromPack(pack) {
    const membershipFolderNames = this.getDTFolderNames();
    const dtFolders = pack.folders.filter(f => membershipFolderNames.includes(f.name))
    return dtFolders.map(f => f.id)
  }
  
  getAllowedDTFOlderIdsFromPack(pack) {
    const membershipFolderNames = this.getDTFolderNames();
    const dtFolders = pack.folders.filter(f => membershipFolderNames.includes(f.name) && this.folderIsAllowed(f.name))
    return dtFolders.map(f => f.id)
  }
}


export default new plugin();