<script>
  import { ApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy } from "svelte";
  import { characterClass, characterSubClass, resetStores, tabs, isLevelUp, levelUpTabs, activeTab, actorInGame, readOnlyTabs } from "~/src/stores/index"
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";
  import dnd5e from "~/config/systems/dnd5e.json"
  import Spells from "~/src/components/organisms/dnd5e/Tabs/Spells.svelte";
  import Equipment from "~/src/components/organisms/dnd5e/Tabs/Equipment.svelte";
  import { log } from '~/src/helpers/Utility';
  import { MODULE_ID } from "~/src/helpers/constants";

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let levelUp = false;

  //- register hooks
  Hooks.once("gas.close", gasClose);
  Hooks.once("gas.equipmentSelection", handleEquipmentSelection);
  

  setContext("#doc", documentStore);

  const application = getContext('#external').application;
  
  // set initial active tab
  $activeTab = levelUp ? $levelUpTabs[0].id : $tabs[0].id

  $: filteredTabs = levelUp ? $levelUpTabs : $tabs

  // Get illumination settings
  const illuminatedHeight = Number(game.settings.get(MODULE_ID, 'illuminatedHeight').replace(/[a-zA-Z]/g, '')) + 'px';
  const illuminatedWidth = Number(game.settings.get(MODULE_ID, 'illuminatedWidth').replace(/[a-zA-Z]/g, '')) + 'px';

  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
    '--illuminated-initial-height': illuminatedHeight,
    '--illuminated-initial-width': illuminatedWidth
  };

  onMount( async () => {
    if(levelUp) {
      $actorInGame = $documentStore
      // Initialize characterClass from the actor's class data if in level-up mode
      if ($actorInGame) {
        // Find the first class item in the actor's items
        const classItem = $actorInGame.items.find(item => item.type === "class");
        if (classItem) {
          // Set the characterClass store with the class item
          characterClass.set(classItem);
          window.GAS.log.d('[PCAppShell] Initialized characterClass for level-up:', classItem);
        } else {
          window.GAS.log.d('[PCAppShell] No class found on actor for level-up');
        }
      }
    }
    isLevelUp.set(levelUp);

    window.GAS.log.d(stylesApp)

    // window.GAS.log.d($isLevelUp)
  });

  onDestroy(() => {
    resetStores();
    Hooks.off("gas.close", gasClose);
    Hooks.off("gas.equipmentSelection", handleEquipmentSelection);
  });

  function gasClose() {
    window.GAS.log.d('gas.close')
    window.GAS.log.d($actorInGame);
    window.GAS.log.d($actorInGame.sheet);
    window.GAS.log.d($isLevelUp)
    if(!$isLevelUp) {
      $actorInGame.sheet.render(true);
    }
    resetStores();
    application.close();
  }

  /**
   * NB: this is called after advancements because some equipment selection
   * is dependent on the proficiencies selected
   * @todo: logic for those proficiency dependencies are not yet implemented
   */
  function handleEquipmentSelection() {
    window.GAS.log.d('[PCAPP] handleEquipmentSelection')
    // Add Equipment tab
    if(!$tabs.find(x => x.id === "equipment")) {
      window.GAS.log.d('[PCAPP] adding equipment tab')
      tabs.update(t => [...t, { label: "Equipment", id: "equipment", component: "Equipment" }]);
    }

    // Remove Advancements tab as it will be empty
    tabs.update(t => t.filter(x => x.id !== "advancements"));

    // Set active tab to equipment
    activeTab.set("equipment");

    // Set read-only state for other tabs
    readOnlyTabs.set(["race", "background", "abilities", "class"]);
  }


</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true}/>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->

<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    main
      section.a
        Tabs.gas-tabs( tabs="{filteredTabs}" bind:activeTab="{$activeTab}" sheet="PC")

      section.b
        Footer

</template>



<style lang="sass">
  main 
    text-align: center
    display: flex
    flex-direction: column
    height: 100%

  section 
    padding: 0.5rem 0.2rem

  .a
    flex: 1
    overflow-y: scroll
    min-width: 200px

  .b 
    height: 65px


  .flex-grow
    flex: 1 // Make this section grow to fill available space
    overflow-y: scroll
    height: 90%

  .section-bottom
    // Add any additional styling for the bottom section

  
</style>