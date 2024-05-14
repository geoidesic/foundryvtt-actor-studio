import '../styles/init.scss'; // Import any styles as this includes them in the build.
import { MODULE_ID, LOG_PREFIX, DEFAULT_SOURCES, DEFAULT_PACKS } from '~/src/helpers/constants';
import PCApplication from './app/PCApplication.js';
import { userHasRightPermissions } from '~/src/helpers/Utility'

Hooks.once("ready", (app, html, data) => {
    console.log('[ >> Actor Studio Initialising... << ]');
    console.log('[ >> Actor Studio Initialised << ]');
    CONFIG.debug.hooks = true;
    
});

function addCreateNewActorButton(html, app) {
  console.info(`${LOG_PREFIX} Adding Create New Actor button`);

  const $hctButton = $(
    `<button class='dialog-button' data-hct_start>
      ${game.i18n.localize('GAS.ActorStudio')}
    </button>`,
  );

  $('button', html).after($hctButton); // added after the Create New Actor confirm button
  $hctButton.on('mousedown', function (e) {
    if (userHasRightPermissions()) {
      const heroName = $('input', html).val();
      try {
        new PCApplication(new Actor({name:heroName, type: "character"})).render(true, { focus: true })
        app.close();
      } catch (error) {
        ui.notifications.error(error.message);
      }
    }
  })
}

Hooks.on('renderApplication', (app, html, data)  => {
    
    console.log(html);
    console.log(app);

    const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
    if (app.title === createNewActorLocalized) {
      addCreateNewActorButton(html, app);
    }
})
