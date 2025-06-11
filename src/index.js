import '../styles/Variables.scss'; // Import any styles as this includes them in the build.
import '../styles/init.sass'; // Import any styles as this includes them in the build.

import { MODULE_ID } from '~/src/helpers/constants';

import DonationTrackerGameSettings from '~/src/settings/DonationTrackerGameSettings.js';


//- import hooks
import { init, ready } from './hooks/init.js';
import { captureAdvancement } from './hooks/captureAdvancement.js';
import { renderAdvancementManager } from './hooks/advancementManager.js';
import { renderCompendium } from './hooks/renderCompendium.js';
import { renderASButtonInCreateActorApplication, activateDocumentDirectory, renderActorDirectory } from './hooks/actorStudioStartButtons.js';
import { openActorStudio } from './hooks/actorStudioStartButtons.js';

Hooks.once("init", (app, html, data) => {
  init(app, html, data);
});

Hooks.once("ready", (app, html, data) => {
  ready(app, html, data);
});

Hooks.on('gas.captureAdvancement', (initial = false) => {
  captureAdvancement(initial);
});

//- donation-tracker integration
Hooks.once("membershipReady", (app, html, data) => {
  const dtExists = game.modules.get('donation-tracker')?.active
  window.GAS.log.i('Checking for Donation Tracker module: ', dtExists ? 'Found' : 'Not Found');
  if (dtExists) {
    DonationTrackerGameSettings.init();
  }
});


Hooks.on('renderAdvancementManager', async (app, html, data) => {
  renderAdvancementManager(app, html, data);
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
  renderCompendium(app, html, data);
})


//- game.version < 13
Hooks.on('renderApplication', (app, html, data) => {
  Hooks.call('gas.renderASButtonInCreateActorApplication', app, html, data);
});

//- game.version >= 13
Hooks.on('renderApplicationV2', (app, html, data) => {
  Hooks.call('gas.renderASButtonInCreateActorApplication', app, html, data);
});

//- Add Actor Studio button to the Create New Actor dialog
Hooks.on('gas.renderASButtonInCreateActorApplication', (app, html, data) => {
  renderASButtonInCreateActorApplication(app, html, data);
})

//- Add Actor Studio button to the Actor Directory in game.version >= 13
Hooks.on('activateDocumentDirectory', async (app) => {
  activateDocumentDirectory(app);
})
//- Add Actor Studio button to the Actor Directory in game.version < 13
Hooks.on('renderActorDirectory', async (app) => {
  renderActorDirectory(app);
})

Hooks.on('gas.openActorStudio', (actorName, folderName, actorType) => {
  openActorStudio(actorName, folderName, actorType);
});
