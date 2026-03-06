import { MODULE_ID } from '~/src/helpers/constants';
import AbilityScoresSettingsButton from './AbilityScoresSettingsButton';

export function registerAbilityScoresSettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'abilityScoresSettings', {
    name: game.i18n.localize('GAS.Setting.AbilityScores.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityScores.Hint'),
    label: game.i18n.localize('GAS.Setting.AbilityScores.Label'),
    icon: 'fas fa-dice-d20',
    type: AbilityScoresSettingsButton,
    restricted: true,
  });

  // Register individual settings (config: false so they appear in the app)
  game.settings.register(MODULE_ID, 'allowManualInput', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowManualInput.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowManualInput.Hint'),
    scope: 'world',
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, 'allowStandardArray', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowStandardArray.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowStandardArray.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'standardArray', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.StandardArrayValues.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.StandardArrayValues.Hint'),
    scope: 'world',
    config: false,
    default: '15, 14, 13, 12, 10, 8',
    type: String,
  });

  game.settings.register(MODULE_ID, 'allowPointBuy', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowPointBuy.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowPointBuy.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'pointBuyLimit', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.PointBuyLimit.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.PointBuyLimit.Hint'),
    scope: 'world',
    config: false,
    default: 27,
    type: Number,
  });

  game.settings.register(MODULE_ID, 'allowRolling', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowRolling.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowRolling.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'abiiltyRollFormula', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AbilityRollFormula.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AbilityRollFormula.Hint'),
    scope: 'world',
    config: false,
    default: '4d6kh3',
    type: String,
  });

  game.settings.register(MODULE_ID, 'allowAbilityRollScoresToBeMoved', {
    name: game.i18n.localize('GAS.Setting.AllowAbilityRollScoresToBeMoved.Name'),
    hint: game.i18n.localize('GAS.Setting.AllowAbilityRollScoresToBeMoved.Hint'),
    scope: 'world',
    config: false,
    default: true,
    type: Boolean,
  });
}
