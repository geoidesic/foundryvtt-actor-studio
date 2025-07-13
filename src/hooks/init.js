import { MODULE_ID } from '~/src/helpers/constants';
import { initLevelup } from '~/src/plugins/level-up';
import { registerSettings } from '~/src/settings';
import { initEquipmentPurchase } from '~/src/plugins/equipment-purchase'; 
import { log, getDnd5eVersion, getDndRulesVersion } from '~/src/helpers/Utility'
import SubclassLevelPlugin from '~/src//plugins/subclass-level';
import WelcomeApplication from '~/src/app/WelcomeApplication.js';
import packageJson from '../../package.json';
import manifestJson from '../../module.json';


window.GAS = window.GAS || {};

export const init = (app, html, data) => {

  window.GAS.log = log;
  window.GAS.log.level = log.VERBOSE;
  
  
  window.GAS.dnd5eVersion = getDnd5eVersion();
  window.GAS.dnd5eRules = getDndRulesVersion();

  if(game.version > 13) {
    // V12 -> 13 SHIM
    window.MIN_WINDOW_WIDTH = 200;
    window.MIN_WINDOW_HEIGHT = 50;
  }

  //- these settings are for debugging / testing purposes only
  if(packageJson.debug) {
    window.GAS.debug = true;
    window.GAS.race = "Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000"
    window.GAS.background = "Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000"
    // window.GAS.characterClass = "Compendium.dnd-players-handbook.classes.Item.phbbrbBarbarian0"
    window.GAS.characterClass = "Compendium.dnd-players-handbook.classes.Item.phbbrdBard000000"
    // window.GAS.background = "Compendium.dnd-players-handbook.origins.Item.phbbgFarmer00000"
    // window.GAS.characterClass = "Compendium.dnd-players-handbook.classes.Item.phbwlkWarlock000"

    // window.GAS.characterSubClass = "Compendium.dnd-players-handbook.classes.Item.phbwlkCelestialP"
  }
  
  window.GAS.log.i(`Starting System ${MODULE_ID}`);
  window.GAS.log.i('Initialising for foundry version:', game.version);
  window.GAS.log.i('Initialising module manifest version:', manifestJson.version);
  window.GAS.log.i('Initialising module package version:', packageJson.version);
  window.GAS.log.i('Initialising game module version:', game.modules.get(MODULE_ID).version);

  initLevelup();
  registerSettings(app);
  initEquipmentPurchase(); // Initialize the new feature
 
 
  if(game.settings.get(MODULE_ID, 'debug')) {
    log.level = log.VERBOSE;
  } else {
    log.level = log.INFO;
  }

  if(game.settings.get(MODULE_ID, 'debug.hooks')) {
    CONFIG.debug.hooks = true;
  }

  window.GAS.log.d('Debug mode is', game.settings.get(MODULE_ID, 'debug') ? 'enabled' : 'disabled');
  window.GAS.log.d('Debug extended mode is', game.settings.get(MODULE_ID, 'debug.hooks') ? 'enabled' : 'disabled');
  window.GAS.log.d('Log level: ',log.level)

  Hooks.call("gas.initIsComplete");

}

export const ready = (app, html, data) => {
  if (!game.settings.get(MODULE_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }

  if (game.settings.get(MODULE_ID, 'forceDnd5eLevelUpAutomation')) {
    game.settings.set("dnd5e", "disableAdvancements", false);
  }

  Hooks.call("gas.readyIsComplete");

  // Initialize the subclass level plugin
  SubclassLevelPlugin.init();
}

export default {
  init,
  ready
}