import PCApplication from '~/src/app/PCApplication.js';

export function registerActorStudioTests(context) {
  const { describe, it, assert, after } = context;

  const MODULE_ID = 'foundryvtt-actor-studio';

  const wait = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

  const activateActorsSidebar = async () => {
    if (ui.sidebar?.activateTab) {
      await ui.sidebar.activateTab('actors');
    }

    if (ui.actors?.render) {
      await ui.actors.render(true);
    }

    await wait(150);
  };

  const removeSidebarButtonIfPresent = () => {
    const existingButton = document.querySelector('#gas-sidebar-button');
    if (existingButton) existingButton.remove();
  };

  const setSidebarSetting = async (value) => {
    await game.settings.set(MODULE_ID, 'showButtonInSideBar', value);
    await wait(50);
  };

  const setWindowSettings = async (windowX, windowY) => {
    await game.settings.set(MODULE_ID, 'windowX', windowX);
    await game.settings.set(MODULE_ID, 'windowY', windowY);
    await wait(50);
  };

  const closeActorStudioIfOpen = async () => {
    const app = Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet');
    if (app?.close) {
      app.setClosingFromGasHook(true);
      await app.close();
      await wait(200);
    }
    
    // Wait for DOM element to be fully removed
    let attempts = 0;
    while (document.querySelector('#foundryvtt-actor-studio-pc-sheet') && attempts < 20) {
      await wait(100);
      attempts++;
    }
    
    // Force remove if still present
    const element = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    if (element) {
      element.remove();
      await wait(100);
    }
  };

  const openActorStudio = async (name = 'Quench Window Test') => {
    Hooks.call('gas.openActorStudio', name, '', 'character');
    await wait(300);
    return Object.values(ui.windows).find((windowApp) => windowApp?.id === 'foundryvtt-actor-studio-pc-sheet') || null;
  };

  describe("Basic Test Suite", function () {
    it("should pass a basic test", function () {
      assert.ok(true, "This is a basic test");
    });
  });

  describe("Sidebar Button", function () {
    beforeEach(async function () {
      removeSidebarButtonIfPresent();
      await activateActorsSidebar();
    });

    after(async function () {
      await setSidebarSetting(true);
      await activateActorsSidebar();
    });

    it("should add button when setting is enabled", async function () {
      await setSidebarSetting(true);
      removeSidebarButtonIfPresent();
      await activateActorsSidebar();

      const button = document.querySelector('#gas-sidebar-button');
      assert.ok(button, "Button should be present when setting is enabled");
    });

    it("should not add button when setting is disabled", async function () {
      await setSidebarSetting(false);
      removeSidebarButtonIfPresent();
      await activateActorsSidebar();

      const button = document.querySelector('#gas-sidebar-button');
      assert.notOk(button, "Button should not be present when setting is disabled");
    });
  });

  describe("Window Size Settings", function () {
    beforeEach(async function () {
      await closeActorStudioIfOpen();
    });

    after(async function () {
      await setWindowSettings(720, 800);
      await closeActorStudioIfOpen();
    });

    it("should map windowX and windowY settings to default app size", async function () {
      await setWindowSettings(777, 666);

      const options = PCApplication.defaultOptions;
      assert.equal(options.width, 777, "windowX should control default width");
      assert.equal(options.height, 666, "windowY should control default height");
    });

    it("should render Actor Studio with the configured windowX/windowY dimensions", async function () {
      await setWindowSettings(730, 610);
      await closeActorStudioIfOpen();

      const app = await openActorStudio();
      assert.ok(app, "Actor Studio window should open");

      const renderedPosition = app?.position ?? null;
      assert.equal(Number(renderedPosition?.width), 730, "Rendered window width should match windowX");
      assert.equal(Number(renderedPosition?.height), 610, "Rendered window height should match windowY");
    });

    it("should apply new windowX/windowY values after changing settings and reopening", async function () {
      await setWindowSettings(700, 800);
      await closeActorStudioIfOpen();

      let app = await openActorStudio('Quench Window Test A');
      assert.ok(app, "Actor Studio should open for initial size check");
      assert.equal(Number(app.position?.width), 700, "Initial width should be 700");
      assert.equal(Number(app.position?.height), 800, "Initial height should be 800");

      await closeActorStudioIfOpen();
      await setWindowSettings(860, 640);

      app = await openActorStudio('Quench Window Test B');
      assert.ok(app, "Actor Studio should reopen for updated size check");
      assert.equal(Number(app.position?.width), 860, "Updated width should be 860 after settings change");
      assert.equal(Number(app.position?.height), 640, "Updated height should be 640 after settings change");
    });

    it("should reflect runtime resize operations while the app is open", async function () {
      await setWindowSettings(720, 800);
      await closeActorStudioIfOpen();

      const app = await openActorStudio('Quench Runtime Resize Test');
      assert.ok(app, "Actor Studio should open for runtime resize test");

      app.setPosition({ width: 900, height: 650 });
      await wait(100);

      assert.equal(Number(app.position?.width), 900, "Runtime resize should update width to 900");
      assert.equal(Number(app.position?.height), 650, "Runtime resize should update height to 650");
    });
  });

}