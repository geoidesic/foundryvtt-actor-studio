
<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy, tick } from "svelte";
  import { derived } from 'svelte/store';
  import { activeTab, npcTabs, resetStores, selectedNpcBase, } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";

  export let elementRoot;       // the root element of the application
  export let documentStore;     // svelte store for the document
  export let document;          // document object itelf, which is the same as $documentStore
  export let app;

  setContext("#doc", documentStore);


  const application = getContext('#external').application; // the application object

  const setActorItems = async  () => {
    app.updateSource($documentStore, {items: [{name: 'test', type: 'feat'}]});
  
  }
  
  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
  };

  $: filteredTabs = $npcTabs;
  $activeTab = $npcTabs[0].id

  onMount(() => {
    console.log('NPCAcppShell documentStore', $documentStore);
    console.log('NPCAcppShell document', document);
    console.log('NPCAcppShell application', application);
    console.log('NPCAcppShell app', app);
    console.log('NPCAcppShell $activeTab', $activeTab);
  });

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