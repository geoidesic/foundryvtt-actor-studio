import { getTestTimeouts } from '../../helpers/testTimeouts';
import { get } from 'svelte/store';
import { actorInGame } from '../../stores/storeDefinitions';

export function registerClericTests(context) {
  const { describe, it, assert, before, beforeEach, after } = context;

  const TEST_TIMEOUTS = getTestTimeouts();
  const wait = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

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

  const openActorStudio = async (name = `Quench Cleric Test ${Date.now()}`) => {
    Hooks.call('gas.openActorStudio', name, '', 'character');
    await wait(350);
    return Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
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

  const clickFooterButtonBySelector = async (selector) => {
    const button = document.querySelector(selector);
    if (!button) return false;

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(150);
    return true;
  };

  const clickTabByLabel = async (label) => {
    const tabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'));
    const target = tabs.find((button) => (button.textContent || '').trim().toLowerCase() === String(label).toLowerCase());
    if (!target) return false;

    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const activated = await waitForCondition(
      () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button.active'))
        .some((button) => (button.textContent || '').trim().toLowerCase() === String(label).toLowerCase()),
      5000,
      100
    );

    if (!activated) {
      console.warn(`[GAS Test] Tab "${label}" button found but never became active after click.`);
    }

    return activated;
  };

  const visitRequiredCreationTabs = async () => {
    const requiredTabs = ['Race', 'Background', 'Class', 'Abilities'];
    let allVisited = true;

    for (const label of requiredTabs) {
      const visited = await clickTabByLabel(label);
      if (!visited) {
        const available = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'))
          .map((b) => (b.textContent || '').trim());
        console.warn(`[GAS Test] Tab "${label}" not found. Available tabs: [${available.join(', ')}]`);
        allVisited = false;
      }
      await wait(400);
    }

    return allVisited;
  };

  const hasSpellsTabVisible = () => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;

    const tabs = Array.from(root.querySelectorAll('.tabs-list button'));
    return tabs.some((tab) => (tab.textContent || '').trim().toLowerCase().includes('spell'));
  };

  const waitForActorStudioClosed = async () => {
    return waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
  };

  const waitForActorClassLevel = async (actorId, className, targetLevel) => {
    return waitForCondition(() => {
      const actor = game.actors.get(actorId);
      if (!actor) return false;

      const classItem = actor.items.find((item) =>
        item.type === 'class' &&
        item.name?.toLowerCase() === className.toLowerCase()
      );

      return classItem && classItem.system?.levels >= targetLevel;
    }, 15000, 200);
  };

  const closeActorSheetIfOpen = async (actor) => {
    if (!actor?.sheet) return;

    try {
      await actor.sheet.close();
      await wait(200);
    } catch (error) {
      // Sheet might already be closed
    }
  };

  const safeGetSetting = (moduleId, settingKey, defaultValue) => {
    try {
      return game.settings.get(moduleId, settingKey);
    } catch (error) {
      return defaultValue;
    }
  };

  const configureQuenchAutomation = (config) => {
    window.GAS = window.GAS || {};
    window.GAS.quenchAutomation = {
      enabled: true,
      allowLegacyRootValues: false,
      advancements: {
        enabled: true,
        ...(config?.advancements || {})
      },
      selections: {
        ...(config?.selections || {})
      }
    };
  };

  const clearQuenchAutomation = () => {
    if (window?.GAS?.quenchAutomation) {
      delete window.GAS.quenchAutomation;
    }
  };

  const clickActorStudioLevelUpButtonOnSheet = async (actor) => {
    if (!actor?.sheet) return false;

    await actor.sheet.render(true);
    await wait(500);

    const levelUpButton = document.querySelector('button.level-up');
    if (!levelUpButton) return false;

    levelUpButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(300);
    return true;
  };

  const waitForLevelUpAppOpen = async () => {
    return waitForCondition(() => {
      const app = Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet');
      return app && app.element?.querySelector('.gas-add-level-btn');
    }, 10000, 200);
  };

  const focusLevelUpClassTab = async () => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;

    const tabs = Array.from(root.querySelectorAll('.tabs-list button'));
    const classTab = tabs.find((tab) => (tab.textContent || '').trim().toLowerCase().includes('level up') ||
                                          (tab.textContent || '').trim().toLowerCase().includes('class'));

    if (!classTab) return false;

    classTab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(300);
    return true;
  };

  const ensureSubclassChoiceIfRequired = async () => {
    // For cleric, no subclass choice is required at these levels
    return true;
  };

  const clickExistingClassPlusInLevelUp = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      const addLevelButton = root.querySelector('.footer-container .gas-add-level-btn');
      if (addLevelButton && !addLevelButton.disabled) {
        return true;
      }

      const plusButton = root.querySelector('.class-row .plus-btn:not([disabled])');
      if (!plusButton) return false;

      plusButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return Boolean(root.querySelector('.footer-container .gas-add-level-btn'));
    }, 15000, 150);
  };

  const hasSelectionFromUuid = (item, expectedUuid) => {
    const uuidTail = String(expectedUuid || '').split('.').pop() || '';
    const sourceId = String(
      item?.flags?.core?.sourceId
      || item?.flags?.dnd5e?.sourceId
      || item?.flags?.['dnd5e']?.sourceId
      || ''
    );
    return Boolean(uuidTail && sourceId.includes(uuidTail));
  };

  const assertCoreSelectionsOnActor = (actor, { classIdentifier, classUuid, raceUuid, backgroundUuid, className }) => {
    const normalizedClassIdentifier = String(classIdentifier || '').toLowerCase();
    const normalizedClassName = String(className || '').toLowerCase();

    const hasClassSelection = actor.items.some((item) => {
      if (item.type !== 'class') return false;
      const itemIdentifier = String(item.system?.identifier || '').toLowerCase();
      const itemName = String(item.name || '').toLowerCase();
      return itemIdentifier === normalizedClassIdentifier
        || itemName.includes(normalizedClassName)
        || hasSelectionFromUuid(item, classUuid);
    });

    const hasRaceSelection = actor.items.some((item) => {
      if (!['race', 'species'].includes(item.type)) return false;
      const itemName = String(item.name || '').toLowerCase();
      return itemName.includes('orc') || hasSelectionFromUuid(item, raceUuid);
    });

    const hasBackgroundSelection = actor.items.some((item) => {
      if (item.type !== 'background') return false;
      const itemName = String(item.name || '').toLowerCase();
      return itemName.includes('artisan') || hasSelectionFromUuid(item, backgroundUuid);
    });

    assert.ok(hasClassSelection, `Created actor should contain the selected ${className} class`);
    assert.ok(hasRaceSelection, 'Created actor should contain the selected race/species');
    assert.ok(hasBackgroundSelection, 'Created actor should contain the selected background');
  };

  const waitForSpellsTab = async () => {
    const spellsTabVisible = await waitForCondition(() => hasSpellsTabVisible(), 5000, 200);
    if (!spellsTabVisible) return false;

    // Click on spells tab if not already active
    const spellsTab = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'))
      .find((tab) => (tab.textContent || '').trim().toLowerCase().includes('spell'));

    if (spellsTab && !spellsTab.classList.contains('active')) {
      spellsTab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(500);
    }

    // Wait for spell content to load
    return waitForCondition(() => {
      const cantripRows = document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-row[data-level="0"]');
      const spellRows = document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-row');
      return cantripRows.length > 0 || spellRows.length > 0;
    }, 10000, 200);
  };

  const selectCantripsUntilFinalizeReady = async (maxCantrips = 3, maxSpells = 9) => {
    let clickedCantripCount = 0;
    let selectedSpellCount = 0;
    let finalizeReady = false;

    // First, try to select cantrips
    const cantripRows = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-row[data-level="0"]'));
    for (const row of cantripRows.slice(0, maxCantrips)) {
      const addBtn = row.querySelector('.add-btn');
      if (addBtn && !addBtn.classList.contains('selected')) {
        addBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        clickedCantripCount++;
        selectedSpellCount++;
        await wait(200);

        // Check if finalize is ready after each selection
        const finalizeBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn');
        if (finalizeBtn) {
          finalizeReady = true;
          break;
        }
      }
    }

    // If finalize not ready and we have room for more spells, try level 1 spells
    if (!finalizeReady && selectedSpellCount < maxSpells) {
      const level1Rows = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-row[data-level="1"]'));
      for (const row of level1Rows.slice(0, maxSpells - selectedSpellCount)) {
        const addBtn = row.querySelector('.add-btn');
        if (addBtn && !addBtn.classList.contains('selected')) {
          addBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          selectedSpellCount++;
          await wait(200);

          // Check if finalize is ready after each selection
          const finalizeBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn');
          if (finalizeBtn) {
            finalizeReady = true;
            break;
          }
        }
      }
    }

    return { clickedCantripCount, selectedSpellCount, finalizeReady };
  };

  const MODULE_ID = 'foundryvtt-actor-studio';
  const DEBUG_ROOT_KEYS = ['debug', 'trace'];

  describe('Cleric', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    let createdActorId = null;
    let createdActor = null;
    const testActorName = `Quench Cleric Automation ${Date.now()}`;
    const clericClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000';
    const selectedRaceUuid = 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000';
    const selectedBackgroundUuid = 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000';

    const getCurrentActor = () => {
      if (createdActorId) {
        const actorFromId = game.actors.get(createdActorId) || null;
        if (actorFromId) return actorFromId;
      }
      return createdActor;
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

      const actorToCleanup = createdActorId ? game.actors.get(createdActorId) : createdActor;
      await closeActorSheetIfOpen(actorToCleanup);

      if (actorToCleanup && !actorToCleanup.deleted) {
        await actorToCleanup.delete();
      }
      createdActor = null;
      createdActorId = null;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);

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
          race: selectedRaceUuid,
          background: selectedBackgroundUuid,
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

      assertCoreSelectionsOnActor(createdActor, {
        classIdentifier: 'cleric',
        classUuid: clericClassUuid,
        raceUuid: selectedRaceUuid,
        backgroundUuid: selectedBackgroundUuid,
        className: 'cleric'
      });

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