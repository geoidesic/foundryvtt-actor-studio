import { MODULE_ID } from '~/src/helpers/constants';
import SpellSettingsButton from './SpellSettingsButton';
import SpellListManagerButton from '../SpellListManagerButton';

export function registerSpellSettings() {
  game.settings.registerMenu(MODULE_ID, 'spellSettings', {
    name: game.i18n.localize('GAS.Setting.Spell.Name'),
    hint: game.i18n.localize('GAS.Setting.Spell.Hint'),
    label: game.i18n.localize('GAS.Setting.Spell.Label'),
    icon: 'fas fa-hat-wizard',
    type: SpellSettingsButton,
    restricted: true,
  });

  game.settings.register(MODULE_ID, 'enableSpellSelection', {
    name: game.i18n.localize('GAS.Setting.EnableSpellSelection.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableSpellSelection.Hint'),
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE_ID, 'enableCustomSpellListFiltering', {
    // Backward-compatible key retained; label / hint clarify strict vs extended behavior.
    name: game.i18n.localize('GAS.Setting.EnableCustomSpellListFiltering.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableCustomSpellListFiltering.Hint'),
    scope: 'world',
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, 'customSpellLists', {
    name: game.i18n.localize('GAS.Setting.CustomSpellLists.Name'),
    hint: game.i18n.localize('GAS.Setting.CustomSpellLists.Hint'),
    scope: 'world',
    config: false,
    type: Object,
    default: [],
  });

}
