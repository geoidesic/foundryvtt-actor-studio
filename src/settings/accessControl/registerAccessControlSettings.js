import { MODULE_ID } from '~/src/helpers/constants';
import AccessControlSettingsButton from './AccessControlSettingsButton';

export function registerAccessControlSettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'accessControlSettings', {
    name: game.i18n.localize('GAS.Setting.AccessControl.Name'),
    hint: game.i18n.localize('GAS.Setting.AccessControl.Hint'),
    label: game.i18n.localize('GAS.Setting.AccessControl.Label'),
    icon: 'fas fa-user-lock',
    type: AccessControlSettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'disableOtherActorCreationOptionsForPlayers', {
    name: game.i18n.localize('GAS.Setting.DisableOtherActorCreationOptionsForPlayers.Name'),
    hint: game.i18n.localize('GAS.Setting.DisableOtherActorCreationOptionsForPlayers.Hint'),
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, 'nonGmsCanOnlyCreatePCs', {
    name: game.i18n.localize('GAS.Setting.NonGmsCanOnlyCreatePCs.Name'),
    hint: game.i18n.localize('GAS.Setting.NonGmsCanOnlyCreatePCs.Hint'),
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  });
}
