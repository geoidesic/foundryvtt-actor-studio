import { MODULE_ID } from '~/src/helpers/constants';
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

  if (!game.settings.get(MODULE_ID, 'milestoneLeveling') && (actor.system.details.xp.max - actor.system.details.xp.value > 0)) return;

  buttons.css('gap', '0.35rem');
  const levelUpButton = $(`
    <button type="button" class="config-button gold-button level-up" data-action="flags" data-tooltip="GAS.LevelUp.Button" aria-label="GAS.LevelUp.Button" style="
      animation: pulse 2s infinite;
    ">
      <i class="fas fa-arrow-alt-circle-up"></i>
    </button>
  `);

  levelUpButton.on('click', async (event) => {
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

  if (!game.settings.get(MODULE_ID, 'milestoneLeveling') && (actor.system.details.xp.max - actor.system.details.xp.value > 0)) return;

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

}

