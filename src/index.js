import '../styles/init.scss'; // Import any styles as this includes them in the build.
import { MODULE_ID, LOG_PREFIX, DEFAULT_SOURCES, DEFAULT_PACKS } from '~/src/helpers/constants';
import PCApplication from './app/PCApplication.js';
import { userHasRightPermissions } from '~/src/helpers/Utility'
import { log } from '~/src/helpers/Utility'
window.log = log;
log.level = log.DEBUG;

Hooks.once("ready", (app, html, data) => {
    log.i('Initialising');
    CONFIG.debug.hooks = true;
    
});

function addCreateNewActorButton(html, app) {
  console.info(`${LOG_PREFIX} Adding Create New Actor button`);
  const select = $('select', html);

  function updateButton() {
    const actorType = select.val();
    if (actorType === "character") {
      if (!$('button[data-hct_start]', html).length) {
        const $hctButton = $(
          `<button class='dialog-button' data-hct_start>
            ${game.i18n.localize('GAS.ActorStudio')}
          </button>`,
        );

        $('button', html).last().after($hctButton); // Ensure button is added after the Create New Actor confirm button

        $hctButton.on('mousedown', function (e) {
          if (userHasRightPermissions()) {
            const actorName = $('input', html).val();
            try {
              new PCApplication(new Actor.implementation({name: actorName, type: actorType})).render(true, { focus: true });
              app.close();
            } catch (error) {
              ui.notifications.error(error.message);
            }
          }
        });
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

Hooks.on('renderApplication', (app, html, data)  => {
    
  log.d(html);
  log.d(app);

  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    addCreateNewActorButton(html, app);
  }
})
