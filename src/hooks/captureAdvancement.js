import { get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import {  dropItemRegistry, preAdvancementSelections, race, background, characterClass, characterSubClass } from '~/src/stores/index.js';
import FeatSelector from '~/src/components/molecules/dnd5e/Feats/FeatSelector.svelte';

const BROWSE_TARGET_SELECTOR = [
  '[data-action="browse"]',
  'button[data-action="choice-browse"]',
  'button[data-action="browse-compendium"]',
  'button[data-action="compendium"]',
  'button.item-choice-browse',
  'a[data-action="browse"]'
].join(', ');

const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

// Helper to get advancement element based on version
const getAdvancementElement = (currentProcess) => {
  const version = window.GAS.dnd5eVersion;
  const rawElement = currentProcess.app?.element;
  
  if (version >= 4) {
    // v4 passes raw DOM element
    return $(rawElement);
  }
  // v3 already provides jQuery element
  return rawElement;
};

const containsFeat = (value, depth = 0) => {
  if (!value || depth > 4) return false;
  if (typeof value === 'string') {
    return value.toLowerCase().includes('feat');
  }
  if (Array.isArray(value)) {
    return value.some((entry) => containsFeat(entry, depth + 1));
  }
  if (typeof value === 'object') {
    return Object.values(value).some((entry) => containsFeat(entry, depth + 1));
  }
  return false;
};

const readPath = (source, path) => {
  let current = source;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
};

const findAdvancementFlow = (currentProcess, advancementId) => {
  if (!advancementId) return null;
  const flows = currentProcess?.app?.flows;
  if (!flows) return null;

  if (typeof flows.get === 'function') {
    const direct = flows.get(advancementId);
    if (direct) return direct;
  }

  if (typeof flows.values === 'function') {
    for (const flow of flows.values()) {
      if (flow?.advancement?.id === advancementId) {
        return flow;
      }
    }
  }

  return null;
};

const isFeatAdvancementFlow = (flow) => {
  if (!flow) return false;

  const advancement = flow.advancement ?? {};
  
  // Primary check: AbilityScoreImprovement is the main feat advancement type
  if (advancement.type === 'AbilityScoreImprovement') {
    window.GAS.log.d('[isFeatAdvancementFlow] Detected AbilityScoreImprovement (ASI/Feat choice)');
    return true;
  }
  
  // Secondary check: ItemChoice that is SPECIFICALLY restricted to feats only
  // This is different from ItemChoice for Fighting Styles, Spells, etc.
  if (advancement.type === 'ItemChoice') {
    // Check if the restriction explicitly specifies feat type
    const restrictionType = advancement.configuration?.restriction?.type 
                         || advancement.restriction?.type;
    
    const isFeatRestriction = restrictionType === 'feat';
    
    window.GAS.log.d('[isFeatAdvancementFlow] ItemChoice advancement:', {
      restrictionType,
      isFeatRestriction,
      title: advancement.title,
      hint: advancement.hint
    });
    
    return isFeatRestriction;
  }
  
  // For backwards compatibility, check if "feat" appears in specific paths
  // but only for non-ItemChoice types to avoid false positives
  if (advancement.type !== 'ItemChoice' && advancement.type !== 'ItemGrant') {
    const ADVANCEMENT_FEAT_PATHS = [
      ['type'],
      ['slug'],
      ['identifier']
    ];
    
    const hasFeaInPath = ADVANCEMENT_FEAT_PATHS.some((path) => containsFeat(readPath(advancement, path)));
    
    if (hasFeaInPath) {
      window.GAS.log.d('[isFeatAdvancementFlow] Detected feat in advancement path (legacy check)');
    }
    
    return hasFeaInPath;
  }
  
  return false;
};

const isFeatChoiceForm = (formElement, currentProcess) => {
  if (!formElement) return false;

  const datasetType = formElement.dataset?.advancementType ?? formElement.dataset?.type;
  if (containsFeat(datasetType)) {
    return true;
  }

  const browseLabel = formElement.querySelector?.('[data-action="browse"]')?.textContent;
  if (containsFeat(browseLabel)) {
    return true;
  }

  const advancementId = formElement.dataset?.id ?? formElement.getAttribute?.('data-id');
  if (!advancementId) {
    return false;
  }

  const flow = findAdvancementFlow(currentProcess, advancementId);
  return isFeatAdvancementFlow(flow);
};

// Intercept browse buttons for feat selections in captured advancement forms
export const interceptFeatBrowseButtons = (element, currentProcess) => {
  try {
    if (!element?.length) {
      return;
    }

    // Check if custom feat selector is enabled
    const customFeatSelectorEnabled = game.settings.get('foundryvtt-actor-studio', 'enableCustomFeatSelector');
    window.GAS.log.d('[interceptFeatBrowseButtons] Setting enabled:', customFeatSelectorEnabled);
    
    if (!customFeatSelectorEnabled) {
      return;
    }

    // Remove any existing handler
    if (element[0].gasFeatInterceptHandler) {
      element[0].removeEventListener('click', element[0].gasFeatInterceptHandler, true);
    }

    // Add new handler in capture phase
    element[0].gasFeatInterceptHandler = (event) => {
    const target = $(event.target).closest(BROWSE_TARGET_SELECTOR);
    if (!target.length) {
      return;
    }

    const formElement = target.closest('form')[0];
    if (!formElement) {
      return;
    }

    const isFeat = isFeatChoiceForm(formElement, currentProcess);
    window.GAS.log.d('[interceptFeatBrowseButtons] Browse button clicked, isFeat:', isFeat, 'formElement:', formElement);
    
    if (!isFeat) {
      return;
    }

    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();

    window.GAS.log.d('[interceptFeatBrowseButtons] Intercepted feat browse action, opening selector');

    const $form = $(formElement);
    showFeatSelector($form, currentProcess);

    return false;
  };

  element[0].addEventListener('click', element[0].gasFeatInterceptHandler, true);
  } catch (error) {
    window.GAS.log.e('[interceptFeatBrowseButtons] Error setting up feat interception:', error);
  }
};

// Show the custom feat selector overlay
export const showFeatSelector = async (formElement, currentProcess) => {
  try {
    window.GAS.log.d('[showFeatSelector] Starting feat selector...');

    // Get the advancement flow instance from the form
    const advancementId = formElement.attr('data-advancement-id') || formElement.attr('data-id');
    const level = parseInt(formElement.attr('data-level')) || 1;

    // Try to get the flow to check current selections (optional validation)
    const flow = findAdvancementFlow(currentProcess, advancementId);
    
    if (flow) {
      // Only validate if we successfully found the flow
      const advancement = flow.advancement;
      const choices = advancement?.configuration?.choices;
      window.GAS.log.d('[showFeatSelector] Advancement choices config:', choices);

      // Get the maximum number of selections allowed
      let maxSelections = 1; // Default to 1
      if (choices && Array.isArray(choices) && choices.length > 0) {
        const firstChoice = choices[0];
        maxSelections = typeof firstChoice === 'object' ? (firstChoice.count || 1) : firstChoice;
      }

      // Count current selections
      const currentSelections = flow.selected?.size || 0;
      
      window.GAS.log.d('[showFeatSelector] Selection validation:', {
        maxSelections,
        currentSelections,
        canSelect: currentSelections < maxSelections
      });

      // Validate that we can add more selections
      if (currentSelections >= maxSelections) {
        ui.notifications.warn('No additional items can be selected, uncheck items before selecting more.');
        window.GAS.log.w('[showFeatSelector] Maximum selections reached', {
          max: maxSelections,
          current: currentSelections
        });
        return;
      }
    } else {
      // If we can't find the flow, log a warning but continue anyway
      window.GAS.log.w('[showFeatSelector] Could not find advancement flow for validation, proceeding without validation');
    }

    // Create a temporary container for the Svelte component
    const container = document.createElement('div');
    container.id = 'gas-feat-selector-container';
    document.body.appendChild(container);

    // Get the actor from the advancement manager
    const actor = currentProcess?.app?.actor;
    const currentActorLevel = actor?.system?.details?.level ?? 1;
    
    // During level-up, the character is advancing TO the next level
    // so they should be able to select feats for that target level
    const targetLevel = currentActorLevel + 1;

    // Create the feat selector instance
    const featSelector = new FeatSelector({
      target: container,
      props: {
        actor: actor,
        characterLevel: targetLevel,
        onSelect: (selectedFeat) => {
          handleFeatSelection(selectedFeat, currentProcess);
        },
        onClose: () => {
          featSelector.$destroy();
          document.body.removeChild(container);
        }
      }
    });

  } catch (error) {
    window.GAS.log.e('[showFeatSelector] Error showing feat selector:', error);
    // Fallback: show error notification
    ui.notifications.error('Failed to load feat selector. Please check your compendium sources.');
  }
};

// Handle feat selection from our custom selector
export const handleFeatSelection = async (selectedFeat, currentProcess) => {
  try {
    window.GAS.log.d('[handleFeatSelection] Selected feat:', selectedFeat.name, 'UUID:', selectedFeat.uuid);
    window.GAS.log.d('[handleFeatSelection] currentProcess:', currentProcess);

    if (!currentProcess?.app) {
      window.GAS.log.w('[handleFeatSelection] No advancement manager available');
      ui.notifications.warn('Failed to find advancement manager. Please try again.');
      return;
    }

    const advancementManager = currentProcess.app;
    const flow = advancementManager.step?.flow;
    if (!flow) {
      window.GAS.log.w('[handleFeatSelection] No current flow available on advancement manager');
      ui.notifications.warn('Failed to find current advancement flow. Please try again.');
      return;
    }

    const item = await fromUuid(selectedFeat.uuid);
    
    // Check if this is an AbilityScoreImprovement flow (uses `feat` property)
    // or an ItemChoice flow (uses `selected` Set)
    if (flow.advancement?.type === 'AbilityScoreImprovement') {
      // ASI flow - set the feat property directly
      flow.feat = item;
      window.GAS.log.d('[handleFeatSelection] Set feat property for ASI advancement');
    } else {
      // ItemChoice flow - add to selected set
      flow.selected ??= new Set();
      flow.selected.add(selectedFeat.uuid);
      window.GAS.log.d('[handleFeatSelection] Added feat to selected set:', Array.from(flow.selected));

      // If the item is not in the pool, add it to dropped (only if pool exists)
      if (flow.pool && !flow.pool.find(i => i.uuid === selectedFeat.uuid)) {
        flow.dropped ??= [];
        flow.dropped.push(item);
        item.dropped = true;
        window.GAS.log.d('[handleFeatSelection] Added feat to dropped items');
      }
    }

    // Re-render the advancement form to show the selected feat
    await advancementManager.render();
    window.GAS.log.d('[handleFeatSelection] Re-rendered advancement manager to show selection');

  } catch (error) {
    window.GAS.log.e('[handleFeatSelection] Error handling feat selection:', error);
    ui.notifications.error('Failed to select feat. Please try again.');
  }
};

export const captureAdvancement = (initial = false) => {
  window.GAS.log.d('[gas.captureAdvancement] initial', initial)
  const skipDomMove = game.settings.get(MODULE_ID, 'disableAdvancementCapture');
  if (skipDomMove) {
    window.GAS.log.d('[gas.captureAdvancement] Dev setting: Skipping advancement DOM movement');
    return;
  }


  const currentProcess = get(dropItemRegistry.currentProcess);
  window.GAS.log.d('[gas.captureAdvancement] currentProcess in gas.captureAdvancement:', {
    id: currentProcess?.id,
    app: currentProcess?.app,
    element: currentProcess?.app?.element
  });

  // Cache initial state if this is the first capture
  if (initial) {
    preAdvancementSelections.set({
      race: get(race),
      background: get(background),
      class: get(characterClass),
      subclass: get(characterSubClass)
    });
    window.GAS.log.d('[gas.captureAdvancement] Caching initial advancement state', get(preAdvancementSelections));
  }

  if (currentProcess) {
    const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
    if (!isAppElementAppended(currentProcess.id)) {
      window.GAS.log.d(currentProcess);
      const element = getAdvancementElement(currentProcess);
      if(element) {
        window.GAS.log.d('[gas.captureAdvancement] Got element, appending to panel');
        element.removeClass(); // Remove all classes from the root element itself
        element.addClass('gas-advancements')
        element.attr('gas-appid', currentProcess.id);
        element.appendTo(panelElement);
        window.GAS.log.d('[gas.captureAdvancement] Element appended successfully');

        // Intercept browse buttons for feat selections
        interceptFeatBrowseButtons(element, currentProcess);
        window.GAS.log.d('[gas.captureAdvancement] interceptFeatBrowseButtons completed');
      } else {
        window.GAS.log.w('[gas.captureAdvancement] No element found from getAdvancementElement');
      }
    } else {
      window.GAS.log.d('[gas.captureAdvancement] Element already appended for', currentProcess.id);
    }
  } else {
    window.GAS.log.w('[gas.captureAdvancement] No currentProcess available');
  }
}

export default {
  captureAdvancement,
  interceptFeatBrowseButtons,
  showFeatSelector,
  handleFeatSelection
};