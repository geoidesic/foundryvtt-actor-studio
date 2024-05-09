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
         title: 'TemplateESM.title',  // Automatically localized from `lang/en.json`.
         width: 300,

         svelte: {
            class: PCAppShell,
            target: document.body
         }
      });
   }
}