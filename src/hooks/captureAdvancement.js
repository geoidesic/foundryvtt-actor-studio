import { get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import {  dropItemRegistry, preAdvancementSelections, race, background, characterClass, characterSubClass } from '~/src/stores/index.js';

const isAppElementAppended = (appId) => {
  const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
  return panelElement.find(`[data-appid="${appId}"]`).length > 0;
};

// Helper to get advancement element based on version
const getAdvancementElement = (currentProcess) => {
  const version = window.GAS.dnd5eVersion;
  const rawElement = currentProcess.app?.element;
  
  if (version >= 4) {
    // v4 passes raw DOM element
    return $(rawElement);
  }
  // v3 already provides jQuery element
  return rawElement;
};

export const captureAdvancement = (initial = false) => {
  window.GAS.log.d('[gas.captureAdvancement] initial', initial)
  const skipDomMove = game.settings.get(MODULE_ID, 'disableAdvancementCapture');
  if (skipDomMove) {
    window.GAS.log.d('[gas.captureAdvancement] Dev setting: Skipping advancement DOM movement');
    return;
  }


  const currentProcess = get(dropItemRegistry.currentProcess);
  window.GAS.log.d('[gas.captureAdvancement] currentProcess in gas.captureAdvancement:', {
    id: currentProcess?.id,
    app: currentProcess?.app,
    element: currentProcess?.app?.element
  });

  // Cache initial state if this is the first capture
  if (initial) {
    preAdvancementSelections.set({
      race: get(race),
      background: get(background),
      class: get(characterClass),
      subclass: get(characterSubClass)
    });
    window.GAS.log.d('[gas.captureAdvancement] Caching initial advancement state', get(preAdvancementSelections));
  }

  if (currentProcess) {
    const panelElement = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .content');
    if (!isAppElementAppended(currentProcess.id)) {
      window.GAS.log.d(currentProcess);
      const element = getAdvancementElement(currentProcess);
      if(element) {
        element.removeClass(); // Remove all classes from the root element itself
        element.addClass('gas-advancements')
        element.attr('gas-appid', currentProcess.id);
        element.appendTo(panelElement);
      }
    }
  }
}

export default {
  captureAdvancement
};