import { MODULE_ID } from '~/src/helpers/constants';
import PCApplication from '~/src/app/PCApplication.js';

export function registerSettings() {
  game.settings.register(MODULE_ID, 'enableLevelUp', {
    name: game.i18n.localize('GAS.Setting.EnableLevelUp.Name'),
    hint: game.i18n.localize('GAS.Setting.EnableLevelUp.Hint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}

export function dnd5eSheet2UI(app, html, data) {

  const sheetheader = html.find('.sheet-header');
  const buttons = sheetheader.find('.sheet-header-buttons')
  const xpValue = Number(sheetheader.find('.xp-label .value')[0].innerText);
  const xpNextLevel = Number(sheetheader.find('.xp-label .max')[0].innerText);
  if(xpValue < xpNextLevel) return;

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
  
  $('<style>')
    .prop('type', 'text/css')
    .html(pulseKeyframes)
    .appendTo('head');
  
  buttons.append(levelUpButton);
  // console.log('sheetheader', sheetheader);
  // console.log('buttons', buttons);
  // console.log('xpValue', xpValue);
  // console.log('xpNextLevel', xpNextLevel);

}

export function initLevelup() {

  registerSettings();

  Hooks.on("renderActorSheet5e", (app, html, data) => {
    if(game.settings.get(MODULE_ID, 'enableLevelUp') === false) return;

    if(app.constructor.name === "ActorSheet5eCharacter") {
      alert('1');
    }
    if(app.constructor.name === "ActorSheet5eCharacter2") {
      dnd5eSheet2UI(app, html, data)
    }

  })

}

