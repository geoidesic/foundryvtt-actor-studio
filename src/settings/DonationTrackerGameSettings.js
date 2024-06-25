import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { camelCaseToTitleCase } from '~/src/helpers/Utility'

import { MODULE_ID } from '~/src/helpers/constants';
class DonationTrackerGameSettings extends TJSGameSettings {
   constructor() {
      super(MODULE_ID);
   }

   init() {
      log.i('Registering Actor Studio Donation Tracker integration')
      const namespace = this.namespace;
      const allSettings = [];

      this.register({
         namespace,
         key: "enable-donation-tracker",
         options: {
            name: game.i18n.localize('GAS.Setting.DonationTrackerEnabled.Name'),
            hint: game.i18n.localize('GAS.Setting.DonationTrackerEnabled.Hint'),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onchange: () => {
            }
         }
      });

      const membershipRanks = game.membership?.RANKS || []
      log.d('membershipRanks', membershipRanks)

      if ( Object.keys(membershipRanks).length > 0) {
         log.d('Registering Donation Tracker Ranks')
         for (const [rank, value] of Object.entries(membershipRanks)) {
            log.d('rank', rank)
            if(value === -1) continue;
            allSettings.push({
               namespace,
               key: `donation-tracker-rank-${rank}`,
               options: {
                  name: `${camelCaseToTitleCase(rank)}`,
                  hint: `${game.i18n.localize('GAS.Setting.DonationTrackerRank.Hint')}: ${camelCaseToTitleCase(rank)}`,
                  scope: "world",
                  config: true,
                  type: String,
                  default: `${camelCaseToTitleCase(rank)}`,
                  onchange: () => {
                     alert('o');
                  }
               }
            });
         }
      }
      log.d('allSettings', allSettings)
      this.registerAll(allSettings, !game.user.isGM);
   }
}

export default new DonationTrackerGameSettings();
