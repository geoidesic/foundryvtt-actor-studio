import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID } from '~/src/helpers/constants';

class openAISettings extends TJSGameSettings {
  constructor() {
    super(MODULE_ID);
  }

  init() {
    game.system.log.i('Registering Actor Studio Donation Tracker integration')
    const namespace = this.namespace;
    const allSettings = [];

    this.register({
      namespace,
      key: "enable-license-tracker",
      options: {
        name: game.i18n.localize('GAS.Setting.DonationTrackerEnabled.Name'),
        hint: game.i18n.localize('GAS.Setting.DonationTrackerEnabled.Hint'),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onchange: () => {
        }
      }
    });
  }
}


export default new openAISettings();