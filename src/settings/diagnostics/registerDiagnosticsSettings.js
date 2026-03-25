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

  // Test timeout settings — only register when Quench is active
  if (!game.modules.get('quench')?.active) return;

  game.settings.register(MODULE_ID, 'testTimeoutPerTest', {
    name: game.i18n.localize('GAS.Setting.testTimeoutPerTest.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutPerTest.Hint'),
    scope: 'world',
    config: false,
    default: 120000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutActorStudioClosed', {
    name: game.i18n.localize('GAS.Setting.testTimeoutActorStudioClosed.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutActorStudioClosed.Hint'),
    scope: 'world',
    config: false,
    default: 5000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutSpellsTabVisible', {
    name: game.i18n.localize('GAS.Setting.testTimeoutSpellsTabVisible.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutSpellsTabVisible.Hint'),
    scope: 'world',
    config: false,
    default: 25000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutGeneralCondition', {
    name: game.i18n.localize('GAS.Setting.testTimeoutGeneralCondition.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutGeneralCondition.Hint'),
    scope: 'world',
    config: false,
    default: 20000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testIntervalPolling', {
    name: game.i18n.localize('GAS.Setting.testIntervalPolling.Name'),
    hint: game.i18n.localize('GAS.Setting.testIntervalPolling.Hint'),
    scope: 'world',
    config: false,
    default: 100,
    type: Number,
  });
}
