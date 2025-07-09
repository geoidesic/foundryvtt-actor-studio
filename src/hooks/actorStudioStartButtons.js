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
    `<button id="${buttonId}" type="button" class='dialog-button default bright' data-gas_start style="display: flex; align-items: center; justify-content: center; background-color: white; padding: 0; margin: 0; height: 40px;">
      <img src="modules/${MODULE_ID}/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 30px; border: none; width: auto;">
      ${text ? `<span>${text}</span>` : ''}
    </button>`,
  );
  return gasButton;
}

// Unified function to render sidebar button for both V12 and V13
export const renderActorStudioSidebarButton = (app) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
  if (app.constructor.name !== "ActorDirectory") return;
  
  // Get the appropriate element based on version
  const element = game.version >= 13 ? app.element : app._element;
  if (!element) return;
  
  // Check if button already exists in the DOM
  if ($(element).find('#gas-sidebar-button').length > 0) return;
  
  // Create and add the button
  const $gasButton = getActorStudioButton('gas-sidebar-button');
  
  if (game.version >= 13) {
    $gasButton.addClass('v13');
    $(element).find('header.directory-header .header-actions').after($gasButton);
  } else {
    $(element).find('header.directory-header').append($gasButton);
  }
  
  // Add event handlers
  $gasButton.on('mousedown', (e) => Hooks.call('gas.openActorStudio', game.user.name));
  $gasButton.on('keydown', (e) => Hooks.call('gas.openActorStudio', game.user.name));
}


export const renderASButtonInCreateActorApplication = (app, html) => {
  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
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



export default {
  renderASButtonInCreateActorApplication,
  renderActorStudioSidebarButton,
  openActorStudio
}