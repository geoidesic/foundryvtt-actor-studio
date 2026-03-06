import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

import ProgressionSettingsAppShell from './ProgressionSettingsAppShell.svelte';

export default class ProgressionSettingsApp extends SvelteApplication {
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
    const defaultWidth = Math.max(550, Math.min(750, Math.floor(viewportWidth * 0.45)));

    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Actor Studio - Progression',
      id: 'gas-progression-settings',
      resizable: true,
      minimizable: true,
      draggable: true,
      width: defaultWidth,
      height: 620,
      minWidth: 550,
      minHeight: 450,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.png',

      svelte: {
        class: ProgressionSettingsAppShell,
        target: document.body
      }
    });
  }
}
