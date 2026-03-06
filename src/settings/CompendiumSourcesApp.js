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
    const viewportWidth = globalThis?.innerWidth ?? 1640;
    const defaultWidth = Math.max(620, Math.min(900, Math.floor(viewportWidth * 0.5)));

    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Actor Studio - Compendium Sources',
      id: 'gas-compendium-sources-settings',
      resizable: true,
      minimizable: true,
      draggable: true,
      width: defaultWidth,
      height: 740,
      minWidth: 620,
      minHeight: 500,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.png',

      svelte: {
        class: CompendiumSourcesAppShell,
        target: document.body
      }
    });
  }
}
