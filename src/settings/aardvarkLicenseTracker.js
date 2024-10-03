import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID } from '~/src/helpers/constants';

class aardvarkLicenseTrackerSettings extends TJSGameSettings {
  constructor() {
    super(MODULE_ID);
  }

  init() {
    game.system.log.i('Registering Actor Studio Aardvark license tracker integration')
    const namespace = this.namespace;
    const allSettings = [];
    const license = {
      namespace,
      key: "aardvark-license-code",
      options: {
        name: game.i18n.localize('GAS.Setting.Aardvark.LicenseTrackerCode.Name'),
        hint: game.i18n.localize('GAS.Setting.Aardvark.LicenseTrackerCode.Hint'),
        scope: "world",
        config: true,
        type: String,
        default: '',
        onChange: (val) => {
        }
      }
    };


    this.register({
      namespace,
      key: "aardvark-enable-license-tracker",
      options: {
        name: game.i18n.localize('GAS.Setting.Aardvark.LicenseTrackerEnabled.Name'),
        hint: game.i18n.localize('GAS.Setting.Aardvark.LicenseTrackerEnabled.Hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: (val) => {
         
        }
      }
    });
    if (game.settings.get(MODULE_ID, 'aardvark-enable-license-tracker')) {
      this.register(license);
    }
  }

}


export default new aardvarkLicenseTrackerSettings();