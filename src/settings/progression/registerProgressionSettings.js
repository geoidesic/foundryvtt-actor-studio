import { MODULE_ID } from '~/src/helpers/constants';
import ProgressionSettingsButton from './ProgressionSettingsButton';

export function registerProgressionSettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'progressionSettings', {
    name: game.i18n.localize('GAS.Setting.Progression.Name'),
    hint: game.i18n.localize('GAS.Setting.Progression.Hint'),
    label: game.i18n.localize('GAS.Setting.Progression.Label'),
    icon: 'fas fa-chart-line',
    type: ProgressionSettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'enableLevelUp', {
    name: game.i18n.localize('GAS.Setting.EnableLevelUp.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableLevelUp.Hint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'milestoneLeveling', {
    name: game.i18n.localize('GAS.Setting.milestoneLeveling.Name'),
    hint: game.i18n.localize('GAS.Setting.milestoneLeveling.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'forceDnd5eLevelUpAutomation', {
    name: game.i18n.localize('GAS.Setting.forceDnd5eLevelUpAutomation.Name'),
    hint: game.i18n.localize('GAS.Setting.forceDnd5eLevelUpAutomation.Hint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'disableAdvancementCapture', {
    name: game.i18n.localize('GAS.Setting.disableAdvancementCapture.Name'),
    hint: game.i18n.localize('GAS.Setting.disableAdvancementCapture.Hint'),
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, 'advancementCaptureTimerThreshold', {
    name: game.i18n.localize('GAS.Setting.AdvancementCaptureTimerThreshold.Name'),
    hint: game.i18n.localize('GAS.Setting.AdvancementCaptureTimerThreshold.Hint'),
    scope: 'world',
    config: false,
    default: 300,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'enableCustomFeatSelector', {
    name: 'Enable Custom Feat Selector',
    hint: 'Replace the default dnd5e compendium browser with a custom feat selector modal for ItemChoice feat advancements.',
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, 'showLevelPreviewDropdown', {
    name: game.i18n.localize('GAS.Setting.ShowLevelPreviewDropdown.Name'),
    hint: game.i18n.localize('GAS.Setting.ShowLevelPreviewDropdown.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });
}
