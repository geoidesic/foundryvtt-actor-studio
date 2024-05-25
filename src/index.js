import '../styles/Variables.scss'; // Import any styles as this includes them in the build.
import '../styles/init.scss'; // Import any styles as this includes them in the build.
import { MODULE_ID, LOG_PREFIX, DEFAULT_SOURCES, DEFAULT_PACKS } from '~/src/helpers/constants';
import PCApplication from './app/PCApplication.js';
import { userHasRightPermissions, log } from '~/src/helpers/Utility'
import { tabs, activeTab, advancementApp } from '~/src/helpers/store.js';
import { writable, get, derived } from 'svelte/store';;

window.log = log;
log.level = log.DEBUG;

Hooks.once("ready", (app, html, data) => {
  log.i('Initialising');
  // CONFIG.debug.hooks = true;
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
            log.d('html', html);
            if (userHasRightPermissions()) {
              const actorName = $('input', html).val();
              log.d('actorType', actorType);
              try {
                new PCApplication(new Actor.implementation({ name: actorName, type: actorType })).render(true, { focus: true });
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

function stripClasses(element) {
  element.find('*').removeClass(); // Remove all classes from all descendants
  element.removeClass(); // Remove all classes from the element itself
}

function stripRootClasses(element) {
  element.removeClass(); // Remove all classes from the root element itself
  element.addClass('gas-advancements')
}

Hooks.on('renderAdvancementManager', async (app, html, data) => {
  // Check if your application is currently open by looking for its specific DOM element
  const appElement = $('#foundryvtt-actor-studio-pc-sheet');
  if (appElement.length) {
    // stripClasses(html);
    log.d('html', html)
    log.d('app', app)
    stripRootClasses(html);

    const unsubscribe = tabs.subscribe(async (obj) => {

      if (!obj.find(x => x.id === "advancements")) {
        await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        activeTab.set('advancements');
      }
    })

    advancementApp.set({ app, html, data });



    unsubscribe();


  }
});


Hooks.on('gas.renderAdvancement', () => {
  const {app, html, data} = get(advancementApp);
  if (app) {
    const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
    // Move the dialog to your application's content area
    app.element.appendTo(panelElement);


    // Modify the application properties
   
  }
})
