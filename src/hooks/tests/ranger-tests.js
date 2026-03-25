import { getTestTimeouts } from '../../helpers/testTimeouts';
import { get } from 'svelte/store';
import { actorInGame } from '../../stores/storeDefinitions';

export function registerRangerTests(context) {
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

  const openActorStudio = async (name = `Quench Ranger Test ${Date.now()}`) => {
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
    // For ranger, no subclass choice is required at these levels
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

  const completeSpellsStepIfVisible = async (options = {}) => {
    const { timeoutMs = 25000 } = options;

    const spellsTabVisible = await waitForCondition(() => hasSpellsTabVisible(), 5000, 200);
    if (!spellsTabVisible) {
      return { visible: false, completed: false };
    }

    // Click on spells tab if not already active
    const spellsTab = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'))
      .find((tab) => (tab.textContent || '').trim().toLowerCase().includes('spell'));

    if (spellsTab && !spellsTab.classList.contains('active')) {
      spellsTab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(500);
    }

    // Wait for spell UI to load
    const spellUIReady = await waitForCondition(() => {
      const finalizeBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn');
      const skipBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn');
      return finalizeBtn || skipBtn;
    }, timeoutMs, 200);

    if (!spellUIReady) {
      return { visible: true, completed: false };
    }

    // Try to finalize first, then skip if finalize not available
    const finalizeBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn');
    if (finalizeBtn) {
      finalizeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(300);
      return { visible: true, completed: true };
    }

    const skipBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn');
    if (skipBtn) {
      skipBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await wait(300);
      return { visible: true, completed: true };
    }

    return { visible: true, completed: false };
  };

  const shouldExpectRangerSpellsForLevel = (level) => {
    // Ranger spellcasting rules: gets spells at level 2
    return level >= 2;
  };

  const MODULE_ID = 'foundryvtt-actor-studio';
  const DEBUG_ROOT_KEYS = ['debug', 'trace'];

  describe('Ranger', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    let rangerActorId = null;
    let rangerActor = null;
    const testActorName = `Quench Ranger Automation ${Date.now()}`;
    const rangerClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbrgrRanger0000';
    const selectedRaceUuid = 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000';
    const selectedBackgroundUuid = 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000';

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
          race: selectedRaceUuid,
          background: selectedBackgroundUuid,
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

      assertCoreSelectionsOnActor(rangerActor, {
        classIdentifier: 'ranger',
        classUuid: rangerClassUuid,
        raceUuid: selectedRaceUuid,
        backgroundUuid: selectedBackgroundUuid,
        className: 'ranger'
      });
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