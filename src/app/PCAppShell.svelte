<script>
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { setContext, getContext, onMount, onDestroy } from "svelte";
  import { characterClass, characterSubClass, resetStores, tabs, isLevelUp, levelUpTabs, activeTab, actorInGame } from "~/src/helpers/store"
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";
  import dnd5e from "~/config/systems/dnd5e.json"
  import Spells from "~/src/components/organisms/dnd5e/Tabs/Spells.svelte";
  import { log } from '~/src/helpers/Utility';

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let levelUp = false;


  setContext("#doc", documentStore);

  const application = getContext('#external').application;
  
  // set initial active tab
  $activeTab = levelUp ? $levelUpTabs[0].id : $tabs[0].id

  $: filteredTabs = levelUp ? $levelUpTabs : $tabs

  // $: if($characterClass?.system?.spellcasting?.progression && $characterClass?.system?.spellcasting?.progression !== "none") {
    // @todo: [NB: this has been disabled for MVP as the bounty wasn't reached to fund this work.
    // ensure that tabs includes spells
    // if(!$tabs.find(x => x.id === "spells")) {
    //   $tabs = [...$tabs, { label: "Spells", id: "spells", component: "Spells" }]
    // }
  // } else {
    // remove spells tab
    // $tabs = $tabs.filter(x => x.id !== "spells")
  // }

  const stylesApp = {
      '--tjs-app-overflow': 'visible'
  };

  onMount( async () => {
    if(levelUp) {
      $actorInGame = $documentStore
      log.d($actorInGame);
    }
    isLevelUp.set(levelUp);
  });

  onDestroy(() => {
    resetStores();
  });

  Hooks.on("gas.close", (item) => {
    log.d('gas.close')
    log.d($actorInGame);
    log.d($actorInGame.sheet);
    $actorInGame.sheet.render(true);
    resetStores();
    application.close();
  });
    
</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true}/>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->

<template lang="pug">
  ApplicationShell(bind:elementRoot stylesApp)
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