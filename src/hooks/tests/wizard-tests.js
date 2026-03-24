import { getTestTimeouts } from '~/src/helpers/testTimeouts';

export function registerWizardTests(context) {
  const { describe, it, assert, beforeEach, afterEach } = context;

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

  const openActorStudio = async (name = `Quench Wizard Test ${Date.now()}`) => {
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

  const getWizardRoot = () => document.querySelector('#foundryvtt-actor-studio-pc-sheet');

  const getTabButtons = () => {
    const root = getWizardRoot();
    if (!root) return [];
    return Array.from(root.querySelectorAll('.tabs-list button'));
  };

  const getTabLabels = () => {
    return getTabButtons()
      .map((button) => (button.textContent || '').trim())
      .filter(Boolean);
  };

  const clickTabByLabel = async (label) => {
    const tabs = getTabButtons();
    const target = tabs.find((button) => ((button.textContent || '').trim().toLowerCase() === String(label).toLowerCase()));
    if (!target) return false;

    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    return waitForCondition(() => {
      const active = getTabButtons().find((button) => button.classList.contains('active'));
      return ((active?.textContent || '').trim().toLowerCase() === String(label).toLowerCase());
    }, 5000, 100);
  };

  describe('Wizard UI', function () {
    beforeEach(async function () {
      this.timeout(TEST_TIMEOUTS.perTest);
      await closeActorStudioIfOpen();
    });

    afterEach(async function () {
      this.timeout(TEST_TIMEOUTS.perTest);
      await closeActorStudioIfOpen();
    });

    it('should open wizard with tab navigation visible', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const app = await openActorStudio();
      assert.ok(app, 'Actor Studio wizard should open');

      const tabsLoaded = await waitForCondition(() => getTabButtons().length >= 4, 8000, 100);
      assert.ok(tabsLoaded, 'Wizard should render tab navigation');

      const labels = getTabLabels().map((label) => label.toLowerCase());
      assert.ok(labels.some((label) => ['race', 'origin', 'species'].includes(label)), 'Wizard should expose a race/origin/species tab');
      assert.ok(labels.includes('class'), 'Wizard should expose a class tab');
      assert.ok(labels.includes('background'), 'Wizard should expose a background tab');
      assert.ok(labels.some((label) => ['abilities', 'ability scores'].includes(label)), 'Wizard should expose an abilities tab');
    });

    it('should allow switching across core wizard tabs', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const app = await openActorStudio('Quench Wizard Navigation Test');
      assert.ok(app, 'Actor Studio wizard should open for tab navigation test');

      const tabsLoaded = await waitForCondition(() => getTabButtons().length >= 4, 8000, 100);
      assert.ok(tabsLoaded, 'Wizard tabs should be available before navigation');

      const raceLabel = getTabLabels().find((label) => ['race', 'origin', 'species'].includes(label.toLowerCase()));
      assert.ok(Boolean(raceLabel), 'A race/origin/species tab should exist');

      const raceClicked = await clickTabByLabel(raceLabel);
      assert.ok(raceClicked, 'Race/origin/species tab should become active');

      const classClicked = await clickTabByLabel('Class');
      assert.ok(classClicked, 'Class tab should become active');

      const backgroundClicked = await clickTabByLabel('Background');
      assert.ok(backgroundClicked, 'Background tab should become active');

      const abilitiesLabel = getTabLabels().find((label) => ['abilities', 'ability scores'].includes(label.toLowerCase()));
      assert.ok(Boolean(abilitiesLabel), 'An abilities tab should exist');
      const abilitiesClicked = await clickTabByLabel(abilitiesLabel);
      assert.ok(abilitiesClicked, 'Abilities tab should become active');
    });

    it('should render wizard footer controls', async function () {
      this.timeout(TEST_TIMEOUTS.perTest);

      const app = await openActorStudio('Quench Wizard Footer Test');
      assert.ok(app, 'Actor Studio wizard should open for footer test');

      const footerLoaded = await waitForCondition(() => {
        const root = getWizardRoot();
        if (!root) return false;
        return Boolean(root.querySelector('.footer-container .button-container'));
      }, 8000, 100);
      assert.ok(footerLoaded, 'Wizard footer button container should render');

      const footerButtons = Array.from(document.querySelectorAll('#foundryvtt-actor-studio-pc-sheet .footer-container .button-container button'));
      assert.ok(footerButtons.length > 0, 'Wizard footer should expose at least one action button');
    });
  });
}
