import { MODULE_ID } from '~/src/helpers/constants';
import BackgroundSettingsButton from './BackgroundSettingsButton';

export function registerBackgroundSettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'backgroundSettings', {
    name: game.i18n.localize('GAS.Setting.Background.Name'),
    hint: game.i18n.localize('GAS.Setting.Background.Hint'),
    label: game.i18n.localize('GAS.Setting.Background.Label'),
    icon: 'fas fa-user-plus',
    type: BackgroundSettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'enableCustomBackground', {
    name: game.i18n.localize('GAS.Setting.EnableCustomBackground.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableCustomBackground.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });
}