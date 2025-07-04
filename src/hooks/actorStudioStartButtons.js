
import PCApplication from '~/src//app/PCApplication.js';
import dnd5e from "~/config/systems/dnd5e.json";
import { userHasRightPermissions } from '~/src/helpers/Utility'
import { MODULE_ID } from '~/src/helpers/constants';

const handleActorStudioStartButtonClick = function (e, app, html) {
  window.GAS.log.d('handleActorStudioStartButtonClick', e, app, html)
  if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
    
        let actorName = '';
        let folderName = '';
        let actorType = 'character';
        if (html) {
          actorName = $('input', html).val();
          window.GAS.log.d('renderASButtonInCreateActorApplication actorName', actorName)
          folderName = $('select[name="folder"]', html).val();
          window.GAS.log.d('renderASButtonInCreateActorApplication folderName', folderName)
          const select = $('select', html);
          actorType = select.val();
        }
        window.GAS.log.d('handleActorStudioStartButtonClick actorName', actorName)
        window.GAS.log.d('handleActorStudioStartButtonClick folderName', folderName)
        window.GAS.log.d('handleActorStudioStartButtonClick actorType', actorType)

        Hooks.call('gas.openActorStudio', actorName, folderName, actorType);
        e.preventDefault();
        e.stopPropagation();
        return false;
        
  }
}


export function openActorStudio(actorName, folderName = '', actorType = 'character') {
  if (userHasRightPermissions()) {
    if (document.querySelector('#foundryvtt-actor-studio-pc-sheet')) {
      ui.notifications.error('Actor Studio is already open and busy with another task. Please close the existing Actor Studio window before attempting to opening a new one.');
      return;
    }
    try {
        new PCApplication(new Actor.implementation({ name: actorName, folder: folderName, type: actorType })).render(true, { focus: true });
    } catch (error) {
        ui.notifications.error(error.message);
    }
  }
}

function isActorTypeValid(actorTypes, type) {
  // Check if the type exists as a key in the object and its value is true
  return actorTypes.hasOwnProperty(type) && actorTypes[type] === true;
}

function getActorStudioButton(buttonId, text=false) {
  const gasButton = $(
    `<button id="${buttonId}" type="button" class='dialog-button default bright' data-gas_start">
      <img src="modules/${MODULE_ID}/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 30px; border: none; width: auto;">
      ${text ? `<span>${text}</span>` : ''}
    </button>`,
  );
  return gasButton;
}

export const activateDocumentDirectory = (app) => {
  if(game.version > 13) {
    if (!game.modules.get(MODULE_ID)?.active) return;
    // Add Actor Studio button to the sidebar
    if (app.constructor.name === "ActorDirectory") {
      if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
      if ($('#gas-sidebar-button').length) return;
      const $gasButton = getActorStudioButton('gas-sidebar-button').addClass('v13');
      $(app.element).find('header.directory-header .header-actions').after($gasButton);
      $gasButton.on('mousedown', (e) => Hooks.call('gas.openActorStudio', game.user.name));
      $gasButton.on('keydown', (e) => Hooks.call('gas.openActorStudio', game.user.name));
    }
  }
}

export const renderASButtonInCreateActorApplication = (app, html, data) => {
  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    window.GAS.log.i('Adding Create New Actor button');

    const select = $('select', html);
    const systemActorDocumentTypes = dnd5e.actorTypes

    function updateButton() {
      const actorType = select.val();
      // window.GAS.log.d('actorType', actorType)
      if (isActorTypeValid(systemActorDocumentTypes, actorType)) {
        // disable the button if the setting is enabled
        const hideOtherButtons = !game.user.isGM && game.settings.get(MODULE_ID, 'disableOtherActorCreationOptionsForPlayers');
        const nonGmsCanOnlyCreatePCs = !game.user.isGM && game.settings.get(MODULE_ID, 'nonGmsCanOnlyCreatePCs');
        if (!game.user.isGM && hideOtherButtons) {
          $('.dialog-buttons .dialog-button:not(#gas-dialog-button)', html).hide();
        }
        if (!game.user.isGM && nonGmsCanOnlyCreatePCs) {
          $('#document-create .form-fields select', html).prop('disabled', true);
        }
        if (!$('#gas-dialog-button', html).length) {
          const $gasButton = getActorStudioButton('gas-dialog-button');
          window.GAS.log.d('html', html)
          $('button', html).last().after($gasButton); // Ensure button is added after the Create New Actor confirm button


          $gasButton.on('mousedown', (e) => handleActorStudioStartButtonClick(e, app, html));
          $gasButton.on('keydown', (e) => handleActorStudioStartButtonClick(e, app, html));

        }
        
      } else {
        $('#gas-dialog-button', html).remove(); // Remove button if actorType is not "character"
      }
    }

    // Initial check
    updateButton();

    // Update button when the select value changes
    select.on('change', updateButton);
  }
}

export const renderActorDirectory = (app) => {
  if(game.version < 13) {
    if (!game.modules.get(MODULE_ID)?.active) return;
    // Add Actor Studio button to the sidebar
    if (app.constructor.name === "ActorDirectory") {
      if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
      if ($('#gas-sidebar-button').length) return;
      const $gasButton = getActorStudioButton('gas-sidebar-button');
      $(app._element).find('header.directory-header').append($gasButton);
      $gasButton.on('mousedown', (e) => Hooks.call('gas.openActorStudio', game.user.name));
      $gasButton.on('keydown', (e) => Hooks.call('gas.openActorStudio', game.user.name));
    }
  }
}

export default {
  renderASButtonInCreateActorApplication,
  activateDocumentDirectory,
  renderActorDirectory,
  openActorStudio
}