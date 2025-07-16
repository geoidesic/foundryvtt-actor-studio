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
  import { getWorkflowFSM, workflowFSMContext, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let levelUp = false;

  //- register hooks
  console.log('[PCAPP] Registering gas.close hook (once)');
  Hooks.once("gas.close", gasClose);
  console.log('[PCAPP] Registering gas.equipmentSelection hook (persistent)');
  Hooks.on("gas.equipmentSelection", handleEquipmentSelection);
  

  setContext("#doc", documentStore);

  const application = getContext('#external').application;
  
  // set initial active tab
  $activeTab = levelUp ? $levelUpTabs[0].id : $tabs[0].id

  $: {
    console.log('[PCAPP] Reactive filteredTabs changed:', filteredTabs);
    console.log('[PCAPP] Current activeTab:', $activeTab);
    console.log('[PCAPP] Tab with id "equipment" exists:', filteredTabs.find(t => t.id === 'equipment'));
  }

  $: filteredTabs = levelUp ? $levelUpTabs : $tabs

  // Get illumination settings
  const illuminatedHeight = Number(game.settings.get(MODULE_ID, 'illuminatedHeight').replace(/[a-zA-Z]/g, '')) + 'px';
  const illuminatedWidth = Number(game.settings.get(MODULE_ID, 'illuminatedWidth').replace(/[a-zA-Z]/g, '')) + 'px';

  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
    '--illuminated-initial-height': illuminatedHeight,
    '--illuminated-initial-width': illuminatedWidth
  };

  onMount(async () => {
    getWorkflowFSM()
    if(levelUp) {
      $actorInGame = $documentStore
      // Initialize characterClass from the actor's class data if in level-up mode
      if ($actorInGame) {
        // Find the first class item in the actor's items
        const classItem = $actorInGame.items.find(item => item.type === "class");
        if (classItem) {
          // Set the characterClass store with the class item
          characterClass.set(classItem);
        }
      }
    }
    isLevelUp.set(levelUp);

    window.GAS.log.d(stylesApp)

    // window.GAS.log.d($isLevelUp)
  });

  onDestroy(() => {
    console.log('[PCAPP] onDestroy called - cleaning up');
    // Don't reset stores here - let gasClose handle it
    console.log('[PCAPP] Unregistering gas.close hook');
    Hooks.off("gas.close", gasClose);
    console.log('[PCAPP] Unregistering gas.equipmentSelection hook');
    Hooks.off("gas.equipmentSelection", handleEquipmentSelection);
    console.log('[PCAPP] onDestroy complete');
  });

  /**
   * Handle workflow state changes and update tabs accordingly
   */
  function handleWorkflowStateChange(state) {
    console.log('[PCAPP] ====== handleWorkflowStateChange CALLED ======');
    console.log('[PCAPP] New workflow state:', state);
    console.log('[PCAPP] Current tabs:', $tabs);
    console.log('[PCAPP] Current active tab:', $activeTab);

    // Remove Advancements tab when workflow moves past processing_advancements
    if (state !== 'processing_advancements' && state !== 'creating_character') {
      const hasAdvancementsTab = $tabs.find(x => x.id === "advancements");
      
      if (hasAdvancementsTab) {
        console.log('[PCAPP] Removing advancements tab - workflow has moved past processing_advancements');
        tabs.update(t => {
          const filteredTabs = t.filter(x => x.id !== "advancements");
          console.log('[PCAPP] Tabs after removing advancements:', filteredTabs);
          return filteredTabs;
        });

        // If the active tab was advancements, switch to the first available tab
        if ($activeTab === "advancements") {
          const remainingTabs = $tabs.filter(x => x.id !== "advancements");
          if (remainingTabs.length > 0) {
            console.log('[PCAPP] Setting active tab to:', remainingTabs[0].id);
            activeTab.set(remainingTabs[0].id);
          }
        }
      }
    }

    // Don't add tabs here - let the workflow state machine handle it
    // The workflow state machine has its own logic for adding spells/equipment/shop tabs
    // We only handle the removal of advancements tab here

    console.log('[PCAPP] ====== handleWorkflowStateChange COMPLETE ======');
  }

  function gasClose() {
    console.log('[PCAPP] ====== gasClose CALLED ======');
    window.GAS.log.d('gas.close')
    window.GAS.log.d($actorInGame);
    
    // Only try to access actor sheet if actor exists
    if ($actorInGame) {
      window.GAS.log.d($actorInGame.sheet);
      window.GAS.log.d($isLevelUp);
      if(!$isLevelUp) {
        $actorInGame.sheet.render(true);
      }
    } else {
      console.log('[PCAPP] No actor in game - skipping sheet render');
    }
    
    console.log('[PCAPP] Resetting stores and workflow state machine');
    resetStores();
    
    // Reset workflow state machine to idle, with error handling
    try {
      const currentState = getWorkflowFSM().getCurrentState();
      console.log('[PCAPP] Current workflow state before reset:', currentState);
      
      // Only send reset if not in a state that can't handle it
      if (currentState !== 'processing_advancements') {
        getWorkflowFSM().handle(WORKFLOW_EVENTS.RESET);
        console.log('[PCAPP] Workflow state after reset:', getWorkflowFSM().getCurrentState());
      } else {
        // For processing_advancements, we'll let it complete naturally or force stop
        console.log('[PCAPP] Skipping reset for processing_advancements state - will be handled naturally');
        // Force the processing flag to false to allow cleanup
        if (workflowFSMContext?.isProcessing) {
          workflowFSMContext.isProcessing.set(false);
        }
      }
    } catch (error) {
      console.warn('[PCAPP] Error during workflow reset:', error);
      // Force cleanup even if reset fails
      if (workflowFSMContext?.isProcessing) {
        workflowFSMContext.isProcessing.set(false);
      }
    }
    
    // Set flag to indicate we're closing from the gas hook
    if (application && typeof application.setClosingFromGasHook === 'function') {
      application.setClosingFromGasHook(true);
      console.log('[PCAPP] setClosingFromGasHook called on application instance');
    } else {
      console.warn('[PCAPP] application.setClosingFromGasHook is not a function or application is undefined:', application);
      // Fallback: try to close directly if possible
      if (application && typeof application.close === 'function') {
        application.close();
      }
    }
    application.close();
    console.log('[PCAPP] ====== gasClose COMPLETE ======');
  }

  /**
   * NB: this is called after advancements because some equipment selection
   * is dependent on the proficiencies selected
   * @todo: logic for those proficiency dependencies are not yet implemented
   */
  function handleEquipmentSelection() {
    console.log('[PCAPP] ====== handleEquipmentSelection CALLED ======');
    window.GAS.log.d('[PCAPP] handleEquipmentSelection called');
    window.GAS.log.d('[PCAPP] Current tabs before update:', $tabs);
    
    // Add Equipment tab
    if(!$tabs.find(x => x.id === "equipment")) {
      console.log('[PCAPP] Adding equipment tab - tab does not exist');
      window.GAS.log.d('[PCAPP] adding equipment tab')
      tabs.update(t => {
        const newTabs = [...t, { label: "Equipment", id: "equipment", component: "Equipment" }];
        console.log('[PCAPP] New tabs after adding equipment:', newTabs);
        return newTabs;
      });
    } else {
      console.log('[PCAPP] Equipment tab already exists');
    }

    // Note: Advancements tab removal is handled by handleWorkflowStateChange
    // Don't remove it here to avoid conflicts

    // Set active tab to equipment
    console.log('[PCAPP] Setting active tab to equipment');
    activeTab.set("equipment");
    console.log('[PCAPP] Active tab set to:', $activeTab);

    // Set read-only state for other tabs
    console.log('[PCAPP] Setting read-only tabs');
    readOnlyTabs.set(["race", "background", "abilities", "class"]);
    console.log('[PCAPP] Read-only tabs set to:', $readOnlyTabs);
    
    console.log('[PCAPP] ====== handleEquipmentSelection COMPLETE ======');
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