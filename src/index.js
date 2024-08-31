import '../styles/Variables.scss'; // Import any styles as this includes them in the build.
import '../styles/init.sass'; // Import any styles as this includes them in the build.

import WelcomeApplication from './app/WelcomeApplication.js';
import PCApplication from './app/PCApplication.js';
import dnd5e from "~/config/systems/dnd5e.json";
import packageJson from '../package.json';
import manifestJson from '../module.json';

import { MODULE_ID } from '~/src/helpers/constants';
import { userHasRightPermissions, log, getAllPackIdsFromAllSettings } from '~/src/helpers/Utility'
import { tabs, activeTab, dropItemRegistry, isLevelUp, levelUpTabs } from '~/src/helpers/store.js';
import { initLevelup } from '~/src/plugins/level-up';
import { get } from 'svelte/store';
import { registerSettings } from '~/src/settings';
import DonationTrackerGameSettings from '~/src/settings/DonationTrackerGameSettings.js';



Hooks.once("init", (app, html, data) => {

  game.system.log = log;
  log.level = log.DEBUG;

  game.system.log.i(`Starting System ${MODULE_ID}`);
  game.system.log.i('Initialising for foundry version:', game.version);
  game.system.log.i('Initialising module manifest version:', manifestJson.version);
  game.system.log.i('Initialising module package version:', packageJson.version);
  game.system.log.i('Initialising game module version:', game.modules.get(MODULE_ID).version);

  initLevelup();
  registerSettings(app);
  
  if(game.settings.get(MODULE_ID, 'debug')) {
    log.level = log.VERBOSE;
  } else {
    log.level = log.INFO;
  }

  if(game.settings.get(MODULE_ID, 'debug.hooks')) {
    CONFIG.debug.hooks = true;
  }

  game.system.log.d('Debug mode is', game.settings.get(MODULE_ID, 'debug') ? 'enabled' : 'disabled');
  game.system.log.d('Debug extended mode is', game.settings.get(MODULE_ID, 'debug.hooks') ? 'enabled' : 'disabled');
  game.system.log.d('Log level: ',log.level)

  Hooks.call("gas.initIsComplete");

});

Hooks.once("ready", (app, html, data) => {
  
  if (!game.settings.get(MODULE_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }

  Hooks.call("gas.readyIsComplete");
});

//- donation-tracker integration
Hooks.once("membershipReady", (app, html, data) => {
  const dtExists = game.modules.get('donation-tracker')?.active
  game.system.log.i('Checking for Donation Tracker module: ', dtExists ? 'Found' : 'Not Found');
  if (dtExists) {
    DonationTrackerGameSettings.init();
  }
  if (game.settings.get(MODULE_ID, 'forceDnd5eLevelUpAutomation')) {
    game.settings.set("dnd5e", "disableAdvancements", false);
  }
});

const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

const generateUniqueId = () => `app-${Math.random().toString(36).substr(2, 9)}`;


Hooks.on('renderAdvancementManager', async (app, html, data) => {
  // game.system.log.d('renderAdvancementManager')
  // Check if your application is currently open by looking for its specific DOM element
  const currentProcess = get(dropItemRegistry.currentProcess)
  // const methods = Object.getOwnPropertyNames(app).filter(item => typeof app[item] === 'function');

  // game.system.log.d('currentProcess', currentProcess)
  // game.system.log.d('app._stepIndex', app._stepIndex)

  if (currentProcess.id && app._stepIndex === 0) {
    const appElement = $('#foundryvtt-actor-studio-pc-sheet');
    if (appElement.length) {
      dropItemRegistry.updateCurrentProcess({ app, html, data })
      const advancementsTab = get(isLevelUp) ? get(levelUpTabs).find(x => x.id === "advancements") : get(tabs).find(x => x.id === "advancements");
      // console.log('advancementsTab', advancementsTab)
      if (advancementsTab) {
        Hooks.call("gas.renderAdvancement");
      } else {
        game.system.log.i('Advancements tab not found, adding it to the tabs')
        // @why,- add the advancements tab to the store, which will trigger it's component to render, which will in turn call gas.renderAdvancement
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

Hooks.on("renderActorSheet", (app, html, actor) => {
  // game.system.log.d("actor", actor);
})
Hooks.on("renderItemSheet5e", (app, html, item) => {
  // game.system.log.d("item", item);
})

Hooks.on("dropActorSheetData", (actor, type, info) => {
  // game.system.log.d("dropActorSheetData", actor, type, info);
})

Hooks.on('gas.renderAdvancement', () => {
  // game.system.log.d('gas.renderAdvancement')
  // game.system.log.d('Advancements tab found, rendering the advancment workflow')

  const currentProcess = get(dropItemRegistry.currentProcess);
  // Get all stored advancement apps
  if (currentProcess) {
    const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
    // Move each app's dialog to your application's content area
    // Check if the app's element is already appended
    if (!isAppElementAppended(currentProcess.id)) {
      const element = currentProcess.app.element
      element.removeClass(); // Remove all classes from the root element itself
      element.addClass('gas-advancements')
      element.attr('gas-appid', currentProcess.id);
      // Move each app's dialog to your application's content area
      element.appendTo(panelElement);
    }
  }
});

Hooks.on('dnd5e.preAdvancementManagerComplete', (...args) => {
  // game.system.log.d(args)
})

Hooks.on('closeAdvancementManager', async (...args) => {
  // Define a function to check if the panel is empty
  const isPanelEmpty = () => $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content')?.html()?.trim() === '';
  // Define a function to wait for the panel to become empty
  const waitForPanelEmpty = async () => {
    while (!isPanelEmpty()) {
      // Wait for a short delay before checking again
      await new Promise(resolve => setTimeout(resolve, 100)); // Adjust the delay as needed
    }
  };

  // Wait for the panel to become empty
  await waitForPanelEmpty();


  // Once the panel is empty, proceed with the queue
  const queue = await dropItemRegistry.advanceQueue();
  // game.system.log.d('closeAdvancementManager queue', queue)
  if (!queue) {
    Hooks.call("gas.close");
  }
});

Hooks.on('renderSettingsConfig', (app, html, context) => {
  if (game.user.isGM) {
    $(`section[data-tab="${MODULE_ID}"] h2`, html).after(`<h3>${game.i18n.localize('GAS.Setting.World')}</h3>`)
  }
  $(`[data-setting-id="${MODULE_ID}.allowManualInput"]`, html).before(`<h4>${game.i18n.localize('GAS.Setting.AbilityScoreEntryOptions')}</h4>`)
  $(`[data-setting-id="${MODULE_ID}.dontShowWelcome"]`, html).before(`<h3>${game.i18n.localize('GAS.Setting.User')}</h3>`)
})


Hooks.on('renderCompendium', async (app, html, data) => {
  // game.system.log.d('renderCompendium', app, html, data)
  if (game.modules.get('donation-tracker')?.active && game.settings.get(MODULE_ID, 'enable-donation-tracker')) {

    const pack = app.collection
    if (pack.locked) return
    if (pack.metadata.path.includes('systems/')) return
    const allPacks = getAllPackIdsFromAllSettings();
    const actionButtons = html.find('.action-buttons')
    const DTaction = actionButtons.find('button.gas-add-dt-folders');

    // don't render the button if it already exists
    if (DTaction.length) {
      game.system.log.i('Donation Tracker button already exists, skipping')
      return;
    }

    // if the metadata.id of the pack matches any of the packs that are mapped to Actor Studio Sources, then render the DT folders button
    if (!allPacks.includes(pack.metadata.id)) {
      // @why commented out? Apparently these were annoying
      // game.system.log.i('Pack is not mapped to Actor Studio Sources, skipping')
      // ui.notifications.warn(`Pack ${pack.metadata.label} is not mapped to Actor Studio Sources. Please map it to enable the Donation Tracker feature.`)
      return;
    }

    // if the DTfolders already exist, don't render the button
    const membershipRanks = game.membership.RANKS
    for (const [rank, value] of Object.entries(membershipRanks)) {
      if (value === -1) continue;
      const folder = pack.folders.find(f => f.name === game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
      if (folder) {
        game.system.log.i('Donation Tracker folders already exist, skipping')
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

function getActorStudioButton(buttonId) {
  const gasButton = $(
    `<button id="${buttonId}" type="button" class='dialog-button default bright' data-gas_start style="display: flex; align-items: center; justify-content: center; background-color: white; padding: 0; margin: 0; height: 40px;">
      <img src="modules/${MODULE_ID}/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 30px; border: none; width: auto;">
    </button>`,
  );
  return gasButton;
}



Hooks.on('renderApplication', (app, html, data) => {
  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    game.system.log.i('Adding Create New Actor button');

    const select = $('select', html);
    const systemActorDocumentTypes = dnd5e.actorTypes

    function updateButton() {
      const actorType = select.val();
      // game.system.log.d('actorType', actorType)
      if (isActorTypeValid(systemActorDocumentTypes, actorType)) {
        if (!$('#gas-dialog-button', html).length) {
          const $gasButton = getActorStudioButton('gas-dialog-button');
          // game.system.log.d('html', html)
          $('button', html).last().after($gasButton); // Ensure button is added after the Create New Actor confirm button

          const handleButtonClick = function (e) {
            if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
              if (userHasRightPermissions()) {
                const actorName = $('input', html).val();
                const folderName = $('select[name="folder"]', html).val();
                // game.system.log.d('actorType', actorType);
                try {
                  // new PCApplication(new Actor.implementation({ name: actorName, flags: { [MODULE_ID]: {folderName}}, type: actorType })).render(true, { focus: true });
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


Hooks.on('renderActorDirectory', async (app) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  // Add Actor Studio button to the sidebar
  if (app.constructor.name === "ActorDirectory") {
    if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
    if ($('#gas-sidebar-button').length) return;
    const $gasButton = getActorStudioButton('gas-sidebar-button');
    $(app._element).find('header.directory-header').append($gasButton);

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

    $gasButton.on('mousedown', handleButtonClick);
    $gasButton.on('keydown', handleButtonClick);
  }
})