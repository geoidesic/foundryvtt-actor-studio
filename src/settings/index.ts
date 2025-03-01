import CompendiumSourcesSubmenu from './compendiumSourcesSubmenu';
import DonationTrackerSettingsButton from './DonationTrackerSettingsButton';
import { MODULE_ID, LOG_PREFIX, DEFAULT_SOURCES } from '../helpers/constants';

// settings not shown on the Module Settings - not modifiable by users
export const enum PrivateSettingKeys {
  LAST_MIGRATION = 'lastMigration',
}

export function registerSettings(app: Game): void {
  window.GAS.log.d("Building module settings");

  Handlebars.registerHelper('checkedIf', function (condition) {
    return condition ? 'checked' : '';
  });

  /**  Disabled settings */
  // defaultStartingGoldDice();
  // showRollsAsChatMessages();
  // individualPanelScrolls();
  // tokenDisplayNameMode();
  // tokenDisplayBarsMode();
  // equipmentBlacklist();
  // subraceNameBlacklist();
  // buttonOnDialogInsteadOfActorsDirectory();
  // trimSubclasses();
  // custom packs
  // integrations
  // useTokenizerIfAvailable();
  // private settings
  // lastMigration();
  // abilityScoreMethods();


  /** World Settings */
  sourcesConfiguration();
  donationTracker();
  allowManualInput();
  allowStandardArray();
  allowPointBuy();
  pointBuyLimit();
  allowRolling(app);
  abilityRollFormula();
  allowAbilityRollScoresToBeMoved();
  showButtonInSideBar(app);
  disableOtherActorCreationOptionsForPlayers();
  nonGmsCanOnlyCreatePCs();
  filterPackSourcesAppropriatelyByName();
  showPackLabelInSelect();
  illuminatedDescription();
  illuminatedHeight();
  illuminatedWidth();
  enableEquipmentSelection();
  showPackLabelInSelect();
  windowX();
  windowY();
  enableLevelUp();
  milestoneLeveling();
  forceDnd5eLevelUpAutomation();
  debugSetting();
  debugHooksSetting();

  /** User settings */
  dontShowWelcome();
  disableAdvancementCapture();
}

function illuminatedHeight() {
  game.settings.register(MODULE_ID, 'illuminatedHeight', {
    name: game.i18n.localize('GAS.Setting.illuminatedHeight.Name'),
    hint: game.i18n.localize('GAS.Setting.illuminatedHeight.Hint'),
    scope: 'world',
    config: true,
    default: '64px',
    type: String,
  });
}
function illuminatedWidth() {
  game.settings.register(MODULE_ID, 'illuminatedWidth', {
    name: game.i18n.localize('GAS.Setting.illuminatedWidth.Name'),
    hint: game.i18n.localize('GAS.Setting.illuminatedWidth.Hint'),
    scope: 'world',
    config: true,
    default: '64px',
    type: String,
  });
}

export function filterPackSourcesAppropriatelyByName() {
  game.settings.register(MODULE_ID, 'filterPackSourcesAppropriatelyByName', {
    name: game.i18n.localize('GAS.Setting.FilterPackSourcesAppropriatelyByName.Name'),
    hint: game.i18n.localize('GAS.Setting.FilterPackSourcesAppropriatelyByName.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}

export function illuminatedDescription() {
  game.settings.register(MODULE_ID, 'illuminatedDescription', {
    name: game.i18n.localize('GAS.Setting.illuminatedDescription.Name'),
    hint: game.i18n.localize('GAS.Setting.illuminatedDescription.Hint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}

function allowAbilityRollScoresToBeMoved() {
  game.settings.register(MODULE_ID, 'allowAbilityRollScoresToBeMoved', {
    name: game.i18n.localize('GAS.Setting.AllowAbilityRollScoresToBeMoved.Name'),
    hint: game.i18n.localize('GAS.Setting.AllowAbilityRollScoresToBeMoved.Hint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}

function enableLevelUp() {
  game.settings.register(MODULE_ID, 'enableLevelUp', {
    name: game.i18n.localize('GAS.Setting.EnableLevelUp.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableLevelUp.Hint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}

function showPackLabelInSelect() {
  game.settings.register(MODULE_ID, 'showPackLabelInSelect', {
    name: game.i18n.localize('GAS.Setting.ShowPackLabelInSelect.Name'),
    hint: game.i18n.localize('GAS.Setting.ShowPackLabelInSelect.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}


function nonGmsCanOnlyCreatePCs() {
  game.settings.register(MODULE_ID, 'nonGmsCanOnlyCreatePCs', {
    name: game.i18n.localize('GAS.Setting.NonGmsCanOnlyCreatePCs.Name'),
    hint: game.i18n.localize('GAS.Setting.NonGmsCanOnlyCreatePCs.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
}
function disableOtherActorCreationOptionsForPlayers() {
  game.settings.register(MODULE_ID, 'disableOtherActorCreationOptionsForPlayers', {
    name: game.i18n.localize('GAS.Setting.DisableOtherActorCreationOptionsForPlayers.Name'),
    hint: game.i18n.localize('GAS.Setting.DisableOtherActorCreationOptionsForPlayers.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });
}

function disableAdvancementCapture() {
  game.settings.register(MODULE_ID, 'devDisableAdvancementMove', {
    name: game.i18n.localize('GAS.Setting.DisableAdvancementMove.Name'),
    hint: game.i18n.localize('GAS.Setting.DisableAdvancementMove.Hint'),
    scope: 'user',
    config: true,
    type: Boolean,
    default: false
  });
}

function sourcesConfiguration() {
  game.settings.register(MODULE_ID, 'compendiumSources', {
    scope: 'world',
    config: false,
    type: Object,
    default: DEFAULT_SOURCES,
  });
  // Define a settings submenu which handles advanced configuration needs
  game.settings.registerMenu(MODULE_ID, 'compendiumSources', {
    name: game.i18n.localize('GAS.Setting.Sources.Name'),
    hint: game.i18n.localize('GAS.Setting.Sources.Hint'),
    label: game.i18n.localize('GAS.Setting.Sources.Label'),
    icon: 'fas fa-atlas',
    type: CompendiumSourcesSubmenu,
    restricted: true,
  });
}

function equipmentBlacklist() {
  game.settings.register(MODULE_ID, 'equipmentsBlackList', {
    name: game.i18n.localize('GAS.Setting.EquipmentBlacklist.Name'),
    hint: game.i18n.localize('GAS.Setting.EquipmentBlacklist.Hint'),
    scope: 'world',
    config: true,
    default:
      'Potion of Climbing; Potion of Healing; Spell Scroll 1st Level; Spell Scroll Cantrip Level; Unarmed Strike',
    type: String,
  });
}

function subraceNameBlacklist() {
  game.settings.register(MODULE_ID, 'subracesBlacklist', {
    name: game.i18n.localize('GAS.Setting.SubraceNameBlacklist.Name'),
    hint: game.i18n.localize('GAS.Setting.SubraceNameBlacklist.Hint'),
    scope: 'world',
    config: true,
    default: 'Gnome Cunning; Halfling Nimbleness',
    type: String,
  });
}

function trimSubclasses() {
  game.settings.register(MODULE_ID, 'trimSubclasses', {
    name: game.i18n.localize('GAS.Setting.TrimSubclasses.Name'),
    hint: game.i18n.localize('GAS.Setting.TrimSubclasses.Hint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}

function milestoneLeveling() {
  game.settings.register(MODULE_ID, 'milestoneLeveling', {
    name: game.i18n.localize('GAS.Setting.milestoneLeveling.Name'),
    hint: game.i18n.localize('GAS.Setting.milestoneLeveling.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}

function forceDnd5eLevelUpAutomation() {
  game.settings.register(MODULE_ID, 'forceDnd5eLevelUpAutomation', {
    name: game.i18n.localize('GAS.Setting.forceDnd5eLevelUpAutomation.Name'),
    hint: game.i18n.localize('GAS.Setting.forceDnd5eLevelUpAutomation.Hint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}

function dontShowWelcome() {
  game.settings.register(MODULE_ID, 'dontShowWelcome', {
    name: game.i18n.localize('GAS.Setting.DontShowWelcome.Name'),
    hint: game.i18n.localize('GAS.Setting.DontShowWelcome.Hint'),
    scope: 'user',
    config: true,
    default: false,
    type: Boolean,
  });
}

function defaultStartingGoldDice() {
  game.settings.register(MODULE_ID, 'defaultGoldDice', {
    name: game.i18n.localize('GAS.Setting.DefaultGoldDice.Name'),
    hint: game.i18n.localize('GAS.Setting.DefaultGoldDice.Hint'),
    scope: 'world',
    config: true,
    default: '5d4 * 10',
    type: String,
  });
}

function useTokenizerIfAvailable() {
  game.settings.register(MODULE_ID, 'useTokenizer', {
    name: game.i18n.localize('GAS.Setting.UseTokenizer.Name'),
    hint: game.i18n.localize('GAS.Setting.UseTokenizer.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
}

function buttonOnDialogInsteadOfActorsDirectory() {
  game.settings.register(MODULE_ID, 'buttonOnDialog', {
    name: game.i18n.localize('GAS.Setting.ButtonOnDialogInsteadOfActorsDirectory.Name'),
    hint: game.i18n.localize('GAS.Setting.ButtonOnDialogInsteadOfActorsDirectory.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
}

function tokenDisplayBarsMode() {
  game.settings.register(MODULE_ID, 'displayBarsMode', {
    name: game.i18n.localize('GAS.Setting.TokenBarMode.Name'),
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      0: 'Never Displayed',
      10: 'When Controlled',
      20: 'Hover by Owner',
      30: 'Hover by Anyone',
      40: 'Always for Owner',
      50: 'Always for Anyone',
    },
    default: 20,
  });
}

function tokenDisplayNameMode() {
  game.settings.register(MODULE_ID, 'displayNameMode', {
    name: game.i18n.localize('GAS.Setting.TokenNameMode.Name'),
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      0: 'Never Displayed',
      10: 'When Controlled',
      20: 'Hover by Owner',
      30: 'Hover by Anyone',
      40: 'Always for Owner',
      50: 'Always for Anyone',
    },
    default: 20,
  });
}

function showRollsAsChatMessages() {
  game.settings.register(MODULE_ID, 'showRolls', {
    name: game.i18n.localize('GAS.Setting.ShowRolls.Name'),
    hint: game.i18n.localize('GAS.Setting.ShowRolls.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
}

function individualPanelScrolls() {
  game.settings.register(MODULE_ID, 'individualScrolls', {
    name: game.i18n.localize('GAS.Setting.IndividualPanelScroll.Name'),
    hint: game.i18n.localize('GAS.Setting.IndividualPanelScroll.Hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
  });
}


function pointBuyLimit() {
  game.settings.register(MODULE_ID, 'pointBuyLimit', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.PointBuyLimit.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.PointBuyLimit.Hint'),
    scope: 'world',
    config: true,
    default: 27,
    type: Number,
  });
}
function windowX() {
  game.settings.register(MODULE_ID, 'windowX', {
    name: game.i18n.localize('GAS.Setting.WindowX.Name'),
    hint: game.i18n.localize('GAS.Setting.WindowX.Hint'),
    scope: 'world',
    config: true,
    default: 700,
    type: Number,
  });
}
function windowY() {
  game.settings.register(MODULE_ID, 'windowY', {
    name: game.i18n.localize('GAS.Setting.WindowY.Name'),
    hint: game.i18n.localize('GAS.Setting.WindowY.Hint'),
    scope: 'world',
    config: true,
    default: 800,
    type: Number,
  });
}

function abilityRollFormula() {
  game.settings.register(MODULE_ID, 'abiiltyRollFormula', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AbilityRollFormula.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AbilityRollFormula.Hint'),
    scope: 'world',
    config: true,
    default: '4d6kh3',
    type: String,
    onChange: () => { console.log('allowPointBuy') },
    updateSetting: () => { console.log('updateSetting'); },
  });
}


function allowManualInput() {
  game.settings.register(MODULE_ID, 'allowManualInput', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowManualInput.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowManualInput.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
}

function allowStandardArray() {
  game.settings.register(MODULE_ID, 'allowStandardArray', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowStandardArray.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowStandardArray.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}

function allowPointBuy() {
  game.settings.register(MODULE_ID, 'allowPointBuy', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowPointBuy.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowPointBuy.Hint'),
    scope: 'world',
    config: true,
    default: false,
    onChange: () => { console.log('allowPointBuy') },
    updateSetting: () => { console.log('updateSetting'); },
    type: Boolean,
  });
}

function allowRolling(app) {
  game.settings.register(MODULE_ID, 'allowRolling', {
    name: game.i18n.localize('GAS.Setting.AbilityEntry.AllowRolling.Name'),
    hint: game.i18n.localize('GAS.Setting.AbilityEntry.AllowRolling.Hint'),
    scope: 'world',
    config: true,
    default: false,
    onChange: () => { console.log('allowPointBuy') },
    updateSetting: () => { console.log('updateSetting'); },
    type: Boolean,
  });
}

function showButtonInSideBar(app) {
  game.settings.register(MODULE_ID, 'showButtonInSideBar', {
    name: game.i18n.localize('GAS.Setting.showButtonInSideBar.Name'),
    hint: game.i18n.localize('GAS.Setting.showButtonInSideBar.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}
function debugSetting() {
  game.settings.register(MODULE_ID, 'debug', {
    name: game.i18n.localize('GAS.Setting.debug.Name'),
    hint: game.i18n.localize('GAS.Setting.debug.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}
function debugHooksSetting() {
  game.settings.register(MODULE_ID, 'debug.hooks', {
    name: game.i18n.localize('GAS.Setting.debugHooks.Name'),
    hint: game.i18n.localize('GAS.Setting.debugHooks.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}

function donationTracker() {
  if (!game.modules.get('donation-tracker')?.active) return;

  Hooks.on('actor-studio-donation-tracker:settings', () => {
    if (game.user.isGM) { DonationTrackerSettingsButton.showSettings(); }
  });

  game.settings.registerMenu(MODULE_ID, 'DonationTracker', {
    name: game.i18n.localize('GAS.Setting.DonationTracker.Name'),
    hint: game.i18n.localize('GAS.Setting.DonationTracker.Hint'),
    label: game.i18n.localize('GAS.Setting.DonationTracker.Label'),
    icon: 'fas fa-coins',
    type: DonationTrackerSettingsButton,
    restricted: true,
    onChange: () => {
      Hooks.call('actor-studio-donation-tracker:settings');
    }
  });

}

// PRIVATE SETTINGS

function lastMigration() {
  game.settings.register(MODULE_ID, PrivateSettingKeys.LAST_MIGRATION, {
    scope: 'world',
    config: false,
    default: 0,
    type: Number,
  });
}

function enableEquipmentSelection() {
  game.settings.register(MODULE_ID, 'enableEquipmentSelection', {
    name: game.i18n.localize('GAS.Setting.EnableEquipmentSelection.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableEquipmentSelection.Hint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
}
