import { get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { safeGetSetting } from '~/src/helpers/Utility';
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

const FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG = {
  default: {
    checkboxSelectors: [],
    rollInputSelectors: [],
    rollButtonSelectors: [
      '[data-action="roll"]',
      '[data-action="roll-hit-points"]',
      'button.rollButton',
      'button.roll-button.dice-button'
    ],
    radioSelectors: [
      'input[type="radio"][value="average"]',
      'input[type="radio"][value="avg"]',
      'input[type="radio"][data-value="average"]',
      'input[type="radio"][name*="hp"][value="average"]',
      'input[type="radio"][name*="hit"][value="average"]'
    ],
    selectSelectors: [
      'select[name*="hp"]',
      'select[name*="hit"]',
      'select[data-action*="hp"]',
      'select[data-action*="hit"]'
    ],
    buttonSelectors: [
      '[data-action="take-average"]',
      'button[value="average"]',
      'button[data-value="average"]'
    ],
    selectValues: ['average', 'avg']
  },
  3: {
    checkboxSelectors: [
      'div.rolls input[type="checkbox"].averageCheckbox'
    ],
    rollInputSelectors: [
      'input.rollResult'
    ],
    rollButtonSelectors: [
      'button.rollButton'
    ],
    radioSelectors: [],
    selectSelectors: [],
    buttonSelectors: [],
    selectValues: []
  },
  4: {
    checkboxSelectors: [],
    rollInputSelectors: [],
    rollButtonSelectors: [],
    radioSelectors: [],
    selectSelectors: [],
    buttonSelectors: [],
    selectValues: []
  },
  5: {
    checkboxSelectors: [
      'dnd5e-checkbox.average-checkbox',
      'dnd5e-checkbox[name="useAverage"]',
      'dnd5e-checkbox[id$="-useAverage"]',
      'dnd5e-checkbox[id*="useAverage"]'
    ],
    rollInputSelectors: [
      'input.roll-result'
    ],
    rollButtonSelectors: [
      'button.roll-button.dice-button',
      'button.roll-button dice-button'
    ],
    radioSelectors: [],
    selectSelectors: [],
    buttonSelectors: [],
    selectValues: []
  }
};

const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

const getSystemMajorVersion = () => {
  const version = Number(window.GAS?.dnd5eVersion ?? 0);
  return Number.isFinite(version) ? Math.floor(version) : 0;
};

const getForceTakeAverageSelectorConfig = () => {
  const majorVersion = getSystemMajorVersion();
  const baseConfig = FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG.default;
  const versionConfig = FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[majorVersion] ?? {};

  return {
    checkboxSelectors: [...(baseConfig.checkboxSelectors ?? []), ...(versionConfig.checkboxSelectors ?? [])],
    rollInputSelectors: [...(baseConfig.rollInputSelectors ?? []), ...(versionConfig.rollInputSelectors ?? [])],
    rollButtonSelectors: [...(baseConfig.rollButtonSelectors ?? []), ...(versionConfig.rollButtonSelectors ?? [])],
    radioSelectors: [...(baseConfig.radioSelectors ?? []), ...(versionConfig.radioSelectors ?? [])],
    selectSelectors: [...(baseConfig.selectSelectors ?? []), ...(versionConfig.selectSelectors ?? [])],
    buttonSelectors: [...(baseConfig.buttonSelectors ?? []), ...(versionConfig.buttonSelectors ?? [])],
    selectValues: [...(baseConfig.selectValues ?? []), ...(versionConfig.selectValues ?? [])]
  };
};

const hasForceTakeAverageTargets = (element, selectorConfig) => {
  const selectors = [
    ...(selectorConfig.checkboxSelectors ?? []),
    ...(selectorConfig.radioSelectors ?? []),
    ...(selectorConfig.selectSelectors ?? []),
    ...(selectorConfig.buttonSelectors ?? []),
    ...(selectorConfig.rollInputSelectors ?? []),
    ...(selectorConfig.rollButtonSelectors ?? [])
  ].filter(Boolean);

  return selectors.some((selector) => element.find(selector).length > 0);
};

const includesHitPoints = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return /hit\s*points?|hitpoints|hp/i.test(value);
};

const isHitPointAdvancement = (currentProcess, element) => {
  const advancement = currentProcess?.app?.step?.flow?.advancement;
  const advancementMeta = [
    advancement?.type,
    advancement?.title,
    advancement?.hint,
    advancement?.identifier,
    advancement?.slug
  ];

  if (advancementMeta.some((entry) => includesHitPoints(entry))) {
    return true;
  }

  const forms = element?.find?.('form') ?? [];
  for (const form of forms) {
    const markers = [
      form?.dataset?.advancementType,
      form?.dataset?.type,
      form?.dataset?.action,
      form?.getAttribute?.('data-advancement-type'),
      form?.getAttribute?.('data-type'),
      form?.getAttribute?.('data-action')
    ];

    if (markers.some((entry) => includesHitPoints(entry))) {
      return true;
    }
  }

  return false;
};

const ensureForcedAverageOverlay = (checkboxElement) => {
  const overlayHost = checkboxElement.closest('label, .rolls, .form-group, .form-fields').first();
  const host = overlayHost.length ? overlayHost : checkboxElement.parent();

  if (!host.length) {
    return;
  }

  host.attr('data-gas-force-locked', 'true');

  const currentPosition = host.css('position');
  if (!currentPosition || currentPosition === 'static') {
    host.css('position', 'relative');
  }

  const existingOverlay = host.find('> .gas-force-lock-overlay');
  if (existingOverlay.length) {
    return;
  }

  const overlay = $('<div class="gas-force-lock-overlay" data-gas-force-locked="true" aria-hidden="false" tabindex="0"></div>');
  overlay.css({
    position: 'absolute',
    inset: '0',
    zIndex: '999',
    background: 'transparent',
    cursor: 'not-allowed',
    pointerEvents: 'auto'
  });

  const notifyLockedChoice = (event) => {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    ui.notifications?.error('The Game Master has disabled this choice.');
    return false;
  };

  overlay.on('click', notifyLockedChoice);
  overlay.on('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      notifyLockedChoice(event);
    }
  });

  host.append(overlay);
};

const applyForceTakeAverageSelection = (element, selectorConfig) => {
  let didApply = false;
  let foundTarget = false;
  let foundSelectionTarget = false;

  const lockControl = (controlElement, { disable = true } = {}) => {
    if (disable) {
      controlElement.prop('disabled', true);
      controlElement.attr('disabled', 'disabled');
    } else {
      controlElement.prop('disabled', false);
      if (typeof controlElement.removeAttr === 'function') {
        controlElement.removeAttr('disabled');
      }
    }
    controlElement.attr('aria-disabled', 'true');
    controlElement.attr('data-gas-force-locked', 'true');

    const rawControl = controlElement[0];
    if (rawControl instanceof HTMLElement) {
      rawControl.disabled = disable;
      if (!disable && typeof rawControl.removeAttribute === 'function') {
        rawControl.removeAttribute('disabled');
      }
    }

    ensureForcedAverageOverlay(controlElement);
  };

  for (const selector of selectorConfig.checkboxSelectors) {
    const checkboxes = element.find(selector);
    if (checkboxes.length) {
      foundTarget = true;
      foundSelectionTarget = true;
    }

    checkboxes.each((_, checkbox) => {
      const checkboxElement = $(checkbox);
      const nestedCheckbox = checkboxElement.find('input[type="checkbox"]').first();
      const rawCheckbox = checkboxElement[0];
      const isChecked = checkboxElement.is(':checked')
        || Boolean(rawCheckbox?.checked)
        || (nestedCheckbox.length ? nestedCheckbox.is(':checked') : false);

      if (!isChecked) {
        if (nestedCheckbox.length) {
          nestedCheckbox.prop('checked', true);
          nestedCheckbox.trigger('input');
          nestedCheckbox.trigger('change');
        }

        checkboxElement.prop('checked', true);
        checkboxElement.attr('checked', 'checked');
        checkboxElement.attr('aria-checked', 'true');
        if (rawCheckbox && 'checked' in rawCheckbox) {
          rawCheckbox.checked = true;
        }
        if (rawCheckbox && typeof rawCheckbox.setAttribute === 'function') {
          rawCheckbox.setAttribute('checked', 'checked');
          rawCheckbox.setAttribute('aria-checked', 'true');
        }

        checkboxElement.trigger('input');
        checkboxElement.trigger('change');
        didApply = true;
      }

      lockControl(checkboxElement, { disable: false });

      const nestedInputs = checkboxElement.find('input[type="checkbox"]');
      if (nestedInputs.length) {
        nestedInputs.each((__, nestedInput) => {
          lockControl($(nestedInput), { disable: false });
        });
      }
    });
  }

  for (const selector of selectorConfig.rollInputSelectors) {
    const rollInputs = element.find(selector);
    if (rollInputs.length) {
      foundTarget = true;
    }

    rollInputs.each((_, rollInput) => {
      lockControl($(rollInput));
    });
  }

  for (const selector of selectorConfig.rollButtonSelectors) {
    const rollButtons = element.find(selector);
    if (rollButtons.length) {
      foundTarget = true;
    }

    rollButtons.each((_, rollButton) => {
      lockControl($(rollButton));
    });
  }

  for (const selector of selectorConfig.radioSelectors) {
    const radios = element.find(selector);
    if (radios.length) {
      foundTarget = true;
      foundSelectionTarget = true;
    }

    radios.each((_, radio) => {
      if (!radio.checked) {
        radio.checked = true;
        $(radio).trigger('change');
        $(radio).trigger('click');
        didApply = true;
      }

      lockControl($(radio), { disable: false });
    });
  }

  for (const selector of selectorConfig.selectSelectors) {
    const selects = element.find(selector);
    if (selects.length) {
      foundTarget = true;
      foundSelectionTarget = true;
    }

    selects.each((_, selectElement) => {
      const options = Array.from(selectElement.options ?? []);
      const targetValue = options.find((option) => selectorConfig.selectValues.includes(option.value))?.value;
      if (targetValue && selectElement.value !== targetValue) {
        selectElement.value = targetValue;
        $(selectElement).trigger('change');
        didApply = true;
      }

      lockControl($(selectElement), { disable: false });
    });
  }

  for (const selector of selectorConfig.buttonSelectors) {
    const button = element.find(selector).first();
    if (button.length) {
      foundTarget = true;
      foundSelectionTarget = true;
      button.trigger('click');
      didApply = true;
      lockControl(button, { disable: false });
      break;
    }
  }

  return { didApply, foundTarget, foundSelectionTarget };
};

const forceTakeAverageHitPoints = (element, currentProcess) => {
  if (!safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false)) {
    return;
  }

  if (!element?.length) {
    return;
  }

  const selectorConfig = getForceTakeAverageSelectorConfig();
  const isHpAdvancement = isHitPointAdvancement(currentProcess, element);
  const hasTargetControls = hasForceTakeAverageTargets(element, selectorConfig);

  if (!isHpAdvancement && !hasTargetControls) {
    return;
  }

  if (!isHpAdvancement && hasTargetControls) {
    window.GAS.log.d('[forceTakeAverageHitPoints] proceeding via control-detection fallback');
  }

  const initialResult = applyForceTakeAverageSelection(element, selectorConfig);
  const rootElement = element[0];

  if (!initialResult.didApply && !initialResult.foundTarget && rootElement) {
    if (rootElement.gasForceAverageObserver) {
      rootElement.gasForceAverageObserver.disconnect();
      rootElement.gasForceAverageObserver = null;
    }

    if (rootElement.gasForceAverageRetryTimer) {
      clearTimeout(rootElement.gasForceAverageRetryTimer);
      rootElement.gasForceAverageRetryTimer = null;
    }

    let attempts = 0;
    const maxAttempts = 20;

    const finalize = () => {
      if (rootElement.gasForceAverageObserver) {
        rootElement.gasForceAverageObserver.disconnect();
        rootElement.gasForceAverageObserver = null;
      }
      if (rootElement.gasForceAverageRetryTimer) {
        clearTimeout(rootElement.gasForceAverageRetryTimer);
        rootElement.gasForceAverageRetryTimer = null;
      }
    };

    const attemptApply = (reason = 'retry') => {
      attempts += 1;
      const result = applyForceTakeAverageSelection(element, selectorConfig);
      if (result.didApply || result.foundTarget || attempts >= maxAttempts) {
        window.GAS.log.d('[forceTakeAverageHitPoints] processed (delayed)', {
          didApply: result.didApply,
          foundTarget: result.foundTarget,
          attempts,
          reason,
          majorVersion: getSystemMajorVersion()
        });
        finalize();
        return;
      }

      rootElement.gasForceAverageRetryTimer = setTimeout(() => attemptApply('timer'), 75);
    };

    rootElement.gasForceAverageObserver = new MutationObserver(() => {
      attemptApply('mutation');
    });

    rootElement.gasForceAverageObserver.observe(rootElement, { childList: true, subtree: true });
    rootElement.gasForceAverageRetryTimer = setTimeout(() => attemptApply('initial-timer'), 50);
  }

  window.GAS.log.d('[forceTakeAverageHitPoints] processed', {
    didApply: initialResult.didApply,
    foundTarget: initialResult.foundTarget,
    majorVersion: getSystemMajorVersion(),
    hasVersionSpecificSelectors: (FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[getSystemMajorVersion()]?.checkboxSelectors?.length ?? 0) > 0
      || (FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[getSystemMajorVersion()]?.rollInputSelectors?.length ?? 0) > 0
      || (FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[getSystemMajorVersion()]?.rollButtonSelectors?.length ?? 0) > 0
      || (FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[getSystemMajorVersion()]?.radioSelectors?.length ?? 0) > 0
      || (FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[getSystemMajorVersion()]?.selectSelectors?.length ?? 0) > 0
      || (FORCE_TAKE_AVERAGE_HP_SELECTOR_CONFIG[getSystemMajorVersion()]?.buttonSelectors?.length ?? 0) > 0
  });
};

const interceptForcedAverageClicks = (element) => {
  if (!safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false)) {
    return;
  }

  if (!element?.length || !element[0]) {
    return;
  }

  if (element[0].gasForceAverageClickHandler) {
    element[0].removeEventListener('click', element[0].gasForceAverageClickHandler, true);
  }

  element[0].gasForceAverageClickHandler = (event) => {
    if ($(event.target).closest('.gas-force-lock-overlay').length) {
      return;
    }

    const lockedControl = $(event.target).closest('[data-gas-force-locked="true"]');
    if (!lockedControl.length) {
      return;
    }

    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();

    ui.notifications?.error('The Game Master has disabled this choice.');
    return false;
  };

  element[0].addEventListener('click', element[0].gasForceAverageClickHandler, true);
};

// Helper to see if the module is configured to skip moving DOM during advancement capture
const skipDomMove = () => safeGetSetting(MODULE_ID, 'disableAdvancementCapture', false);

// Helper to get the DOM/jQuery element for the advancement app across DnD5e versions
const getAdvancementElement = (currentProcess) => {
  const version = window.GAS?.dnd5eVersion || 0;
  const rawElement = currentProcess?.app?.element;
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
    const customFeatSelectorEnabled = safeGetSetting(MODULE_ID, 'enableCustomFeatSelector', false);
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
    const isValid = item?.system?.validatePrerequisites?.(flow.advancement?.actor, { showMessage: true });
    if ((isValid !== undefined) && (isValid !== true)) {
      window.GAS.log.w('[handleFeatSelection] Feat prerequisites not met for selection:', selectedFeat.uuid);
      return;
    }

    // Mirror the native dnd5e flow behavior so V14 updates the visible selection correctly.
    if (typeof flow.advancement?.apply === 'function') {
      if (flow.advancement?.type === 'AbilityScoreImprovement') {
        await flow.advancement.apply(flow.level, {
          retainedItems: flow.retainedData?.retainedItems,
          type: 'feat',
          uuid: selectedFeat.uuid
        });
        window.GAS.log.d('[handleFeatSelection] Applied feat via advancement.apply() for ASI advancement');
      } else {
        await flow.advancement.apply(flow.level, {
          selected: [selectedFeat.uuid]
        });
        window.GAS.log.d('[handleFeatSelection] Applied feat selection via advancement.apply() for ItemChoice advancement');
      }

      if (typeof flow.render === 'function') {
        await flow.render();
        window.GAS.log.d('[handleFeatSelection] Re-rendered advancement flow to show selection');
      } else {
        await advancementManager.render();
        window.GAS.log.d('[handleFeatSelection] Re-rendered advancement manager to show selection');
      }
      return;
    }

    // Legacy fallback for older flows without advancement.apply().
    flow.selected ??= new Set();
    flow.selected.add(selectedFeat.uuid);
    window.GAS.log.d('[handleFeatSelection] Added feat to selected set:', Array.from(flow.selected));

    if (flow.pool && !flow.pool.find(i => i.uuid === selectedFeat.uuid)) {
      flow.dropped ??= [];
      flow.dropped.push(item);
      item.dropped = true;
      window.GAS.log.d('[handleFeatSelection] Added feat to dropped items');
    }

    await advancementManager.render();
    window.GAS.log.d('[handleFeatSelection] Re-rendered advancement manager to show selection');

  } catch (error) {
    window.GAS.log.e('[handleFeatSelection] Error handling feat selection:', error);
    ui.notifications.error('Failed to select feat. Please try again.');
  }
};

export const captureAdvancement = (initial = false) => {
  window.GAS.log.d('[gas.captureAdvancement] initial', initial)
  const skipDomMove = safeGetSetting(MODULE_ID, 'disableAdvancementCapture', false);
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

        interceptForcedAverageClicks(element);

        forceTakeAverageHitPoints(element, currentProcess);
      } else {
        window.GAS.log.w('[gas.captureAdvancement] No element found from getAdvancementElement');
      }
    } else {
      window.GAS.log.d('[gas.captureAdvancement] Element already appended for', currentProcess.id);
      const existingElement = panelElement.find(`[gas-appid="${currentProcess.id}"]`);
      interceptForcedAverageClicks(existingElement);
      forceTakeAverageHitPoints(existingElement, currentProcess);
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