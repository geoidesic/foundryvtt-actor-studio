import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

import EquipmentSettingsAppShell from './EquipmentSettingsAppShell.svelte';

export default class EquipmentSettingsApp extends SvelteApplication {
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
      title: 'Actor Studio - Equipment & Gold',
      id: 'gas-equipment-settings',
      resizable: true,
      minimizable: true,
      draggable: true,
      width: defaultWidth,
      height: 500,
      minWidth: 500,
      minHeight: 400,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.png',

      svelte: {
        class: EquipmentSettingsAppShell,
        target: document.body
      }
    });
  }
}
