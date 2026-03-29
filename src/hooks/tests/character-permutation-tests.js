import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';
import { getTestTimeouts } from '~/src/helpers/testTimeouts';

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
  const WAIT_SHORT = POLL_INTERVAL;
  const WAIT_MEDIUM = POLL_INTERVAL * 2;
  const WAIT_LONG = POLL_INTERVAL * 3;

  let savedDebugState = {};
  let originalMilestoneLeveling = false;
  let originalForceTakeAverageHitPoints = false;
  let classActorId = null;
  let classActor = null;
  const testActorName = `Quench ${classConfig.displayName} Automation ${Date.now()}`;

  const waitForCondition = async (fn, timeoutMs = TEST_TIMEOUTS.generalCondition, intervalMs = TEST_TIMEOUTS.pollingInterval) => {
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

  const clickTabByLabel = async (label) => {
    const tabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'));
    const target = tabs.find((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase()));
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return waitForCondition(
      () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button.active'))
        .some((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase())),
      TEST_TIMEOUTS.generalCondition,
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
    return waitForCondition(() => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet .class-row[role="button"]')), TEST_TIMEOUTS.generalCondition, POLL_INTERVAL);
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

      const firstRealOption = options.find((option) => {
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
    }, TEST_TIMEOUTS.generalCondition, POLL_INTERVAL);
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
    }, TEST_TIMEOUTS.generalCondition * 2, POLL_INTERVAL);
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
    }, TEST_TIMEOUTS.generalCondition * 2, POLL_INTERVAL);
  };

  const waitForActorStudioClosed = async () => waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), TEST_TIMEOUTS.actorStudioClosed * 8, POLL_INTERVAL);

  const waitForActorClassLevel = async (actorId, targetLevel) => {
    return waitForCondition(() => {
      const actor = game.actors.get(actorId);
      if (!actor) return false;
      const classItem = actor.items.find((item) => item.type === 'class' && String(item.system?.identifier || '').toLowerCase() === classIdentifier);
      return Number(classItem?.system?.levels || 0) >= Number(targetLevel);
    }, TEST_TIMEOUTS.perTest, POLL_INTERVAL);
  };

  const hasSpellsTabVisible = () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).some((button) => (button.textContent || '').trim().toLowerCase().includes('spell'));

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
    }, TEST_TIMEOUTS.spellsTabVisible * 3, POLL_INTERVAL);
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

  const completeSpellsStepIfVisible = async ({ timeoutMs = TEST_TIMEOUTS.spellsTabVisible * 3, allowSkip = true } = {}) => {
    const allTabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).map((button) => (button.textContent || '').trim());
    logSubclassDebug('checking for spells tab, all tabs:', allTabs);
    const spellsVisible = await waitForCondition(() => hasSpellsTabVisible(), timeoutMs, POLL_INTERVAL);
    if (!spellsVisible) {
      logSubclassDebug('spells tab not visible');
      return { visible: false, completed: false };
    }

    logSubclassDebug('spells tab visible, clicking Spells tab');
    await clickTabByLabel('Spells');
    const spellsLoaded = await waitForSpellsTab();
    if (!spellsLoaded) {
      logSpellStepDiagnostics('spells tab did not become actionable');
      logSubclassDebug('spells tab failed to load actionable UI');
      return { visible: true, completed: false };
    }

    logSpellStepDiagnostics('spells tab actionable');

    const finalizedImmediately = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn') || clickFooterButtonContaining('finalize'),
      TEST_TIMEOUTS.generalCondition,
      POLL_INTERVAL
    );
    if (finalizedImmediately) return { visible: true, completed: true };

    const selectionDeadline = Date.now() + (TEST_TIMEOUTS.generalCondition * 2);
    let selectedEnoughSpells = false;
    while (Date.now() < selectionDeadline) {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) break;

      if (isFooterButtonAvailable('finalize')) {
        selectedEnoughSpells = true;
        break;
      }

      const { counters, selectedSpellRows, totalSelected } = readSpellSelectionSnapshot(root);
      const spellLimit = counters.spells.limit;
      const cantripLimit = counters.cantrips.limit;
      const totalLimit = spellLimit + cantripLimit;

      const collapsedHeaders = Array.from(root.querySelectorAll('.spell-level-group .spell-level-header'))
        .filter((header) => (header.textContent || '').includes('[+]'));
      if (collapsedHeaders.length) {
        logSubclassDebug('expanding collapsed spell group', {
          header: String(collapsedHeaders[0].textContent || '').replace(/\s+/g, ' ').trim(),
          counters,
          totalSelected,
          totalLimit
        });
        collapsedHeaders[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(WAIT_SHORT);
        continue;
      }

      const spellRows = root.querySelectorAll('.spell-level-group .spell-row').length;
      const addButtons = Array.from(root.querySelectorAll('button.add-btn:not([disabled])'));
      const hasSpellChoicesVisible = spellRows > 0 || addButtons.length > 0;
      const useFallbackSelection = totalLimit === 0 && hasSpellChoicesVisible;
      const needsMoreSpells = counters.spells.current < spellLimit;
      const needsMoreCantrips = counters.cantrips.current < cantripLimit;

      if (!useFallbackSelection && !needsMoreSpells && !needsMoreCantrips) {
        selectedEnoughSpells = true;
        break;
      }

      if (!addButtons.length) {
        if (useFallbackSelection) {
          logSpellStepDiagnostics('fallback selection active but no add buttons visible', root);
        }
        await wait(WAIT_SHORT);
        continue;
      }

      const targetButton = addButtons[0];
      const buttonLabel = String(targetButton.closest('.spell-row')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      logSubclassDebug('clicking spell add button', {
        buttonLabel,
        useFallbackSelection,
        beforeCounters: counters,
        beforeSelectedSpellRows: selectedSpellRows,
        totalSelected,
        totalLimit
      });

      targetButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      const selectionAdvanced = await waitForCondition(() => {
        const updatedRoot = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
        if (!updatedRoot) return false;
        const updated = readSpellSelectionSnapshot(updatedRoot);
        return updated.totalSelected > totalSelected || updated.selectedSpellRows > selectedSpellRows || isFooterButtonAvailable('finalize');
      }, WAIT_MEDIUM, POLL_INTERVAL);

      if (!selectionAdvanced) {
        logSpellStepDiagnostics(`spell add click produced no visible progress: ${buttonLabel}`);
        await wait(WAIT_SHORT);
      }
    }

    if (!selectedEnoughSpells) {
      logSpellStepDiagnostics('selection did not reach required counters');
      logSubclassDebug('unable to satisfy spell selection counters before timeout');
    }

    const finalized = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn') || clickFooterButtonContaining('finalize'),
      TEST_TIMEOUTS.generalCondition,
      POLL_INTERVAL
    );
    if (finalized) return { visible: true, completed: true };

    logSpellStepDiagnostics('finalize button unavailable after selection');

    if (!allowSkip) {
      logSpellStepDiagnostics('skip disabled for required spell flow');
      return { visible: true, completed: false };
    }

    const skipped = await waitForCondition(() => {
      const selectors = [
        '#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn',
        '#foundryvtt-actor-studio-pc-sheet .footer-container button.secondary',
        '#foundryvtt-actor-studio-pc-sheet .footer-container .button-container .secondary'
      ];
      return selectors.some((selector) => clickFooterButtonBySelector(selector)) || clickFooterButtonContaining('skip') || clickFooterButtonContaining('continue');
    }, TEST_TIMEOUTS.generalCondition, POLL_INTERVAL);
    if (!skipped) {
      logSpellStepDiagnostics('skip/continue controls unavailable');
    }
    return { visible: true, completed: skipped };
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

    const createClicked = await waitForCondition(() => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'), TEST_TIMEOUTS.generalCondition * 2, POLL_INTERVAL);
    assert.ok(createClicked, `Create Character button should be clickable for ${classIdentifier}`);

    const creationClosedEarly = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), TEST_TIMEOUTS.generalCondition, POLL_INTERVAL);
    if (!creationClosedEarly) {
      const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: TEST_TIMEOUTS.spellsTabVisible * 3 });
      if (spellStepResult.visible) {
        assert.ok(spellStepResult.completed, `${classConfig.displayName} creation spells step should complete via UI controls`);
      }
    }

    const actorStudioClosed = await waitForActorStudioClosed();
    assert.ok(actorStudioClosed, `Actor Studio should close after ${classIdentifier} creation completes`);

    await wait(TEST_TIMEOUTS.advancementAutomation);
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

    const addLevelClicked = await waitForCondition(() => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'), TEST_TIMEOUTS.generalCondition * 2, POLL_INTERVAL);
    assert.ok(addLevelClicked, `Add Level button should be clickable for ${classIdentifier} progression`);

    await wait(TEST_TIMEOUTS.advancementAutomation * 2);
    const tabsAfterAddLevel = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).map((button) => (button.textContent || '').trim());
    logSubclassDebug('tabs after add level:', tabsAfterAddLevel);

    const rulesVersion = String(window.GAS?.dnd5eRules || '').trim();
    const expectSpells = typeof classConfig.shouldExpectSpellsForLevel === 'function'
      ? Boolean(classConfig.shouldExpectSpellsForLevel({ classIdentifier, targetLevel, rulesVersion }))
      : false;
    const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: TEST_TIMEOUTS.spellsTabVisible * 3, allowSkip: !expectSpells });
    logSubclassDebug('spell expectations', { classIdentifier, targetLevel, expectSpells, rulesVersion });
    if (expectSpells) {
      assert.ok(spellStepResult.visible, `Spells tab should appear for ${classIdentifier} level ${targetLevel}`);
      assert.ok(spellStepResult.completed, `${classConfig.displayName} level-up spells step should complete`);
    } else if (spellStepResult.visible) {
      assert.ok(spellStepResult.completed, `If spells UI appears for ${classIdentifier} level ${targetLevel}, it should complete`);
    }

    const appClosed = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), TEST_TIMEOUTS.generalCondition, POLL_INTERVAL);
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
