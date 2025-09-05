
<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy, tick } from "svelte";
  import { derived } from 'svelte/store';
  import { activeTab, npcTabs, resetStores, selectedNpcBase, } from "~/src/stores/index";
  import { npcSelectProgress } from "~/src/stores/npc";
  import { MODULE_ID } from "~/src/helpers/constants";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";

  export let elementRoot;       // the root element of the application
  export let documentStore;     // svelte store for the document
  export let document;          // document object itelf, which is the same as $documentStore
  export let app;
  export let npcWorkflowFSM;    // NPC workflow state machine

  setContext("#doc", documentStore);
  setContext("#npcWorkflowFSM", npcWorkflowFSM);

  const application = getContext('#external').application; // the application object

  //- register hooks
  console.log('[NPCAPP] Registering gas.close hook');
  Hooks.on("gas.close", gasClose);

  const setActorItems = async  () => {
    app.updateSource($documentStore, {items: [{name: 'test', type: 'feat'}]});
  }
  
  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
  };

  // Show all tabs once progress has reached 100%, and keep them visible
  let hasReached100Percent = false;
  $: if ($npcSelectProgress === 100) hasReached100Percent = true;
  $: filteredTabs = hasReached100Percent ? $npcTabs : [$npcTabs[0]];
  
  // Let the workflow handle navigation - no automatic redirects

  onMount(() => {
    console.log('NPCAcppShell documentStore', $documentStore);
    console.log('NPCAcppShell document', document);
    console.log('NPCAcppShell application', application);
    console.log('NPCAcppShell app', app);
    console.log('NPCAcppShell $activeTab', $activeTab);
    console.log('NPCAcppShell npcWorkflowFSM', npcWorkflowFSM);
  });

  onDestroy(() => {
    console.log('[NPCAPP] onDestroy called - cleaning up');
    console.log('[NPCAPP] Unregistering gas.close hook');
    Hooks.off("gas.close", gasClose);
    console.log('[NPCAPP] onDestroy complete');
  });

  function gasClose() {
    console.log('[NPCAPP] ====== gasClose CALLED ======');
    window.GAS.log.d('gas.close');
    
    // Reset stores
    console.log('[NPCAPP] Resetting stores and NPC workflow state machine');
    resetStores();
    
    // Reset NPC workflow state machine to idle
    try {
      if (npcWorkflowFSM) {
        const currentState = npcWorkflowFSM.getCurrentState();
        console.log('[NPCAPP] Current NPC workflow state before reset:', currentState);
        npcWorkflowFSM.handle('reset');
        console.log('[NPCAPP] NPC workflow state after reset:', npcWorkflowFSM.getCurrentState());
      }
    } catch (error) {
      console.warn('[NPCAPP] Error during NPC workflow reset:', error);
    }
    
    // Set flag to indicate we're closing from the gas hook
    if (application && typeof application.setClosingFromGasHook === 'function') {
      application.setClosingFromGasHook(true);
      console.log('[NPCAPP] setClosingFromGasHook called on application instance');
      
      // Close the application
      application.close();
    } else {
      console.warn('[NPCAPP] application.setClosingFromGasHook is not a function or application is undefined:', application);
      // Fallback: try to close directly if possible
      if (application && typeof application.close === 'function') {
        application.close();
      }
    }
    
    console.log('[NPCAPP] ====== gasClose COMPLETE ======');
  }

</script>

<svelte:options accessors={true}/>


<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    main
      section.a
        Tabs.gas-tabs( tabs="{filteredTabs}" bind:activeTab="{$activeTab}" sheet="NPC")
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