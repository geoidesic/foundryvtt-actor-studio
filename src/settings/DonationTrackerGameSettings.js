import { TJSGameSettings }       from '#runtime/svelte/store/fvtt/settings';

import { MODULE_ID }   from '~/src/helpers/constants';
import { log } from '~/src/helpers/Utility'

class DonationTrackerGameSettings extends TJSGameSettings
{
   #themeStore;

   constructor()
   {
      super(MODULE_ID);
   }

   init()
   {
      log.d("DonationTrackerGameSettings init")
      const namespace = this.namespace;



   }
}

export default new DonationTrackerGameSettings();