
import { getAllPackIdsFromAllSettings } from '~/src/helpers/Utility'
import { MODULE_ID } from '~/src/helpers/constants';
import { safeGetSetting } from '~/src/helpers/Utility';

export const renderCompendium = (app, html, data) => {
  // window.GAS.log.d('renderCompendium', app, html, data)
    if (game.modules.get('donation-tracker')?.active && safeGetSetting(MODULE_ID, 'enable-donation-tracker', false)) {
  
      const pack = app.collection
      if (pack.locked) return
      if (pack.metadata.path.includes('systems/')) return
      const allPacks = getAllPackIdsFromAllSettings();
      const actionButtons = html.find('.action-buttons')
      const DTaction = actionButtons.find('button.gas-add-dt-folders');
  
      // don't render the button if it already exists
      if (DTaction.length) {
        window.GAS.log.i('Donation Tracker button already exists, skipping')
        return;
      }
  
      // if the metadata.id of the pack matches any of the packs that are mapped to Actor Studio Sources, then render the DT folders button
      if (!allPacks.includes(pack.metadata.id)) {
        // @why commented out? Apparently these were annoying
        // window.GAS.log.i('Pack is not mapped to Actor Studio Sources, skipping')
        // ui.notifications.warn(`Pack ${pack.metadata.label} is not mapped to Actor Studio Sources. Please map it to enable the Donation Tracker feature.`)
        return;
      }
  
      // if the DTfolders already exist, don't render the button
      const membershipRanks = game.membership.RANKS
      for (const [rank, value] of Object.entries(membershipRanks)) {
        if (value === -1) continue;
        const folder = pack.folders.find(f => f.name === safeGetSetting(MODULE_ID, `donation-tracker-rank-${rank}`, ''))
        if (folder) {
          window.GAS.log.i('Donation Tracker folders already exist, skipping')
          return;
        }
      }
  
      async function addDonationTrackerFolders() {
        const membershipRanks = game.membership.RANKS
        for (const [rank, value] of Object.entries(membershipRanks)) {
          if (value === -1) continue;
          const folder = pack.folders.find(f => f.name === safeGetSetting(MODULE_ID, `donation-tracker-rank-${rank}`, ''))
          if (!folder) {
            // pack.folders.createDocument({ name: game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`), type: "JournalEntry" });
            const folderCls = getDocumentClass("Folder");
            // const myFolder = await folderCls.create({ name: game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`), type: "JournalEntry" });
            await folderCls.create({ name: safeGetSetting(MODULE_ID, `donation-tracker-rank-${rank}`, ''), type: "Item" }, { pack: pack.metadata.id });
          }
        }
      }
  
      const button = $(`<button role="button" class="gas-add-dt-folders" datatitle="${game.i18n.localize('GAS.Setting.DonationTrackerAction.Name')}" data-tooltip="${game.i18n.localize('GAS.Setting.DonationTrackerAction.Hint')}"><i class="fas fa-folder"></i> ${game.i18n.localize('GAS.Setting.DonationTrackerAction.Name')}</button>`);
      button.on('click', addDonationTrackerFolders)
      actionButtons.append(button)
  
    }

  }

  export default {
    renderCompendium
  }