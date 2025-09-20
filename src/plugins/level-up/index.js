import { get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { levelUpSubClassObject } from '~/src/stores/storeDefinitions';
import PCApplication from '~/src/app/PCApplication.js';

const pulseKeyframes = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
`;

export function dnd5eSheet2UI(app, html, data) {
  const actor = data.actor;
  window.GAS.log.d('[GAS] dnd5eSheet2UI: dnd5eVersion', window.GAS.dnd5eVersion);
  window.GAS.log.d('[GAS] dnd5eSheet2UI: actor', actor);
  window.GAS.log.d('[GAS] dnd5eSheet2UI: html', html);

  const sheetheader = html.find('.sheet-header');
  window.GAS.log.d('[GAS] dnd5eSheet2UI: sheetheader', sheetheader.length);
  const buttons = sheetheader.find('.sheet-header-buttons');
  window.GAS.log.d('[GAS] dnd5eSheet2UI: buttons', buttons.length);

  let classes;
  if (window.GAS.dnd5eVersion >= 4) {
    classes = actor.classes;
  } else if (actor.system && actor.system.classes && Object.keys(actor.system.classes).length) {
    classes = actor.system.classes;
  } else if (actor._classes && Object.keys(actor._classes).length) {
    classes = actor._classes;
  } else {
    classes = undefined;
  }
  window.GAS.log.d('[GAS] dnd5eSheet2UI: classes', classes);

  let hasClasses = false;
  if (classes) {
    if (Array.isArray(classes)) {
      hasClasses = classes.length > 0;
    } else if (Array.isArray(classes.items)) {
      hasClasses = classes.items.length > 0;
    } else {
      hasClasses = Object.keys(classes).length > 0;
    }
  }

  if (!hasClasses || (!game.settings.get(MODULE_ID, 'milestoneLeveling') && (actor.system.details.xp.max - actor.system.details.xp.value > 0))) {
    window.GAS.log.d('[GAS] dnd5eSheet2UI: No classes or not eligible for level up.');
    return;
  }

  buttons.css('gap', '0.35rem');
  const levelUpButton = $(
    `<button type="button" class="config-button gold-button level-up" data-action="flags" data-tooltip="GAS.LevelUp.Button" aria-label="GAS.LevelUp.Button" style="
      animation: pulse 2s infinite;
    ">
      <img src="modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-blue.png" alt="Level Up Button Actor Studio Logo" style="width: 100%; height: 100%; object-fit: contain; max-width: 24px; max-height: 24px;"></img>
    </button>
  `);

  levelUpButton.on('click', async (event) => {
    //- check if Actor Studio is already open
    if (document.querySelector('#foundryvtt-actor-studio-pc-sheet')) {
      ui.notifications.error('Actor Studio is already open and busy with another task. Please close the existing Actor Studio window before attempting to opening a new one.');
      return;
    }
    //- render the level up UI
    new PCApplication(app.actor, true).render(true, { focus: true });
  })

  $('<style>')
    .prop('type', 'text/css')
    .html(pulseKeyframes)
    .appendTo('head');

  buttons.append(levelUpButton);
}

export function tidy5eSheetUI(app, element, data) {
  // Defensive logging for debugging
  console.log(app, element, data);
  if (game.settings.get(MODULE_ID, 'enableLevelUp') === false) return;

  // Safer tidy5e module/api detection to support older tidy5e versions
  const tidyModule = game.modules.get("tidy5e-sheet") || game.modules.get("tidy5e");
  const tidy5eApi = tidyModule?.api;
  window.GAS.log.g('tidy5eapi', tidy5eApi);

  // Prefer the tidy5e API check when available; fall back to a constructor/name heuristic
  let isTidy = false;
  try {
    if (tidy5eApi && typeof tidy5eApi.isTidy5eCharacterSheet === 'function') {
      isTidy = tidy5eApi.isTidy5eCharacterSheet(app);
    } else {
      // Older versions might not expose an API; detect by class/name as a last resort
      isTidy = /tidy5e/i.test(app?.constructor?.name || '') || /tidy5e/i.test(app?.form?.id || '') || /tidy5e/i.test(String(app?.name || ''));
    }
  } catch (err) {
    window.GAS.log.w('[GAS] tidy5eSheetUI: tidy5e detection threw', err);
    isTidy = false;
  }

  if (!isTidy) {
    return;
  }

  const actor = data.actor;
  window.GAS.log.g('actor', actor);
  window.GAS.log.g(1)

  // Determine classes across dnd5e versions (v3 vs v4)
  let classes;
  if (window.GAS?.dnd5eVersion >= 4) {
    classes = actor?.classes;
  } else if (actor?.system?.classes && Object.keys(actor.system.classes).length) {
    classes = actor.system.classes;
  } else if (actor?._classes && Object.keys(actor._classes).length) {
    classes = actor._classes;
  } else {
    classes = undefined;
  }

  let actorHasClasses = false;
  if (classes) {
    if (Array.isArray(classes)) {
      actorHasClasses = classes.length > 0;
    } else if (Array.isArray(classes.items)) {
      actorHasClasses = classes.items.length > 0;
    } else {
      actorHasClasses = Object.keys(classes).length > 0;
    }
  }

  window.GAS.log.g('actorHasClasses', actorHasClasses)
  const isMilestoneLeveling = game.settings.get(MODULE_ID, 'milestoneLeveling')
  window.GAS.log.g('isMilestoneLeveling', isMilestoneLeveling)
  const actorHasLevellingXP = (actor.system.details.xp.max - actor.system.details.xp.value > 0)
  window.GAS.log.g('actorHasLevellingXP', actorHasLevellingXP)

  if (!actorHasClasses || (!isMilestoneLeveling && actorHasLevellingXP)) return;
  // Find the new Tidy5e header actions container
  // Primary selector for modern tidy5e
  let actionsContainer = $(element).find('[data-tidy-sheet-part="sheet-header-actions-container"]');
  // Backwards-compatible fallbacks for older tidy5e markups
  if (!actionsContainer || actionsContainer.length === 0) {
    actionsContainer = $(element).find('.sheet-header-actions');
  }
  if (!actionsContainer || actionsContainer.length === 0) {
    // Older tidy5e or other sheet shapes used .sheet-header-buttons
    actionsContainer = $(element).find('.sheet-header-buttons');
  }
  if (!actionsContainer || actionsContainer.length === 0) {
    actionsContainer = $(element).find('.sheet-header .sheet-header-buttons');
  }
  if (!actionsContainer || actionsContainer.length === 0) {
    window.GAS?.log?.w?.('[GAS] tidy5eSheetUI: header actions container not found; skipping button injection.');
    return;
  }

  // Prevent duplicate injections
  if (actionsContainer.find('#gas-levelup-btn').length > 0) {
    window.GAS?.log?.d?.('[GAS] tidy5eSheetUI: level up button already present.');
    return;
  }

  const levelUpButton = $(`
    <button
      id="gas-levelup-btn"
      type="button"
      class="button button-icon-only button-gold gas-levelup"
      data-action="gasLevelUp"
      data-tooltip="GAS.LevelUp.Button"
      aria-label="GAS.LevelUp.Button"
      style="animation: pulse 2s infinite;"
    >
      <img src="modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-blue.png" alt="Level Up Button Actor Studio Logo" style="width: 100%; height: 100%; object-fit: contain; max-width: 20px; max-height: 20px;">
    </button>
  `);
  window.GAS.log.g(2)

  levelUpButton.on("click", async (event) => {
    //- check if Actor Studio is already open
    if (document.querySelector('#foundryvtt-actor-studio-pc-sheet')) {
      ui.notifications.error('Actor Studio is already open and busy with another task. Please close the existing Actor Studio window before attempting to opening a new one.');
      return;
    }
    //- render the level up UI
    new PCApplication(app.actor, true).render(true, { focus: true });
  });
  window.GAS.log.g(3)

  // Inject pulse keyframes only once
  if (!document.getElementById('gas-levelup-pulse-style')) {
    $('<style id="gas-levelup-pulse-style">')
      .prop('type', 'text/css')
      .html(pulseKeyframes)
      .appendTo('head');
  }

  // Append our button inside the container (not after)
  actionsContainer.append(levelUpButton);
  window.GAS.log.g(3)

}

export function initLevelup() {

  Hooks.on("renderActorSheetV2", (app, html, data) => {
   
    window.GAS.log.d(app.constructor.name)
    window.GAS.log.d(data)
    if(game.settings.get(MODULE_ID, 'enableLevelUp') === false) return;

    if(app.constructor.name === "CharacterActorSheet") {
      dnd5eSheet2UI(app, $(app.element), data)
    }

  });

  Hooks.on("renderActorSheet5e", (app, html, data) => {
    // window.GAS.log.d(app.constructor.name)
    if(game.settings.get(MODULE_ID, 'enableLevelUp') === false) return;

    if(app.constructor.name === "ActorSheet5eCharacter") {
      log.e("Level Up not implemented for old dnd5e character sheet")
    }
    if(app.constructor.name === "ActorSheet5eCharacter2") {
      dnd5eSheet2UI(app, html, data)
    }

  })

  Hooks.on("renderTidy5eCharacterSheetQuadrone", (app, element, data) => {
    tidy5eSheetUI(app, element, data);
  });

  //- potentially hook into the subclass flow
  Hooks.on("renderSubclassFlow", (SubClassFlow, html, app) => {
    
    html.find('.pill-lg').text(get(levelUpSubClassObject)?.name)
    //- remove drop listener
    html.find('.pill-lg').off('drop');
    html.find('.pill-lg').off('dragover');
    html.find('.pill-lg').off('dragleave');
    html.find('.pill-lg').off('dragenter');
    html.find('.pill-lg').off('dragend');
    html.find('.pill-lg').off('dragstart');
    //- remove the click listener
    html.find('div.pill-lg.roboto-upper.empty').off('click');
    
    // Remove the handler via the element's onclick property
    const pillElement = html.find('.pill-lg')[0];
    if (pillElement) {
      pillElement.onclick = null;
      // If data-action attribute is triggering the event, remove it too
      pillElement.removeAttribute('data-action');
    }
  });


}

