import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';
import { getTestTimeouts } from '~/src/helpers/testTimeouts';

export function registerCharacterPermutationTests(context, options = {}) {
  const { describe, it, assert, before, after } = context;
  const enabledClasses = new Set((options?.classes || ['cleric', 'fighter', 'ranger', 'warlock']).map((entry) => String(entry).toLowerCase()));

  const MODULE_ID = 'foundryvtt-actor-studio';
  const TEST_TIMEOUTS = getTestTimeouts();
  const wait = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));
  let createdActor = null;
  let createdActorId = null;

  const closeActorStudioIfOpen = async () => {
    const app = Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet');
    if (app?.close) {
      app.setClosingFromGasHook(true);
      await app.close();
      await wait(200);
    }

    let attempts = 0;
    while (document.querySelector('#foundryvtt-actor-studio-pc-sheet') && attempts < 20) {
      await wait(100);
      attempts++;
    }

    const element = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (element) {
      element.remove();
      await wait(100);
    }
  };

  const openActorStudio = async (name = 'Quench Permutation Test') => {
    Hooks.call('gas.openActorStudio', name, '', 'character');
    await wait(300);
    return Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
  };

  const getActorStudioApp = () => {
    return Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
  };

  const getCurrentActor = () => {
    if (!createdActorId) return null;
    return game.actors.get(createdActorId) || null;
  };

  const closeActorSheetIfOpen = async (actor) => {
    if (!actor?.sheet) return;

    try {
      await actor.sheet.close();
    } catch (error) {
      // Ignore close errors in test cleanup.
    }

    await wait(150);
  };

  const configureQuenchAutomation = (config = {}) => {
    window.GAS = window.GAS || {};
    window.GAS.quenchAutomation = {
      enabled: true,
      allowLegacyRootValues: false,
      advancements: {
        enabled: true,
        ...(config.advancements || {})
      },
      selections: {
        ...(config.selections || {})
      }
    };
  };

  const clearQuenchAutomation = () => {
    if (window?.GAS?.quenchAutomation) {
      delete window.GAS.quenchAutomation;
    }
  };

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

  const clickFooterButtonContaining = async (text) => {
    const buttons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button'));
    const target = buttons.find((button) => {
      const label = (button.textContent || '').toLowerCase();
      return label.includes(text.toLowerCase()) && !button.disabled;
    });

    if (!target) return false;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return true;
  };

  const clickFooterButtonBySelector = async (selector) => {
    const target = document.querySelector(selector);
    if (!target || target.disabled) return false;

    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return true;
  };

  const isFooterButtonAvailable = (text) => {
    const buttons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button'));
    return buttons.some((button) => {
      const label = (button.textContent || '').toLowerCase();
      return label.includes(text.toLowerCase()) && !button.disabled;
    });
  };

  const clickTabByLabel = async (label) => {
    const tabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'));
    const target = tabs.find((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase()));
    if (!target) return false;

    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    return await waitForCondition(
      () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button.active'))
        .some((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase())),
      5000,
      100
    );
  };

  const clickFirstAvailableTabLabel = async (labels) => {
    for (const label of labels) {
      const clicked = await clickTabByLabel(label);
      if (clicked) return true;
    }
    return false;
  };

  const focusLevelUpClassTab = async () => {
    const tabFocused = await clickFirstAvailableTabLabel(['Level Up', 'Class']);
    if (!tabFocused) return false;

    // Wait for class-row elements to appear in the focused tab
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;
      return Boolean(root.querySelector('.class-row'));
    }, 8000, 100);
  };

  const clickActorStudioLevelUpButtonOnSheet = async (actor) => {
    if (!actor?.sheet) return false;

    await closeActorStudioIfOpen();
    await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 5000, 100);

    // Render sheet multiple times to ensure header injections are complete
    await actor.sheet.render(true, { focus: true });
    await wait(300);
    await actor.sheet.render(true, { focus: true });
    await wait(300);
    await actor.sheet.render(true, { focus: true });
    
    await waitForCondition(() => {
      const rootElement = actor.sheet?.element?.[0] || actor.sheet?.element || null;
      return Boolean(rootElement && rootElement.isConnected);
    }, 8000, 100);

    const buttonClicked = await waitForCondition(() => {
      const rootElement = actor.sheet?.element?.[0] || actor.sheet?.element || null;
      const appWrapper = actor.sheet?.appId != null
        ? document.querySelector(`[data-appid="${actor.sheet.appId}"]`)
        : null;

      // Search selectors in priority order
      const selectors = [
        'button.level-up',
        'button[title*="Level"]',
        'button[title*="level"]',
        '#gas-levelup-btn',
        'button.gas-levelup',
        '.gas-levelup'
      ];

      let button = null;
      for (const selector of selectors) {
        button = rootElement?.querySelector?.(selector)
          || appWrapper?.querySelector?.(selector)
          || document.querySelector(selector)
          || null;
        if (button && !button.disabled && button.isConnected) {
          break;
        }
        button = null;
      }

      if (!button || button.disabled || !button.isConnected) return false;

      if (typeof button.scrollIntoView === 'function') {
        button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }

      // Ensure button has focus
      if (typeof button.focus === 'function') {
        button.focus();
      }

      // Dispatch multiple event types for broader compatibility
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }));
      button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, composed: true }));
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      // Try jQuery if available
      if (typeof window.$ === 'function') {
        window.$(button).trigger('click');
      }

      // Try native click method
      if (typeof button.click === 'function') {
        button.click();
      }

      return true;
    }, 20000, 150);

    return buttonClicked;
  };

  const waitForActorStudioClosed = async () => {
    return waitForCondition(
      () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
      30000,
      150
    );
  };

  const waitForLevelUpAppOpen = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      return Array.from(root.querySelectorAll('.tabs-list button'))
        .some((button) => (button.textContent || '').trim().toLowerCase().includes('level'));
    }, 20000, 150);
  };

  const clickExistingClassPlusInLevelUp = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      const addLevelButton = root.querySelector('.footer-container .gas-add-level-btn');
      if (addLevelButton && !addLevelButton.disabled) {
        return true;
      }

      const plusIcon = root.querySelector(
        '.class-row[role="button"] i.fa-plus, .class-row[role="button"] i.fas.fa-plus, .class-row i.fa-plus, .class-row i.fas.fa-plus'
      );
      const clickableRow = plusIcon?.closest?.('[role="button"]')
        || plusIcon?.closest?.('.class-row')
        || root.querySelector('.class-row[role="button"]')
        || root.querySelector('.class-row');
      if (!clickableRow) return false;

      if (typeof clickableRow.scrollIntoView === 'function') {
        clickableRow.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }

      clickableRow.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      return Boolean(root.querySelector('.footer-container .gas-add-level-btn'));
    }, 18000, 150);
  };

  const selectIconSelectOptionByLabel = async (selectId, labels, { excludedLabels = [] } = {}) => {
    const preferredLabels = (Array.isArray(labels) ? labels : [labels])
      .map((label) => String(label || '').trim().toLowerCase())
      .filter(Boolean);
    const excluded = new Set(
      (Array.isArray(excludedLabels) ? excludedLabels : [excludedLabels])
        .map((label) => String(label || '').trim().toLowerCase())
        .filter(Boolean)
    );

    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      const select = root.querySelector(`#${selectId}`);
      if (!select) return false;

      const selectedLabel = select.querySelector('.selected-option .option-label');
      const selectedText = String(selectedLabel?.textContent || '').trim().toLowerCase();
      if (selectedText) {
        if (preferredLabels.length === 0) {
          return !excluded.has(selectedText);
        }

        if (preferredLabels.some((label) => selectedText.includes(label))) {
          return true;
        }
      }

      const trigger = select.querySelector('.selected-option');
      if (!trigger) return false;

      if (!select.querySelector('.options-dropdown')) {
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return false;
      }

      const options = Array.from(select.querySelectorAll('.options-dropdown .option'));
      if (!options.length) return false;

      const matchingOption = options.find((option) => {
        const text = String(option.textContent || '').trim().toLowerCase();
        return preferredLabels.some((label) => text.includes(label)) && !excluded.has(text);
      }) || options.find((option) => {
        const text = String(option.textContent || '').trim().toLowerCase();
        return !excluded.has(text);
      });

      if (!matchingOption) return false;

      matchingOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      const updatedLabel = select.querySelector('.selected-option .option-label');
      const updatedText = String(updatedLabel?.textContent || '').trim().toLowerCase();
      if (!updatedText) return false;

      if (preferredLabels.length === 0) {
        return !excluded.has(updatedText);
      }

      return preferredLabels.some((label) => updatedText.includes(label));
    }, 10000, 150);
  };

  const ensureSubclassChoiceIfRequired = async ({ preferredLabels = [], excludedLabels = [] } = {}) => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      const subclassSelect = root.querySelector('#subClass-select');
      if (!subclassSelect) {
        return true;
      }

      const selectedSubclassLabel = subclassSelect.querySelector('.selected-option .option-label');
      if (selectedSubclassLabel && (selectedSubclassLabel.textContent || '').trim().length > 0) {
        return true;
      }

      const trigger = subclassSelect.querySelector('.selected-option');
      if (!trigger) return false;

      if (!subclassSelect.querySelector('.options-dropdown')) {
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return false;
      }

      const options = Array.from(subclassSelect.querySelectorAll('.options-dropdown .option'));
      const preferred = preferredLabels.map((label) => String(label || '').trim().toLowerCase()).filter(Boolean);
      const excluded = new Set(excludedLabels.map((label) => String(label || '').trim().toLowerCase()).filter(Boolean));

      const option = options.find((candidate) => {
        const text = String(candidate.textContent || '').trim().toLowerCase();
        return preferred.some((label) => text.includes(label)) && !excluded.has(text);
      }) || options.find((candidate) => {
        const text = String(candidate.textContent || '').trim().toLowerCase();
        return !excluded.has(text);
      });

      if (!option) return false;

      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      const updatedSelection = subclassSelect.querySelector('.selected-option .option-label');
      return Boolean(updatedSelection && (updatedSelection.textContent || '').trim().length > 0);
    }, 10000, 150);
  };

  const waitForActorClassLevel = async (actorId, classIdentifier, targetLevel) => {
    return waitForCondition(() => {
      const actor = game.actors.get(actorId);
      if (!actor) return false;

      const classItem = actor.items.find((item) => item.type === 'class' && item.system?.identifier === classIdentifier);
      return Number(classItem?.system?.levels || 0) >= Number(targetLevel);
    }, 50000, 250);
  };

  const hasSpellsTabVisible = () => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;

    return Array.from(root.querySelectorAll('.tabs-list button'))
      .some((button) => (button.textContent || '').trim().toLowerCase().includes('spells'));
  };

  const visitAllVisibleTabs = async () => {
    const clickedLabels = new Set();
    const tabButtons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'));
    const labels = tabButtons
      .map((button) => (button.textContent || '').trim())
      .filter(Boolean);

    for (const label of labels) {
      const clicked = await clickTabByLabel(label);
      if (clicked) {
        clickedLabels.add(label.toLowerCase());
        await wait(120);
      }
    }

    return {
      clickedCount: clickedLabels.size,
      visibleCount: labels.length
    };
  };

  const waitForSpellsTab = async () => {
    return waitForCondition(
      () => {
        const root = '#foundryvtt-actor-studio-pc-sheet';
        const spellsTabButtonActive = Array.from(document.querySelectorAll(`${root} .tabs-list button.active`))
          .some((button) => (button.textContent || '').trim().toLowerCase().includes('spells'));

        return Boolean(
          document.querySelector(`${root} spells-tab-container`) ||
          document.querySelector(`${root} .spells-tab`) ||
          document.querySelector(`${root} .selected-spells`) ||
          spellsTabButtonActive ||
          Array.from(document.querySelectorAll(`${root} .footer-container .button-container button`))
            .some((button) => (button.textContent || '').toLowerCase().includes('finalize'))
        );
      },
      30000,
      200
    );
  };

  const selectCantripsUntilFinalizeReady = async (targetClicks = 3, maxClicks = 9) => {
    let clickedCantripCount = 0;

    while (clickedCantripCount < maxClicks && !isFooterButtonAvailable('finalize')) {
      const spellLevelGroups = Array.from(
        document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-level-group')
      );

      const cantripGroup = spellLevelGroups.find((group) => {
        const headerText = (group.querySelector('.spell-level-header .flex1')?.textContent || '').toLowerCase();
        return headerText.includes('cantrip');
      });

      if (!cantripGroup) {
        await wait(150);
        continue;
      }

      const cantripHeader = cantripGroup.querySelector('.spell-level-header');
      const isCollapsed = (cantripHeader?.textContent || '').includes('[+]');
      if (cantripHeader && isCollapsed) {
        cantripHeader.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(180);
      }

      const cantripAddButtons = Array.from(cantripGroup.querySelectorAll('ul.spell-rows .add-btn:not([disabled])'));
      if (cantripAddButtons.length === 0) {
        await wait(150);
        continue;
      }

      const clicksThisCycle = Math.min(cantripAddButtons.length, targetClicks - clickedCantripCount);
      for (let index = 0; index < clicksThisCycle; index++) {
        cantripAddButtons[index].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        clickedCantripCount++;
        await wait(90);
      }

      await wait(180);
    }

    return {
      clickedCantripCount,
      finalizeReady: isFooterButtonAvailable('finalize'),
      selectedSpellCount: document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .selected-spell').length
    };
  };

  const shouldExpectRangerSpellsForLevel = (targetLevel) => {
    const rulesVersion = String(window.GAS?.dnd5eRules || '').trim();
    if (rulesVersion === '2014') {
      return Number(targetLevel) >= 2;
    }
    return Number(targetLevel) >= 1;
  };

  const shouldExpectWarlockSpellsForLevel = (targetLevel) => {
    // Warlocks always get spells from level 1 onwards
    return Number(targetLevel) >= 1;
  };

  const completeSpellsStepIfVisible = async ({ timeoutMs = 20000 } = {}) => {
    const spellsVisible = await waitForCondition(() => hasSpellsTabVisible(), timeoutMs, 200);
    if (!spellsVisible) {
      return { visible: false, completed: false, action: 'none' };
    }

    await clickTabByLabel('Spells');
    const spellsLoaded = await waitForSpellsTab();
    if (!spellsLoaded) {
      return { visible: true, completed: false, action: 'none' };
    }

    const finalizedImmediately = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn') || clickFooterButtonContaining('finalize'),
      10000,
      150
    );
    if (finalizedImmediately) {
      return { visible: true, completed: true, action: 'finalize' };
    }

    const skipped = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn') || clickFooterButtonContaining('skip') || clickFooterButtonContaining('continue'),
      8000,
      150
    );
    if (skipped) {
      return { visible: true, completed: true, action: 'skip' };
    }

    const selectedEnoughSpells = await waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      if (isFooterButtonAvailable('finalize')) {
        return true;
      }

      // Parse the expected vs selected counters from the header (e.g., "0/3 Cantrips, 2/4 Spells")
      const headerText = root.textContent || '';
      const spellLimitMatch = headerText.match(/Spells[:\s]+(\d+)\/(\d+)/i);
      const cantripLimitMatch = headerText.match(/Cantrips[:\s]+(\d+)\/(\d+)/i);
      
      const currentSpellsSelected = spellLimitMatch ? parseInt(spellLimitMatch[1], 10) : 0;
      const spellLimit = spellLimitMatch ? parseInt(spellLimitMatch[2], 10) : 0;
      const currentCantripsSelected = cantripLimitMatch ? parseInt(cantripLimitMatch[1], 10) : 0;
      const cantripLimit = cantripLimitMatch ? parseInt(cantripLimitMatch[2], 10) : 0;

      // Expand ALL collapsed spell groups
      const collapsedHeaders = Array.from(root.querySelectorAll('.spell-level-group .spell-level-header'))
        .filter((header) => (header.textContent || '').includes('[+]'));
      if (collapsedHeaders.length) {
        collapsedHeaders[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return false;
      }

      // Check if we've already met the requirements
      const needsMoreSpells = currentSpellsSelected < spellLimit;
      const needsMoreCantrips = currentCantripsSelected < cantripLimit;
      
      if (!needsMoreSpells && !needsMoreCantrips) {
        return true; // All requirements met
      }

      // Get cantrip buttons from Cantrips group
      const cantripGroup = Array.from(root.querySelectorAll('.spell-level-group'))
        .find((group) => (group.textContent || '').includes('Cantrips'));
      const cantripButtons = cantripGroup 
        ? Array.from(cantripGroup.querySelectorAll('.add-btn:not([disabled])'))
        : [];

      // Get spell buttons from Lvl 1+ groups
      const spellLevelGroups = Array.from(root.querySelectorAll('.spell-level-group'))
        .filter((group) => !(group.textContent || '').includes('Cantrips'));
      const spellButtons = spellLevelGroups
        .flatMap((group) => Array.from(group.querySelectorAll('.add-btn:not([disabled])')))
        .slice(0, spellLimit - currentSpellsSelected);

      // Select cantrips first
      const cantripsToSelect = Math.max(0, cantripLimit - currentCantripsSelected);
      for (let i = 0; i < Math.min(cantripsToSelect, cantripButtons.length); i++) {
        cantripButtons[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      // Then select spells
      const spellsToSelect = Math.max(0, spellLimit - currentSpellsSelected);
      for (let i = 0; i < Math.min(spellsToSelect, spellButtons.length); i++) {
        spellButtons[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      return isFooterButtonAvailable('finalize');
    }, 20000, 200);

    if (!selectedEnoughSpells) {
      return { visible: true, completed: false, action: 'none' };
    }

    const finalizedAfterSelection = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn') || clickFooterButtonContaining('finalize'),
      10000,
      150
    );

    return {
      visible: true,
      completed: finalizedAfterSelection,
      action: finalizedAfterSelection ? 'finalize' : 'none'
    };
  };

  const visitRequiredCreationTabs = async () => {
    const raceVisited = await clickFirstAvailableTabLabel(['Race', 'Origin', 'Species']);
    const classVisited = await clickTabByLabel('Class');
    const backgroundVisited = await clickTabByLabel('Background');
    const abilitiesVisited = await clickFirstAvailableTabLabel(['Abilities', 'Ability Scores']);

    const allTabsVisitResult = await visitAllVisibleTabs();

    await wait(400);

    return raceVisited
      && classVisited
      && backgroundVisited
      && abilitiesVisited
      && allTabsVisitResult.clickedCount >= allTabsVisitResult.visibleCount;
  };

  // Keys set on window.GAS when package.json debug === true
  const DEBUG_ROOT_KEYS = ['debug', 'race', 'background', 'characterClass', 'characterSubClass'];

  if (enabledClasses.has('cleric')) {
  describe('Cleric', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    const testActorName = 'Quench Cleric Automation';
    const clericClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000';

    before(function () {
      // Neutralise any values set by init.js when package.json debug === true
      // so that quenchAutomation selections take full precedence.
      savedDebugState = {};
      for (const key of DEBUG_ROOT_KEYS) {
        if (Object.prototype.hasOwnProperty.call(window.GAS, key)) {
          savedDebugState[key] = window.GAS[key];
          delete window.GAS[key];
        }
      }

      originalMilestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
      originalForceTakeAverageHitPoints = safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false);
    });

    beforeEach(function () {
      this.timeout(TEST_TIMEOUTS.perTest);
    });

    after(async function () {
      clearQuenchAutomation();
      await closeActorStudioIfOpen();

      const actorToCleanup = createdActorId ? game.actors.get(createdActorId) : createdActor;
      await closeActorSheetIfOpen(actorToCleanup);

      if (actorToCleanup && !actorToCleanup.deleted) {
        await actorToCleanup.delete();
      }
      createdActor = null;
      createdActorId = null;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);

      // Restore the debug-mode root values that were saved in before()
      for (const [key, value] of Object.entries(savedDebugState)) {
        window.GAS[key] = value;
      }
      savedDebugState = {};
    });

    it('should auto-run cleric creation and finalize spells', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      await game.settings.set(MODULE_ID, 'allowManualInput', true);
      await game.settings.set(MODULE_ID, 'allowStandardArray', false);
      await game.settings.set(MODULE_ID, 'allowPointBuy', false);
      await game.settings.set(MODULE_ID, 'allowRolling', false);
      await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
      await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
      await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);

      configureQuenchAutomation({
        selections: {
          race: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
          background: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
          characterClass: clericClassUuid
        }
      });

      await closeActorStudioIfOpen();
      const creationApp = await openActorStudio(testActorName);
      assert.ok(creationApp, 'Actor Studio should open for cleric creation test');

      const requiredTabsVisited = await visitRequiredCreationTabs();
      assert.ok(requiredTabsVisited, 'All visible creation tabs should be visited before creating the character');

      const createClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
        20000,
        150
      );
      assert.ok(createClicked, 'Create Character button should be clickable');

      const spellsTabLoaded = await waitForSpellsTab();
      assert.ok(spellsTabLoaded, 'Spells tab should appear after character creation');

      const spellSelectionResult = await selectCantripsUntilFinalizeReady(3, 9);
      assert.ok(
        spellSelectionResult.selectedSpellCount > 0,
        `At least one spell should be selected on the spells tab (found ${spellSelectionResult.selectedSpellCount})`
      );
      assert.ok(
        spellSelectionResult.finalizeReady,
        `Finalize Spells should unlock after cantrip selection (clicked cantrips: ${spellSelectionResult.clickedCantripCount})`
      );

      const finalizedSpells = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn'),
        15000,
        200
      );
      assert.ok(finalizedSpells, 'Finalize Spells button should be visible and clicked after spell selection completes');

      await wait(1200);
      createdActorId = get(actorInGame)?.id || null;
      assert.ok(createdActorId, 'Created actor id should be available after finalizing spells');

      createdActor = game.actors.get(createdActorId);
      assert.ok(createdActor, 'Created cleric actor should exist in world actors');

      const actorSpellItems = createdActor.items.filter(item => item.type === 'spell');
      assert.ok(actorSpellItems.length > 0, 'Created cleric should have spells embedded after finalization');
    });

    it('should open level-up app from actor sheet when milestone leveling is enabled', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentActor();
      assert.ok(actor, 'Existing created actor should be available for level-up tests');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Actor Studio level-up button should be clickable on the actor sheet');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up Actor Studio app should open from actor sheet button');

      await closeActorStudioIfOpen();
    });

    it('should level cleric from 1 to 2 without showing spells tab', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentActor();
      assert.ok(actor, 'Existing created actor should be available for 1->2 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for 1->2 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for 1->2 test');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before 1->2 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked to select class level-up');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for 1->2 progression');

      const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 12000, 200);
      assert.ok(!spellsTabAppeared, 'Spells tab should not appear for cleric level 1->2');

      const reachedLevel2 = await waitForActorClassLevel(createdActorId, 'cleric', 2);
      assert.ok(reachedLevel2, 'Cleric class level should progress to 2');

      await closeActorStudioIfOpen();
    });

    it('should level cleric from 2 to 3, finalize spells, and add them to the actor', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentActor();
      assert.ok(actor, 'Existing created actor should be available for 2->3 level-up test');

      const spellCountBefore = actor.items.filter((item) => item.type === 'spell').length;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for 2->3 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for 2->3 test');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before 2->3 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked for 2->3 test');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for 2->3 progression');

      const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 25000, 200);
      assert.ok(spellsTabAppeared, 'Spells tab should appear for cleric level 2->3');

      const spellsTabLoaded = await waitForSpellsTab();
      assert.ok(spellsTabLoaded, 'Spells content should load for 2->3 level-up');

      const spellSelectionResult = await selectCantripsUntilFinalizeReady(3, 9);
      assert.ok(
        spellSelectionResult.finalizeReady,
        `Finalize Spells should unlock for 2->3 level-up (clicked cantrips: ${spellSelectionResult.clickedCantripCount})`
      );

      const finalizedSpells = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn'),
        15000,
        200
      );
      assert.ok(finalizedSpells, 'Finalize Spells button should be clicked for 2->3 level-up');

      const reachedLevel3 = await waitForActorClassLevel(createdActorId, 'cleric', 3);
      assert.ok(reachedLevel3, 'Cleric class level should progress to 3');

      const actorAfter = getCurrentActor();
      assert.ok(actorAfter, 'Actor should still exist after 2->3 level-up');

      const spellItemsAfter = actorAfter.items.filter((item) => item.type === 'spell');
      const spellCountAfter = spellItemsAfter.length;
      assert.ok(
        spellCountAfter > spellCountBefore,
        `Spell count should increase after 2->3 level-up (before: ${spellCountBefore}, after: ${spellCountAfter})`
      );

      const addedSpellCount = spellCountAfter - spellCountBefore;
      assert.ok(
        addedSpellCount > 0,
        `Cleric 2->3 should add at least one spell item to the actor (added: ${addedSpellCount})`
      );

      assert.ok(
        spellItemsAfter.some((item) => item.system?.level === 0 || item.system?.level > 0),
        'Cleric should have persisted spell items on the actor after 2->3 finalization'
      );

      createdActor = actorAfter;
      await closeActorStudioIfOpen();
    });
  });
  }

  if (enabledClasses.has('fighter')) {
  describe('Fighter', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    let fighterActorId = null;
    let fighterActor = null;
    const testActorName = `Quench Fighter Automation ${Date.now()}`;
    const fighterClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbftrFighter000';

    const findFighterActorByName = () => {
      const matches = game.actors.contents
        .filter((actorDoc) => actorDoc?.name === testActorName && actorDoc?.type === 'character');
      if (!matches.length) return null;
      return matches[matches.length - 1];
    };

    const getCurrentFighterActor = () => {
      if (fighterActorId) {
        const actorFromId = game.actors.get(fighterActorId) || null;
        if (actorFromId) return actorFromId;
      }

      const actorFromName = findFighterActorByName();
      if (actorFromName && !fighterActorId) {
        fighterActorId = actorFromName.id;
      }
      return actorFromName;
    };

    before(function () {
      // Neutralise any values set by init.js when package.json debug === true
      // so that quenchAutomation selections take full precedence.
      savedDebugState = {};
      for (const key of DEBUG_ROOT_KEYS) {
        if (Object.prototype.hasOwnProperty.call(window.GAS, key)) {
          savedDebugState[key] = window.GAS[key];
          delete window.GAS[key];
        }
      }

      originalMilestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
      originalForceTakeAverageHitPoints = safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false);
    });

    beforeEach(function () {
      this.timeout(TEST_TIMEOUTS.perTest);
    });

    after(async function () {
      clearQuenchAutomation();
      await closeActorStudioIfOpen();

      const actorToCleanup = fighterActorId ? game.actors.get(fighterActorId) : (fighterActor || findFighterActorByName());
      await closeActorSheetIfOpen(actorToCleanup);

      if (actorToCleanup && !actorToCleanup.deleted) {
        await actorToCleanup.delete();
      }
      fighterActor = null;
      fighterActorId = null;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);

      // Restore the debug-mode root values that were saved in before()
      for (const [key, value] of Object.entries(savedDebugState)) {
        window.GAS[key] = value;
      }
      savedDebugState = {};
    });

    it('should auto-run fighter creation without spell selection', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      await game.settings.set(MODULE_ID, 'allowManualInput', true);
      await game.settings.set(MODULE_ID, 'allowStandardArray', false);
      await game.settings.set(MODULE_ID, 'allowPointBuy', false);
      await game.settings.set(MODULE_ID, 'allowRolling', false);
      await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
      await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
      await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);

      configureQuenchAutomation({
        selections: {
          race: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
          background: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
          characterClass: fighterClassUuid
        }
      });

      await closeActorStudioIfOpen();
      const creationApp = await openActorStudio(testActorName);
      assert.ok(creationApp, 'Actor Studio should open for fighter creation test');

      const requiredTabsVisited = await visitRequiredCreationTabs();
      assert.ok(requiredTabsVisited, 'All visible creation tabs should be visited before creating the character');

      const createClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
        20000,
        150
      );
      assert.ok(createClicked, 'Create Character button should be clickable');

      const spellsTabLoaded = await waitForCondition(() => hasSpellsTabVisible(), 8000, 200);
      assert.ok(!spellsTabLoaded, 'Spells tab should not appear for fighter creation (non-spellcaster at level 1)');

      const actorStudioClosed = await waitForActorStudioClosed();
      assert.ok(actorStudioClosed, 'Actor Studio should close after fighter creation completes');

      await wait(1200);
      fighterActorId = get(actorInGame)?.id || null;

      if (!fighterActorId) {
        const actorByName = findFighterActorByName();
        fighterActorId = actorByName?.id || null;
      }

      assert.ok(fighterActorId, 'Created actor id should be available after finalizing creation');

      const reachedLevel1 = await waitForActorClassLevel(fighterActorId, 'fighter', 1);
      assert.ok(reachedLevel1, 'Fighter class level should be embedded at level 1 after creation');

      fighterActor = game.actors.get(fighterActorId);
      assert.ok(fighterActor, 'Created fighter actor should exist in world actors');

      const hasBackground = fighterActor.items.some((item) => item.type === 'background');
      assert.ok(hasBackground, 'Created fighter actor should have a background item embedded');
    });

    it('should open level-up app from fighter actor sheet when milestone leveling is enabled', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentFighterActor();
      assert.ok(actor, 'Existing created fighter actor should be available for level-up tests');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Actor Studio level-up button should be clickable on the fighter actor sheet');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up Actor Studio app should open from fighter actor sheet button');

      await closeActorStudioIfOpen();
    });

    it('should level fighter from 1 to 2 without showing spells tab', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentFighterActor();
      assert.ok(actor, 'Existing created fighter actor should be available for 1->2 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for fighter 1->2 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for fighter 1->2 test');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before fighter 1->2 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked to select class level-up');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for fighter 1->2 progression');

      const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 12000, 200);
      assert.ok(!spellsTabAppeared, 'Spells tab should not appear for fighter level 1->2');

      const reachedLevel2 = await waitForActorClassLevel(fighterActorId, 'fighter', 2);
      assert.ok(reachedLevel2, 'Fighter class level should progress to 2');

      await closeActorStudioIfOpen();
    });

    it('should level fighter from 2 to 3 without showing spells tab', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentFighterActor();
      assert.ok(actor, 'Existing created fighter actor should be available for 2->3 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for fighter 2->3 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for fighter 2->3 test');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before fighter 2->3 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked for fighter 2->3 test');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for fighter 2->3 progression');

      const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
      assert.ok(!spellsTabAppeared, 'Spells tab should not appear for fighter level 2->3');

      const reachedLevel3 = await waitForActorClassLevel(fighterActorId, 'fighter', 3);
      assert.ok(reachedLevel3, 'Fighter class level should progress to 3');

      fighterActor = getCurrentFighterActor();
      await closeActorStudioIfOpen();
    });
  });
  }

  if (enabledClasses.has('ranger')) {
  describe('Ranger', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    let rangerActorId = null;
    let rangerActor = null;
    const testActorName = `Quench Ranger Automation ${Date.now()}`;
    const rangerClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbrgrRanger0000';

    const findRangerActorByName = () => {
      const matches = game.actors.contents
        .filter((actorDoc) => actorDoc?.name === testActorName && actorDoc?.type === 'character');
      if (!matches.length) return null;
      return matches[matches.length - 1];
    };

    const getCurrentRangerActor = () => {
      if (rangerActorId) {
        const actorFromId = game.actors.get(rangerActorId) || null;
        if (actorFromId) return actorFromId;
      }

      const actorFromName = findRangerActorByName();
      if (actorFromName && !rangerActorId) {
        rangerActorId = actorFromName.id;
      }
      return actorFromName;
    };

    before(function () {
      savedDebugState = {};
      for (const key of DEBUG_ROOT_KEYS) {
        if (Object.prototype.hasOwnProperty.call(window.GAS, key)) {
          savedDebugState[key] = window.GAS[key];
          delete window.GAS[key];
        }
      }

      originalMilestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
      originalForceTakeAverageHitPoints = safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false);
    });

    beforeEach(function () {
      this.timeout(TEST_TIMEOUTS.perTest);
    });

    after(async function () {
      clearQuenchAutomation();
      await closeActorStudioIfOpen();

      const actorToCleanup = rangerActorId ? game.actors.get(rangerActorId) : (rangerActor || findRangerActorByName());
      await closeActorSheetIfOpen(actorToCleanup);

      if (actorToCleanup && !actorToCleanup.deleted) {
        await actorToCleanup.delete();
      }
      rangerActor = null;
      rangerActorId = null;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);

      for (const [key, value] of Object.entries(savedDebugState)) {
        window.GAS[key] = value;
      }
      savedDebugState = {};
    });

    it('should auto-run ranger creation and handle spell step as required by rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      await game.settings.set(MODULE_ID, 'allowManualInput', true);
      await game.settings.set(MODULE_ID, 'allowStandardArray', false);
      await game.settings.set(MODULE_ID, 'allowPointBuy', false);
      await game.settings.set(MODULE_ID, 'allowRolling', false);
      await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
      await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
      await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);

      configureQuenchAutomation({
        selections: {
          race: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
          background: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
          characterClass: rangerClassUuid
        }
      });

      await closeActorStudioIfOpen();
      const creationApp = await openActorStudio(testActorName);
      assert.ok(creationApp, 'Actor Studio should open for ranger creation test');

      const requiredTabsVisited = await visitRequiredCreationTabs();
      assert.ok(requiredTabsVisited, 'All visible creation tabs should be visited before creating the ranger');

      const createClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
        20000,
        150
      );
      assert.ok(createClicked, 'Create Character button should be clickable for ranger creation');

      const creationClosedEarly = await waitForCondition(
        () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        12000,
        200
      );

      if (!creationClosedEarly) {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 12000, 200);
        if (spellsTabAppeared) {
          const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 30000 });
          assert.ok(spellStepResult.visible, 'Spells tab should be detectable when shown during ranger creation');
          assert.ok(spellStepResult.completed, 'Ranger creation spells step should complete via UI controls when displayed');
        }
      }

      const actorStudioClosed = await waitForActorStudioClosed();
      assert.ok(actorStudioClosed, 'Actor Studio should close after ranger creation completes');

      await wait(1200);
      rangerActorId = get(actorInGame)?.id || null;
      if (!rangerActorId) {
        const actorByName = findRangerActorByName();
        rangerActorId = actorByName?.id || null;
      }
      assert.ok(rangerActorId, 'Created ranger actor id should be available after creation');

      const reachedLevel1 = await waitForActorClassLevel(rangerActorId, 'ranger', 1);
      assert.ok(reachedLevel1, 'Ranger class level should be embedded at level 1 after creation');

      rangerActor = game.actors.get(rangerActorId);
      assert.ok(rangerActor, 'Created ranger actor should exist in world actors');

      const hasBackground = rangerActor.items.some((item) => item.type === 'background');
      assert.ok(hasBackground, 'Created ranger actor should have a background item embedded');
    });

    it('should open level-up app from ranger actor sheet when milestone leveling is enabled', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentRangerActor();
      assert.ok(actor, 'Existing created ranger actor should be available for level-up tests');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Actor Studio level-up button should be clickable on the ranger actor sheet');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up Actor Studio app should open from ranger actor sheet button');

      await closeActorStudioIfOpen();
    });

    it('should level ranger from 1 to 2 and handle spells according to rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentRangerActor();
      assert.ok(actor, 'Existing created ranger actor should be available for 1->2 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for ranger 1->2 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for ranger 1->2 test');

      const levelUpTabFocused = await focusLevelUpClassTab();
      assert.ok(levelUpTabFocused, 'Level-up/Class tab should be focused before ranger 1->2 class selection');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before ranger 1->2 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked to select ranger level-up');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for ranger 1->2 progression');

      const expectSpellsAtLevel2 = shouldExpectRangerSpellsForLevel(2);
      if (expectSpellsAtLevel2) {
        const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 25000 });
        assert.ok(spellStepResult.visible, 'Spells tab should appear for ranger level 2 in this ruleset');
        assert.ok(spellStepResult.completed, 'Ranger level 1->2 spells step should complete (finalize or skip)');
      } else {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
        assert.ok(!spellsTabAppeared, 'Spells tab should not appear for ranger level 1->2 in this ruleset');
      }

      // Wait for the level-up app to fully close after spells completes
      const appClosedAfterSpells = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
      assert.ok(appClosedAfterSpells, 'Level-up app should close after spell completion');

      const reachedLevel2 = await waitForActorClassLevel(rangerActorId, 'ranger', 2);
      assert.ok(reachedLevel2, 'Ranger class level should progress to 2');

      await closeActorStudioIfOpen();
    });

    it('should level ranger from 2 to 3 and handle spells according to rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentRangerActor();
      assert.ok(actor, 'Existing created ranger actor should be available for 2->3 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for ranger 2->3 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for ranger 2->3 test');

      const levelUpTabFocused = await focusLevelUpClassTab();
      assert.ok(levelUpTabFocused, 'Level-up/Class tab should be focused before ranger 2->3 class selection');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before ranger 2->3 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked for ranger 2->3 test');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for ranger 2->3 progression');

      const expectSpellsAtLevel3 = shouldExpectRangerSpellsForLevel(3);
      if (expectSpellsAtLevel3) {
        const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 25000 });
        assert.ok(spellStepResult.visible, 'Spells tab should appear for ranger level 3 in this ruleset');
        assert.ok(spellStepResult.completed, 'Ranger level 2->3 spells step should complete (finalize or skip)');
      } else {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
        assert.ok(!spellsTabAppeared, 'Spells tab should not appear for ranger level 2->3 in this ruleset');
      }

      // Wait for the level-up app to fully close after spells completes
      const appClosedAfterSpells = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
      assert.ok(appClosedAfterSpells, 'Level-up app should close after spell completion');

      const reachedLevel3 = await waitForActorClassLevel(rangerActorId, 'ranger', 3);
      assert.ok(reachedLevel3, 'Ranger class level should progress to 3');

      rangerActor = getCurrentRangerActor();
      await closeActorStudioIfOpen();
    });
  });
  }

  if (enabledClasses.has('warlock')) {
  describe('Warlock', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    let warlockActorId = null;
    let warlockActor = null;
    const testActorName = `Quench Warlock Automation ${Date.now()}`;
    const warlockClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbwlkWarlock000';

    const findWarlockActorByName = () => {
      const matches = game.actors.contents
        .filter((actorDoc) => actorDoc?.name === testActorName && actorDoc?.type === 'character');
      if (!matches.length) return null;
      return matches[matches.length - 1];
    };

    const getCurrentWarlockActor = () => {
      if (warlockActorId) {
        const actorFromId = game.actors.get(warlockActorId) || null;
        if (actorFromId) return actorFromId;
      }

      const actorFromName = findWarlockActorByName();
      if (actorFromName && !warlockActorId) {
        warlockActorId = actorFromName.id;
      }
      return actorFromName;
    };

    before(function () {
      savedDebugState = {};
      for (const key of DEBUG_ROOT_KEYS) {
        if (Object.prototype.hasOwnProperty.call(window.GAS, key)) {
          savedDebugState[key] = window.GAS[key];
          delete window.GAS[key];
        }
      }

      originalMilestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
      originalForceTakeAverageHitPoints = safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false);
    });

    beforeEach(function () {
      this.timeout(TEST_TIMEOUTS.perTest);
    });

    after(async function () {
      clearQuenchAutomation();
      await closeActorStudioIfOpen();

      const actorToCleanup = warlockActorId ? game.actors.get(warlockActorId) : (warlockActor || findWarlockActorByName());
      await closeActorSheetIfOpen(actorToCleanup);

      if (actorToCleanup && !actorToCleanup.deleted) {
        await actorToCleanup.delete();
      }
      warlockActor = null;
      warlockActorId = null;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);

      for (const [key, value] of Object.entries(savedDebugState)) {
        window.GAS[key] = value;
      }
      savedDebugState = {};
    });

    it('should auto-run warlock creation and handle spell step as required by rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      await game.settings.set(MODULE_ID, 'allowManualInput', true);
      await game.settings.set(MODULE_ID, 'allowStandardArray', false);
      await game.settings.set(MODULE_ID, 'allowPointBuy', false);
      await game.settings.set(MODULE_ID, 'allowRolling', false);
      await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
      await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
      await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);

      configureQuenchAutomation({
        selections: {
          race: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
          background: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
          characterClass: warlockClassUuid
        }
      });

      await closeActorStudioIfOpen();
      const creationApp = await openActorStudio(testActorName);
      assert.ok(creationApp, 'Actor Studio should open for warlock creation test');

      const requiredTabsVisited = await visitRequiredCreationTabs();
      assert.ok(requiredTabsVisited, 'All visible creation tabs should be visited before creating the warlock');

      const createClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
        20000,
        150
      );
      assert.ok(createClicked, 'Create Character button should be clickable for warlock creation');

      const creationClosedEarly = await waitForCondition(
        () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        12000,
        200
      );

      if (!creationClosedEarly) {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 12000, 200);
        if (spellsTabAppeared) {
          const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 30000 });
          assert.ok(spellStepResult.visible, 'Spells tab should be detectable when shown during warlock creation');
          assert.ok(spellStepResult.completed, 'Warlock creation spells step should complete via UI controls when displayed');
        }
      }

      const actorStudioClosed = await waitForActorStudioClosed();
      assert.ok(actorStudioClosed, 'Actor Studio should close after warlock creation completes');

      await wait(1200);
      warlockActorId = get(actorInGame)?.id || null;
      if (!warlockActorId) {
        const actorByName = findWarlockActorByName();
        warlockActorId = actorByName?.id || null;
      }
      assert.ok(warlockActorId, 'Created warlock actor id should be available after creation');

      const reachedLevel1 = await waitForActorClassLevel(warlockActorId, 'warlock', 1);
      assert.ok(reachedLevel1, 'Warlock class level should be embedded at level 1 after creation');

      warlockActor = game.actors.get(warlockActorId);
      assert.ok(warlockActor, 'Created warlock actor should exist in world actors');

      const hasBackground = warlockActor.items.some((item) => item.type === 'background');
      assert.ok(hasBackground, 'Created warlock actor should have a background item embedded');
    });

    it('should open level-up app from warlock actor sheet when milestone leveling is enabled', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentWarlockActor();
      assert.ok(actor, 'Existing created warlock actor should be available for level-up tests');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Actor Studio level-up button should be clickable on the warlock actor sheet');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up Actor Studio app should open from warlock actor sheet button');

      await closeActorStudioIfOpen();
    });

    it('should level warlock from 1 to 2 and handle spells according to rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentWarlockActor();
      assert.ok(actor, 'Existing created warlock actor should be available for 1->2 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for warlock 1->2 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for warlock 1->2 test');

      const levelUpTabFocused = await focusLevelUpClassTab();
      assert.ok(levelUpTabFocused, 'Level-up/Class tab should be focused before warlock 1->2 class selection');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before warlock 1->2 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked to select warlock level-up');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for warlock 1->2 progression');

      const expectSpellsAtLevel2 = shouldExpectWarlockSpellsForLevel(2);
      if (expectSpellsAtLevel2) {
        const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 25000 });
        assert.ok(spellStepResult.visible, 'Spells tab should appear for warlock level 2 in this ruleset');
        assert.ok(spellStepResult.completed, 'Warlock level 1->2 spells step should complete (finalize or skip)');
      } else {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
        assert.ok(!spellsTabAppeared, 'Spells tab should not appear for warlock level 1->2 in this ruleset');
      }

      // Wait for the level-up app to fully close after spells completes
      const appClosedAfterSpells = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
      assert.ok(appClosedAfterSpells, 'Level-up app should close after spell completion');

      const reachedLevel2 = await waitForActorClassLevel(warlockActorId, 'warlock', 2);
      assert.ok(reachedLevel2, 'Warlock class level should progress to 2');

      await closeActorStudioIfOpen();
    });

    it('should level warlock from 2 to 3 and handle spells according to rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentWarlockActor();
      assert.ok(actor, 'Existing created warlock actor should be available for 2->3 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for warlock 2->3 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for warlock 2->3 test');

      const levelUpTabFocused = await focusLevelUpClassTab();
      assert.ok(levelUpTabFocused, 'Level-up/Class tab should be focused before warlock 2->3 class selection');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before warlock 2->3 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked for warlock 2->3 test');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for warlock 2->3 progression');

      const expectSpellsAtLevel3 = shouldExpectWarlockSpellsForLevel(3);
      if (expectSpellsAtLevel3) {
        const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 25000 });
        assert.ok(spellStepResult.visible, 'Spells tab should appear for warlock level 3 in this ruleset');
        assert.ok(spellStepResult.completed, 'Warlock level 2->3 spells step should complete (finalize or skip)');
      } else {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
        assert.ok(!spellsTabAppeared, 'Spells tab should not appear for warlock level 2->3 in this ruleset');
      }

      // Wait for the level-up app to fully close after spells completes
      const appClosedAfterSpells = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
      assert.ok(appClosedAfterSpells, 'Level-up app should close after spell completion');

      const reachedLevel3 = await waitForActorClassLevel(warlockActorId, 'warlock', 3);
      assert.ok(reachedLevel3, 'Warlock class level should progress to 3');

      warlockActor = getCurrentWarlockActor();
      await closeActorStudioIfOpen();
    });
  });
  }
}

export function registerClericPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['cleric'] });
}

export function registerFighterPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['fighter'] });
}

export function registerRangerPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['ranger'] });
}

export function registerWarlockPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['warlock'] });
}
