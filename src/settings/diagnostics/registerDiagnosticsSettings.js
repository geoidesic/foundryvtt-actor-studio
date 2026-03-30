import { MODULE_ID } from '~/src/helpers/constants';
import DiagnosticsSettingsButton from './DiagnosticsSettingsButton';
import { showReloadRequiredConfirm } from '../confirmationHelpers';

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
    requiresReload: true,
    onChange: () => {
      return showReloadRequiredConfirm({ world: true });
    }
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
    name: 'Per-test timeout (ms)',
    hint: 'Timeout applied to each Quench test case.',
    scope: 'world',
    config: false,
    default: 120000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutWaitShort', {
    name: 'Short wait duration (ms)',
    hint: 'Short helper wait used by Quench automation.',
    scope: 'world',
    config: false,
    default: 100,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutWaitMedium', {
    name: 'Medium wait duration (ms)',
    hint: 'Medium helper wait used by Quench automation.',
    scope: 'world',
    config: false,
    default: 200,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutWaitLong', {
    name: 'Long wait duration (ms)',
    hint: 'Long helper wait used by Quench automation.',
    scope: 'world',
    config: false,
    default: 300,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutUiInteraction', {
    name: game.i18n.localize('GAS.Setting.testTimeoutUiInteraction.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutUiInteraction.Hint'),
    scope: 'world',
    config: false,
    default: 5000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutUiStateChange', {
    name: game.i18n.localize('GAS.Setting.testTimeoutUiStateChange.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutUiStateChange.Hint'),
    scope: 'world',
    config: false,
    default: 20000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutSpellUiLoad', {
    name: game.i18n.localize('GAS.Setting.testTimeoutSpellUiLoad.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutSpellUiLoad.Hint'),
    scope: 'world',
    config: false,
    default: 5000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutSpellWorkflow', {
    name: game.i18n.localize('GAS.Setting.testTimeoutSpellWorkflow.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutSpellWorkflow.Hint'),
    scope: 'world',
    config: false,
    default: 30000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutAppClosure', {
    name: game.i18n.localize('GAS.Setting.testTimeoutAppClosure.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutAppClosure.Hint'),
    scope: 'world',
    config: false,
    default: 4000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutAppLifecycleComplete', {
    name: game.i18n.localize('GAS.Setting.testTimeoutAppLifecycleComplete.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutAppLifecycleComplete.Hint'),
    scope: 'world',
    config: false,
    default: 32000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutAdvancementProcessing', {
    name: game.i18n.localize('GAS.Setting.testTimeoutAdvancementProcessing.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutAdvancementProcessing.Hint'),
    scope: 'world',
    config: false,
    default: 1500,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutAdvancementPostLevel', {
    name: game.i18n.localize('GAS.Setting.testTimeoutAdvancementPostLevel.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutAdvancementPostLevel.Hint'),
    scope: 'world',
    config: false,
    default: 3000,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'testTimeoutActorDataUpdate', {
    name: game.i18n.localize('GAS.Setting.testTimeoutActorDataUpdate.Name'),
    hint: game.i18n.localize('GAS.Setting.testTimeoutActorDataUpdate.Hint'),
    scope: 'world',
    config: false,
    default: 50000,
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
