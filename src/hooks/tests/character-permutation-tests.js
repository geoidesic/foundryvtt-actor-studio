import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';

export function registerCharacterPermutationTests(context) {
  const { describe, it, assert, before, after } = context;

  const MODULE_ID = 'foundryvtt-actor-studio';
  const wait = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));
  let createdActor = null;
  let createdActorId = null;
  let originalMilestoneLeveling = false;
  let originalForceTakeAverageHitPoints = false;

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

  const waitForCondition = async (fn, timeoutMs = 20000, intervalMs = 100) => {
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

  const clickActorStudioLevelUpButtonOnSheet = async (actor) => {
    if (!actor?.sheet) return false;

    actor.sheet.render(true, { focus: true });

    return waitForCondition(() => {
      const rootElement = actor.sheet?.element?.[0] || actor.sheet?.element || document;
      const button = rootElement?.querySelector?.('#gas-levelup-btn, button.level-up')
        || document.querySelector('#gas-levelup-btn, button.level-up');

      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }, 15000, 150);
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
      if (!plusIcon) return false;

      const clickableRow = plusIcon.closest('[role="button"]') || plusIcon.closest('.class-row');
      if (!clickableRow) return false;

      clickableRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      return Boolean(root.querySelector('.footer-container .gas-add-level-btn'));
    }, 15000, 150);
  };

  const ensureSubclassChoiceIfRequired = async () => {
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

      const option = subclassSelect.querySelector(
        '.options-dropdown .option[tabindex="0"], .options-dropdown .option:not(.is-current-selection):not([aria-disabled="true"])'
      );
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

  describe('Cleric', function () {
    let savedDebugState = {};
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
      this.timeout(120000);
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
      this.timeout(120000);

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
      this.timeout(120000);

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
      this.timeout(120000);

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
      this.timeout(120000);

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
