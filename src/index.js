import '../styles/Variables.scss'; // Import any styles as this includes them in the build.
import '../styles/init.scss'; // Import any styles as this includes them in the build.

import WelcomeApplication from './app/WelcomeApplication.js';
import PCApplication from './app/PCApplication.js';
import dnd5e from "~/config/systems/dnd5e.json";

import { MODULE_ID, LOG_PREFIX, DEFAULT_SOURCES, DEFAULT_PACKS } from '~/src/helpers/constants';
import { userHasRightPermissions, log, getAllPackIdsFromAllSettings } from '~/src/helpers/Utility'
import { tabs, activeTab, dropItemRegistry } from '~/src/helpers/store.js';
import { writable, get, derived } from 'svelte/store';
import { registerSettings } from '~/src/settings';
import DonationTrackerGameSettings from '~/src/settings/DonationTrackerGameSettings.js';
import { tick } from "svelte";


window.log = log;
log.level = log.DEBUG;



Hooks.once("init", (app, html, data) => {

  log.i('Initialising');
  // CONFIG.debug.hooks = true;
  registerSettings(app);


});
Hooks.once("ready", (app, html, data) => {

  if (!game.modules.get(MODULE_ID).active) {
    log.w('Module is not active');
    return;
  }
  if (!game.settings.get(MODULE_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }
  DonationTrackerGameSettings.init();
});


const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

const generateUniqueId = () => `app-${Math.random().toString(36).substr(2, 9)}`;


Hooks.on('renderAdvancementManager', async (app, html, data) => {
  // Check if your application is currently open by looking for its specific DOM element
  const currentProcess = get(dropItemRegistry.currentProcess)
  const methods = Object.getOwnPropertyNames(app).filter(item => typeof app[item] === 'function');

  if (currentProcess.id && app._stepIndex === 0) {
    const appElement = $('#foundryvtt-actor-studio-pc-sheet');
    if (appElement.length) {
      dropItemRegistry.updateCurrentProcess({ app, html, data })
      const advancementsTab = get(tabs).find(x => x.id === "advancements");
      if (advancementsTab) {
        Hooks.call("gas.renderAdvancement");
      } else {
        await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        activeTab.set('advancements');
      }
    }
  }
});

Hooks.on('gas.renderAdvancement', () => {
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
  log.d(args)
})
Hooks.on('closeAdvancementManager', async (...args) => {
  // Define a function to check if the panel is empty
  const isPanelEmpty = () => $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content').html().trim() === '';

  // Define a function to wait for the panel to become empty
  const waitForPanelEmpty = async () => {
    while (!isPanelEmpty()) {
      // Wait for a short delay before checking again
      await new Promise(resolve => setTimeout(resolve, 100)); // Adjust the delay as needed
    }
  };

  // Wait for the panel to become empty
  await waitForPanelEmpty();

  // Once the panel is empty, proceed with the drop operation
  const queue = await dropItemRegistry.advanceQueue();
  if (!queue) {
    Hooks.call("gas.close");
  }
});

// Hooks.on('dnd5e.advancementManagerComplete', (...args) => {
//   log.d(args)
//   setTimeout(() => {
//     dropItemRegistry.advanceQueue();
//   }, 5000);
// })

Hooks.on('renderSettingsConfig', (app, html, context) => {
  if(game.user.isGM) {
    $(`section[data-tab="${MODULE_ID}"] h2`, html).after(`<h3>${game.i18n.localize('GAS.Setting.World')}</h3>`)
  }
  $(`[data-setting-id="${MODULE_ID}.allowManualInput"]`, html).before(`<h4>${game.i18n.localize('GAS.Setting.AbilityScoreEntryOptions')}</h4>`)
  $(`[data-setting-id="${MODULE_ID}.dontShowWelcome"]`, html).before(`<h3>${game.i18n.localize('GAS.Setting.User')}</h3>`)
})


Hooks.on('renderCompendium', async (app, html, data) => {
  log.d('renderCompendium', app, html, data)
  if (game.settings.get(MODULE_ID, 'enable-donation-tracker')) {

    const pack = app.collection
    const allPacks = getAllPackIdsFromAllSettings();
    const actionButtons = html.find('.action-buttons')
    const DTaction = actionButtons.find('button.gas-add-dt-folders');

    // don't render the button if it already exists
    if (DTaction.length) {
      log.i('Donation Tracker button already exists, skipping')
      return;
    }

    // if the metadata.id of the pack matches any of the packs that are mapped to Actor Studio Sources, then render the DT folders button
    if (!allPacks.includes(pack.metadata.id)) {
      log.i('Pack is not mapped to Actor Studio Sources, skipping')
      ui.notifications.warn(`Pack ${pack.metadata.label} is not mapped to Actor Studio Sources. Please map it to enable the Donation Tracker feature.`)
      return;
    }

    // if the DTfolders already exist, don't render the button
    const membershipRanks = game.membership.RANKS
    for (const [rank, value] of Object.entries(membershipRanks)) {
      if (value === -1) continue;
      const folder = pack.folders.find(f => f.name === game.settings.get(MODULE_ID, `donation-tracker-rank-${rank}`))
      if (folder) {
        log.i('Donation Tracker folders already exist, skipping')
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

function getActorStudioButton() {
  const gasButton = $(
    `<button type="button" class='dialog-button default bright' data-gas_start style="display: flex; align-items: center; justify-content: center; background-color: white; padding: 0; margin: 0; height: 40px;">
      <img src="modules/${MODULE_ID}/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 30px; border: none; width: auto;">
    </button>`,
  );
  return gasButton;
}

function addCreateNewActorButton(html, app) {
  log.i('Adding Create New Actor button');
  const select = $('select', html);
  const systemActorDocumentTypes = dnd5e.actorTypes

  function updateButton() {
    const actorType = select.val();
    log.d('actorType', actorType)
    if (isActorTypeValid(systemActorDocumentTypes, actorType)) {
      if (!$('button[data-gas_start]', html).length) {
        const $gasButton = getActorStudioButton();
        log.d('html', html)
        $('button', html).last().after($gasButton); // Ensure button is added after the Create New Actor confirm button

        const handleButtonClick = function (e) {
          if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
            if (userHasRightPermissions()) {
              const actorName = $('input', html).val();
              const folderName = $('select[name="folder"]', html).val();
              log.d('actorType', actorType);
              try {
                log.d('app', app)
                log.d('app.getData()', app.getData())
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
      $('button[data-gas_start]', html).remove(); // Remove button if actorType is not "character"
    }
  }

  // Initial check
  updateButton();

  // Update button when the select value changes
  select.on('change', updateButton);
}

Hooks.on('renderApplication', (app, html, data) => {

  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    addCreateNewActorButton(html, app);
  }
})


Hooks.on('changeSidebarTab', async (app) => {
  if (!game.modules.get(MODULE_ID).active) return;
  // Add Actor Studio button to the sidebar
  if (app.constructor.name === "ActorDirectory") {
    if(!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
    const $gasButton = getActorStudioButton();
    $(app._element).find('header.directory-header').append($gasButton);

    const handleButtonClick = function (e) {
      if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
        if (userHasRightPermissions()) {
          try {
            log.d('app', app)
            log.d('app.getData()', app.getData())
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