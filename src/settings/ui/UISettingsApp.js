import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

import UISettingsAppShell from './UISettingsAppShell.svelte';

export default class UISettingsApp extends SvelteApplication {
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
    const defaultWidth = Math.max(500, Math.min(700, Math.floor(viewportWidth * 0.4)));

    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Actor Studio - UI & Window',
      id: 'gas-ui-settings',
      resizable: true,
      minimizable: true,
      draggable: true,
      width: defaultWidth,
      height: 600,
      minWidth: 500,
      minHeight: 400,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.png',

      svelte: {
        class: UISettingsAppShell,
        target: document.body
      }
    });
  }
}
