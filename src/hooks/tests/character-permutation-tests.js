import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';
import { getTestTimeouts } from '~/src/helpers/testTimeouts';

export function registerCharacterPermutationTests(context, options = {}) {
  const { describe, it, assert, before, after } = context;
  const enabledClasses = new Set((options?.classes || ['cleric', 'fighter', 'ranger', 'paladin', 'warlock']).map((entry) => String(entry).toLowerCase()));

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

  const shouldExpectPaladinSpellsForLevel = (targetLevel) => {
    const rulesVersion = String(window.GAS?.dnd5eRules || '').trim();
    if (rulesVersion === '2014') {
      return Number(targetLevel) >= 2;
    }
    return Number(targetLevel) >= 1;
  };

  const shouldExpectBardSpellsForLevel = (targetLevel) => {
    // Bards get spells from level 1 onwards
    return Number(targetLevel) >= 1;
  };

  const shouldExpectSorcererSpellsForLevel = (targetLevel) => {
    // Sorcerers get spells from level 1 onwards
    return Number(targetLevel) >= 1;
  };

  const shouldExpectArtificerSpellsForLevel = (targetLevel) => {
    // Artificers get spells from level 1 onwards
    return Number(targetLevel) >= 1;
  };

  const resolveClassUuidByIdentifier = async (classIdentifier) => {
    try {
      const classesPack = game.packs.get('dnd-players-handbook.classes');
      if (!classesPack) return null;

      const index = await classesPack.getIndex({ fields: ['name', 'system.identifier'] });
      const match = index.find((entry) => String(entry?.system?.identifier || '').toLowerCase() === String(classIdentifier).toLowerCase());
      if (!match?._id) return null;

      return `Compendium.${classesPack.collection}.Item.${match._id}`;
    } catch (error) {
      return null;
    }
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













export function registerBarbarianPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['barbarian'] });
}

export function registerBardPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['bard'] });
}

export function registerSorcererPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['sorcerer'] });
}

export function registerArtificerPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['artificer'] });
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

export function registerPaladinPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['paladin'] });
}

export function registerWarlockPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['warlock'] });
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

export function registerPaladinPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['paladin'] });
}

export function registerWarlockPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['warlock'] });
}
