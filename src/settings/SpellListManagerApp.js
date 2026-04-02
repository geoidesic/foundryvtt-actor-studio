import { SvelteApplication }  from '#runtime/svelte/application';
import SpellListManager from './SpellListManagerApp.svelte';

export default class SpellListManagerApp extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'spell-list-manager',
      title: 'Spell List Manager',
      resizable: true,
      width: 800,
      height: 600,

      svelte: {
        class: SpellListManager,
        target: document.body,
        props: {}
      }
    });
  }
}