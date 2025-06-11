import { get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { tabs, activeTab, dropItemRegistry, isLevelUp, levelUpTabs } from '~/src/stores/index.js';

// Helper to check if we're on first step based on version
const isFirstAdvancementStep = (app) => {
  const version = window.GAS.dnd5eVersion;
  if (version >= 4) {
    return app.steps?.[0] === app.step;
  }
  return app._stepIndex === 0;
};


export const renderAdvancementManager = async (app, html, data) => {

  // Check if the Actor Studio application is currently open by looking for its specific DOM element
  const currentProcess = get(dropItemRegistry.currentProcess)
  
  if (currentProcess.id && isFirstAdvancementStep(app)) {
    const appElement = $('#foundryvtt-actor-studio-pc-sheet');
    if (appElement.length) {
      const disableAdvancementCapture = game.settings.get(MODULE_ID, 'disableAdvancementCapture') || false;
      if(disableAdvancementCapture) {
        return;
      }
      dropItemRegistry.updateCurrentProcess({ app, html, data })
      const advancementsTab = get(isLevelUp) ? get(levelUpTabs).find(x => x.id === "advancements") : get(tabs).find(x => x.id === "advancements");
      // console.log('advancementsTab', advancementsTab)
      if (advancementsTab) {
        Hooks.call("gas.captureAdvancement");
      } else {
        window.GAS.log.i('Advancements tab not found, adding it to the tabs')
        // @why,- add the advancements tab to the store, which will trigger it's component to render, which will in turn call gas.captureAdvancement
        if(get(isLevelUp)) {
          await levelUpTabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        } else {
          await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        }
        activeTab.set('advancements');
      }
    }
  }
}


  export default {
    renderAdvancementManager
  }