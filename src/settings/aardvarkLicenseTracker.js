import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID } from '../helpers/constants';

class AardvarkLicenseTrackerSettings extends TJSGameSettings {
  constructor() {
    super(MODULE_ID);
  }

  init() {
    const namespace = this.namespace;

    this.register({
      namespace,
      key: 'EnableLicenseTracker',
      options: {
        name: 'GAS.Setting.EnableLicenseTracker.Name',
        hint: 'GAS.Setting.EnableLicenseTracker.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
      },
    });

    this.register({
      namespace,
      key: 'AardvarkLicenseCode',
      options: {
        name: 'GAS.Setting.AardvarkLicenseCode.Name',
        hint: 'GAS.Setting.AardvarkLicenseCode.Hint',
        scope: 'world',
        config: true,
        type: String,
        default: '',
      },
    });
  }
}

export const aardvarkLicenseTrackerSettings = new AardvarkLicenseTrackerSettings();
