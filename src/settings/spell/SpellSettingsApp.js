import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

import SpellSettingsAppShell from './SpellSettingsAppShell.svelte';

export default class SpellSettingsApp extends SvelteApplication {
  constructor(options) {
    super(options);
  }

  static get defaultOptions() {
    const viewportWidth = globalThis?.innerWidth ?? 1640;
    const defaultWidth = Math.max(550, Math.min(750, Math.floor(viewportWidth * 0.45)));

    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('GAS.Setting.Spell.Title'),
      id: 'gas-spell-settings',
      resizable: true,
      minimizable: true,
      draggable: true,
      width: defaultWidth,
      height: 620,
      minWidth: 550,
      minHeight: 450,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-white.png',

      svelte: {
        class: SpellSettingsAppShell,
        target: document.body,
      },
    });
  }
}
