import '../styles/Variables.sass'; // Import any styles as this includes them in the build.
import '../styles/init.sass'; // Import any styles as this includes them in the build.

import { MODULE_ID } from '~/src/helpers/constants';

import DonationTrackerGameSettings from '~/src/settings/DonationTrackerGameSettings.js';

// Import usage tracking
import UsageTracker from '~/src/usage-tracking.js';


//- import hooks
import { init, ready } from './hooks/init.js';
import { captureAdvancement } from './hooks/captureAdvancement.js';
import { renderAdvancementManager } from './hooks/advancementManager.js';
import { renderCompendium } from './hooks/renderCompendium.js';
import { renderASButtonInCreateActorApplication, renderActorStudioSidebarButton, cleanupAllEventHandlers, cleanupEventHandlers } from './hooks/actorStudioStartButtons.js';
import { openActorStudio } from './hooks/actorStudioStartButtons.js';
import { renderNPCStudioSidebarButton, renderASButtonInCreateNPCApplication, openNPCStudio } from './hooks/actorStudioNPCStartButtons.js';

Hooks.once("init", (app, html, data) => {
  init(app, html, data);
});

Hooks.once("ready", (app, html, data) => {
  ready(app, html, data);
  
  // Only send the first usage tracking event (module_loaded or session_start)
  if (window.GASUsageTracker && !window.GASUsageTracker._hasTrackedFirstEvent) {
    window.GASUsageTracker.initialize(); // This will send module_loaded
    window.GASUsageTracker._hasTrackedFirstEvent = true;
    // Do NOT call trackSessionStart here, as initialize() already tracks module_loaded
  }
});

// Clean up event handlers when module is disabled
Hooks.once("disableModule", (module) => {
  if (module.id === MODULE_ID) {
    cleanupAllEventHandlers();
  }
});

// Clean up event handlers when module is unloaded
Hooks.once("unloadModule", (module) => {
  if (module.id === MODULE_ID) {
    cleanupAllEventHandlers();
    
    // Track session end
    if (window.GASUsageTracker) {
      window.GASUsageTracker.trackSessionEnd();
    }
  }
});

Hooks.on('gas.captureAdvancement', (initial = false) => {
  captureAdvancement(initial);
  
  // Track advancement capture
  if (window.GASUsageTracker) {
    window.GASUsageTracker.trackAdvancementCapture(initial);
  }
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


/** 
 * Handle rendering the Actor Studio button in the Create New Actor dialog
 */
//- game.version < 13
Hooks.on('renderApplication', (app, html, data) => {
  renderASButtonInCreateActorApplication(app, html, data);
  if (game.settings.get(MODULE_ID, 'enableNPCCreation')) renderASButtonInCreateNPCApplication(app, html, data);
});

//- game.version >= 13
Hooks.on('renderApplicationV2', (app, html, data) => {
  renderASButtonInCreateActorApplication(app, html, data);
  if (game.settings.get(MODULE_ID, 'enableNPCCreation')) renderASButtonInCreateNPCApplication(app, html, data);
});

// Clean up event handlers when dialogs are closed
Hooks.on('closeApplication', (app) => {
  if (app.title === game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') })) {
    const dialogId = `dialog-${app.id || 'create-actor'}`;
    cleanupEventHandlers(dialogId);
  }
});

/** 
 * Handle rendering the Actor Studio button in the Sidebar Actor Directory
 */
//- Add Actor Studio button to the Actor Directory in game.version >= 13
Hooks.on('activateActorDirectory', async (app) => {
  renderActorStudioSidebarButton(app);
  if (game.settings.get(MODULE_ID, 'enableNPCCreation') && game.version >= 13) renderNPCStudioSidebarButton(app);
})
//- Add Actor Studio button to the Actor Directory in game.version < 13
Hooks.on('renderActorDirectory', async (app, html) => {
  renderActorStudioSidebarButton(app, html);
  if (game.settings.get(MODULE_ID, 'enableNPCCreation') && game.version < 13) renderNPCStudioSidebarButton(app, html);
})

Hooks.on('gas.openActorStudio', (actorName, folderName, actorType) => {
  openActorStudio(actorName, folderName, actorType);
  
  // Track actor studio opened
  if (window.GASUsageTracker) {
    window.GASUsageTracker.trackActorStudioOpened(actorName, folderName, actorType);
  }
});

Hooks.on('gas.openNPCStudio', (actorName, folderName, actorType) => {
  openNPCStudio(actorName, folderName, actorType);
  if (window.GASUsageTracker) {
    window.GASUsageTracker.trackActorStudioOpened(actorName, folderName, actorType);
  }
});
