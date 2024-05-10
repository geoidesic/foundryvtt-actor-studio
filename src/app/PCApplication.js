import { SvelteApplication }  from '#runtime/svelte/application';
import PCAppShell          from './PCAppShell.svelte';


export default class PCApplication extends SvelteApplication
{
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: game.i18n.localize('GAS.ActorStudio')+' - '+game.i18n.localize('GAS.PCTitle'),  // Automatically localized from `lang/en.json`.
         width: 500,
         height: 600,
         minWidth: 500,

         svelte: {
            class: PCAppShell,
            target: document.body
         }
      });
   }
}