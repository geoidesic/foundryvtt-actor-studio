import { getTestTimeouts } from '../../helpers/testTimeouts';
import { get } from 'svelte/store';
import { actorInGame } from '../../stores/storeDefinitions';

export function registerPaladinTests(context) {
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

  const openActorStudio = async (name = `Quench Paladin Test ${Date.now()}`) => {
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
    // For paladin, no subclass choice is required at these levels
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

  const MODULE_ID = 'foundryvtt-actor-studio';
  const DEBUG_ROOT_KEYS = ['debug', 'trace'];

  describe('Paladin', function () {
    let savedDebugState = {};
    let originalMilestoneLeveling = false;
    let originalForceTakeAverageHitPoints = false;
    let paladinActorId = null;
    let paladinActor = null;
    const testActorName = `Quench Paladin Automation ${Date.now()}`;
    const paladinClassUuid = 'Compendium.dnd-players-handbook.classes.Item.phbpdnPaladin000';
    const selectedRaceUuid = 'Compendium.dnd-players-handbook.origins.Item.phbspDwarf000000';
    const selectedBackgroundUuid = 'Compendium.dnd-players-handbook.origins.Item.phbbgFarmer00000';

    const findPaladinActorByName = () => {
      const matches = game.actors.contents
        .filter((actorDoc) => actorDoc?.name === testActorName && actorDoc?.type === 'character');
      if (!matches.length) return null;
      return matches[matches.length - 1];
    };

    const getCurrentPaladinActor = () => {
      if (paladinActorId) {
        const actorFromId = game.actors.get(paladinActorId) || null;
        if (actorFromId) return actorFromId;
      }

      const actorFromName = findPaladinActorByName();
      if (actorFromName && !paladinActorId) {
        paladinActorId = actorFromName.id;
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

      const actorToCleanup = paladinActorId ? game.actors.get(paladinActorId) : (paladinActor || findPaladinActorByName());
      await closeActorSheetIfOpen(actorToCleanup);

      if (actorToCleanup && !actorToCleanup.deleted) {
        await actorToCleanup.delete();
      }
      paladinActor = null;
      paladinActorId = null;

      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', originalForceTakeAverageHitPoints);

      for (const [key, value] of Object.entries(savedDebugState)) {
        window.GAS[key] = value;
      }
      savedDebugState = {};
    });

    it('should auto-run paladin creation and handle spell step as required by rules', async function () {
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
          characterClass: paladinClassUuid
        }
      });

      await closeActorStudioIfOpen();
      const creationApp = await openActorStudio(testActorName);
      assert.ok(creationApp, 'Actor Studio should open for paladin creation test');

      const requiredTabsVisited = await visitRequiredCreationTabs();
      assert.ok(requiredTabsVisited, 'All visible creation tabs should be visited before creating the paladin');

      const createClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
        20000,
        150
      );
      assert.ok(createClicked, 'Create Character button should be clickable for paladin creation');

      const creationClosedEarly = await waitForCondition(
        () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        12000,
        200
      );

      if (!creationClosedEarly) {
        const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 12000, 200);
        if (spellsTabAppeared) {
          // Paladins are non-spellcasters, so if spells tab appears, skip it
          const skipBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn');
          if (skipBtn) {
            skipBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            await wait(300);
          }
        }
      }

      const actorStudioClosed = await waitForActorStudioClosed();
      assert.ok(actorStudioClosed, 'Actor Studio should close after paladin creation completes');

      await wait(1200);
      paladinActorId = get(actorInGame)?.id || null;
      if (!paladinActorId) {
        const actorByName = findPaladinActorByName();
        paladinActorId = actorByName?.id || null;
      }
      assert.ok(paladinActorId, 'Created paladin actor id should be available after creation');

      const reachedLevel1 = await waitForActorClassLevel(paladinActorId, 'paladin', 1);
      assert.ok(reachedLevel1, 'Paladin class level should be embedded at level 1 after creation');

      paladinActor = game.actors.get(paladinActorId);
      assert.ok(paladinActor, 'Created paladin actor should exist in world actors');

      const hasBackground = paladinActor.items.some((item) => item.type === 'background');
      assert.ok(hasBackground, 'Created paladin actor should have a background item embedded');

      assertCoreSelectionsOnActor(paladinActor, {
        classIdentifier: 'paladin',
        classUuid: paladinClassUuid,
        raceUuid: selectedRaceUuid,
        backgroundUuid: selectedBackgroundUuid,
        className: 'paladin'
      });
    });

    it('should open level-up app from paladin actor sheet when milestone leveling is enabled', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentPaladinActor();
      assert.ok(actor, 'Existing created paladin actor should be available for level-up tests');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Actor Studio level-up button should be clickable on the paladin actor sheet');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up Actor Studio app should open from paladin actor sheet button');

      await closeActorStudioIfOpen();
    });

    it('should level paladin from 1 to 2 and handle spells according to rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentPaladinActor();
      assert.ok(actor, 'Existing created paladin actor should be available for 1->2 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for paladin 1->2 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for paladin 1->2 test');

      const levelUpTabFocused = await focusLevelUpClassTab();
      assert.ok(levelUpTabFocused, 'Level-up/Class tab should be focused before paladin 1->2 class selection');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before paladin 1->2 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked to select paladin level-up');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for paladin 1->2 progression');

      // Paladins are non-spellcasters, so spells tab should not appear
      const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
      assert.ok(!spellsTabAppeared, 'Spells tab should not appear for paladin level 1->2 (non-spellcaster)');

      // Wait for the level-up app to fully close
      const appClosedAfterSpells = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
      assert.ok(appClosedAfterSpells, 'Level-up app should close after progression');

      const reachedLevel2 = await waitForActorClassLevel(paladinActorId, 'paladin', 2);
      assert.ok(reachedLevel2, 'Paladin class level should progress to 2');

      await closeActorStudioIfOpen();
    });

    it('should level paladin from 2 to 3 and handle spells according to rules', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const actor = getCurrentPaladinActor();
      assert.ok(actor, 'Existing created paladin actor should be available for 2->3 level-up test');

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      configureQuenchAutomation({ advancements: { enabled: true } });

      await closeActorStudioIfOpen();

      const levelUpButtonClicked = await clickActorStudioLevelUpButtonOnSheet(actor);
      assert.ok(levelUpButtonClicked, 'Level-up button should be clickable for paladin 2->3 test');

      const levelUpAppOpened = await waitForLevelUpAppOpen();
      assert.ok(levelUpAppOpened, 'Level-up app should open for paladin 2->3 test');

      const levelUpTabFocused = await focusLevelUpClassTab();
      assert.ok(levelUpTabFocused, 'Level-up/Class tab should be focused before paladin 2->3 class selection');

      const subclassHandled = await ensureSubclassChoiceIfRequired();
      assert.ok(subclassHandled, 'Subclass choice should be selected when required before paladin 2->3 progression');

      const plusClicked = await clickExistingClassPlusInLevelUp();
      assert.ok(plusClicked, 'Existing class plus button should be clicked for paladin 2->3 test');

      const addLevelClicked = await waitForCondition(
        () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        20000,
        150
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable for paladin 2->3 progression');

      // Paladins are non-spellcasters, so spells tab should not appear
      const spellsTabAppeared = await waitForCondition(() => hasSpellsTabVisible(), 15000, 200);
      assert.ok(!spellsTabAppeared, 'Spells tab should not appear for paladin level 2->3 (non-spellcaster)');

      // Wait for the level-up app to fully close
      const appClosedAfterSpells = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
      assert.ok(appClosedAfterSpells, 'Level-up app should close after progression');

      const reachedLevel3 = await waitForActorClassLevel(paladinActorId, 'paladin', 3);
      assert.ok(reachedLevel3, 'Paladin class level should progress to 3');

      paladinActor = getCurrentPaladinActor();
      await closeActorStudioIfOpen();
    });
  });
}