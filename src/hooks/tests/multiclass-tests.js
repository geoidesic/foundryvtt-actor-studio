/**
 * Multiclass Quench Test Suite
 *
 * Tests that multiclassing into a full caster (e.g. Fighter → Bard) correctly
 * allows cantrip selection in the spell step.
 *
 * Flow:
 *   1. Create a Fighter (non-spellcaster) via Actor Studio
 *   2. Level Fighter 1→2 (no spell changes)
 *   3. Open level-up app → select Bard as new multiclass → assert cantrips appear
 */

import { get } from 'svelte/store';
import { actorInGame } from '~/src/stores/index';
import { safeGetSetting } from '~/src/helpers/Utility';
import { getTestTimeout, getTestTimeouts } from '~/src/helpers/testTimeouts';

const MODULE_ID = 'foundryvtt-actor-studio';

export function registerMulticlassTests(context) {
  const { describe, it, before, after, assert } = context;

  const TEST_TIMEOUTS = getTestTimeouts();
  const POLL_INTERVAL = TEST_TIMEOUTS.pollingInterval;
  const WAIT_SHORT = TEST_TIMEOUTS.waitShort;
  const WAIT_MEDIUM = TEST_TIMEOUTS.waitMedium;
  const WAIT_LONG = TEST_TIMEOUTS.waitLong;

  const isAborted = () =>
    typeof globalThis._gasQuenchIsAborted === 'function' && globalThis._gasQuenchIsAborted();

  class AbortError extends Error {
    constructor() { super('Test run aborted by user'); this.name = 'AbortError'; }
  }

  const checkAbort = () => { if (isAborted()) throw new AbortError(); };

  const wait = (ms) => new Promise((resolve, reject) => {
    if (isAborted()) { reject(new AbortError()); return; }
    const timer = setTimeout(() => { clearInterval(poller); resolve(); }, ms);
    const poller = setInterval(() => {
      if (isAborted()) { clearTimeout(timer); clearInterval(poller); reject(new AbortError()); }
    }, Math.min(ms, POLL_INTERVAL));
  });

  const waitForCondition = async (fn, timeoutMs = TEST_TIMEOUTS.uiInteraction, intervalMs = POLL_INTERVAL, description = 'condition') => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      let settled = false;
      let inFlight = false;
      const interval = setInterval(async () => {
        if (settled || inFlight) return;
        inFlight = true;
        if (isAborted()) {
          clearInterval(interval);
          settled = true;
          reject(new AbortError());
          return;
        }
        try {
          if (await fn()) {
            clearInterval(interval);
            settled = true;
            resolve(true);
          } else if (Date.now() - start >= timeoutMs) {
            clearInterval(interval);
            settled = true;
            resolve(false);
          }
        } catch (error) {
          clearInterval(interval);
          settled = true;
          reject(error);
        } finally {
          inFlight = false;
        }
      }, intervalMs);
    });
  };

  const closeActorStudioIfOpen = async () => {
    const app = Object.values(ui.windows).find((w) => w?.id === 'foundryvtt-actor-studio-pc-sheet');
    if (app?.close) {
      app.setClosingFromGasHook(true);
      await app.close();
      await wait(WAIT_MEDIUM);
    }
    let attempts = 0;
    while (document.querySelector('#foundryvtt-actor-studio-pc-sheet') && attempts < 20) {
      checkAbort();
      await wait(WAIT_SHORT);
      attempts++;
    }
    const el = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (el) { el.remove(); await wait(WAIT_SHORT); }
  };

  const openActorStudio = async (name) => {
    Hooks.call('gas.openActorStudio', name, '', 'character');
    await wait(WAIT_LONG);
    return Object.values(ui.windows).find((w) => w?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
  };

  const clickFooterButtonBySelector = async (selector) => {
    const target = document.querySelector(selector);
    if (!target || target.disabled) return false;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return true;
  };

  const clickFooterButtonContaining = async (text) => {
    const buttons = Array.from(
      document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button')
    );
    const target = buttons.find((b) => {
      const label = (b.textContent || '').toLowerCase();
      return label.includes(String(text).toLowerCase()) && !b.disabled;
    });
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    return true;
  };

  const clickTabByLabel = async (label) => {
    const tabs = Array.from(
      document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button')
    );
    const target = tabs.find((b) => (b.textContent || '').trim().toLowerCase() === String(label).toLowerCase());
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return waitForCondition(
      () => Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button.active'))
        .some((b) => (b.textContent || '').trim().toLowerCase() === String(label).toLowerCase()),
      TEST_TIMEOUTS.uiInteraction,
      POLL_INTERVAL,
      `tab '${label}' to become active`
    );
  };

  const clickFirstAvailableTabLabel = async (labels) => {
    for (const label of labels) {
      if (await clickTabByLabel(label)) return true;
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

  const hasSpellUiVisible = () => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;
    return Boolean(
      root.querySelector('.spells-tab-container') ||
      root.querySelector('.gas-finalize-spells-btn') ||
      root.querySelector('.available-spell-grid') ||
      root.querySelector('.right-panel.spell-list')
    );
  };

  const getFinalizeButton = () => {
    return document.querySelector('#foundryvtt-actor-studio-pc-sheet .gas-finalize-spells-btn')
      || document.querySelector('.gas-finalize-spells-btn');
  };

  const readSpellCounters = (root) => {
    if (!root) return { spells: { current: 0, limit: 0 }, cantrips: { current: 0, limit: 0 } };

    const parseCounterValue = (text) => {
      const match = String(text || '').match(/(\d+)\s*\/\s*(\d+)/);
      if (!match) return { current: 0, limit: 0 };
      return { current: Number.parseInt(match[1], 10) || 0, limit: Number.parseInt(match[2], 10) || 0 };
    };

    const labels = Array.from(root.querySelectorAll('.spells-tab-container .grid-item.label'));
    const values = Array.from(root.querySelectorAll('.spells-tab-container .grid-item.value'));
    let spells = { current: 0, limit: 0 };
    let cantrips = { current: 0, limit: 0 };
    labels.forEach((labelNode, index) => {
      const text = String(labelNode.textContent || '').toLowerCase();
      const val = String(values[index]?.textContent || '');
      const parsed = parseCounterValue(val);
      if (text.includes('spell')) spells = parsed;
      if (text.includes('cantrip')) cantrips = parsed;
    });
    if (spells.limit === 0 && cantrips.limit === 0) {
      const headerText = root.textContent || '';
      spells = parseCounterValue((headerText.match(/Spells[^0-9]*(\d+\/\d+)/i) || [])[1] || '0/0');
      cantrips = parseCounterValue((headerText.match(/Cantrips[^0-9]*(\d+\/\d+)/i) || [])[1] || '0/0');
    }
    return { spells, cantrips };
  };

  // ── Actor references ─────────────────────────────────────────────────────
  let actorId = null;
  let originalMilestoneLeveling = false;
  const testActorName = `Quench Multiclass ${Date.now()}`;

  const getCurrentActor = () => (actorId ? game.actors.get(actorId) : null);
  const findActorByName = () => game.actors?.find((a) => a?.name === testActorName) || null;

  before(async function () {
    this.timeout(TEST_TIMEOUTS.perTest);
    checkAbort();

    // Guard: package.json has "debug": true → init.js sets window.GAS root
    // keys (debug, characterClass, race, background) which bypass quenchAutomation
    // selections in getSelectionAutomationValue(). This will cause creation to
    // use the debug defaults (e.g. Cleric) instead of the test's automation values.
    // Set "debug" to false in package.json and reload Foundry.
    if (window.GAS?.debug || window.GAS?.characterClass) {
      const msg = 'package.json has "debug": true — set it to false and reload Foundry before running multiclass tests.';
      console.error(`[QUENCH] ${msg}`);
      ui.notifications?.error?.(msg, { permanent: true });
      assert.fail(msg);
    }

    // Clean up any leftover actor from previous runs
    const existing = game.actors?.find((a) => a?.name?.startsWith?.('Quench Multiclass'));
    if (existing) await existing.delete();

    // Save original milestone leveling setting so we can restore it in after()
    originalMilestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
    // Set milestoneLeveling to true since 2 out of 3 tests require it for level-up
    await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
  });

  after(async function () {
    this.timeout(TEST_TIMEOUTS.perTest);
    checkAbort();
    await closeActorStudioIfOpen();
    if (window?.GAS?.quenchAutomation) delete window.GAS.quenchAutomation;
    try {
      await game.settings.set(MODULE_ID, 'milestoneLeveling', originalMilestoneLeveling);
    } catch (_) { /* restore best-effort */ }
    const actor = getCurrentActor();
    if (actor) {
      try { await actor.delete(); } catch (_) { /* ignore */ }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST: Create a Fighter (non-spellcaster)
  // ═══════════════════════════════════════════════════════════════════════
  it('should create a fighter via Actor Studio', async function () {
    this.timeout(TEST_TIMEOUTS.perTest);
    checkAbort();

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
        race: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
        background: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
        characterClass: 'Compendium.dnd-players-handbook.classes.Item.phbftrFighter000'
      }
    };

    await closeActorStudioIfOpen();
    const app = await openActorStudio(testActorName);
    assert.ok(app, 'Actor Studio should open for fighter creation');

    const tabsVisited = await visitRequiredCreationTabs();
    assert.ok(tabsVisited, 'All visible creation tabs should be visited');

    const createClicked = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
      TEST_TIMEOUTS.uiStateChange,
      POLL_INTERVAL
    );
    assert.ok(createClicked, 'Create Character button should be clickable');

    const closed = await waitForCondition(
      () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
      TEST_TIMEOUTS.appLifecycleComplete,
      POLL_INTERVAL,
      'Actor Studio to close after fighter creation'
    );
    assert.ok(closed, 'Actor Studio should close after fighter creation');

    await wait(getTestTimeout('advancementProcessing'));
    actorId = get(actorInGame)?.id || findActorByName()?.id || null;
    assert.ok(actorId, 'Fighter actor ID should be available after creation');

    const actor = game.actors.get(actorId);
    assert.ok(actor, 'Fighter actor should exist in world');

    // Verify fighter has no spell slots (non-spellcaster)
    const spells = actor.system?.spells || {};
    const hasSpellSlots = Object.keys(spells).some((key) => key.startsWith('spell') && spells[key]?.max > 0);
    assert.ok(!hasSpellSlots, 'Level 1 fighter should have no spell slots');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST: Level Fighter 1→2
  // ═══════════════════════════════════════════════════════════════════════
  it('should level fighter from 1 to 2', async function () {
    this.timeout(TEST_TIMEOUTS.perTest);
    checkAbort();

    const actor = getCurrentActor();
    assert.ok(actor, 'Fighter actor should exist for level-up');

    await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
    await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
    window.GAS.quenchAutomation = {
      enabled: true,
      allowLegacyRootValues: false,
      advancements: { enabled: true },
      selections: {}
    };

    await closeActorStudioIfOpen();

    // Click level-up button on fighter sheet
    const levelUpButtons = Array.from(
      document.querySelectorAll(`button.level-up, button[data-action="level-up"]`)
    );
    // If no buttons on page, render the sheet
    if (levelUpButtons.length === 0) {
      await actor.sheet.render(true, { focus: true });
      await wait(WAIT_LONG);
    }

    let btnClicked = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      checkAbort();
      const buttons = Array.from(
        document.querySelectorAll(`button.level-up, button[data-action="level-up"]`)
      );
      const target = buttons.find((b) => !b.disabled);
      if (target) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        btnClicked = true;
        break;
      }
      await wait(WAIT_MEDIUM);
    }
    assert.ok(btnClicked, 'Level-up button should be clickable on fighter sheet');

    const appOpened = await waitForCondition(
      () => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet')),
      TEST_TIMEOUTS.appClosure,
      POLL_INTERVAL,
      'level-up app to open'
    );
    assert.ok(appOpened, 'Level-up app should open');

    // Focus Level Up/Class tab
    const tabFocused = await clickFirstAvailableTabLabel(['Level Up', 'Class']);
    assert.ok(tabFocused, 'Level-up tab should be focused');

    // Activate existing class row (Fighter)
    const rowActivated = await waitForCondition(() => {
      const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
      if (!root) return false;

      const addLevelBtn = root.querySelector('.footer-container .gas-add-level-btn');
      if (addLevelBtn && !addLevelBtn.disabled) return true;

      const classRows = Array.from(root.querySelectorAll('.class-row[role="button"]'));
      const matchingRow = classRows.find((r) => {
        const text = String(r.textContent || '').toLowerCase();
        return text.includes('fighter');
      }) || classRows[0];
      if (!matchingRow) return false;

      // Click the plus icon to activate
      const plusIcon = matchingRow.querySelector('i.fa-plus, i.fas.fa-plus');
      if (plusIcon) {
        matchingRow.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      return false;
    }, TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL);
    // Row activation may succeed via the plus click or may already be active
    // Continue regardless — what matters is the Add Level button

    await wait(WAIT_MEDIUM);

    // Click Add Level
    const addLevelClicked = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
      TEST_TIMEOUTS.uiStateChange,
      POLL_INTERVAL
    );
    assert.ok(addLevelClicked, 'Add Level button should be clickable for fighter 1→2');

    await wait(getTestTimeout('advancementPostLevel'));

    // Skip spells if it appears (fighter has no spells)
    const spellsVisible = await waitForCondition(
      () => {
        const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
        if (!root) return false;
        return hasSpellUiVisible() || root.querySelector('.gas-finalize-spells-btn') !== null;
      },
      TEST_TIMEOUTS.uiInteraction,
      POLL_INTERVAL,
      'spell UI (if any)'
    );
    if (spellsVisible) {
      const finalized = await waitForCondition(
        () => clickFooterButtonContaining('finalize') || clickFooterButtonContaining('skip'),
        TEST_TIMEOUTS.uiInteraction,
        POLL_INTERVAL,
        'finalize/skip button'
      );
      assert.ok(finalized, 'Should finalize or skip spells step for fighter');
    }

    // Wait for app to close
    const appClosed = await waitForCondition(
      () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
      TEST_TIMEOUTS.appLifecycleComplete,
      POLL_INTERVAL,
      'level-up app to close after fighter 1→2'
    );
    assert.ok(appClosed, 'Level-up app should close after fighter progression');

    // Verify fighter reached level 2 (wait with condition instead of hard timeout)
    const reachedLevel = await waitForCondition(() => {
      const a = getCurrentActor();
      if (!a) return false;
      const cls = Object.values(a.classes || {})[0];
      const lvl = cls?.system?.levels || cls?.levels || 0;
      return lvl >= 2;
    }, TEST_TIMEOUTS.actorDataUpdate, POLL_INTERVAL, 'fighter to reach level 2');
    assert.ok(reachedLevel, 'Fighter should reach level 2');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST: Multiclass Fighter → Bard (pick cantrips)
  // ═══════════════════════════════════════════════════════════════════════
  it('should multiclass fighter into bard and allow cantrip selection', async function () {
    this.timeout(TEST_TIMEOUTS.perTest * 2);
    checkAbort();

    const actor = getCurrentActor();
    assert.ok(actor, 'Fighter actor should exist for multiclass');

    await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
    await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
    await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
    await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);
    await game.settings.set(MODULE_ID, 'enableSpellSelection', true);

    // Use automation to select Bard as the multiclass class.
    // LevelUp.svelte onMount reads quenchAutomation.selections.levelUpClass
    // and calls selectMultiClassHandler automatically.
    const BARD_UUID = 'Compendium.dnd-players-handbook.classes.Item.phbbrdBard000000';
    window.GAS.quenchAutomation = {
      enabled: true,
      allowLegacyRootValues: false,
      advancements: { enabled: true },
      selections: {
        levelUpClass: BARD_UUID
      }
    };

    await closeActorStudioIfOpen();

    // Click level-up button on fighter sheet
    const levelUpButtons = Array.from(
      document.querySelectorAll('button.level-up, button[data-action="level-up"]')
    );
    if (levelUpButtons.length === 0) {
      await actor.sheet.render(true, { focus: true });
      await wait(TEST_TIMEOUTS.waitLong);
    }

    let btnClicked = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      checkAbort();
      const buttons = Array.from(
        document.querySelectorAll('button.level-up, button[data-action="level-up"]')
      );
      const target = buttons.find((b) => !b.disabled);
      if (target) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        btnClicked = true;
        break;
      }
      await wait(TEST_TIMEOUTS.waitMedium);
    }
    assert.ok(btnClicked, 'Level-up button should be clickable for multiclass round');

    const appOpened = await waitForCondition(
      () => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet')),
      TEST_TIMEOUTS.waitLong * 3,
      POLL_INTERVAL,
      'level-up app to open for multiclass'
    );
    assert.ok(appOpened, 'Level-up app should open for multiclass');

    // onMount will auto-select Bard from quenchAutomation.selections.levelUpClass.
    // Wait for the Add Level button to become enabled (Bard selected).
    await wait(TEST_TIMEOUTS.waitMedium);

    const addLevelClicked = await waitForCondition(
      () => clickFooterButtonBySelector('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
      TEST_TIMEOUTS.uiStateChange,
      POLL_INTERVAL
    );
    assert.ok(addLevelClicked, 'Add Level button should be clickable for bard multiclass');

    // Wait for advancement processing
    await wait(getTestTimeout('advancementPostLevel'));

    // ── Verify spell selection UI shows Bard cantrips ──
    // Bard level 1: 2 cantrips (2024 rules)
    const spellUiAppeared = await waitForCondition(
      () => {
        const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
        if (!root) return false;
        return hasSpellUiVisible() || Boolean(root.querySelector('.gas-finalize-spells-btn'));
      },
      TEST_TIMEOUTS.spellWorkflow,
      POLL_INTERVAL,
      'spell UI to appear during bard multiclass'
    );
    assert.ok(spellUiAppeared, 'Spell selection UI should appear when multiclassing into Bard');

    // Click Spells tab if visible
    const spellsTabClicked = await clickTabByLabel('Spells');
    if (spellsTabClicked) {
      await wait(TEST_TIMEOUTS.waitMedium);
    }

    // Wait for spell limits to populate
    // Note: waitForCondition resolves with true/false, so read counters separately after.
    const limitsAppeared = await waitForCondition(() => {
      const counters = readSpellCounters(document.querySelector('#foundryvtt-actor-studio-pc-sheet'));
      return counters.cantrips.limit > 0 || counters.spells.limit > 0;
    }, TEST_TIMEOUTS.spellUiLoad, POLL_INTERVAL, 'spell limits (cantrips or spells) to be set');

    assert.ok(limitsAppeared, 'Spell limits should be set for bard multiclass');

    const finalCounters = readSpellCounters(document.querySelector('#foundryvtt-actor-studio-pc-sheet'));
    assert.ok(
      finalCounters.cantrips.limit >= 2,
      `Bard multiclass should show at least 2 cantrips (got ${finalCounters.cantrips.limit})`
    );
    window.GAS.log.d('[QUENCH MULTICLASS] Bard cantrip limit confirmed:', finalCounters.cantrips.limit);

    // Helper to expand collapsed spell groups matching a header predicate
    const expandGroups = async (matchFn) => {
      const headers = Array.from(
        document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .spell-level-group .spell-level-header')
      ).filter((h) => {
        const text = String(h.textContent || '').toLowerCase();
        return text.includes('[+]') && matchFn(text);
      });
      for (const h of headers) {
        h.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(TEST_TIMEOUTS.waitShort);
      }
      return headers.length;
    };

    // Helper to select ALL enabled add-buttons from groups matching a header predicate,
    // returning the total selected. Keeps clicking until no more are available.
    const selectAllFromGroups = async (headerMatchFn) => {
      let selected = 0;
      const deadline = Date.now() + TEST_TIMEOUTS.spellWorkflow;
      while (Date.now() < deadline) {
        checkAbort();
        await expandGroups(headerMatchFn);
        // Find first enabled add-btn in a matching group
        const groups = document.querySelectorAll(
          '#foundryvtt-actor-studio-pc-sheet .spell-level-group'
        );
        let targetBtn = null;
        for (const group of groups) {
          const headerText = String(group.querySelector('.spell-level-header')?.textContent || '').toLowerCase();
          if (!headerMatchFn(headerText)) continue;
          targetBtn = group.querySelector('button.add-btn:not([disabled])');
          if (targetBtn) break;
        }
        if (!targetBtn) break; // no more available
        targetBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        selected++;
        await wait(TEST_TIMEOUTS.waitMedium);
      }
      return selected;
    };

    // Select cantrips
    const cantripsSelected = await selectAllFromGroups(
      (text) => text.includes('cantrip')
    );
    assert.ok(
      cantripsSelected >= finalCounters.cantrips.limit,
      `Should select ${finalCounters.cantrips.limit} bard cantrips (selected: ${cantripsSelected})`
    );

    // Select ALL 1st-level spells (Bard gets spells known at level 1)
    const spellsSelected = await selectAllFromGroups(
      (text) => !text.includes('cantrip')
    );
    assert.ok(
      spellsSelected >= 1,
      `Should select at least 1 bard spell (selected: ${spellsSelected})`
    );
    window.GAS.log.d(`[QUENCH MULTICLASS] Bard spells selected: ${spellsSelected}`);

    // Finalize spells
    const finalized = await waitForCondition(
      () => clickFooterButtonContaining('finalize'),
      TEST_TIMEOUTS.uiInteraction,
      POLL_INTERVAL,
      'finalize button after bard multiclass spell selection'
    );
    assert.ok(finalized, 'Should finalize bard multiclass spell selection');

    // Wait for app to close
    const appClosed = await waitForCondition(
      () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
      TEST_TIMEOUTS.appLifecycleComplete,
      POLL_INTERVAL,
      'level-up app to close after bard multiclass'
    );
    assert.ok(appClosed, 'Level-up app should close after bard multiclass');

    // Verify actor has Bard class and cantrips (wait with condition)
    const bardClassAppeared = await waitForCondition(() => {
      const a = getCurrentActor();
      if (!a) return false;
      const ck = Object.keys(a.classes || {}).map((k) => k.toLowerCase());
      return ck.includes('bard');
    }, TEST_TIMEOUTS.actorDataUpdate, POLL_INTERVAL, 'bard class to appear on actor');
    assert.ok(bardClassAppeared, 'Actor should have Bard class after multiclass');

    // Verify bard has cantrips and 1st-level spells
    const bardActor = getCurrentActor();
    const cantripItems = bardActor.items.filter(
      (item) => item.type === 'spell' && (item.system?.level || 0) === 0
    );
    assert.ok(
      cantripItems.length >= 1,
      `Bard multiclass should have at least 1 cantrip (got ${cantripItems.length})`
    );
    window.GAS.log.d('[QUENCH MULTICLASS] Bard cantrips found on actor:', cantripItems.map((s) => s.name));

    const spellItems = bardActor.items.filter(
      (item) => item.type === 'spell' && (item.system?.level || 0) >= 1
    );
    assert.ok(
      spellItems.length >= 1,
      `Bard multiclass should have at least 1 first-level spell (got ${spellItems.length})`
    );
    window.GAS.log.d('[QUENCH MULTICLASS] Bard 1st-level spells found on actor:', spellItems.map((s) => s.name));
  });
}
