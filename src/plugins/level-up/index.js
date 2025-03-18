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
  // window.GAS.log.d(actor);

  const sheetheader = html.find('.sheet-header');
  const buttons = sheetheader.find('.sheet-header-buttons')

  console.log('actor._classes', actor._classes);
  if (!Object.keys(actor._classes).length || !game.settings.get(MODULE_ID, 'milestoneLeveling') && (actor.system.details.xp.max - actor.system.details.xp.value > 0)) return;

  buttons.css('gap', '0.35rem');
  const levelUpButton = $(`
    <button type="button" class="config-button gold-button level-up" data-action="flags" data-tooltip="GAS.LevelUp.Button" aria-label="GAS.LevelUp.Button" style="
      animation: pulse 2s infinite;
    ">
      <i class="fas fa-arrow-alt-circle-up"></i>
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
  const tidy5eApi = game.modules.get("tidy5e-sheet").api;

  if (!tidy5eApi.isTidy5eCharacterSheet(app)) {
    return;
  }

  const actor = data.actor;

  if (!Object.keys(actor._classes).length || !game.settings.get(MODULE_ID, 'milestoneLeveling') && (actor.system.details.xp.max - actor.system.details.xp.value > 0)) return;

  const levelUpButton = $(`
    <button
      type="button"
      data-tidy-render-scheme="handlebars"
      class="inline-transparent-button"
      data-action="flags"
      data-tooltip="GAS.LevelUp.Button"
      aria-label="GAS.LevelUp.Button"
      style="animation: pulse 2s infinite;"
    >
      <i class="fas fa-arrow-alt-circle-up"></i>
    </button>
  `);

  levelUpButton.on("click", async (event) => {
    //- render the level up UI
    new PCApplication(app.actor, true).render(true, { focus: true });
  });

  $("<style>").prop("type", "text/css").html(pulseKeyframes).appendTo("head");

  $(element)
    .find('[data-tidy-sheet-part="name-container"]')
    .after(levelUpButton);
}

export function initLevelup() {

  //- @deprecated: for some reason, extending this class was causing issues with the subclass advancement - where the subclass level was being set to 0
  // Hooks.once("ready", async () => {
  //   //- prevent the default subclass advancement
  //   const { default: SubclassAdvancement } = await import('./extensions/subclass.js');
  //   CONFIG.DND5E.advancementTypes.Subclass.documentClass = SubclassAdvancement;

  //   window.GAS.log.d('[LEVEL UP] subclass advancement class replaced', CONFIG.DND5E.advancementTypes.Subclass.documentClass);
  // });

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

  Hooks.on("tidy5e-sheet.renderActorSheet", (app, element, data) => {
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

