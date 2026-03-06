import { MODULE_ID } from '~/src/helpers/constants';
import DiagnosticsSettingsButton from './DiagnosticsSettingsButton';

export function registerDiagnosticsSettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'diagnosticsSettings', {
    name: game.i18n.localize('GAS.Setting.Diagnostics.Name'),
    hint: game.i18n.localize('GAS.Setting.Diagnostics.Hint'),
    label: game.i18n.localize('GAS.Setting.Diagnostics.Label'),
    icon: 'fas fa-bug',
    type: DiagnosticsSettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'debug', {
    name: game.i18n.localize('GAS.Setting.debug.Name'),
    hint: game.i18n.localize('GAS.Setting.debug.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'debug.hooks', {
    name: game.i18n.localize('GAS.Setting.debugHooks.Name'),
    hint: game.i18n.localize('GAS.Setting.debugHooks.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });
}
