<script>
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { setContext, getContext, onMount } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import dnd5e from "~/config/systems/dnd5e.json"
  import Abilities from "~/src/components/organisms/dnd5e/Abilities.svelte";
  import Background from "~/src/components/organisms/dnd5e/Background.svelte";
  import Class from "~/src/components/organisms/dnd5e/Class.svelte";
  import Race from "~/src/components/organisms/dnd5e/Race.svelte";
  import Spells from "~/src/components/organisms/dnd5e/Spells.svelte";


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
      //- header {localize("GAS.PCTitle")}
      section 
        Tabs( {tabs} bind:activeTab="{activeTab}" sheet="PC")
</template>


<style lang="scss">
   main {
      text-align: center;
      display: flex;
      flex-direction: column;
   }
</style>