<script>
  import { ApplicationShell }   from '#runtime/svelte/component/core';
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
  const illuminatedHeight = game.settings.get(MODULE_ID, 'illuminatedHeight');
  const illuminatedWidth = game.settings.get(MODULE_ID, 'illuminatedWidth');

  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
    '--illuminated-initial-height': illuminatedHeight,
    '--illuminated-initial-width': illuminatedWidth
  };

  onMount( async () => {
    if(levelUp) {
      $actorInGame = $documentStore
      // window.GAS.log.d($actorInGame);
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

  :global(.tabs-list) 
    padding: 0.25rem 1.5rem !important

  :global(.gas-tabs)
    position: relative 
    padding-top: 1rem

  :global(.gas-tabs .tabs-list) 
    background: #dbd9cd !important
    position: fixed
    top: 30px
    left: 0
    width: 100%
    z-index: 1
    height: 2.5rem !important
    padding-top: 1rem !important

  :global(.gas-tabs .tabs-list::after)
    content: ""
    display: block
    position: fixed
    top: 71px
    left: auto
    width: 95%
    height: 17px
    background: black
    background: linear-gradient(0deg, rgba(219, 217, 205, 0) 0%, #f9f9f9 100%)
    z-index: 1 

  :global(.gas-tabs .tabs-list button:hover)
    box-shadow: 0px -5px 14px -8px var(--color-shadow-primary) !important

  :global(.tab-content)
    --tjs-app-overflow: visible
    padding: 15px 0px 15px 15px
    border: 2px solid transparent
    border-radius: 10px 
    background-color: #f9f9f9
    position: relative 
    margin-top: 5px

    position: relative
    padding: 0

  :global(.tab-content .scroll)
    box-sizing: content-box
    padding: 15px

  :global(.tab-content .col-a)
    padding: 1rem

  :global(.tab-content ul.icon-list .image)
    min-width: 24px

  :global(.tab-content ul.icon-list)
    list-style-type: none !important
    padding: 0
    position: relative
    margin: 0

  :global(.tab-content ul.icon-list li)
    margin: 3px 0
    box-shadow: 0 0 0 1px var(--li-inset-color) inset
    padding: 0.5rem 0.3rem
    border-radius: var(--border-radius)
    background: var(--li-background-color)

  :global(.tab-content ul.icon-list .image img.icon)
    position: absolute
    top: -3px
    left: 0
    width: 24px
    height: 24px
    vertical-align: middle
    border: 0

  :global(.tab-content ul.icon-list li.tight .flexcol)
    gap: 0
    line-height: 11px
    height: 19px
    margin: 4px 0 5px 0

  :global(.tab-content ul.icon-list li.tight .image img.icon)
    top: 2px
    left: 2px
  
</style>