import { MODULE_ID } from '~/src/helpers/constants';
import EquipmentSettingsButton from './EquipmentSettingsButton';

export function registerEquipmentSettings() {
  // Register the menu for the settings app
  game.settings.registerMenu(MODULE_ID, 'equipmentSettings', {
    name: game.i18n.localize('GAS.Setting.Equipment.Name'),
    hint: game.i18n.localize('GAS.Setting.Equipment.Hint'),
    label: game.i18n.localize('GAS.Setting.Equipment.Label'),
    icon: 'fas fa-shield-alt',
    type: EquipmentSettingsButton,
    restricted: true,
  });

  // Register individual settings
  game.settings.register(MODULE_ID, 'defaultGoldDice', {
    name: game.i18n.localize('GAS.Setting.defaultGoldDice.Name'),
    hint: game.i18n.localize('GAS.Setting.defaultGoldDice.Hint'),
    scope: 'world',
    config: false,
    default: '5d4 * 10',
    type: String,
  });

  game.settings.register(MODULE_ID, 'enableEquipmentSelection', {
    name: game.i18n.localize('GAS.Setting.EnableEquipmentSelection.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableEquipmentSelection.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'enableEquipmentPurchase', {
    name: game.i18n.localize('GAS.Setting.EnableEquipmentPurchase.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableEquipmentPurchase.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'enableSpellSelection', {
    name: game.i18n.localize('GAS.Setting.EnableSpellSelection.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableSpellSelection.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });
}
