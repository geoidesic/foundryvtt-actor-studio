import '../styles/Variables.scss'; // Import any styles as this includes them in the build.
import '../styles/init.scss'; // Import any styles as this includes them in the build.
import { MODULE_ID, LOG_PREFIX, DEFAULT_SOURCES, DEFAULT_PACKS } from '~/src/helpers/constants';
import PCApplication from './app/PCApplication.js';
import WelcomeApplication from './app/WelcomeApplication.js';
import { userHasRightPermissions, log, delay } from '~/src/helpers/Utility'
import { tabs, activeTab, dropItemRegistry } from '~/src/helpers/store.js';
import { writable, get, derived } from 'svelte/store';
import { registerSettings } from '~/src/settings';
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
  if(!game.settings.get(MODULE_ID, 'dontShowWelcome')){
    new WelcomeApplication().render(true, { focus: true });
  }
});

function addCreateNewActorButton(html, app) {
  log.i('Adding Create New Actor button');
  const select = $('select', html);

  function updateButton() {
    const actorType = select.val();
    if (actorType === "character") {
      if (!$('button[data-hct_start]', html).length) {
        const $hctButton = $(
          `<button type="button" class='dialog-button default bright' data-hct_start style="display: flex; align-items: center; justify-content: center; background-color: white; padding: 0; margin: 0; height: 40px;">
            <img src="modules/foundryvtt-actor-studio/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 30px; border: none; width: auto;">
          </button>`,
        );

        $('button', html).last().after($hctButton); // Ensure button is added after the Create New Actor confirm button

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

        $hctButton.on('mousedown', handleButtonClick);
        $hctButton.on('keydown', handleButtonClick);
      }
    } else {
      $('button[data-hct_start]', html).remove(); // Remove button if actorType is not "character"
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



const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

const generateUniqueId = () => `app-${Math.random().toString(36).substr(2, 9)}`;


Hooks.on('renderAdvancementManager', async (app, html, data) => {
  log.d('renderAdvancementManager')

  // Check if your application is currently open by looking for its specific DOM element
  const currentProcess = get(dropItemRegistry.currentProcess)
  log.d('app', app)
  const methods = Object.getOwnPropertyNames(app).filter(item => typeof app[item] === 'function');

  log.d('methods', methods)
  log.d('currentProcess', currentProcess)

  if (currentProcess.id && app._stepIndex === 0) {
    log.d('currentProcess', currentProcess)
    log.d(' app._stepIndex', app._stepIndex)
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
  log.d('gas.renderAdvancement')
  const currentProcess = get(dropItemRegistry.currentProcess);
  log.d('currentProcess', currentProcess)

  // Get all stored advancement apps
  if (currentProcess) {
    const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
    log.d('panelElement', panelElement)
    // Move each app's dialog to your application's content area
    // Check if the app's element is already appended
    if (!isAppElementAppended(currentProcess.id)) {
      log.d('not cuurently appended, so append app');
      const element = currentProcess.app.element
      log.d('element', element)
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
  log.d('queue', queue)
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


Hooks.on('renderSettingsConfig', (app, html ,context) => {

  log.d('renderSettingsConfig', app, html, context)
  $('[data-setting-id="foundryvtt-actor-studio.allowManualInput"]', html).before('<h3>Ability Score Entry Options</h3>')
  // $('[data-setting-id="foundryvtt-actor-studio.allowManualInput"]', html)
  // $(html).before('[data-setting-id="foundryvtt-actor-studio.allowManualInput"]').insertAdjacentHTML('beforeBegin', '<h3>Sub-header</h3>')
})