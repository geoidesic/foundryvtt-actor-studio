import { MODULE_ID } from '~/src/helpers/constants';
import UISettingsButton from './UISettingsButton';

export function registerUISettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'uiSettings', {
    name: game.i18n.localize('GAS.Setting.UI.Name'),
    hint: game.i18n.localize('GAS.Setting.UI.Hint'),
    label: game.i18n.localize('GAS.Setting.UI.Label'),
    icon: 'fas fa-desktop',
    type: UISettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'windowX', {
    name: game.i18n.localize('GAS.Setting.WindowX.Name'),
    hint: game.i18n.localize('GAS.Setting.WindowX.Hint'),
    scope: 'world',
    config: false,
    default: 720,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'windowY', {
    name: game.i18n.localize('GAS.Setting.WindowY.Name'),
    hint: game.i18n.localize('GAS.Setting.WindowY.Hint'),
    scope: 'world',
    config: false,
    default: 800,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'showButtonInSideBar', {
    name: game.i18n.localize('GAS.Setting.showButtonInSideBar.Name'),
    hint: game.i18n.localize('GAS.Setting.showButtonInSideBar.Hint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'experimentalCharacterNameStyling', {
    name: game.i18n.localize('GAS.Setting.ExperimentalCharacterNameStyling.Name'),
    hint: game.i18n.localize('GAS.Setting.ExperimentalCharacterNameStyling.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'illuminatedDescription', {
    name: game.i18n.localize('GAS.Setting.illuminatedDescription.Name'),
    hint: game.i18n.localize('GAS.Setting.illuminatedDescription.Hint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'illuminatedWidth', {
    name: game.i18n.localize('GAS.Setting.illuminatedWidth.Name'),
    hint: game.i18n.localize('GAS.Setting.illuminatedWidth.Hint'),
    scope: 'world',
    config: false,
    default: '100',
    type: String,
  });

  game.settings.register(MODULE_ID, 'illuminatedHeight', {
    name: game.i18n.localize('GAS.Setting.illuminatedHeight.Name'),
    hint: game.i18n.localize('GAS.Setting.illuminatedHeight.Hint'),
    scope: 'world',
    config: false,
    default: '100',
    type: String,
  });

  game.settings.register(MODULE_ID, 'hideAdvancementList', {
    name: game.i18n.localize('GAS.Setting.HideAdvancementList.Name'),
    hint: game.i18n.localize('GAS.Setting.HideAdvancementList.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });
}
