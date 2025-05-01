import '../styles/Variables.scss'; // Import any styles as this includes them in the build.
import '../styles/init.sass'; // Import any styles as this includes them in the build.

import WelcomeApplication from './app/WelcomeApplication.js';
import PCApplication from './app/PCApplication.js';
import dnd5e from "~/config/systems/dnd5e.json";
import packageJson from '../package.json';
import manifestJson from '../module.json';

import { MODULE_ID } from '~/src/helpers/constants';
import { userHasRightPermissions, log, getAllPackIdsFromAllSettings, getDnd5eVersion, getDndRulesVersion } from '~/src/helpers/Utility'
import { tabs, activeTab, dropItemRegistry, isLevelUp, levelUpTabs, preAdvancementSelections, race, background, characterClass, characterSubClass } from '~/src/stores/index.js';
import { initLevelup } from '~/src/plugins/level-up';
import { initEquipmentPurchase } from './plugins/equipment-purchase'; // Import the new feature
import { get } from 'svelte/store';
import { registerSettings } from '~/src/settings';
import DonationTrackerGameSettings from '~/src/settings/DonationTrackerGameSettings.js';
import SubclassLevelPlugin from './plugins/subclass-level';

window.GAS = {};


Hooks.once("init", (app, html, data) => {

  window.GAS.log = log;
  log.level = log.DEBUG;
  
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
    window.GAS.background = "Compendium.dnd-players-handbook.origins.Item.phbbgFarmer00000"
    window.GAS.characterClass = "Compendium.dnd-players-handbook.classes.Item.phbwlkWarlock000"
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

});

Hooks.once("ready", (app, html, data) => {
  
  if (!game.settings.get(MODULE_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }

  if (game.settings.get(MODULE_ID, 'forceDnd5eLevelUpAutomation')) {
    game.settings.set("dnd5e", "disableAdvancements", false);
  }

  Hooks.call("gas.readyIsComplete");

  // Initialize the subclass level plugin
  SubclassLevelPlugin.init();
});

//- donation-tracker integration
Hooks.once("membershipReady", (app, html, data) => {
  const dtExists = game.modules.get('donation-tracker')?.active
  window.GAS.log.i('Checking for Donation Tracker module: ', dtExists ? 'Found' : 'Not Found');
  if (dtExists) {
    DonationTrackerGameSettings.init();
  }
});

const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

const generateUniqueId = () => `app-${Math.random().toString(36).substr(2, 9)}`;


// Helper to check if we're on first step based on version
const isFirstAdvancementStep = (app) => {
  const version = window.GAS.dnd5eVersion;
  if (version >= 4) {
    return app.steps?.[0] === app.step;
  }
  return app._stepIndex === 0;
};

// Helper to get advancement element based on version
const getAdvancementElement = (currentProcess) => {
  const version = window.GAS.dnd5eVersion;
  const rawElement = currentProcess.app?.element;
  
  if (version >= 4) {
    // v4 passes raw DOM element
    return $(rawElement);
  }
  // v3 already provides jQuery element
  return rawElement;
};

Hooks.on('renderAdvancementManager', async (app, html, data) => {

  // Check if the Actor Studio application is currently open by looking for its specific DOM element
  const currentProcess = get(dropItemRegistry.currentProcess)
  
  if (currentProcess.id && isFirstAdvancementStep(app)) {
    const appElement = $('#foundryvtt-actor-studio-pc-sheet');
    if (appElement.length) {
      const disableAdvancementCapture = game.settings.get(MODULE_ID, 'disableAdvancementCapture') || false;
      if(disableAdvancementCapture) {
        return;
      }
      dropItemRegistry.updateCurrentProcess({ app, html, data })
      const advancementsTab = get(isLevelUp) ? get(levelUpTabs).find(x => x.id === "advancements") : get(tabs).find(x => x.id === "advancements");
      // console.log('advancementsTab', advancementsTab)
      if (advancementsTab) {
        Hooks.call("gas.captureAdvancement");
      } else {
        window.GAS.log.i('Advancements tab not found, adding it to the tabs')
        // @why,- add the advancements tab to the store, which will trigger it's component to render, which will in turn call gas.captureAdvancement
        if(get(isLevelUp)) {
          await levelUpTabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        } else {
          await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        }
        activeTab.set('advancements');
      }
    }
  }
});


Hooks.on('renderCompendium', (pack, html, data ) => {
  window.GAS.log.d('renderCompendium', pack);
})
Hooks.on("renderFolderConfig", (app, html, folder) => {
  window.GAS.log.d("folder", folder);
})
Hooks.on("renderActorSheet", (app, html, actor) => {
  window.GAS.log.d("actor", actor);
})
Hooks.on("renderItemSheet5e", (app, html, item) => {
  window.GAS.log.d("item", item);
})

Hooks.on("dropActorSheetData", (actor, type, info) => {
  // window.GAS.log.d("dropActorSheetData", actor, type, info);
})

Hooks.on('gas.captureAdvancement', (initial = false) => {
  window.GAS.log.d('[gas.captureAdvancement] initial', initial)
  const skipDomMove = game.settings.get(MODULE_ID, 'disableAdvancementCapture');
  if (skipDomMove) {
    window.GAS.log.d('[gas.captureAdvancement] Dev setting: Skipping advancement DOM movement');
    return;
  }


  const currentProcess = get(dropItemRegistry.currentProcess);
  window.GAS.log.d('[gas.captureAdvancement] currentProcess in gas.captureAdvancement:', {
    id: currentProcess?.id,
    app: currentProcess?.app,
    element: currentProcess?.app?.element
  });

  // Cache initial state if this is the first capture
  if (initial) {
    preAdvancementSelections.set({
      race: get(race),
      background: get(background),
      class: get(characterClass),
      subclass: get(characterSubClass)
    });
    window.GAS.log.d('[gas.captureAdvancement] Caching initial advancement state', get(preAdvancementSelections));
  }

  if (currentProcess) {
    const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
    if (!isAppElementAppended(currentProcess.id)) {
      window.GAS.log.d(currentProcess);
      const element = getAdvancementElement(currentProcess);
      if(element) {
        element.removeClass(); // Remove all classes from the root element itself
        element.addClass('gas-advancements')
        element.attr('gas-appid', currentProcess.id);
        element.appendTo(panelElement);
      }
    }
  }
  
});

Hooks.on('dnd5e.preAdvancementManagerComplete', (...args) => {
  // window.GAS.log.d(args)
})

Hooks.on('renderSettingsConfig', (app, html, context) => {
  if (game.user.isGM) {
    $(`section[data-tab="${MODULE_ID}"] h2`, html).after(`<h3>${game.i18n.localize('GAS.Setting.World')}</h3>`)
  }
  $(`[data-setting-id="${MODULE_ID}.allowManualInput"]`, html).before(`<h4 class="gas-settings-h4">${game.i18n.localize('GAS.Setting.AbilityScoreEntryOptions')}</h4>`)
  $(`[data-setting-id="${MODULE_ID}.enableLevelUp"]`, html).before(`<h4 class="gas-settings-h4">${game.i18n.localize('GAS.Setting.LevelingOptions')}</h4>`)
  $(`[data-setting-id="${MODULE_ID}.showButtonInSideBar"]`, html).before(`<h4 class="gas-settings-h4">${game.i18n.localize('GAS.Setting.DisplayOptions')}</h4>`)
  $(`[data-setting-id="${MODULE_ID}.debug"]`, html).before(`<h4 class="gas-settings-h4">${game.i18n.localize('GAS.Setting.DebugOptions')}</h4>`)
  $(`[data-setting-id="${MODULE_ID}.dontShowWelcome"]`, html).before(`<h3>${game.i18n.localize('GAS.Setting.User')}</h3>`)
})

Hooks.on('renderCompendium', async (app, html, data) => {
  // window.GAS.log.d('renderCompendium', app, html, data)
  if (game.modules.get('donation-tracker')?.active && game.settings.get(MODULE_ID, 'enable-donation-tracker')) {

    const pack = app.collection
    if (pack.locked) return
    if (pack.metadata.path.includes('systems/')) return
    const allPacks = getAllPackIdsFromAllSettings();
    const actionButtons = html.find('.action-buttons')
    const DTaction = actionButtons.find('button.gas-add-dt-folders');

    // don't render the button if it already exists
    if (DTaction.length) {
      window.GAS.log.i('Donation Tracker button already exists, skipping')
      return;
    }

    // if the metadata.id of the pack matches any of the packs that are mapped to Actor Studio Sources, then render the DT folders button
    if (!allPacks.includes(pack.metadata.id)) {
      // @why commented out? Apparently these were annoying
      // window.GAS.log.i('Pack is not mapped to Actor Studio Sources, skipping')
      // ui.notifications.warn(`Pack ${pack.metadata.label} is not mapped to Actor Studio Sources. Please map it to enable the Donation Tracker feature.`)
      return;
    }

    // if the DTfolders already exist, don't render the button
    const membershipRanks = game.membership.RANKS
    for (const [rank, value] of Object.entries(membershipRanks)) {
      if (value === -1) continue;
      const folder = pack.folders.find(f => f.name === game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
      if (folder) {
        window.GAS.log.i('Donation Tracker folders already exist, skipping')
        return;
      }
    }

    async function addDonationTrackerFolders() {
      const membershipRanks = game.membership.RANKS
      for (const [rank, value] of Object.entries(membershipRanks)) {
        if (value === -1) continue;
        const folder = pack.folders.find(f => f.name === game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
        if (!folder) {
          // pack.folders.createDocument({ name: game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`), type: "JournalEntry" });
          const folderCls = getDocumentClass("Folder");
          // const myFolder = await folderCls.create({ name: game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`), type: "JournalEntry" });
          await folderCls.create({ name: game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`), type: "Item" }, { pack: pack.metadata.id });
        }
      }
    }

    const button = $(`<button role="button" class="gas-add-dt-folders" datatitle="${game.i18n.localize('GAS.Setting.DonationTrackerAction.Name')}" data-tooltip="${game.i18n.localize('GAS.Setting.DonationTrackerAction.Hint')}"><i class="fas fa-folder"></i> ${game.i18n.localize('GAS.Setting.DonationTrackerAction.Name')}</button>`);
    button.on('click', addDonationTrackerFolders)
    actionButtons.append(button)

  }

})

function isActorTypeValid(actorTypes, type) {
  // Check if the type exists as a key in the object and its value is true
  return actorTypes.hasOwnProperty(type) && actorTypes[type] === true;
}

function getActorStudioButton(buttonId, text=false) {
  const gasButton = $(
    `<button id="${buttonId}" type="button" class='dialog-button default bright' data-gas_start">
      <img src="modules/${MODULE_ID}/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 30px; border: none; width: auto;">
      ${text ? `<span>${text}</span>` : ''}
    </button>`,
  );
  return gasButton;
}


Hooks.on('renderApplicationV2', (app, html, data, position) => {

})


Hooks.on('renderApplication', (app, html, data) => {
  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    window.GAS.log.i('Adding Create New Actor button');

    const select = $('select', html);
    const systemActorDocumentTypes = dnd5e.actorTypes

    function updateButton() {
      const actorType = select.val();
      // window.GAS.log.d('actorType', actorType)
      if (isActorTypeValid(systemActorDocumentTypes, actorType)) {
        // disable the button if the setting is enabled
        const hideOtherButtons = !game.user.isGM && game.settings.get(MODULE_ID, 'disableOtherActorCreationOptionsForPlayers');
        const nonGmsCanOnlyCreatePCs = !game.user.isGM && game.settings.get(MODULE_ID, 'nonGmsCanOnlyCreatePCs');
        if (!game.user.isGM && hideOtherButtons) {
          $('.dialog-buttons .dialog-button:not(#gas-dialog-button)', html).hide();
        }
        if (!game.user.isGM && nonGmsCanOnlyCreatePCs) {
          $('#document-create .form-fields select', html).prop('disabled', true);
        }
        if (!$('#gas-dialog-button', html).length) {
          const $gasButton = getActorStudioButton('gas-dialog-button');
          // window.GAS.log.d('html', html)
          $('button', html).last().after($gasButton); // Ensure button is added after the Create New Actor confirm button

          const handleButtonClick = function (e) {
            if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
              if (userHasRightPermissions()) {
                //- check if Actor Studio is already open
                if (document.querySelector('#foundryvtt-actor-studio-pc-sheet')) {
                  ui.notifications.error('Actor Studio is already open and busy with another task. Please close the existing Actor Studio window before attempting to opening a new one.');
                  return;
                }
                const actorName = $('input', html).val();
                const folderName = $('select[name="folder"]', html).val();
                try {
                  new PCApplication(new Actor.implementation({ name: actorName, folder: folderName, type: actorType })).render(true, { focus: true });
                  app.close();
                } catch (error) {
                  ui.notifications.error(error.message);
                }
              }
            }
          };

          $gasButton.on('mousedown', handleButtonClick);
          $gasButton.on('keydown', handleButtonClick);

        }
        
      } else {
        $('#gas-dialog-button', html).remove(); // Remove button if actorType is not "character"
      }
    }

    // Initial check
    updateButton();

    // Update button when the select value changes
    select.on('change', updateButton);
  }
})

const handleButtonClick = function (e) {
  if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
    if (userHasRightPermissions()) {
      try {
        // new PCApplication(new Actor.implementation({ name: actorName, flags: { [MODULE_ID]: {folderName}}, type: actorType })).render(true, { focus: true });
        new PCApplication(new Actor.implementation({ name: game.user.name, folder: '', type: 'character' })).render(true, { focus: true });
        app.close();
      } catch (error) {
        ui.notifications.error(error.message);
      }
    }
  }
};

// activateDocumentDirectory
Hooks.on('activateDocumentDirectory', async (app) => {
  if(game.version > 13) {
    if (!game.modules.get(MODULE_ID)?.active) return;
    // Add Actor Studio button to the sidebar
    if (app.constructor.name === "ActorDirectory") {
      if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
      if ($('#gas-sidebar-button').length) return;
      const $gasButton = getActorStudioButton('gas-sidebar-button').addClass('v13');
      $(app.element).find('header.directory-header .header-actions').after($gasButton);
      $gasButton.on('mousedown', handleButtonClick);
      $gasButton.on('keydown', handleButtonClick);
    }
  }
})

Hooks.on('renderActorDirectory', async (app) => {
  if(game.version < 13) {
    if (!game.modules.get(MODULE_ID)?.active) return;
    // Add Actor Studio button to the sidebar
    if (app.constructor.name === "ActorDirectory") {
      if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
      if ($('#gas-sidebar-button').length) return;
      const $gasButton = getActorStudioButton('gas-sidebar-button');
      $(app._element).find('header.directory-header').append($gasButton);
      $gasButton.on('mousedown', handleButtonClick);
      $gasButton.on('keydown', handleButtonClick);
    }
  } else {
    if(game.version > 13) {
      if (!game.modules.get(MODULE_ID)?.active) return;
      // Add Actor Studio button to the sidebar
      if (app.constructor.name === "ActorDirectory") {
        if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
        if ($('#gas-sidebar-button').length) return;
        const $gasButton = getActorStudioButton('gas-sidebar-button').addClass('v13');
        $(app.element).find('header.directory-header .header-actions').after($gasButton);
        $gasButton.on('mousedown', handleButtonClick);
        $gasButton.on('keydown', handleButtonClick);
      }
    }
  }
})
