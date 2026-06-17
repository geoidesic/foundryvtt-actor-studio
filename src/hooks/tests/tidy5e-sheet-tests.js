import { getTestTimeouts } from '~/src/helpers/testTimeouts';

const MODULE_ID = 'foundryvtt-actor-studio';

const TEST_TIMEOUTS = getTestTimeouts();
const POLL_INTERVAL = TEST_TIMEOUTS.pollingInterval;
const WAIT_MEDIUM = TEST_TIMEOUTS.waitMedium;
const WAIT_LONG = TEST_TIMEOUTS.waitLong;
const WAIT_SHORT = TEST_TIMEOUTS.waitShort;

// ── Tidy5e detection helpers ────────────────────────────────────────────────
// tidy5e-sheet (v5+, v12+ Foundry) registers under the module ID prefix 'tidy5e-sheet.'
// Legacy tidy5e (classic, pre-v12) uses 'tidy5e.' — we do NOT use that.
// The sheet class object key format in CONFIG.Actor.sheetClasses is "moduleId.ClassName".

function getTidySheetId() {
  const sheetClasses = CONFIG?.Actor?.sheetClasses?.character ?? {};
  const ids = Object.keys(sheetClasses);
  // Prefer the modern Quadrone sheet over the classic Tidy5e sheet when both exist.
  const quad = ids.find((id) => /Tidy5eCharacterSheetQuadrone$/i.test(id.split('.').pop() || ''));
  if (quad) return quad;
  const classic = ids.find((id) => /Tidy5eCharacterSheet$/i.test(id.split('.').pop() || ''));
  return classic || null;
}

function isTidy5eModuleActive() {
  return game?.modules?.get?.('tidy5e-sheet')?.active === true;
}

/** Check whether the actor's currently OPEN sheet instance is Tidy5e. */
function isTidySheetInstance(actor) {
  if (!actor?.sheet) return false;
  const tidyMod = game?.modules?.get?.('tidy5e-sheet');
  if (tidyMod?.api?.isTidy5eCharacterSheet?.(actor.sheet)) return true;
  return /tidy5e/i.test(actor.sheet?.constructor?.name || '');
}

function countOpenSheetsForActor(actor) {
  if (!actor) return 0;
  return Object.values(ui.windows).filter((w) => w?.document?.uuid === actor.uuid).length;
}

/** Switch an actor's sheet class to tidy5e, using Foundry's _onSheetChange API. */
async function switchActorToTidy5e(actor, tidySheetId) {
  if (!actor || !tidySheetId) return;
  const current = String(actor.getFlag('core', 'sheetClass') || '');
  if (current === tidySheetId) return;

  const wasOpen = !!actor.sheet?.rendered;
  if (wasOpen) {
    await actor.sheet.close();
  }
  await actor.setFlag('core', 'sheetClass', tidySheetId);
  if (typeof actor._onSheetChange === 'function') {
    await actor._onSheetChange({ sheetOpen: wasOpen });
  }
  if (wasOpen) {
    await actor.sheet.render(true);
  }
}

/** Switch an actor back to the system default sheet class. */
async function switchActorToDefault(actor) {
  if (!actor) return;
  const DSC = foundry?.applications?.apps?.DocumentSheetConfig;
  const defaultId = DSC?.getSheetClassesForSubType?.('Actor', 'character')?.defaultClass;
  if (!defaultId) return;

  await actor.setFlag('core', 'sheetClass', defaultId);
  if (typeof actor._onSheetChange === 'function') {
    await actor._onSheetChange({ sheetOpen: false });
  }
}

// ── Generic test helpers ─────────────────────────────────────────────────────

async function waitForCondition(fn, timeoutMs, intervalMs, description) {
  return new Promise((resolve) => {
    const start = Date.now();
    let settled = false;
    const interval = setInterval(async () => {
      if (settled) return;
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
      } catch (_) {
        clearInterval(interval);
        settled = true;
        resolve(false);
      }
    }, intervalMs);
  });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function closeActorStudioIfOpen() {
  const app = Object.values(ui.windows).find((w) => w?.id === 'foundryvtt-actor-studio-pc-sheet');
  if (app?.close && typeof app.setClosingFromGasHook === 'function') {
    app.setClosingFromGasHook(true);
    await app.close();
    await wait(WAIT_MEDIUM);
  }
  let attempts = 0;
  while (document.querySelector('#foundryvtt-actor-studio-pc-sheet') && attempts < 20) {
    await wait(WAIT_SHORT);
    attempts++;
  }
  const el = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
  if (el) { el.remove(); await wait(WAIT_SHORT); }
}

async function openActorStudio(name) {
  Hooks.call('gas.openActorStudio', name, '', 'character');
  await wait(WAIT_LONG);
  return Object.values(ui.windows).find((w) => w?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
}

async function visitRequiredCreationTabs() {
  const clickLabel = async (labels) => {
    for (const label of labels) {
      const target = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'))
        .find((b) => (b.textContent || '').trim().toLowerCase() === label.toLowerCase());
      if (target) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await wait(WAIT_MEDIUM);
        return true;
      }
    }
    return false;
  };
  await clickLabel(['Race', 'Origin', 'Species']);
  await wait(WAIT_MEDIUM);
  await clickLabel(['Class']);
  await wait(WAIT_MEDIUM);
  await clickLabel(['Background']);
  await wait(WAIT_MEDIUM);
  await clickLabel(['Abilities', 'Ability Scores']);
  await wait(WAIT_MEDIUM);
}

async function clickFooterButton(selector) {
  const target = document.querySelector(selector);
  if (!target || target.disabled) return false;
  target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  return true;
}

function getFinalizeButton() {
  return document.querySelector('#foundryvtt-actor-studio-pc-sheet .gas-finalize-spells-btn')
    || document.querySelector('.gas-finalize-spells-btn');
}

function clickFinalizeButton() {
  const btn = getFinalizeButton();
  if (!btn || btn.disabled) return false;
  if (typeof btn.click === 'function') btn.click();
  btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  return true;
}

async function openActorStudioLevelUp(actor) {
  if (!actor?.sheet) return false;
  await actor.sheet.render(true, { focus: true });
  await wait(WAIT_LONG);
  const selectors = [
    'button.level-up',
    '#gas-levelup-btn',
    'button[data-action="gasLevelUp"]',
    'button[aria-label="Level Up"]',
    'button[data-action="levelUp"]',
    'button[data-action="level-up"]'
  ];
  const button = selectors
    .map((sel) => document.querySelector(sel))
    .find((candidate) => candidate && !candidate.disabled);
  if (!button) return false;
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  await wait(WAIT_MEDIUM);
  return true;
}

async function focusLevelUpClassTab() {
  const tabs = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .tabs-list button'));
  const target = tabs.find((b) => {
    const t = (b.textContent || '').trim().toLowerCase();
    return t === 'level up' || t === 'class';
  });
  if (target) {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(WAIT_MEDIUM);
  }
  return waitForCondition(
    () => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet .class-row[role="button"]')),
    TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL, 'class row to appear'
  );
}

async function activateExistingClassRow() {
  return waitForCondition(() => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;
    const btn = root.querySelector('.footer-container .gas-add-level-btn');
    if (btn && !btn.disabled) return true;
    const classRows = Array.from(root.querySelectorAll('.class-row[role="button"]'));
    if (!classRows.length) return false;
    const target = classRows[0];
    const plus = target.querySelector('i.fa-plus, i.fas.fa-plus');
    if (plus) {
      const row = plus.closest('[role="button"]') || target;
      row.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      row.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
    return false;
  }, TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL);
}

async function selectFirstSubclassIfRequired() {
  return waitForCondition(() => {
    const root = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (!root) return false;
    const select = root.querySelector('#subClass-select');
    if (!select) return true;
    const labelText = String(select.querySelector('.selected-option .option-label')?.textContent || '').trim().toLowerCase();
    if (labelText && !labelText.includes('select')) return true;
    const trigger = select.querySelector('.selected-option');
    const dropdown = select.querySelector('.options-dropdown');
    if (!dropdown) {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return false;
    }
    const options = Array.from(dropdown.querySelectorAll('.option'))
      .filter((o) => {
        const t = String(o.textContent || '').trim().toLowerCase();
        return t.length > 0 && !t.includes('select');
      });
    if (!options.length) return false;
    options[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return false;
  }, TEST_TIMEOUTS.uiInteraction, POLL_INTERVAL);
}

// ── Unique actor name ────────────────────────────────────────────────────────
const TEST_ACTOR_NAME = `Tidy5e Test ${Date.now()}`;

export function registerTidy5eSheetTests(context) {
  const { describe, it, before, after } = context;
  const { assert } = context;

  let tidySheetId = null;
  let actorId = null;
  let originalDefaultSheetId = null;

  describe('Tidy5e Sheet Integration', function () {

    before(async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      // Guard: package.json has "debug": true → init.js sets window.GAS root
      // keys which bypass quenchAutomation selections. These must be off for tests.
      if (window.GAS?.debug || window.GAS?.characterClass) {
        const msg = 'package.json has "debug": true — set it to false and reload Foundry before running tidy5e tests.';
        console.error(`[QUENCH tidy5e] ${msg}`);
        ui.notifications?.error?.(msg, { permanent: true });
        assert.fail(msg);
      }

      tidySheetId = getTidySheetId();
      if (!tidySheetId) {
        const msg = 'tidy5e-sheet module is not active or its sheet class is not registered in CONFIG.Actor.sheetClasses.character. '
          + 'These tests require Tidy5e to be installed and enabled.';
        console.error(`[QUENCH tidy5e] ${msg}`);
        ui.notifications?.error?.(msg, { permanent: true });
        assert.fail(msg);
      }

      const DSC = foundry?.applications?.apps?.DocumentSheetConfig;
      originalDefaultSheetId = DSC?.getSheetClassesForSubType?.('Actor', 'character')?.defaultClass ?? null;

      window.GAS = window.GAS || {};

      await game.settings.set(MODULE_ID, 'enableLevelUp', true);
      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
    });

    after(async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      delete window.GAS.quenchAutomation;

      // Restore default sheet class
      if (originalDefaultSheetId) {
        try {
          const sheetSettings = game.settings.get('core', 'sheetClasses');
          const current = sheetSettings?.Actor?.character;
          if (current !== originalDefaultSheetId) {
            sheetSettings.Actor = sheetSettings.Actor || {};
            sheetSettings.Actor.character = originalDefaultSheetId;
            await game.settings.set('core', 'sheetClasses', sheetSettings);
          }
        } catch (_) {}
      }

      // Clean up actor
      if (actorId) {
        try {
          const actor = game.actors.get(actorId);
          if (actor) {
            try { await actor.sheet?.close(); } catch (_) {}
            try { if (!actor.deleted) await actor.delete(); } catch (_) {}
          }
        } catch (_) {}
        actorId = null;
      }

      await closeActorStudioIfOpen();
    });

    // ──────────────────────────────────────────────────────────────────────
    // TEST 1: Tidy5e character creation
    // ──────────────────────────────────────────────────────────────────────
    it('should create a character when default sheet is tidy5e and show only one tidy5e sheet after', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      // Set the per-user core.sheetClasses default to tidy5e for Actor.character.
      // On Foundry v12, DocumentSheetConfig.updateDefaultSheet does not exist,
      // so we manipulate the setting directly (same approach Tidy5e itself uses).
      const sheetClasses = game.settings.get('core', 'sheetClasses');
      sheetClasses.Actor = sheetClasses.Actor || {};
      sheetClasses.Actor.character = tidySheetId;
      await game.settings.set('core', 'sheetClasses', sheetClasses);

      await game.settings.set(MODULE_ID, 'allowManualInput', true);
      await game.settings.set(MODULE_ID, 'allowStandardArray', false);
      await game.settings.set(MODULE_ID, 'allowPointBuy', false);
      await game.settings.set(MODULE_ID, 'allowRolling', false);
      // Disable spells so creation has no spells step (Fighter 1 has no spells)
      await game.settings.set(MODULE_ID, 'enableSpellSelection', false);
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
      const app = await openActorStudio(TEST_ACTOR_NAME);
      assert.ok(app, 'Actor Studio should open for creation test');

      await visitRequiredCreationTabs();

      const createClicked = await waitForCondition(
        () => clickFooterButton('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-create-character-btn'),
        TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL
      );
      assert.ok(createClicked, 'Create Character button should be clickable');

      // Wait for Actor Studio to close (no spells step since Fighter 1 + disableSpellSelection)
      const closed = await waitForCondition(
        () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        TEST_TIMEOUTS.appLifecycleComplete, POLL_INTERVAL
      );
      assert.ok(closed, 'Actor Studio should close after creation completes');

      await wait(WAIT_MEDIUM);

      // Find the created actor
      const matches = game.actors.contents.filter((a) => a.name === TEST_ACTOR_NAME && a.type === 'character');
      assert.ok(matches.length > 0, 'Created actor should exist in world actors');
      const actor = matches[matches.length - 1];
      actorId = actor.id;

      // Allow sheet-restore / gas.close hooks to settle
      await wait(WAIT_MEDIUM);

      // Verify actor's sheetClass flag is tidy5e
      const coreFlag = String(actor.getFlag('core', 'sheetClass') || '');
      assert.equal(coreFlag, tidySheetId,
        `Actor core.sheetClass should be "${tidySheetId}" after creation, got "${coreFlag}"`
      );

      // Verify at most one open sheet for this actor
      const sheetCount = countOpenSheetsForActor(actor);
      assert.ok(sheetCount <= 1,
        `Should have at most one open sheet for the actor, found ${sheetCount}`
      );
      if (sheetCount === 1) {
        assert.ok(isTidySheetInstance(actor),
          'The single open sheet should be a Tidy5e instance'
        );
      }
    });

    // ──────────────────────────────────────────────────────────────────────
    // TEST 2: Tidy5e level-up
    // ──────────────────────────────────────────────────────────────────────
    it('should level up from tidy5e sheet and keep a single tidy5e sheet afterward', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      // Recover actor from test 1
      let actor = actorId ? game.actors.get(actorId) : null;
      if (!actor) {
        const matches = game.actors.contents.filter((a) => a.name === TEST_ACTOR_NAME && a.type === 'character');
        actor = matches.length ? matches[matches.length - 1] : null;
      }
      assert.ok(actor, 'Actor should exist for level-up test');

      // Ensure actor is on tidy5e
      await switchActorToTidy5e(actor, tidySheetId);
      await actor.unsetFlag(MODULE_ID, 'originalSheetClass').catch(() => {});
      await wait(WAIT_MEDIUM);

      const onTidy = await waitForCondition(
        () => String((game.actors.get(actor.id) || actor).getFlag('core', 'sheetClass') || '') === tidySheetId,
        TEST_TIMEOUTS.actorDataUpdate, POLL_INTERVAL,
        'actor to be on Tidy5e before level-up'
      );
      assert.ok(onTidy, 'Actor should be on Tidy5e sheet before level-up');

      // Close everything cleanly to start fresh
      await closeActorStudioIfOpen();
      try {
        if (originalDefaultSheetId) {
          await actor.setFlag('core', 'sheetClass', originalDefaultSheetId);
          await wait(WAIT_SHORT);
          try { await actor.sheet?.close(); } catch (_) {}
          await switchActorToTidy5e(actor, tidySheetId);
          await wait(WAIT_MEDIUM);
        } else {
          try { await actor.sheet?.close(); } catch (_) {}
        }
      } catch (_) {}
      await wait(WAIT_MEDIUM);

      // Re-verify actor is still on tidy5e
      actor = game.actors.get(actor.id) || actor;
      if (String(actor.getFlag('core', 'sheetClass') || '') !== tidySheetId) {
        await switchActorToTidy5e(actor, tidySheetId);
        await wait(WAIT_MEDIUM);
      }

      await game.settings.set(MODULE_ID, 'milestoneLeveling', true);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', true);
      await game.settings.set(MODULE_ID, 'enableEquipmentSelection', false);
      await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', false);
      await game.settings.set(MODULE_ID, 'enableSpellSelection', true);
      window.GAS.quenchAutomation = { enabled: true, allowLegacyRootValues: false, advancements: { enabled: true }, selections: {} };

      // Click level-up button
      const levelUpOpened = await openActorStudioLevelUp(actor);
      assert.ok(levelUpOpened, 'Level-up button should be clickable on Tidy5e sheet');

      const appOpened = await waitForCondition(
        () => Boolean(document.querySelector('#foundryvtt-actor-studio-pc-sheet')?.querySelector('.tabs-list')),
        TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL
      );
      assert.ok(appOpened, 'Level-up Actor Studio app should open');

      const tabFocused = await focusLevelUpClassTab();
      assert.ok(tabFocused, 'Level Up / Class tab should be focused');

      const rowActivated = await activateExistingClassRow();
      assert.ok(rowActivated, 'Existing class row should activate');

      const subclassHandled = await selectFirstSubclassIfRequired();
      assert.ok(subclassHandled, 'Subclass selection should be handled');

      await wait(WAIT_MEDIUM);

      const addLevelClicked = await waitForCondition(
        () => clickFooterButton('#foundryvtt-actor-studio-pc-sheet .footer-container .gas-add-level-btn'),
        TEST_TIMEOUTS.uiStateChange, POLL_INTERVAL
      );
      assert.ok(addLevelClicked, 'Add Level button should be clickable');

      await wait(WAIT_MEDIUM);

      // Handle spells step if it appears (Fighter 1→2 has no spells normally)
      const spellsDone = await waitForCondition(() => {
        const finalizeBtn = getFinalizeButton();
        if (finalizeBtn && !finalizeBtn.disabled) return clickFinalizeButton();
        const footerBtns = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button'));
        const actionable = footerBtns.find((b) => {
          const t = (b.textContent || '').toLowerCase();
          return !b.disabled && (t.includes('finalize') || t.includes('skip'));
        });
        if (actionable) {
          actionable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          return true;
        }
        return false;
      }, TEST_TIMEOUTS.spellWorkflow, POLL_INTERVAL);

      // Wait for app to close
      const appClosed = await waitForCondition(
        () => !document.querySelector('#foundryvtt-actor-studio-pc-sheet'),
        TEST_TIMEOUTS.appLifecycleComplete, POLL_INTERVAL
      );
      assert.ok(appClosed, 'Level-up app should close after progression');

      await wait(WAIT_MEDIUM);

      // Verify class level progressed
      const refreshedActor = game.actors.get(actor.id);
      assert.ok(refreshedActor, 'Actor should still exist after level-up');
      const classItem = refreshedActor.items.find((item) => item.type === 'class');
      assert.ok(classItem, 'Actor should have a class item');
      assert.ok(Number(classItem.system?.levels || 0) >= 2,
        `Actor class level should be at least 2 after level-up, got ${Number(classItem.system?.levels || 0)}`
      );

      // Allow sheet-restore hooks to settle
      await wait(WAIT_MEDIUM);

      // ── KEY ASSERTIONS ──

      // 1) At most one open sheet for the actor
      const sheetCount = countOpenSheetsForActor(refreshedActor);
      assert.ok(sheetCount <= 1,
        `Should have at most one open sheet after level-up, found ${sheetCount}`
      );

      // 2) Actor's core.sheetClass flag is tidy5e
      const coreFlag = String(refreshedActor.getFlag('core', 'sheetClass') || '');
      assert.equal(coreFlag, tidySheetId,
        `Actor core.sheetClass should be "${tidySheetId}" after level-up, got "${coreFlag}"`
      );

      // 3) If there's an open sheet, it should be a Tidy5e instance
      if (sheetCount >= 1) {
        assert.ok(isTidySheetInstance(refreshedActor),
          'The open sheet after level-up should be a Tidy5e instance'
        );
      }
    });
  });
}