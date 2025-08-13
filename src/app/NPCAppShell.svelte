
<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy } from "svelte";
  import { activeTab, npcTabs } from "~/src/stores/index";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";

  export let elementRoot;
  export let documentStore;
  export let document;

  const application = getContext('#external').application;
  
  function gasClose() {
    if (application && typeof application.setClosingFromGasHook === 'function') {
      application.setClosingFromGasHook(true);
    }
    if (application && typeof application.close === 'function') {
      application.close();
    }
  }

  Hooks.once("gas.close", gasClose);


  setContext("#doc", documentStore);

  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
  };


  $: filteredTabs = $npcTabs;
  $activeTab = $npcTabs[0].id


</script>

<svelte:options accessors={true}/>


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
</style>