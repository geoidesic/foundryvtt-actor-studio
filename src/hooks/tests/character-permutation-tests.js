import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';
import { getTestTimeouts } from '~/src/helpers/testTimeouts';

const MODULE_ID = 'foundryvtt-actor-studio';

const CLASS_CONFIG = {
  cleric: { displayName: 'Cleric', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  fighter: { displayName: 'Fighter', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbftrFighter000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  ranger: { displayName: 'Ranger', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbrgrRanger0000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  paladin: { displayName: 'Paladin', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbpdnPaladin000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspDwarf000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgFarmer00000' },
  warlock: { displayName: 'Warlock', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbclWarlock000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  barbarian: { displayName: 'Barbarian', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbbrbBarbarian0', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  bard: { displayName: 'Bard', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbbrdBard000000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  sorcerer: { displayName: 'Sorcerer', classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbscrSorcerer00', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' },
  artificer: { displayName: 'Artificer', classUuid: 'Compendium.dnd-tashas-cauldron.tcoe-character-options.Item.tcoeArtificer000', raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000', backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000' }
};

const DEBUG_ROOT_KEYS = ['debug', 'race', 'background', 'characterClass', 'characterSubClass'];

export function registerCharacterPermutationTests(context, options = {}) {
  const { describe, it, assert, before, after } = context;
  const TEST_TIMEOUTS = getTestTimeouts();
  const wait = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
  const enabledClasses = new Set((options?.classes || Object.keys(CLASS_CONFIG)).map((entry) => String(entry).toLowerCase()));

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

  const clickFooterButtonBySelector = async (selector) => {
    const target = document.querySelector(selector);
    if (!target || target.disabled) return false;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
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
    return waitForCondition(() => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet .class-row')), 8000, 100);
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
    }, 10000, 150);
  };

  // Activates the existing class row by clicking the plus icon.
  // Returns true as soon as the row is activated — indicated by either:
  //   - the Add Level button appearing (no subclass required at this level), or
  //   - the #subClass-select appearing (subclass required: caller must handle it before Add Level).
  const activateExistingClassRow = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;
      // Already activated — add-level button is ready.
      const addLevelButton = root.querySelector('.footer-container .gas-add-level-btn');
      if (addLevelButton && !addLevelButton.disabled) return true;
      // Already activated — subclass is required at this level.
      if (root.querySelector('#subClass-select')) return true;

      const plusIcon = root.querySelector('.class-row[role="button"] i.fa-plus, .class-row[role="button"] i.fas.fa-plus, .class-row i.fa-plus, .class-row i.fas.fa-plus');
      const clickableRow = plusIcon?.closest?.('[role="button"]') || plusIcon?.closest?.('.class-row') || root.querySelector('.class-row[role="button"]') || root.querySelector('.class-row');
      if (!clickableRow) return false;

      clickableRow.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      clickableRow.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return false;
    }, 18000, 150);
  };

  const clickActorStudioLevelUpButtonOnSheet = async (actor) => {
    if (!actor?.sheet) return false;
    await actor.sheet.render(true, { focus: true });
    await wait(350);

    const button = document.querySelector('button.level-up');
    if (!button || button.disabled) return false;

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(250);
    return true;
  };

  const waitForLevelUpAppOpen = async () => {
    return waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;
      const tabsList = root.querySelector('.tabs-list');
      return Boolean(tabsList);
    }, 20000, 150);
  };

  const waitForActorStudioClosed = async () => waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 30000, 150);

  const waitForActorClassLevel = async (actorId, classIdentifier, targetLevel) => {
    return waitForCondition(() => {
      const actor = game.actors.get(actorId);
      if (!actor) return false;
      const classItem = actor.items.find((item) => item.type === 'class' && String(item.system?.identifier || '').toLowerCase() === String(classIdentifier).toLowerCase());
      return Number(classItem?.system?.levels || 0) >= Number(targetLevel);
    }, 50000, 250);
  };

  const hasSpellsTabVisible = () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).some((button) => (button.textContent || '').trim().toLowerCase().includes('spell'));

  const completeSpellsStepIfVisible = async ({ timeoutMs = 20000 } = {}) => {
    const allTabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).map(b => (b.textContent || '').trim());
    logSubclassDebug('checking for spells tab, all tabs:', allTabs);
    const spellsVisible = await waitForCondition(() => hasSpellsTabVisible(), timeoutMs, 200);
    if (!spellsVisible) {
      logSubclassDebug('spells tab not visible');
      return { visible: false, completed: false };
    }

    logSubclassDebug('spells tab visible, clicking Spells tab');
    await clickTabByLabel('Spells');

    // Wait for spells UI to load
    await wait(1000);

    // Expand any collapsed spell level headers
    const headers = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-level-header'));
    for (const header of headers) {
      if (header.classList.contains('collapsed') || !header.classList.contains('expanded')) {
        header.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(200);
      }
    }

    // Click available add buttons until finalize becomes available or no more add buttons
    let addButtonsClicked = 0;
    const maxClicks = 20; // Prevent infinite loop
    while (addButtonsClicked < maxClicks) {
      const addButtons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .add-btn:not([disabled])'));
      if (addButtons.length === 0) break;

      // Click the first enabled add button
      addButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      addButtonsClicked++;
      await wait(500);

      // Check if finalize button is now available
      const finalizeBtn = document.querySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn');
      if (finalizeBtn && !finalizeBtn.disabled) break;
    }

    const finalized = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-finalize-spells-btn'),
      12000,
      150
    );
    if (finalized) return { visible: true, completed: true };

    const skipped = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-skip-spells-btn'),
      8000,
      150
    );
    return { visible: true, completed: skipped };
  };

  const shouldExpectSpellsForLevel = (classIdentifier, targetLevel) => {
    const normalized = String(classIdentifier || '').toLowerCase();
    const rulesVersion = String(window.GAS?.dnd5eRules || '').trim();
    if (['cleric', 'warlock', 'bard', 'sorcerer', 'artificer'].includes(normalized)) return Number(targetLevel) >= 1;
    if (normalized === 'ranger') return rulesVersion === '2014' ? Number(targetLevel) >= 2 : Number(targetLevel) >= 1;
    if (normalized === 'paladin') return rulesVersion === '2014' ? Number(targetLevel) === 2 : false;
    return false;
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

  const assertCoreSelectionsOnActor = (assert, actor, { classIdentifier, classUuid, raceUuid, backgroundUuid, className }) => {
    const hasClassSelection = actor.items.some((item) => item.type === 'class' && (String(item.system?.identifier || '').toLowerCase() === String(classIdentifier || '').toLowerCase() || hasSelectionFromUuid(item, classUuid) || String(item.name || '').toLowerCase().includes(String(className || '').toLowerCase())));
    const hasRaceSelection = actor.items.some((item) => ['race', 'species'].includes(item.type) && hasSelectionFromUuid(item, raceUuid));
    const hasBackgroundSelection = actor.items.some((item) => item.type === 'background' && hasSelectionFromUuid(item, backgroundUuid));
    assert.ok(hasClassSelection, `Created actor should contain the selected ${className} class`);
    assert.ok(hasRaceSelection, 'Created actor should contain the selected race/species');
    assert.ok(hasBackgroundSelection, 'Created actor should contain the selected background');
  };

  for (const classIdentifier of enabledClasses) {
    const classConfig = CLASS_CONFIG[classIdentifier];
    if (!classConfig) continue;

    describe(classConfig.displayName, function () {
      let savedDebugState = {};
      let originalMilestoneLeveling = false;
      let originalForceTakeAverageHitPoints = false;
      let classActorId = null;
      let classActor = null;
      let classUuid = classConfig.classUuid;
      const testActorName = `Quench ${classConfig.displayName} Automation ${Date.now()}`;

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

      before(function () {
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
      });

      after(async function () {
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
      });

      it(`should auto-run ${classIdentifier} creation and complete`, async function () {
        this.timeout(TEST_TIMEOUTS.perTest);

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
            characterClass: classUuid
          }
        };

        await closeActorStudioIfOpen();
        const creationApp = await openActorStudio(testActorName);
        assert.ok(creationApp, `Actor Studio should open for ${classIdentifier} creation test`);

        const requiredTabsVisited = await visitRequiredCreationTabs();
        assert.ok(requiredTabsVisited, `All visible creation tabs should be visited before creating ${classIdentifier}`);

        const createClicked = await waitForCondition(() => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'), 20000, 150);
        assert.ok(createClicked, `Create Character button should be clickable for ${classIdentifier}`);

        const creationClosedEarly = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 12000, 200);
        if (!creationClosedEarly) {
          const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 30000 });
          if (spellStepResult.visible) {
            assert.ok(spellStepResult.completed, `${classConfig.displayName} creation spells step should complete via UI controls`);
          }
        }

        const actorStudioClosed = await waitForActorStudioClosed();
        assert.ok(actorStudioClosed, `Actor Studio should close after ${classIdentifier} creation completes`);

        await wait(1200);
        classActorId = get(actorInGame)?.id || findActorByName()?.id || null;
        assert.ok(classActorId, `Created ${classIdentifier} actor id should be available after creation`);

        const reachedLevel1 = await waitForActorClassLevel(classActorId, classIdentifier, 1);
        assert.ok(reachedLevel1, `${classConfig.displayName} class level should be embedded at level 1 after creation`);

        classActor = game.actors.get(classActorId);
        assert.ok(classActor, `Created ${classIdentifier} actor should exist in world actors`);
        assertCoreSelectionsOnActor(assert, classActor, { classIdentifier, classUuid, raceUuid: classConfig.raceUuid, backgroundUuid: classConfig.backgroundUuid, className: classIdentifier });
      });

      it(`should open level-up app from ${classIdentifier} actor sheet when milestone leveling is enabled`, async function () {
        this.timeout(TEST_TIMEOUTS.perTest);
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
      });

      const runLevel = async (targetLevel) => {
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

        // Step 1: Activate the class row (returns once either the subclass selector OR the add-level button is visible).
        const rowActivated = await activateExistingClassRow();
        assert.ok(rowActivated, `Existing class row should activate for ${classIdentifier} level-up`);

        // Step 2: If the class receives its subclass at this level, pick the first available option.
        const subclassHandled = await selectFirstSubclassOptionIfRequired();
        assert.ok(subclassHandled, `Subclass choice should be handled when required for ${classIdentifier} at level ${targetLevel}`);

        // Step 3: Now the Add Level button must be present (subclass satisfied or not required).
        const addLevelClicked = await waitForCondition(() => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'), 20000, 150);
        assert.ok(addLevelClicked, `Add Level button should be clickable for ${classIdentifier} progression`);

        // Wait for advancement processing and workflow progression
        await wait(3000);
        const tabsAfterAddLevel = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')).map(b => (b.textContent || '').trim());
        logSubclassDebug('tabs after add level:', tabsAfterAddLevel);

        const spellStepResult = await completeSpellsStepIfVisible({ timeoutMs: 25000 });
        const expectSpells = shouldExpectSpellsForLevel(classIdentifier, targetLevel);
        const rulesVersion = String(window.GAS?.dnd5eRules || '').trim();
        logSubclassDebug('spell expectations', { classIdentifier, targetLevel, expectSpells, rulesVersion });
        if (expectSpells) {
          assert.ok(spellStepResult.visible, `Spells tab should appear for ${classIdentifier} level ${targetLevel}`);
          assert.ok(spellStepResult.completed, `${classConfig.displayName} level-up spells step should complete`);
        } else if (spellStepResult.visible) {
          assert.ok(spellStepResult.completed, `If spells UI appears for ${classIdentifier} level ${targetLevel}, it should complete`);
        }

        const appClosed = await waitForCondition(() => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'), 15000, 200);
        assert.ok(appClosed, 'Level-up app should close after progression');

        const reachedTargetLevel = await waitForActorClassLevel(classActorId, classIdentifier, targetLevel);
        assert.ok(reachedTargetLevel, `${classConfig.displayName} class level should progress to ${targetLevel}`);
      };

      it(`should level ${classIdentifier} from 1 to 2`, async function () {
        this.timeout(TEST_TIMEOUTS.perTest);
        await runLevel(2);
      });

      it(`should level ${classIdentifier} from 2 to 3`, async function () {
        this.timeout(TEST_TIMEOUTS.perTest);
        await runLevel(3);
      });
    });
  }
}

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