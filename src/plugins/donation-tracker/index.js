class plugin {

  enabled = false;
  constructor() {
    enabled = game.settings.get(MODULE_ID, 'enable-donation-tracker')
  }

  itemIsInFolder(item) {
    if (!item.folder || !this.enabled) return false;
    const membershipRanks = game.membership.RANKS
    const membershipFolderNames = Object.keys(membershipRanks).map(rank => game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
    const folderIsDt = item.folder.find(f => f.name === game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
    return Boolean(folderIsDt);
  }

  canViewItem(item) {
    if (!item.folder || !this.enabled) return true;
    const membershipRanks = game.membership.RANKS
    const membershipFolderNames = Object.keys(membershipRanks).map(rank => game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
    const folderIsDt = item.folder.find(f => f.name === game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
    if(!folderIsDt) return true;
    const canView = game.membership.hasPermission('folderIsDt.name')
    log.d('canView', canView)
    return canView;
  }
}


export default new plugin();