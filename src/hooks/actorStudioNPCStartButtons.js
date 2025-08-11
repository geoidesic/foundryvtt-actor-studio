import NPCApplication from '~/src/app/NPCApplication.js';
import { userHasRightPermissions } from '~/src/helpers/Utility'
import { MODULE_ID } from '~/src/helpers/constants';
import { getActorStudioButton } from './actorStudioStartButtons.js';

export function openNPCStudio(actorName, folderName = '', actorType = 'npc') {
  if (userHasRightPermissions()) {
    if (document.querySelector('#foundryvtt-actor-studio-npc-sheet')) {
      ui.notifications.error('Actor Studio (NPC) is already open and busy with another task. Please close the existing window before opening a new one.');
      return;
    }
    try {
      new NPCApplication(new Actor.implementation({ name: actorName, folder: folderName, type: actorType })).render(true, { focus: true });
    } catch (error) {
      ui.notifications.error(error.message);
    }
  }
}

export function renderNPCStudioSidebarButton(app) {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
  if (!game.settings.get(MODULE_ID, 'enableNPCCreation')) return;
  if (app.constructor.name !== "ActorDirectory") return;

  const element = game.version >= 13 ? app.element : app._element;
  if (!element) return;

  const hasButton = game.version >= 13 
    ? element.querySelector('.gas-sidebar-npc-button')
    : element.find('.gas-sidebar-npc-button').length > 0;
  if (hasButton) return;

  const gasButton = getActorStudioButton('gas-sidebar-npc-button', ['gas-sidebar-button','npc'], 'NPC');

  if (game.version >= 13) {
    gasButton.classList.add('v13');
    const headerActions = element.querySelector('header.directory-header .header-actions');
    if (headerActions && headerActions.parentNode) {
      headerActions.parentNode.insertBefore(gasButton, headerActions.nextSibling);
    }
  } else {
    const header = element.find('header.directory-header')[0];
    if (header) header.appendChild(gasButton);
  }

  gasButton.addEventListener('mousedown', (e) => {
    Hooks.call('gas.openNPCStudio', game.user.name, '', 'npc');
  });
  gasButton.addEventListener('keydown', (e) => {
    Hooks.call('gas.openNPCStudio', game.user.name, '', 'npc');
  });
}

export function renderASButtonInCreateNPCApplication(app, html, data) {
  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    const select = $('select', html);
    function updateButton() {
      const actorType = select.val();
      if (actorType === 'npc') {
        if (!$('.gas-dialog-npc-button', html).length) {
          const gasButton = getActorStudioButton('gas-dialog-npc-button', ['gas-dialog-button','npc'], false);
          $(gasButton).css('line-height', 'unset');
          $('button', html).last().after(gasButton);
          const mousedownHandler = (e) => {
            Hooks.call('gas.openNPCStudio', $('input', html).val(), $('select[name="folder"]', html).val(), 'npc');
            e.preventDefault();
            e.stopPropagation();
            return false;
          };
          const keydownHandler = mousedownHandler;
          $(gasButton).on('mousedown', mousedownHandler);
          $(gasButton).on('keydown', keydownHandler);
        }
      } else {
        $('.gas-dialog-npc-button', html).remove();
      }
    }
    updateButton();
    select.on('change', updateButton);
  }
}
