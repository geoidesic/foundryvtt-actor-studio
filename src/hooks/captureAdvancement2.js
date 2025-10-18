import { get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import {  dropItemRegistry, preAdvancementSelections, race, background, characterClass, characterSubClass } from '~/src/stores/index.js';

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

const ADVANCEMENT_FEAT_PATHS = [
  ['type'],
  ['slug'],
  ['identifier'],
  ['itemType'],
  ['configuration', 'type'],
  ['configuration', 'itemType'],
  ['configuration', 'types'],
  ['configuration', 'choices'],
  ['configuration', 'filters'],
  ['definition', 'type'],
  ['definition', 'itemType'],
  ['definition', 'types'],
  ['definition', 'choices'],
  ['definition', 'filters']
];

const isFeatAdvancementFlow = (flow) => {
  if (!flow) return false;

  const advancement = flow.advancement ?? {};
  return ADVANCEMENT_FEAT_PATHS.some((path) => containsFeat(readPath(advancement, path)));
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
  if (!element?.length) {
    return;
  }

  // Check if custom feat selector is enabled
  if (!game.settings.get('foundryvtt-actor-studio', 'enableCustomFeatSelector')) {
    return;
  }

  // Remove any existing handler
  if (element[0].gasFeatInterceptHandler) {
    element[0].removeEventListener('click', element[0].gasFeatInterceptHandler, { capture: true });
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

    if (!isFeatChoiceForm(formElement, currentProcess)) {
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

  element[0].addEventListener('click', element[0].gasFeatInterceptHandler, { capture: true });
};

// Show the custom feat selector overlay
export const showFeatSelector = async (formElement, currentProcess) => {
  try {
    // Import the FeatSelector component dynamically
    const { default: FeatSelector } = await import('../components/molecules/dnd5e/Feats/FeatSelector.svelte');

    // Create a temporary container for the Svelte component
    const container = document.createElement('div');
    container.id = 'gas-feat-selector-container';
    document.body.appendChild(container);

    // Get the advancement flow instance from the form
    const advancementId = formElement.attr('data-advancement-id') || formElement.attr('data-id');
    const level = parseInt(formElement.attr('data-level')) || 1;

    // Create the feat selector instance
    const featSelector = new FeatSelector({
      target: container,
      props: {
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
    throw new Error('flow: ' + flow);
    if (!flow) {
      window.GAS.log.w('[handleFeatSelection] No current flow available on advancement manager');
      ui.notifications.warn('Failed to find current advancement flow. Please try again.');
      return;
    }

    // For ItemChoice flows, add to selected set
    flow.selected.add(selectedFeat.uuid);
    throw new Error('add called');
    flow.render();
    window.GAS.log.d('[handleFeatSelection] Added feat to selected set and re-rendered flow');

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
        element.removeClass(); // Remove all classes from the root element itself
        element.addClass('gas-advancements')
        element.attr('gas-appid', currentProcess.id);
        element.appendTo(panelElement);

        // Intercept browse buttons for feat selections
        interceptFeatBrowseButtons(element, currentProcess);
      }
    }
  }
}

export default {
  captureAdvancement,
  interceptFeatBrowseButtons,
  showFeatSelector,
  handleFeatSelection
};