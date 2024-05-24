<script>
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { setContext, getContext, onMount } from "svelte";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import dnd5e from "~/config/systems/dnd5e.json"
  import Abilities from "~/src/components/organisms/dnd5e/Tabs/Abilities.svelte";
  import Background from "~/src/components/organisms/dnd5e/Tabs/Background.svelte";
  import Class from "~/src/components/organisms/dnd5e/Tabs/Class.svelte";
  import Race from "~/src/components/organisms/dnd5e/Tabs/Race.svelte";
  import Spells from "~/src/components/organisms/dnd5e/Tabs/Spells.svelte";


  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
   
  
  setContext("#doc", documentStore);
  let activeTab = dnd5e.tabs[0].id

  const defaultTabs = [
    { label: "Abilities", id: "abilities", component: Abilities },
    { label: "Race", id: "race", component: Race },
    { label: "Background", id: "backgrond", component: Background },
    { label: "Class", id: "class", component: Class },
    { label: "Spells", id: "spells", component: Spells },
  ];

  const stylesApp = {
      '--tjs-app-overflow': 'visible'
  };

  onMount( async () => {
    // let actor = await Actor.create({
    //   name: "New Test Actor",
    //   type: "character",
    //   img: "artwork/character-profile.jpg"
    // });
    // console.log(actor);

    // create actor in memory, instead of in game:
    // new Actor.implementation({name:"temp", type: "npc"})
    log.d('elementRoot', elementRoot);
    log.d('documentStore', documentStore);
    log.d('document', document);
    // console.info(`${LOG_PREFIX}elementRoot`, elementRoot);
    // console.info(`${LOG_PREFIX}documentStore`, documentStore);
    // console.info(`${LOG_PREFIX}document`, document);

  });

  $: tabs = defaultTabs;
    
</script>

<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true}/>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->

<template lang="pug">
  ApplicationShell(bind:elementRoot stylesApp)
    main
      section 
        Tabs.gas-tabs( {tabs} bind:activeTab="{activeTab}" sheet="PC")
</template>


<style lang="sass">
  main 
    text-align: center
    display: flex
    flex-direction: column
    height: 100%

  section 
    padding: 0.5rem 0.2rem
  
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
    overflow-y: auto
    height: 580px
    box-sizing: content-box
    padding-right: 15px

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