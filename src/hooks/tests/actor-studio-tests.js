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
}