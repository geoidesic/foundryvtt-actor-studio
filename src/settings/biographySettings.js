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
  }
}

export const biographySettings = new BiographySettings();
