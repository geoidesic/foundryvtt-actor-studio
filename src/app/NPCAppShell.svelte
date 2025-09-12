
<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy, tick } from "svelte";
  import { derived } from 'svelte/store';
  import { activeTab, npcTabs, resetStores, selectedNpcBase, actorInGame } from "~/src/stores/index";
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

  // Show tabs 2-5 (indices 0..4 in npcTabs) once select progress has reached 100%.
  // Keep the Stats tab (npc-create) locked until the actor exists in-game (actorInGame store).
  let filteredTabs = [$npcTabs ? $npcTabs[0] : undefined].filter(Boolean);

  let hasReached100Percent = false;
  $: if ($npcSelectProgress === 100) hasReached100Percent = true;

  // Compute filteredTabs reactively without mutating the canonical `npcTabs` store.
  // Hide the 'npc-features' tab reactively when the app has advanced to the Stats tab
  // (npc-create) so UI and reactive flows stay compatible.
  $: {
  try {
    const shouldHideFeatures = $activeTab === 'npc-create' || !!$actorInGame;
    const baseTabs = Array.isArray($npcTabs) ? $npcTabs : [];
    const visibleNpcTabs = baseTabs.filter(t => t && (!shouldHideFeatures || t.id !== 'npc-features'));

    if (!hasReached100Percent) {
      // Prefer the explicit npc-select tab if available
      filteredTabs = [visibleNpcTabs.find(t => t && t.id === 'npc-select') || visibleNpcTabs[0]].filter(Boolean);
    } else {
      // show first five visible tabs (npc-select, features?, equipment, treasure, biography)
      const firstFive = visibleNpcTabs.slice(0, 5);
      // append Stats tab only when actorInGame exists
      if ($actorInGame) {
        // Only append the npc-create tab if it's not already present in the firstFive slice
        const statsTab = visibleNpcTabs.find(t => t && t.id === 'npc-create');
        const alreadyHasStats = firstFive.some(t => t && t.id === 'npc-create');
        filteredTabs = alreadyHasStats ? firstFive : [...firstFive, statsTab].filter(Boolean);
      } else {
        filteredTabs = firstFive;
      }
    }

    // Diagnostics for runtime issues: log the key lists so you can paste them if the UI goes blank.
    // Keep logs terse but informative.
    console.log('[NPCAPP] visibleNpcTabs ids:', visibleNpcTabs.map(t => t && t.id));
    console.log('[NPCAPP] filteredTabs ids:', filteredTabs.map(t => t && t.id));
  } catch (e) {
    console.error('[NPCAPP] Error computing filteredTabs:', e);
    // Fallback to a safe minimal tab to avoid blank UI
    filteredTabs = [{ id: 'npc-select', label: 'NpcSelect' }];
  }
  }
  
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