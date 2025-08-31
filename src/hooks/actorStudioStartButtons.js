import PCApplication from '~/src//app/PCApplication.js';
import dnd5e from "~/config/systems/dnd5e.json";
import { userHasRightPermissions } from '~/src/helpers/Utility'
import { MODULE_ID } from '~/src/helpers/constants';

// Store references to event handlers for cleanup
const eventHandlers = new Map();

const handleActorStudioStartButtonClick = function (e, app, html) {
  // window.GAS.log.d('handleActorStudioStartButtonClick', e, app, html)
  if (e.type === 'mousedown' || e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) {
    
        let actorName = '';
        let folderName = '';
        let actorType = 'character';
        if (html) {
          actorName = $('input', html).val();
          // window.GAS.log.d('renderASButtonInCreateActorApplication actorName', actorName)
          folderName = $('select[name="folder"]', html).val();
          // window.GAS.log.d('renderASButtonInCreateActorApplication folderName', folderName)
          const select = $('select', html);
          actorType = select.val();
        }
        // window.GAS.log.d('handleActorStudioStartButtonClick actorName', actorName)
        // window.GAS.log.d('handleActorStudioStartButtonClick folderName', folderName)
        // window.GAS.log.d('handleActorStudioStartButtonClick actorType', actorType)

        Hooks.call('gas.openActorStudio', actorName, folderName, actorType);
        e.preventDefault();
        e.stopPropagation();
        return false;
        
  }
}

// Clean up event handlers for a specific element
export function cleanupEventHandlers(elementId) {
  const handlers = eventHandlers.get(elementId);
  if (handlers) {
    handlers.forEach(handler => {
      if (handler.element && handler.element.length) {
        handler.element.off(handler.event, handler.handler);
      }
    });
    eventHandlers.delete(elementId);
  }
}

// Store event handler for later cleanup
function storeEventHandler(elementId, element, event, handler) {
  if (!eventHandlers.has(elementId)) {
    eventHandlers.set(elementId, []);
  }
  eventHandlers.get(elementId).push({ element, event, handler });
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

function getActorStudioButton(buttonId, cssClasses = [], text = false) {
  const gasButton = document.createElement('button');
  gasButton.id = buttonId;
  gasButton.type = 'button';
  gasButton.className = 'dialog-button default bright';
  gasButton.setAttribute('data-gas_start', '');
  gasButton.setAttribute('tabindex', '0');
  gasButton.onclick = () => console.log('GAS native onclick');

  const img = document.createElement('img');
  img.src = `modules/${MODULE_ID}/assets/actor-studio-blue.png`;
  img.alt = 'Actor Studio';
  img.style.height = '100%';
  img.style.maxHeight = '30px';
  img.style.border = 'none';
  img.style.width = 'auto';
  gasButton.appendChild(img);

  if (text) {
    const span = document.createElement('span');
    span.textContent = text;
    gasButton.appendChild(span);
  }

  if (cssClasses.length) {
    gasButton.className += ' ' + cssClasses.join(' ');
  }

  setTimeout(() => {
    const btn = document.getElementById(buttonId);
    if (btn) {
      // console.log('GAS: computed style', window.getComputedStyle(btn));
      console.log('GAS: button parent', btn.parentElement);
    }
  }, 500);
  return gasButton;
}

// Unified function to render sidebar button for both V12 and V13
export const renderActorStudioSidebarButton = (app) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (!game.settings.get(MODULE_ID, 'showButtonInSideBar')) return;
  if (app.constructor.name !== "ActorDirectory") return;

  const element = game.version >= 13 ? app.element : app._element;
  // console.log('GAS: element', element);
  if (!element) return;

  const elementId = `sidebar-${app.id || 'default'}`;
  cleanupEventHandlers(elementId);

  // Handle both V12 (jQuery) and V13 (DOM element) cases
  const hasButton = game.version >= 13 
    ? element.querySelector('#gas-sidebar-button')
    : element.find('#gas-sidebar-button').length > 0;
  
  if (hasButton) return;

  const gasButton = getActorStudioButton('gas-sidebar-button', ['gas-sidebar-button']);
  if (game.version >= 13) {
    gasButton.classList.add('v13');
    const headerActions = element.querySelector('header.directory-header .header-actions');
    // console.log('GAS: headerActions found:', headerActions ? 1 : 0);
    if (headerActions && headerActions.parentNode) {
      headerActions.parentNode.insertBefore(gasButton, headerActions.nextSibling);
    }
  } else {
    const header = element.find('header.directory-header')[0];
    // console.log('GAS: header found:', header ? 1 : 0);
    if (header) header.appendChild(gasButton);
  }
  
  // Check if button was added successfully
  const buttonAdded = game.version >= 13 
    ? element.querySelector('#gas-sidebar-button')
    : element.find('#gas-sidebar-button').length > 0;
  console.log('GAS: sidebar button added?', buttonAdded ? 1 : 0);

  const mousedownHandler = (e) => {
    console.log('GAS sidebar button mousedown', e);
    Hooks.call('gas.openActorStudio', game.user.name, '', 'character');
  };
  const keydownHandler = (e) => {
    console.log('GAS sidebar button keydown', e);
    Hooks.call('gas.openActorStudio', game.user.name, '', 'character');
  };
  gasButton.addEventListener('mousedown', mousedownHandler);
  gasButton.addEventListener('keydown', keydownHandler);
  storeEventHandler(elementId, gasButton, 'mousedown', mousedownHandler);
  storeEventHandler(elementId, gasButton, 'keydown', keydownHandler);
}

export const renderASButtonInCreateActorApplication = (app, html) => {
  const createNewActorLocalized = game.i18n.format('DOCUMENT.Create', { type: game.i18n.localize('DOCUMENT.Actor') });
  if (app.title === createNewActorLocalized) {
    const select = $('select', html);
    const systemActorDocumentTypes = dnd5e.actorTypes;
    
    // Clean up existing event handlers for this dialog
    const dialogId = `dialog-${app.id || 'create-actor'}`;
    cleanupEventHandlers(dialogId);
    
    function updateButton() {
      const actorType = select.val();
      // window.GAS.log.d('actorType', actorType)
      if (isActorTypeValid(systemActorDocumentTypes, actorType)) {
        // disable the button if the setting is enabled
        // Optionally remove the default "Create Actor" submit button and show only GAS button
        if (game.settings.get(MODULE_ID, 'forceASButtonOnlyInNewActorApp')) {
          const $root = $(html);
          if (!$root.attr('data-gas-default-removed')) {
            const $dialogButtons = $('.dialog-buttons', html);
            let $buttons = $dialogButtons.length ? $('button', $dialogButtons) : $('button', html);
            let $submit = $buttons.filter('[type="submit"]').last();
            if (!$submit.length) $submit = $buttons.last();
            if ($submit && $submit.length) {
              $submit.remove();
              $root.attr('data-gas-default-removed', '1');
            }
          }
        }
        const hideOtherButtons = !game.user.isGM && game.settings.get(MODULE_ID, 'disableOtherActorCreationOptionsForPlayers');
        const nonGmsCanOnlyCreatePCs = !game.user.isGM && game.settings.get(MODULE_ID, 'nonGmsCanOnlyCreatePCs');
        if (!game.user.isGM && hideOtherButtons) {
          $('.dialog-buttons .dialog-button:not(#gas-dialog-button)', html).hide();
        }
        if (!game.user.isGM && nonGmsCanOnlyCreatePCs) {
          $('#document-create .form-fields select', html).prop('disabled', true);
        }
        if (!$('#gas-dialog-button', html).length) {
          const gasButton = getActorStudioButton('gas-dialog-button', ['gas-sidebar-button']);
          console.log(gasButton);
          if(game.version < 13) {
            $(gasButton).css('line-height', 'unset')
          }
          const $gasButton = $(gasButton);
          // window.GAS.log.d('html', html)
          $('button', html).last().after($gasButton); // Ensure button is added after the Create New Actor confirm button

          // Create event handlers
          const mousedownHandler = (e) => handleActorStudioStartButtonClick(e, app, html);
          const keydownHandler = (e) => handleActorStudioStartButtonClick(e, app, html);

          $gasButton.on('mousedown', mousedownHandler);
          $gasButton.on('keydown', keydownHandler);
          
          // Store handlers for cleanup
          storeEventHandler(dialogId, gasButton, 'mousedown', mousedownHandler);
          storeEventHandler(dialogId, gasButton, 'keydown', keydownHandler);
        }
        
      } else {
        $('#gas-dialog-button', html).remove(); // Remove button if actorType is not "character"
      }
    }

    // Initial check
    updateButton();

    // Update button when the select value changes
    const changeHandler = updateButton;
    select.on('change', changeHandler);
    storeEventHandler(dialogId, select, 'change', changeHandler);
  }
}

// Cleanup function to be called when the module is disabled or when dialogs are closed
export const cleanupAllEventHandlers = () => {
  for (const [elementId] of eventHandlers) {
    cleanupEventHandlers(elementId);
  }
}

export default {
  renderASButtonInCreateActorApplication,
  renderActorStudioSidebarButton,
  openActorStudio,
  cleanupAllEventHandlers
}

export { getActorStudioButton };