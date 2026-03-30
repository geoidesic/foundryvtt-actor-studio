import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';
import { getTestTimeout, getTestTimeouts } from '~/src/helpers/testTimeouts';

const MODULE_ID = 'foundryvtt-actor-studio';
const DEBUG_ROOT_KEYS = ['debug', 'race', 'background', 'characterClass', 'characterSubClass'];

export function createCharacterPermutationTestHelpers(context, classConfig = {}) {
  const { assert } = context;
  const classIdentifier = String(classConfig.identifier || '').toLowerCase();

  if (!classIdentifier) {
    throw new Error('Character permutation tests require a class identifier');
  }

  if (!classConfig.displayName || !classConfig.classUuid || !classConfig.raceUuid || !classConfig.backgroundUuid) {
    throw new Error(`Character permutation tests require complete config for ${classIdentifier}`);
  }

  const TEST_TIMEOUTS = getTestTimeouts();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const POLL_INTERVAL = TEST_TIMEOUTS.pollingInterval;
  const WAIT_SHORT = TEST_TIMEOUTS.waitShort;
  const WAIT_MEDIUM = TEST_TIMEOUTS.waitMedium;
  const WAIT_LONG = TEST_TIMEOUTS.waitLong;

  let savedDebugState = {};
  let originalMilestoneLeveling = false;
  let originalForceTakeAverageHitPoints = false;
  let classActorId = null;
  let classActor = null;
  const testActorName = `Quench ${classConfig.displayName} Automation ${Date.now()}`;

  const waitForCondition = async (fn, timeoutMs = TEST_TIMEOUTS.uiInteraction, intervalMs = TEST_TIMEOUTS.pollingInterval) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        if (await fn()) return true;
      } catch (error) {
        // Keep polling until timeout.
      }
      await wait(intervalMs);
    }
    return false;
  };

  const logSubclassDebug = (...args) => {
    console.log('[QUENCH subclass]', ...args);
  };

  const parseSpellProgressionValue = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const cantrips = Number.parseInt(value.cantrips, 10) || 0;
      const rawSpells = value.spells;
      const hasAllSpells = String(rawSpells || '').toLowerCase() === 'all' || value.hasAllSpells === true;
      const spells = hasAllSpells ? 0 : (Number.parseInt(rawSpells, 10) || 0);

      return {
        cantrips,
        spells,
        hasAllSpells,
        maxSpellLevel: Number.parseInt(value.maxSpellLevel, 10) || 0,
        uiRequired: typeof value.uiRequired === 'boolean' ? value.uiRequired : undefined
      };
    }

    if (typeof value !== 'string') return null;
    const [cantripsRaw, spellsRaw] = value.split('/').map((entry) => String(entry ?? '').trim());
    if (!cantripsRaw || !spellsRaw) return null;

    return {
      cantrips: Number.parseInt(cantripsRaw, 10) || 0,
      spells: Number.parseInt(spellsRaw, 10) || 0,
      hasAllSpells: spellsRaw.toLowerCase() === 'all',
      maxSpellLevel: 0,
      uiRequired: undefined
    };
  };

  const inferSpellcastingProgression = (identifier) => {
    const normalized = String(identifier || '').toLowerCase();
    if (['bard', 'cleric', 'druid', 'sorcerer', 'wizard'].includes(normalized)) return 'full';
    if (['paladin', 'ranger', 'artificer'].includes(normalized)) return 'half';
    if (['eldritchknight', 'arcanetrickster'].includes(normalized)) return 'third';
    if (normalized === 'warlock') return 'pact';
    return 'none';
  };

  const getMaxSpellLevelForProgression = (level, progression, identifier, rulesVersion) => {
    const numericLevel = Number(level) || 0;
    const is2024Rules = String(rulesVersion || '').trim() === '2024';
    const resolvedProgression = String(progression || '').toLowerCase() || inferSpellcastingProgression(identifier);

    switch (resolvedProgression) {
      case 'full':
        return Math.max(0, Math.min(9, Math.ceil(numericLevel / 2)));
      case 'half':
        return Math.max(0, Math.min(5, is2024Rules
          ? Math.ceil(numericLevel / 4)
          : Math.ceil((numericLevel - 1) / 4)));
      case 'third':
        return Math.max(0, Math.min(4, Math.ceil((numericLevel - 2) / 6)));
      case 'pact':
        if (numericLevel >= 9) return 5;
        if (numericLevel >= 7) return 4;
        if (numericLevel >= 5) return 3;
        if (numericLevel >= 3) return 2;
        return numericLevel >= 1 ? 1 : 0;
      default:
        return 0;
    }
  };

  const shouldExpectSpellsForLevelDynamic = ({ classIdentifier, targetLevel, rulesVersion }) => {
    const numericTargetLevel = Number(targetLevel) || 0;
    if (numericTargetLevel <= 1) return false;

    const oldLevel = Math.max(1, numericTargetLevel - 1);
    const progressionTOON = classConfig?.spellProgressionTOON?.levels;

    const readTOONValue = (levelNumber) => {
      const levelData = progressionTOON?.[String(levelNumber)] || progressionTOON?.[Number(levelNumber)] || null;
      if (!levelData) return undefined;
      return levelData?.[rulesVersion] ?? levelData?.default;
    };

    const oldValueFromTOON = readTOONValue(oldLevel);
    const newValueFromTOON = readTOONValue(numericTargetLevel);

    // Test oracle must come from test-owned TOON data, not production progression stores.
    if (!oldValueFromTOON || !newValueFromTOON) {
      logSubclassDebug('missing TOON spell progression rows; defaulting to no required spells UI', {
        classIdentifier,
        rulesVersion,
        oldLevel,
        targetLevel: numericTargetLevel,
        hasTOON: Boolean(progressionTOON),
        oldValueFromTOON,
        newValueFromTOON
      });
      return false;
    }

    const oldValue = oldValueFromTOON;
    const newValue = newValueFromTOON;

    const oldParsed = parseSpellProgressionValue(oldValue);
    const newParsed = parseSpellProgressionValue(newValue);
    if (!oldParsed || !newParsed) return false;

    if (typeof newParsed.uiRequired === 'boolean') return newParsed.uiRequired;

    const cantripDifference = Math.max(0, newParsed.cantrips - oldParsed.cantrips);
    if (cantripDifference > 0) return true;

    // For classes that auto-gain all spells, the UI step is only needed when cantrips increase.
    if (oldParsed.hasAllSpells || newParsed.hasAllSpells) return false;

    const spellDifference = Math.max(0, newParsed.spells - oldParsed.spells);
    return spellDifference > 0;
  };

  const getExpectedSpellSelectionDeltaDynamic = ({ targetLevel, rulesVersion }) => {
    const numericTargetLevel = Number(targetLevel) || 0;
    if (numericTargetLevel <= 1) return { cantrips: 0, spells: 0, required: false };

    const oldLevel = Math.max(1, numericTargetLevel - 1);
    const progressionTOON = classConfig?.spellProgressionTOON?.levels;
    const readTOONValue = (levelNumber) => {
      const levelData = progressionTOON?.[String(levelNumber)] || progressionTOON?.[Number(levelNumber)] || null;
      if (!levelData) return undefined;
      return levelData?.[rulesVersion] ?? levelData?.default;
    };

    const oldParsed = parseSpellProgressionValue(readTOONValue(oldLevel));
    const newParsed = parseSpellProgressionValue(readTOONValue(numericTargetLevel));
    if (!oldParsed || !newParsed) return { cantrips: 0, spells: 0, required: false };

    const cantripDelta = Math.max(0, newParsed.cantrips - oldParsed.cantrips);
    const spellDelta = (oldParsed.hasAllSpells || newParsed.hasAllSpells)
      ? 0
      : Math.max(0, newParsed.spells - oldParsed.spells);

    return {
      cantrips: cantripDelta,
      spells: spellDelta,
      required: cantripDelta > 0 || spellDelta > 0
    };
  };

  const closeActorStudioIfOpen = async () => {
    const app = Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet');
    if (app?.close) {
      app.setClosingFromGasHook(true);
      await app.close();
      await wait(WAIT_MEDIUM);
    }

    let attempts = 0;
    while (document.querySelector('#foundryvtt-actor-studio-pc-sheet') && attempts < 20) {
      await wait(WAIT_SHORT);
      attempts++;
    }

    const element = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (element) {
      element.remove();
      await wait(WAIT_SHORT);
    }
  };

  const openActorStudio = async (name = 'Quench Permutation Test') => {
    Hooks.call('gas.openActorStudio', name, '', 'character');
    await wait(WAIT_LONG);
    return Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
  };

  const clickFooterButtonBySelector = async (selector) => {
    const target = document.querySelector(selector);
    if (!target || target.disabled) return false;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return true;
  };

  const clickFooterButtonContaining = async (text) => {
    const buttons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button'));
    const target = buttons.find((button) => {
      const label = (button.textContent || '').toLowerCase();
      return label.includes(String(text || '').toLowerCase()) && !button.disabled;
    });
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return true;
  };

  const isFooterButtonAvailable = (text) => {
    const buttons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button'));
    return buttons.some((button) => {
      const label = (button.textContent || '').toLowerCase();
      return label.includes(String(text || '').toLowerCase()) && !button.disabled;
    });
  };

  const getFinalizeButton = () => {
    return document.querySelector('#foundryvtt-actor-studio-pc-sheet .gas-finalize-spells-btn')
      || document.querySelector('.gas-finalize-spells-btn');
  };

  const isFinalizeButtonEnabled = () => {
    const button = getFinalizeButton();
    return Boolean(button && !button.disabled);
  };

  const clickFinalizeButton = () => {
    const target = getFinalizeButton();
    if (!target || target.disabled) return false;

    // Prefer native click first; fall back to synthetic events for robustness across wrappers.
    if (typeof target.click === 'function') target.click();
    target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  };

  const clickTabByLabel = async (label) => {
    const tabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'));
    const target = tabs.find((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase()));
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return waitForCondition(
      () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button.active'))
        .some((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase())),
      TEST_TIMEOUTS.uiInteraction,
      POLL_INTERVAL
    );
  };

  const clickFirstAvailableTabLabel = async (labels) => {
    for (const label of labels) {
      const clicked = await clickTabByLabel(label);
      if (clicked) return true;
    }
    return false;
  };

  const visitRequiredCreationTabs = async () => {
    const raceVisited = await clickFirstAvailableTabLabel(['Race', 'Origin', 'Species']);
    const classVisited = await clickTabByLabel('Class');
    const backgroundVisited = await clickTabByLabel('Background');
    const abilitiesVisited = await clickFirstAvailableTabLabel(['Abilities', 'Ability Scores']);
    return raceVisited && classVisited && backgroundVisited && abilitiesVisited;
  };

  const focusLevelUpClassTab = async () => {
    const tabFocused = await clickFirstAvailableTabLabel(['Level Up', 'Class']);
    if (!tabFocused) return false;
    return waitForCondition(() => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet .class-row[role="button"]')), TEST_TIMEOUTS.uiInteraction, POLL_INTERVAL);
  };

  const selectFirstSubclassOptionIfRequired = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) {
        logSubclassDebug('root missing');
        return false;
      }

      const subclassSelect = root.querySelector('#subClass-select');
      if (!subclassSelect) {
        logSubclassDebug('select missing; treating as not required');
        return true;
      }

      const placeholderNode = subclassSelect.querySelector('.selected-option .placeholder');
      const trigger = subclassSelect.querySelector('.selected-option');
      const triggerClasses = trigger?.className || '';
      const triggerExpanded = trigger?.getAttribute?.('aria-expanded') || 'missing';
      const triggerDisabled = trigger?.classList?.contains?.('disabled') || false;
      const dropdown = subclassSelect.querySelector('.options-dropdown');
      const options = Array.from(subclassSelect.querySelectorAll('.options-dropdown .option'));
      logSubclassDebug('state', {
        hasPlaceholder: Boolean(placeholderNode),
        triggerClasses,
        triggerExpanded,
        triggerDisabled,
        dropdownOpen: Boolean(dropdown),
        optionCount: options.length
      });
      if (!placeholderNode) {
        logSubclassDebug('placeholder absent; selection already resolved');
        return true;
      }

      const selectedLabel = String(subclassSelect.querySelector('.selected-option .option-label')?.textContent || '').trim();
      const normalizedSelected = selectedLabel.toLowerCase();
      if (selectedLabel && !normalizedSelected.includes('select')) {
        logSubclassDebug('label already selected', selectedLabel);
        return true;
      }

      if (!trigger) {
        logSubclassDebug('trigger missing');
        return false;
      }

      if (!dropdown) {
        logSubclassDebug('dispatching click to open dropdown');
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return false;
      }

      if (!options.length) {
        logSubclassDebug('dropdown open but options missing');
        return false;
      }

      // For fighter, prefer Eldritch Knight to test spell selection
      let preferredOption = null;
      if (classIdentifier === 'fighter') {
        preferredOption = options.find((option) => {
          const text = String(option.textContent || '').trim().toLowerCase();
          return text.includes('eldritch knight');
        });
      }

      const firstRealOption = preferredOption || options.find((option) => {
        const text = String(option.textContent || '').trim().toLowerCase();
        return text.length > 0 && !text.includes('select');
      });

      if (!firstRealOption) {
        logSubclassDebug('no selectable option found', options.map((option) => String(option.textContent || '').trim()));
        return false;
      }

      logSubclassDebug('clicking option', String(firstRealOption.textContent || '').trim());
      firstRealOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      const updatedLabel = String(subclassSelect.querySelector('.selected-option .option-label')?.textContent || '').trim().toLowerCase();
      logSubclassDebug('label after click', updatedLabel || '(empty)');
      return updatedLabel.length > 0 && !updatedLabel.includes('select');
    }, TEST_TIMEOUTS.uiInteraction, POLL_INTERVAL);
  };

  const activateExistingClassRow = async () => {
    const isRowActivated = (root) => {
      const addLevelButton = root.querySelector('.footer-container .gas-add-level-btn');
      if (addLevelButton && !addLevelButton.disabled) return true;
      if (root.querySelector('#subClass-select')) return true;

      const classRows = Array.from(root.querySelectorAll('.class-row[role="button"]'));
      if (!classRows.length) return false;

      const matchingRow = classRows.find((row) => {
        const text = String(row.textContent || '').toLowerCase();
        const tooltip = String(row.getAttribute('data-tooltip') || row.getAttribute('aria-label') || '').toLowerCase();
        return `${text} ${tooltip}`.includes(classIdentifier);
      }) || classRows[0];

      return Boolean(matchingRow?.querySelector('i.fa-times, i.fas.fa-times'));
    };

    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      if (isRowActivated(root)) return true;

      const classRows = Array.from(root.querySelectorAll('.class-row[role="button"]'));
      const matchingRow = classRows.find((row) => {
        const text = String(row.textContent || '').toLowerCase();
        const tooltip = String(row.getAttribute('data-tooltip') || row.getAttribute('aria-label') || '').toLowerCase();
        return `${text} ${tooltip}`.includes(classIdentifier);
      }) || classRows[0];

      const plusIcon = matchingRow?.querySelector('i.fa-plus, i.fas.fa-plus')
        || root.querySelector('.class-row[role="button"] i.fa-plus, .class-row[role="button"] i.fas.fa-plus');
      const clickableRow = plusIcon?.closest?.('[role="button"]') || matchingRow || root.querySelector('.class-row[role="button"]');
      if (!clickableRow) return false;

      clickableRow.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return false;
    }, TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL);
  };

  const clickActorStudioLevelUpButtonOnSheet = async (actor) => {
    if (!actor?.sheet) return false;
    await actor.sheet.render(true, { focus: true });
    await wait(WAIT_LONG);

    const button = document.querySelector('button.level-up');
    if (!button || button.disabled) return false;

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(WAIT_MEDIUM);
    return true;
  };

  const waitForLevelUpAppOpen = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;
      return Boolean(root.querySelector('.tabs-list'));
    }, TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL);
  };

  const waitForActorStudioClosed = async () => waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), TEST_TIMEOUTS.appLifecycleComplete, POLL_INTERVAL);

  const waitForActorClassLevel = async (actorId, targetLevel) => {
    return waitForCondition(() => {
      const actor = game.actors.get(actorId);
      if (!actor) return false;
      const classItem = actor.items.find((item) => item.type === 'class' && String(item.system?.identifier || '').toLowerCase() === classIdentifier);
      return Number(classItem?.system?.levels || 0) >= Number(targetLevel);
    }, TEST_TIMEOUTS.actorDataUpdate, POLL_INTERVAL);
  };

  const hasSpellsTabVisible = () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).some((button) => (button.textContent || '').trim().toLowerCase().includes('spell'));

  const hasSpellUiVisible = () => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;

    return Boolean(
      root.querySelector('spells-tab-container')
      || root.querySelector('.spells-tab')
      || root.querySelector('.spell-level-group .spell-level-header')
      || root.querySelector('.spell-level-group .spell-row')
      || root.querySelector('button.add-btn')
      || root.querySelector('.selected-spells')
    );
  };

  const waitForSpellsTab = async () => {
    return waitForCondition(() => {
      const root = '#foundryvtt-actor-studio-pc-sheet';
      const spellsTabButtonActive = Array.from(document.querySelectorAll(`${root} .tabs-list button.active`))
        .some((button) => (button.textContent || '').trim().toLowerCase().includes('spell'));

      return Boolean(
        document.querySelector(`${root} spells-tab-container`)
        || document.querySelector(`${root} .spells-tab`)
        || document.querySelector(`${root} .selected-spells`)
        || spellsTabButtonActive
        || Array.from(document.querySelectorAll(`${root} .footer-container .button-container button`))
          .some((button) => (button.textContent || '').toLowerCase().includes('finalize'))
      );
    }, TEST_TIMEOUTS.spellWorkflow, POLL_INTERVAL);
  };

  const parseCounterValue = (valueText = '') => {
    const match = String(valueText || '').match(/(\d+)\/(\d+)/);
    if (!match) return { current: 0, limit: 0 };
    return {
      current: Number.parseInt(match[1], 10) || 0,
      limit: Number.parseInt(match[2], 10) || 0
    };
  };

  const readSpellCounters = (root) => {
    const labels = Array.from(root.querySelectorAll('.spells-tab-container .grid-item.label'));
    const values = Array.from(root.querySelectorAll('.spells-tab-container .grid-item.value'));

    let spells = { current: 0, limit: 0 };
    let cantrips = { current: 0, limit: 0 };

    labels.forEach((labelNode, index) => {
      const labelText = String(labelNode.textContent || '').toLowerCase();
      const valueText = String(values[index]?.textContent || '');
      const parsed = parseCounterValue(valueText);

      if (labelText.includes('spell')) {
        spells = parsed;
      }
      if (labelText.includes('cantrip')) {
        cantrips = parsed;
      }
    });

    if (spells.limit === 0 && cantrips.limit === 0) {
      const headerText = root.textContent || '';
      spells = parseCounterValue((headerText.match(/Spells[^0-9]*(\d+\/(\d+))/i) || [])[1] || '0/0');
      cantrips = parseCounterValue((headerText.match(/Cantrips[^0-9]*(\d+\/(\d+))/i) || [])[1] || '0/0');
    }

    return { spells, cantrips };
  };

  const readSpellSelectionSnapshot = (root) => {
    const counters = readSpellCounters(root);
    const selectedSpellRows = root.querySelectorAll('.selected-spells .selected-spell').length;
    return {
      counters,
      selectedSpellRows,
      totalSelected: counters.spells.current + counters.cantrips.current
    };
  };

  const logSpellStepDiagnostics = (stage, root = document.querySelector('#foundryvtt-actor-studio-pc-sheet')) => {
    if (!root) {
      logSubclassDebug(`[spells diagnostics] ${stage}: actor studio root missing`);
      return;
    }

    const activeTab = String(root.querySelector('.tabs-list button.active')?.textContent || '').trim();
    const tabs = Array.from(root.querySelectorAll('.tabs-list button')).map((button) => String(button.textContent || '').trim());
    const counters = readSpellCounters(root);
    const addButtons = Array.from(root.querySelectorAll('button.add-btn'));
    const enabledAddButtons = addButtons.filter((button) => !button.disabled).length;
    const collapsedHeaders = Array.from(root.querySelectorAll('.spell-level-group .spell-level-header'))
      .filter((header) => (header.textContent || '').includes('[+]'))
      .map((header) => String(header.textContent || '').replace(/\s+/g, ' ').trim());
    const spellLevelHeaders = Array.from(root.querySelectorAll('.spell-level-group .spell-level-header'))
      .map((header) => String(header.textContent || '').replace(/\s+/g, ' ').trim());
    const footerButtons = Array.from(root.querySelectorAll('.footer-container .button-container button'))
      .map((button) => ({
        text: String(button.textContent || '').replace(/\s+/g, ' ').trim(),
        disabled: !!button.disabled,
        classes: button.className
      }));
    const selectedSpellRows = root.querySelectorAll('.selected-spells .selected-spell').length;
    const availableSpellRows = root.querySelectorAll('.spell-level-group .spell-row').length;

    logSubclassDebug(`[spells diagnostics] ${stage}`, {
      activeTab,
      tabs,
      counters,
      addButtonsTotal: addButtons.length,
      addButtonsEnabled: enabledAddButtons,
      spellLevelHeaders,
      collapsedHeaders,
      selectedSpellRows,
      availableSpellRows,
      footerButtons,
      rootTextSample: String(root.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 500)
    });
  };

  const pickPreferredSpellAddButton = (root, { needsMoreCantrips = false, needsMoreSpells = false } = {}) => {
    const groups = Array.from(root.querySelectorAll('.spell-level-group'));

    const pickFromGroup = (predicate) => {
      for (const group of groups) {
        const headerText = String(group.querySelector('.spell-level-header')?.textContent || '').toLowerCase();
        if (!predicate(headerText)) continue;
        const enabled = group.querySelector('button.add-btn:not([disabled])');
        if (enabled) return enabled;
      }
      return null;
    };

    // If groups exist, use group-based selection
    if (groups.length > 0) {
      if (needsMoreCantrips) {
        return pickFromGroup((headerText) => headerText.includes('cantrip'));
      }

      if (needsMoreSpells) {
        return pickFromGroup((headerText) => !headerText.includes('cantrip'));
      }

      return root.querySelector('button.add-btn:not([disabled])');
    }

    // Fallback: scan all add buttons and pick based on row text
    const allAddButtons = Array.from(root.querySelectorAll('button.add-btn:not([disabled])'));
    for (const button of allAddButtons) {
      const row = button.closest('.spell-row');
      if (!row) continue;
      const rowText = String(row.textContent || '').toLowerCase();
      
      if (needsMoreCantrips && rowText.includes('cantrip')) {
        return button;
      }
      
      if (needsMoreSpells && !rowText.includes('cantrip')) {
        return button;
      }
    }

    // If no preferred button found, return any button
    return allAddButtons.length > 0 ? allAddButtons[0] : null;
  };

  const completeSpellsStepIfVisible = async ({ timeoutMs = TEST_TIMEOUTS.spellWorkflow, allowSkip = true, requiredSelection = null } = {}) => {
    const allTabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).map((button) => (button.textContent || '').trim());
    logSubclassDebug('checking for spells tab, all tabs:', allTabs);
    const spellsVisible = await waitForCondition(() => hasSpellsTabVisible() || hasSpellUiVisible(), timeoutMs, POLL_INTERVAL);
    if (!spellsVisible) {
      logSubclassDebug('spells tab not visible and spell UI not present');
      return { visible: false, completed: false, finalCounters: { spells: { current: 0, limit: 0 }, cantrips: { current: 0, limit: 0 } } };
    }

    if (hasSpellsTabVisible()) {
      logSubclassDebug('spells tab visible, clicking Spells tab');
      await clickTabByLabel('Spells');
    } else {
      logSubclassDebug('spells tab button missing but spell UI is present; continuing with direct UI automation');
    }

    const spellsLoaded = await waitForSpellsTab();
    if (!spellsLoaded) {
      logSpellStepDiagnostics('spells tab did not become actionable');
      return { visible: true, completed: false, finalCounters: { spells: { current: 0, limit: 0 }, cantrips: { current: 0, limit: 0 } } };
    }

    logSpellStepDiagnostics('spells tab actionable');

    // If no required selection, try immediate finalize (e.g. non-spellcaster or "all" spells class)
    if (!requiredSelection || (requiredSelection.cantrips === 0 && requiredSelection.spells === 0)) {
      const finalizedImmediately = await waitForCondition(
        () => clickFinalizeButton() || clickFooterButtonContaining('finalize'),
        TEST_TIMEOUTS.uiInteraction,
        POLL_INTERVAL
      );
      if (finalizedImmediately) {
        return { visible: true, completed: true, finalCounters: { spells: { current: 0, limit: 0 }, cantrips: { current: 0, limit: 0 } } };
      }
      if (allowSkip) {
        const skipped = await waitForCondition(
          () => clickFooterButtonContaining('skip') || clickFooterButtonContaining('continue'),
          TEST_TIMEOUTS.uiInteraction,
          POLL_INTERVAL
        );
        return { visible: true, completed: skipped, finalCounters: { spells: { current: 0, limit: 0 }, cantrips: { current: 0, limit: 0 } } };
      }
      return { visible: true, completed: false, finalCounters: { spells: { current: 0, limit: 0 }, cantrips: { current: 0, limit: 0 } } };
    }

    // ── Deterministic two-phase spell selection driven by TOON data ──
    const requiredCantrips = requiredSelection.cantrips || 0;
    const requiredSpells = requiredSelection.spells || 0;
    logSubclassDebug('starting TOON-driven spell selection', { requiredCantrips, requiredSpells });

    // Helper: expand a collapsed group by header text match, return true if expanded
    const expandGroupByHeaderMatch = async (root, matchFn) => {
      const header = Array.from(root.querySelectorAll('.spell-level-group .spell-level-header'))
        .find((h) => {
          const text = String(h.textContent || '').toLowerCase();
          return text.includes('[+]') && matchFn(text);
        });
      if (header) {
        header.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(WAIT_SHORT);
        return true;
      }
      return false;
    };

    // Helper: click N add-btn buttons within groups matching a header predicate
    const selectFromGroup = async (root, count, headerMatchFn) => {
      let selected = 0;
      const deadline = Date.now() + TEST_TIMEOUTS.uiStateChange;

      while (selected < count && Date.now() < deadline) {
        const currentRoot = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
        if (!currentRoot) break;

        // Try expanding if collapsed
        await expandGroupByHeaderMatch(currentRoot, headerMatchFn);

        // Find an enabled add button in a matching group
        const groups = Array.from(currentRoot.querySelectorAll('.spell-level-group'));
        let targetButton = null;
        for (const group of groups) {
          const headerText = String(group.querySelector('.spell-level-header')?.textContent || '').toLowerCase();
          if (!headerMatchFn(headerText)) continue;
          targetButton = group.querySelector('button.add-btn:not([disabled])');
          if (targetButton) break;
        }

        if (!targetButton) {
          logSubclassDebug('no add button found for group, waiting', { selected, count });
          await wait(WAIT_SHORT);
          continue;
        }

        targetButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        selected++;
        logSubclassDebug('clicked add button', { selected, count });

        // Wait for the click to register (button should disappear or counter should change)
        await wait(WAIT_SHORT);
      }

      logSubclassDebug('group selection complete', { selected, required: count });
      return selected;
    };

    // Phase 1: Select cantrips
    let cantripsSelected = 0;
    if (requiredCantrips > 0) {
      logSubclassDebug('Phase 1: selecting cantrips', { requiredCantrips });
      cantripsSelected = await selectFromGroup(
        document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        requiredCantrips,
        (headerText) => headerText.includes('cantrip')
      );
    }

    // Phase 2: Select spells
    let spellsSelected = 0;
    if (requiredSpells > 0) {
      logSubclassDebug('Phase 2: selecting spells', { requiredSpells });
      spellsSelected = await selectFromGroup(
        document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        requiredSpells,
        (headerText) => !headerText.includes('cantrip')
      );
    }

    logSubclassDebug('spell selection phases complete', { cantripsSelected, requiredCantrips, spellsSelected, requiredSpells });

    // Phase 3: Finalize
    const finalized = await waitForCondition(
      () => clickFinalizeButton() || clickFooterButtonContaining('finalize'),
      TEST_TIMEOUTS.uiStateChange,
      POLL_INTERVAL
    );

    if (finalized) {
      const closedAfterFinalize = await waitForCondition(
        () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        TEST_TIMEOUTS.appClosure,
        POLL_INTERVAL
      );
      const finalCounters = { cantrips: { current: cantripsSelected, limit: requiredCantrips }, spells: { current: spellsSelected, limit: requiredSpells } };
      if (closedAfterFinalize) {
        return { visible: true, completed: true, finalCounters };
      }
      return { visible: true, completed: true, finalCounters };
    }

    logSpellStepDiagnostics('finalize button unavailable after selection');

    if (!allowSkip) {
      return { visible: true, completed: false, finalCounters: { cantrips: { current: cantripsSelected, limit: requiredCantrips }, spells: { current: spellsSelected, limit: requiredSpells } } };
    }

    const skipped = await waitForCondition(() => {
      const selectors = [
        '#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn',
        '#foundryvtt-actor-studio-pc-sheet .footer-container button.secondary',
        '#foundryvtt-actor-studio-pc-sheet .footer-container .button-container .secondary'
      ];
      return selectors.some((selector) => clickFooterButtonBySelector(selector)) || clickFooterButtonContaining('skip') || clickFooterButtonContaining('continue');
    }, TEST_TIMEOUTS.uiInteraction, POLL_INTERVAL);

    return { visible: true, completed: skipped, finalCounters: { cantrips: { current: cantripsSelected, limit: requiredCantrips }, spells: { current: spellsSelected, limit: requiredSpells } } };
  };

  const hasSelectionFromUuid = (item, expectedUuid) => {
    const uuidTail = String(expectedUuid || '').split('.').pop() || '';
    const sourceId = String(
      item?._stats?.compendiumSource
      || item?.flags?.core?.sourceId
      || item?.flags?.dnd5e?.sourceId
      || item?.flags?.['dnd5e']?.sourceId
      || item?.system?.sourceId
      || ''
    );
    return Boolean(uuidTail && sourceId.includes(uuidTail));
  };

  const assertCoreSelectionsOnActor = (actor) => {
    const hasClassSelection = actor.items.some((item) => item.type === 'class' && (
      String(item.system?.identifier || '').toLowerCase() === classIdentifier
      || hasSelectionFromUuid(item, classConfig.classUuid)
      || String(item.name || '').toLowerCase().includes(classConfig.displayName.toLowerCase())
    ));
    const hasRaceSelection = actor.items.some((item) => ['race', 'species'].includes(item.type) && hasSelectionFromUuid(item, classConfig.raceUuid));
    const hasBackgroundSelection = actor.items.some((item) => item.type === 'background' && hasSelectionFromUuid(item, classConfig.backgroundUuid));
    assert.ok(hasClassSelection, `Created actor should contain the selected ${classConfig.displayName} class`);
    assert.ok(hasRaceSelection, 'Created actor should contain the selected race/species');
    assert.ok(hasBackgroundSelection, 'Created actor should contain the selected background');
  };

  const findActorByName = () => {
    const matches = game.actors.contents.filter((actorDoc) => actorDoc?.name === testActorName && actorDoc?.type === 'character');
    if (!matches.length) return null;
    return matches[matches.length - 1];
  };

  const getCurrentActor = () => {
    if (classActorId) {
      const actorFromId = game.actors.get(classActorId) || null;
      if (actorFromId) return actorFromId;
    }
    const actorFromName = findActorByName();
    if (actorFromName && !classActorId) classActorId = actorFromName.id;
    return actorFromName;
  };

  const beforeAll = function () {
    window.GAS = window.GAS || {};
    savedDebugState = {};
    for (const key of DEBUG_ROOT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(window.GAS, key)) {
        savedDebugState[key] = window.GAS[key];
        delete window.GAS[key];
      }
    }
    originalMilestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
    originalForceTakeAverageHitPoints = safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false);
  };

  const afterAll = async function () {
    if (window?.GAS?.quenchAutomation) delete window.GAS.quenchAutomation;
    await closeActorStudioIfOpen();
    const actorToCleanup = classActorId ? game.actors.get(classActorId) : (classActor || findActorByName());
    try {
      await actorToCleanup?.sheet?.close?.();
    } catch (error) {
      // ignore
    }
    if (actorToCleanup && !actorToCleanup.deleted) await actorToCleanup.delete();
    await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
    await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);
    for (const [key, value] of Object.entries(savedDebugState)) window.GAS[key] = value;
  };

  const runCreationTest = async () => {
    await game.settings.set(MODULE_ID, 'allowManualInput', true);
    await game.settings.set(MODULE_ID, 'allowStandardArray', false);
    await game.settings.set(MODULE_ID, 'allowPointBuy', false);
    await game.settings.set(MODULE_ID, 'allowRolling', false);
    await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
    await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
    await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);

    window.GAS.quenchAutomation = {
      enabled: true,
      allowLegacyRootValues: false,
      advancements: { enabled: true },
      selections: {
        race: classConfig.raceUuid,
        background: classConfig.backgroundUuid,
        characterClass: classConfig.classUuid
      }
    };

    await closeActorStudioIfOpen();
    const creationApp = await openActorStudio(testActorName);
    assert.ok(creationApp, `Actor Studio should open for ${classIdentifier} creation test`);

    const requiredTabsVisited = await visitRequiredCreationTabs();
    assert.ok(requiredTabsVisited, `All visible creation tabs should be visited before creating ${classIdentifier}`);

    const createClicked = await waitForCondition(() => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'), TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL);
    assert.ok(createClicked, `Create Character button should be clickable for ${classIdentifier}`);

    const creationClosedEarly = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), TEST_TIMEOUTS.appClosure, POLL_INTERVAL);
    if (!creationClosedEarly) {
      // Compute the required level-1 spell selection from TOON data for spellcasting classes.
      // This is the FULL starting pool, not a delta, so we read level 1 directly.
      const rulesVersionSetting = String(game?.settings?.get?.('dnd5e', 'rulesVersion') || '').trim().toLowerCase();
      const rulesVersionFromSettings = rulesVersionSetting === 'modern' ? '2024' : (rulesVersionSetting ? '2014' : '');
      const rulesVersion = String(window.GAS?.dnd5eRules || '').trim() || rulesVersionFromSettings || '2014';
      const progressionTOON = classConfig?.spellProgressionTOON?.levels;
      const level1TOONEntry = progressionTOON?.['1'] || progressionTOON?.[1];
      const level1Raw = level1TOONEntry?.[rulesVersion] ?? level1TOONEntry?.default;
      const level1Parsed = level1Raw ? parseSpellProgressionValue(level1Raw) : null;
      const creationRequiredSelection = (level1Parsed && (level1Parsed.cantrips > 0 || (level1Parsed.spells > 0 && !level1Parsed.hasAllSpells)))
        ? { cantrips: level1Parsed.cantrips, spells: level1Parsed.spells }
        : null;
      logSubclassDebug('creation spell required selection', { rulesVersion, level1Raw, creationRequiredSelection });

      const spellStepResult = await completeSpellsStepIfVisible({
        timeoutMs: TEST_TIMEOUTS.spellWorkflow,
        allowSkip: !creationRequiredSelection,
        requiredSelection: creationRequiredSelection
      });
      if (spellStepResult.visible) {
        assert.ok(spellStepResult.completed, `${classConfig.displayName} creation spells step should complete via UI controls`);
      }
    }

    const actorStudioClosed = await waitForActorStudioClosed();
    assert.ok(actorStudioClosed, `Actor Studio should close after ${classIdentifier} creation completes`);

    await wait(getTestTimeout('advancementProcessing'));
    classActorId = get(actorInGame)?.id || findActorByName()?.id || null;
    assert.ok(classActorId, `Created ${classIdentifier} actor id should be available after creation`);

    const reachedLevel1 = await waitForActorClassLevel(classActorId, 1);
    assert.ok(reachedLevel1, `${classConfig.displayName} class level should be embedded at level 1 after creation`);

    classActor = game.actors.get(classActorId);
    assert.ok(classActor, `Created ${classIdentifier} actor should exist in world actors`);
    assertCoreSelectionsOnActor(classActor);
  };

  const runOpenLevelUpAppTest = async () => {
    const actor = getCurrentActor();
    assert.ok(actor, `Existing created ${classIdentifier} actor should be available for level-up tests`);

    await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
    await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
    window.GAS.quenchAutomation = { enabled: true, allowLegacyRootValues: false, advancements: { enabled: true }, selections: {} };

    await closeActorStudioIfOpen();
    const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
    assert.ok(levelUpButtonClicked, `Actor Studio level-up button should be clickable on the ${classIdentifier} actor sheet`);

    const levelUpAppOpened = await waitForLevelUpAppOpen();
    assert.ok(levelUpAppOpened, `Level-up Actor Studio app should open from ${classIdentifier} actor sheet button`);
    await closeActorStudioIfOpen();
  };

  const runLevelTest = async (targetLevel) => {
    const actor = getCurrentActor();
    assert.ok(actor, `Existing created ${classIdentifier} actor should be available for level-up to ${targetLevel}`);

    const baselineSpellItemIds = new Set(
      actor.items
        .filter((item) => item.type === 'spell')
        .map((item) => item.id)
    );

    const resolveSpellLevel = (item) => {
      const rawCandidates = [
        item?.system?.level,
        item?.system?.details?.level,
        item?.system?.spellLevel,
        item?.level
      ];

      for (const candidate of rawCandidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        const parsed = Number(candidate);
        if (!Number.isNaN(parsed)) return parsed;
      }

      const labelLevel = String(item?.labels?.level || '').toLowerCase();
      if (labelLevel.includes('cantrip')) return 0;

      return null;
    };

    const getActorSpellDeltaCounts = () => {
      const liveActor = game.actors.get(classActorId) || getCurrentActor();
      if (!liveActor) return { spells: 0, cantrips: 0, unknown: 0, total: 0 };

      const newSpellItems = liveActor.items.filter((item) => item.type === 'spell' && !baselineSpellItemIds.has(item.id));

      let spells = 0;
      let cantrips = 0;
      let unknown = 0;

      for (const item of newSpellItems) {
        const level = resolveSpellLevel(item);
        if (level === 0) {
          cantrips += 1;
          continue;
        }

        if (typeof level === 'number' && level > 0) {
          spells += 1;
          continue;
        }

        // Unknown spell level should not cause false negatives; count it as a spell.
        unknown += 1;
        spells += 1;
      }

      return { spells, cantrips, unknown, total: newSpellItems.length };
    };

    await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
    await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
    await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
    await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);
    await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
    window.GAS.quenchAutomation = { enabled: true, allowLegacyRootValues: false, advancements: { enabled: true }, selections: {} };

    await closeActorStudioIfOpen();
    const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
    assert.ok(levelUpButtonClicked, `Level-up button should be clickable for ${classIdentifier} -> ${targetLevel}`);

    const levelUpAppOpened = await waitForLevelUpAppOpen();
    assert.ok(levelUpAppOpened, `Level-up app should open for ${classIdentifier} -> ${targetLevel}`);

    const levelUpTabFocused = await focusLevelUpClassTab();
    assert.ok(levelUpTabFocused, `Level-up/Class tab should be focused before ${classIdentifier} level-up`);

    const rowActivated = await activateExistingClassRow();
    assert.ok(rowActivated, `Existing class row should activate for ${classIdentifier} level-up`);

    const subclassHandled = await selectFirstSubclassOptionIfRequired();
    assert.ok(subclassHandled, `Subclass choice should be handled when required for ${classIdentifier} at level ${targetLevel}`);

    const addLevelClicked = await waitForCondition(() => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'), TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL);
    assert.ok(addLevelClicked, `Add Level button should be clickable for ${classIdentifier} progression`);

    await wait(getTestTimeout('advancementPostLevel'));
    const tabsAfterAddLevel = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).map((button) => (button.textContent || '').trim());
    logSubclassDebug('tabs after add level:', tabsAfterAddLevel);

    const rulesVersionSetting = String(game?.settings?.get?.('dnd5e', 'rulesVersion') || '').trim().toLowerCase();
    const rulesVersionFromSettings = rulesVersionSetting === 'modern' ? '2024' : (rulesVersionSetting ? '2014' : '');
    const rulesVersion = String(window.GAS?.dnd5eRules || '').trim() || rulesVersionFromSettings || '2014';
    const expectSpells = shouldExpectSpellsForLevelDynamic({ classIdentifier, targetLevel, rulesVersion });
    const expectedSelection = getExpectedSpellSelectionDeltaDynamic({ targetLevel, rulesVersion });
    const spellStepResult = await completeSpellsStepIfVisible({
      timeoutMs: TEST_TIMEOUTS.spellWorkflow,
      allowSkip: !expectSpells,
      requiredSelection: expectSpells ? expectedSelection : null
    });
    logSubclassDebug('spell expectations', { classIdentifier, targetLevel, expectSpells, rulesVersion });
    if (expectSpells) {
      assert.ok(spellStepResult.visible, `Spells tab should appear for ${classIdentifier} level ${targetLevel}`);
      assert.ok(spellStepResult.completed, `${classConfig.displayName} level-up spells step should complete`);
      const finalSpellCount = spellStepResult.finalCounters?.spells?.current || 0;
      const finalCantripCount = spellStepResult.finalCounters?.cantrips?.current || 0;
      let observedSpellCount = finalSpellCount;
      let observedCantripCount = finalCantripCount;

      if (observedSpellCount < expectedSelection.spells || observedCantripCount < expectedSelection.cantrips) {
        await waitForCondition(() => {
          const actorDelta = getActorSpellDeltaCounts();
          return actorDelta.spells >= expectedSelection.spells && actorDelta.cantrips >= expectedSelection.cantrips;
        }, TEST_TIMEOUTS.actorDataUpdate, POLL_INTERVAL);

        const actorDelta = getActorSpellDeltaCounts();
        observedSpellCount = Math.max(observedSpellCount, actorDelta.spells);
        observedCantripCount = Math.max(observedCantripCount, actorDelta.cantrips);

        logSubclassDebug('spell counter reconciliation', {
          classIdentifier,
          targetLevel,
          uiCounters: { spells: finalSpellCount, cantrips: finalCantripCount },
          actorDelta,
          expectedSelection,
          observed: { spells: observedSpellCount, cantrips: observedCantripCount }
        });
      }

      assert.ok(
        observedSpellCount >= expectedSelection.spells,
        `${classConfig.displayName} level ${targetLevel} should select at least ${expectedSelection.spells} spells (selected: ${observedSpellCount})`
      );
      assert.ok(
        observedCantripCount >= expectedSelection.cantrips,
        `${classConfig.displayName} level ${targetLevel} should select at least ${expectedSelection.cantrips} cantrips (selected: ${observedCantripCount})`
      );
    } else if (spellStepResult.visible) {
      assert.ok(spellStepResult.completed, `If spells UI appears for ${classIdentifier} level ${targetLevel}, it should complete`);
    }

    const appClosed = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), TEST_TIMEOUTS.appLifecycleComplete, POLL_INTERVAL);
    if (!appClosed) {
      logSpellStepDiagnostics(`level-up app did not close for ${classIdentifier} level ${targetLevel}`);
      const levelUpState = window.GAS?.levelUpFSM?.getCurrentState?.();
      logSubclassDebug('level-up close failure state snapshot', {
        classIdentifier,
        targetLevel,
        levelUpState,
        actorId: classActorId,
        actorName: getCurrentActor()?.name || null
      });
    }
    assert.ok(appClosed, 'Level-up app should close after progression');

    const reachedTargetLevel = await waitForActorClassLevel(classActorId, targetLevel);
    assert.ok(reachedTargetLevel, `${classConfig.displayName} class level should progress to ${targetLevel}`);
  };

  return {
    TEST_TIMEOUTS,
    beforeAll,
    afterAll,
    runCreationTest,
    runOpenLevelUpAppTest,
    runLevelTest
  };
}
