import { SvelteApplication }  from '#runtime/svelte/application';

import DonationTrackerSettingsAppShell  from './DonationTrackerSettingsAppShell.svelte';


export default class DonationTrackerSettingsApp extends SvelteApplication
{
   /** @inheritDoc */
   constructor(options)
   {
      super(options);
   }

   /**
    *
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: 'GAS.Setting.DonationTracker.Name',
         id: 'gas-donation-tracker-settings',
         resizable: true,
         minimizable: true,
         width: 600,
         height: 400,
         minWidth: 550,
         headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.png',

         svelte: {
            class: DonationTrackerSettingsAppShell,
            target: document.body
         }
      });
   }
}