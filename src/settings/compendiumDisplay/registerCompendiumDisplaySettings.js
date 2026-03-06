import { MODULE_ID } from '~/src/helpers/constants';
import CompendiumDisplaySettingsButton from './CompendiumDisplaySettingsButton';

export function registerCompendiumDisplaySettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'compendiumDisplaySettings', {
    name: game.i18n.localize('GAS.Setting.CompendiumDisplay.Name'),
    hint: game.i18n.localize('GAS.Setting.CompendiumDisplay.Hint'),
    label: game.i18n.localize('GAS.Setting.CompendiumDisplay.Label'),
    icon: 'fas fa-book-open',
    type: CompendiumDisplaySettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'filterPackSourcesAppropriatelyByName', {
    name: game.i18n.localize('GAS.Setting.FilterPackSourcesAppropriatelyByName.Name'),
    hint: game.i18n.localize('GAS.Setting.FilterPackSourcesAppropriatelyByName.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'showPackLabelInSelect', {
    name: game.i18n.localize('GAS.Setting.ShowPackLabelInSelect.Name'),
    hint: game.i18n.localize('GAS.Setting.ShowPackLabelInSelect.Hint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean,
  });
}
