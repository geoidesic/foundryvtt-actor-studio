import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { log, camelCaseToTitleCase } from '~/src/helpers/Utility'

import { MODULE_ID } from '~/src/helpers/constants';
class DonationTrackerGameSettings extends TJSGameSettings {
   constructor() {
      console.log(MODULE_ID);
      super(MODULE_ID);
      console.log(this.namespace)
   }

   init() {
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
               alert('o');
            }
         }
      });

      const membershipRanks = game.membership?.RANKS || []

      if ( Object.keys(membershipRanks).length > 0) {
         for (const [rank, value] of Object.entries(membershipRanks)) {
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
      
      this.registerAll(allSettings, !game.user.isGM);
   }
}

export default new DonationTrackerGameSettings();
