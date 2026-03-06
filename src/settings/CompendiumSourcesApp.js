import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

import CompendiumSourcesAppShell from './CompendiumSourcesAppShell.svelte';

export default class CompendiumSourcesApp extends SvelteApplication {
  /** @inheritDoc */
  constructor(options) {
    super(options);
  }

  /**
   * Default Application options
   *
   * @returns {object} options - Application options.
   * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Actor Studio - Compendium Sources',
      id: 'gas-compendium-sources-settings',
      resizable: true,
      minimizable: true,
      width: 820,
      height: 740,
      minWidth: 620,
      minHeight: 500,
      headerIcon: 'fas fa-atlas',

      svelte: {
        class: CompendiumSourcesAppShell,
        target: document.body
      }
    });
  }
}
