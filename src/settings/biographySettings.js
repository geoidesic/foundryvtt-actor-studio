import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID } from '../helpers/constants';

class BiographySettings extends TJSGameSettings {
  constructor() {
    super(MODULE_ID);
  }

  init() {
    const namespace = this.namespace;

    this.register({
      namespace,
      key: 'EnableBiographyTab',
      options: {
        name: 'GAS.Setting.EnableBiographyTab.Name',
        hint: 'GAS.Setting.EnableBiographyTab.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
      },
    });

    // Show a small button in the Biography tab that will fill the optional details with reasonable
    // randomized values derived from the selected race / class / background. Useful for quick testing
    // or when you don't want to manually type these fields.
    this.register({
      namespace,
      key: 'ShowRandomizeDetailsButton',
      options: {
        name: 'GAS.Setting.ShowRandomizeDetailsButton.Name',
        hint: 'GAS.Setting.ShowRandomizeDetailsButton.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
      },
    });
  }
}

export const biographySettings = new BiographySettings();
