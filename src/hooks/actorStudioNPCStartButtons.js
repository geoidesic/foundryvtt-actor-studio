import NPCApplication from '~/src/app/NPCApplication.js';
import { userHasRightPermissions } from '~/src/helpers/Utility'
import { MODULE_ID } from '~/src/helpers/constants';
import { getActorStudioButton } from './actorStudioStartButtons.js';
import { npcIndexLoading } from '~/src/stores/npcIndexLoading.js';

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

  const elementId = `sidebar-npc-${app.id || 'default'}`;
  // Clean up any previous event handlers for this sidebar instance
  if (typeof cleanupEventHandlers === 'function') cleanupEventHandlers(elementId);

  // Remove any existing button before adding a new one
  if (game.version >= 13) {
    const oldBtn = element.querySelector('#gas-sidebar-npc-button');
    if (oldBtn && oldBtn.parentNode) oldBtn.parentNode.removeChild(oldBtn);
  } else {
    element.find('#gas-sidebar-npc-button').remove();
  }

  // Prevent duplicate button
  const hasButton = game.version >= 13 
    ? element.querySelector('#gas-sidebar-npc-button')
    : element.find('#gas-sidebar-npc-button').length > 0;
  if (hasButton) return;

  const gasButton = getActorStudioButton('gas-sidebar-npc-button', ['gas-sidebar-button','npc'], 'NPC');
  
  // Subscribe to loading state changes
  const unsubscribe = npcIndexLoading.subscribe(loading => {
    if (loading) {
      gasButton.disabled = true;
      // Just show a spinner, no text
      gasButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      gasButton.title = 'Building NPC feature index... Please wait.';
      gasButton.style.opacity = '0.7';
      gasButton.style.cursor = 'not-allowed';
    } else {
      gasButton.disabled = false;
      gasButton.innerHTML = '';
      gasButton.style.opacity = '1';
      gasButton.style.cursor = 'pointer';
      // Re-add the original content
      const img = document.createElement('img');
      img.src = `modules/${MODULE_ID}/assets/actor-studio-blue.png`;
      img.alt = 'Actor Studio';
      img.style.height = '100%';
      img.style.maxHeight = '30px';
      img.style.border = 'none';
      img.style.width = 'auto';
      gasButton.appendChild(img);
      
      const span = document.createElement('span');
      span.textContent = 'NPC';
      gasButton.appendChild(span);
      
      gasButton.title = 'Open Actor Studio (NPC)';
    }
  });

  if (game.version >= 13) {
    gasButton.classList.add('v13');
    const headerActions = element.querySelector('header.directory-header .header-actions');
    if (headerActions && headerActions.parentNode) {
      headerActions.parentNode.insertBefore(gasButton, headerActions.nextSibling);
    }
  } else {
    const header = element.querySelector('header.directory-header')[0];
    if (header) header.appendChild(gasButton);
  }

  // Add event handlers and store for cleanup
  const mousedownHandler = (e) => {
    if (gasButton.disabled) return; // Don't allow clicks when disabled
    Hooks.call('gas.openNPCStudio', game.user.name, '', 'npc');
  };
  const keydownHandler = (e) => {
    if (gasButton.disabled) return; // Don't allow key events when disabled
    Hooks.call('gas.openNPCStudio', game.user.name, '', 'npc');
  };
  gasButton.addEventListener('mousedown', mousedownHandler);
  gasButton.addEventListener('keydown', keydownHandler);

  // Store the unsubscribe function for cleanup
  if (typeof storeEventHandler === 'function') {
    storeEventHandler(elementId, gasButton, 'keydown', keydownHandler);
    // Also store the unsubscribe function
    if (!window.gasNpcButtonCleanup) window.gasNpcButtonCleanup = new Map();
    window.gasNpcButtonCleanup.set(elementId, unsubscribe);
  }
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
          
          // Subscribe to loading state changes
          const unsubscribe = npcIndexLoading.subscribe(loading => {
            if (loading) {
              gasButton.disabled = true;
              // Just show a spinner, no text
              gasButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
              gasButton.title = 'Building NPC feature index... Please wait.';
              gasButton.style.opacity = '0.7';
              gasButton.style.cursor = 'not-allowed';
            } else {
              gasButton.disabled = false;
              gasButton.innerHTML = '';
              gasButton.style.opacity = '1';
              gasButton.style.cursor = 'pointer';
              // Re-add the original content
              const img = document.createElement('img');
              img.src = `modules/${MODULE_ID}/assets/actor-studio-blue.png`;
              img.alt = 'Actor Studio';
              img.style.height = '100%';
              img.style.maxHeight = '30px';
              img.style.border = 'none';
              img.style.width = 'auto';
              gasButton.appendChild(img);
              
              gasButton.title = 'Open Actor Studio (NPC)';
            }
          });
          
          const mousedownHandler = (e) => {
            if (gasButton.disabled) return; // Don't allow clicks when disabled
            Hooks.call('gas.openNPCStudio', $('input', html).val(), $('select[name="folder"]', html).val(), 'npc');
            e.preventDefault();
            e.stopPropagation();
            return false;
          };
          const keydownHandler = mousedownHandler;
          $(gasButton).on('mousedown', mousedownHandler);
          $(gasButton).on('keydown', keydownHandler);
          
          // Store the unsubscribe function for cleanup
          if (!window.gasNpcDialogButtonCleanup) window.gasNpcDialogButtonCleanup = new Map();
          window.gasNpcDialogButtonCleanup.set('gas-dialog-npc-button', unsubscribe);
        }
      } else {
        $('.gas-dialog-npc-button', html).remove();
        // Clean up the unsubscribe function
        if (window.gasNpcDialogButtonCleanup) {
          const unsubscribe = window.gasNpcDialogButtonCleanup.get('gas-dialog-npc-button');
          if (unsubscribe) {
            unsubscribe();
            window.gasNpcDialogButtonCleanup.delete('gas-dialog-npc-button');
          }
        }
      }
    }
    updateButton();
    select.on('change', updateButton);
  }
}
