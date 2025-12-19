<script>
  import { ApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy } from "svelte";
  import { characterClass, characterSubClass, resetStores, tabs, isLevelUp, levelUpTabs, activeTab, actorInGame, readOnlyTabs } from "~/src/stores/index"
  import { goldRoll, startingWealthChoice } from "~/src/stores/storeDefinitions";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";
  import dnd5e from "~/config/systems/dnd5e.json"
  import Spells from "~/src/components/organisms/dnd5e/Tabs/Spells.svelte";
  import Equipment from "~/src/components/organisms/dnd5e/Tabs/Equipment.svelte";
  import { log } from '~/src/helpers/Utility';
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getWorkflowFSM, workflowFSMContext, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';
  import { getLevelUpFSM, levelUpFSMContext, LEVELUP_EVENTS } from '~/src/helpers/LevelUpStateMachine';

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let levelUp = false;

  //- register hooks
  // console.log('[PCAPP] Registering gas.close hook (once)');
  Hooks.once("gas.close", gasClose);
  // console.log('[PCAPP] Registering gas.equipmentSelection hook (persistent)');
  Hooks.on("gas.equipmentSelection", handleEquipmentSelection);
  Hooks.on("gas.choosingStartingWealth", handleStartingWealthChoice);
  

  setContext("#doc", documentStore);

  const application = getContext('#external').application;
  
  // set initial active tab
  $activeTab = levelUp ? $levelUpTabs[0].id : $tabs[0].id

  $: {
    // console.log('[PCAPP] Reactive filteredTabs changed:', filteredTabs);
    // console.log('[PCAPP] Current activeTab:', $activeTab);
    // console.log('[PCAPP] Tab with id "equipment" exists:', filteredTabs.find(t => t.id === 'equipment'));
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
    if(levelUp) {
      // Initialize LevelUp workflow
      $actorInGame = $documentStore
      levelUpFSMContext.actor = $documentStore;
      
      // Initialize characterClass from the actor's class data if in level-up mode
      if ($actorInGame) {
        // Find the first class item in the actor's items
        const classItem = $actorInGame.items.find(item => item.type === "class");
        if (classItem) {
          // Set the characterClass store with the class item
          characterClass.set(classItem);
        }
      }
      
      // Start the LevelUp state machine
      const levelUpFSM = getLevelUpFSM();
      
      // Check current state and reset if needed
      const currentState = levelUpFSM.getCurrentState();
      window.GAS.log.d('[PCAPP] Current FSM state before starting level-up:', currentState);
      
      // Reset FSM to idle if it's in any state other than 'idle'
      if (currentState !== 'idle') {
        // window.GAS.log.d('[PCAPP] Resetting FSM from state:', currentState, 'to idle');
        levelUpFSM.handle(LEVELUP_EVENTS.RESET);
      }
      
      // Now start the level-up workflow
      levelUpFSM.handle(LEVELUP_EVENTS.START_LEVEL_UP);
      // window.GAS.log.d('[PCAPP] Started LevelUp workflow');
    } else {
      // Character creation workflow
      getWorkflowFSM()
    }
    
    isLevelUp.set(levelUp);

    window.GAS.log.d(stylesApp)

    // window.GAS.log.d($isLevelUp)
  });

  onDestroy(() => {
    // console.log('[PCAPP] onDestroy called - cleaning up');
    // Don't reset stores here - let gasClose handle it
    // console.log('[PCAPP] Unregistering gas.close hook');
    Hooks.off("gas.close", gasClose);
    Hooks.off("gas.choosingStartingWealth", handleStartingWealthChoice);
    // console.log('[PCAPP] Unregistering gas.equipmentSelection hook');
    Hooks.off("gas.equipmentSelection", handleEquipmentSelection);
    // console.log('[PCAPP] onDestroy complete');
  });

  /**
   * Handle workflow state changes and update tabs accordingly
   */
  function handleWorkflowStateChange(state) {
    // console.log('[PCAPP] ====== handleWorkflowStateChange CALLED ======');
    // console.log('[PCAPP] New workflow state:', state);
    // console.log('[PCAPP] Current tabs:', $tabs);
    // console.log('[PCAPP] Current active tab:', $activeTab);

    // Remove Advancements tab when workflow moves past processing_advancements
    if (state !== 'processing_advancements' && state !== 'creating_character') {
      const hasAdvancementsTab = $tabs.find(x => x.id === "advancements");
      
      if (hasAdvancementsTab) {
        // console.log('[PCAPP] Removing advancements tab - workflow has moved past processing_advancements');
        tabs.update(t => {
          const filteredTabs = t.filter(x => x.id !== "advancements");
          console.log('[PCAPP] Tabs after removing advancements:', filteredTabs);
          return filteredTabs;
        });

        // If the active tab was advancements, switch to the first available tab
        if ($activeTab === "advancements") {
          const remainingTabs = $tabs.filter(x => x.id !== "advancements");
          if (remainingTabs.length > 0) {
            // console.log('[PCAPP] Setting active tab to:', remainingTabs[0].id);
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
    // console.log('[PCAPP] ====== gasClose CALLED ======');
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
    
    // console.log('[PCAPP] Resetting stores and workflow state machine');
    resetStores();
    
    // Reset workflow state machine to idle, with error handling
    try {
      const currentState = getWorkflowFSM().getCurrentState();
      // console.log('[PCAPP] Current workflow state before reset:', currentState);
      
      // Only send reset if not in a state that can't handle it
      if (currentState !== 'processing_advancements') {
        getWorkflowFSM().handle(WORKFLOW_EVENTS.RESET);
        // console.log('[PCAPP] Workflow state after reset:', getWorkflowFSM().getCurrentState());
      } else {
        // For processing_advancements, we'll let it complete naturally or force stop
        // console.log('[PCAPP] Skipping reset for processing_advancements state - will be handled naturally');
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
      // console.log('[PCAPP] setClosingFromGasHook called on application instance');
    } else {
      // console.warn('[PCAPP] application.setClosingFromGasHook is not a function or application is undefined:', application);
      // Fallback: try to close directly if possible
      if (application && typeof application.close === 'function') {
        application.close();
      }
    }
    application.close();
    // console.log('[PCAPP] ====== gasClose COMPLETE ======');
  }

  /**
   * Handle starting wealth choice for 2014 rules
   */
  function handleStartingWealthChoice() {
    window.GAS.log.d('[PCAPP] handleStartingWealthChoice called');
    
    // Add wealth choice tab
    if(!$tabs.find(x => x.id === "wealth-choice")) {
      tabs.update(t => {
        const newTabs = [...t, { label: "Wealth", id: "wealth-choice", component: "StartingWealthChoice" }];
        window.GAS.log.d('[PCAPP] Added wealth choice tab:', newTabs);
        return newTabs;
      });
    }

    // Set active tab to wealth choice
    activeTab.set("wealth-choice");
    
    // Set read-only state for other tabs
    readOnlyTabs.set(["race", "background", "abilities", "class"]);
  }

  /**
   * NB: this is called after advancements because some equipment selection
   * is dependent on the proficiencies selected
   * @todo: logic for those proficiency dependencies are not yet implemented
   */
  function handleEquipmentSelection() {
    // console.log('[PCAPP] ====== handleEquipmentSelection CALLED ======');
    // window.GAS.log.d('[PCAPP] handleEquipmentSelection called');
    // window.GAS.log.d('[PCAPP] Current tabs before update:', $tabs);
    
    // Determine tab label based on 2014 rules wealth choice
    let tabLabel = "Equipment";
    if (window.GAS.dnd5eRules === "2014" && $startingWealthChoice === "gold") {
      tabLabel = "Gold";
    }
    
    // Add Equipment tab
    if(!$tabs.find(x => x.id === "equipment")) {
      // console.log('[PCAPP] Adding equipment tab - tab does not exist');
      // window.GAS.log.d('[PCAPP] adding equipment tab')
      tabs.update(t => {
        const newTabs = [...t, { label: tabLabel, id: "equipment", component: "Equipment" }];
        // console.log('[PCAPP] New tabs after adding equipment:', newTabs);
        return newTabs;
      });
    } else {
      // Update existing tab label if it changed
      tabs.update(t => {
        const equipmentTab = t.find(x => x.id === "equipment");
        if (equipmentTab && equipmentTab.label !== tabLabel) {
          equipmentTab.label = tabLabel;
        }
        return t;
      });
    }

    // Note: Advancements tab removal is handled by handleWorkflowStateChange
    // Don't remove it here to avoid conflicts

    // Set active tab to equipment
    // console.log('[PCAPP] Setting active tab to equipment');
    activeTab.set("equipment");
    // console.log('[PCAPP] Active tab set to:', $activeTab);

    // Set read-only state for other tabs while preserving existing locked tabs (including wealth-choice)
    readOnlyTabs.update(ro => {
      const base = ["race", "background", "abilities", "class"];
      const preserved = ro.includes("wealth-choice") ? ["wealth-choice"] : [];
      return Array.from(new Set([...base, ...preserved]));
    });
    
    // console.log('[PCAPP] ====== handleEquipmentSelection COMPLETE ======');
  }
  
  /**
   * Handle wealth choice confirmation from user
   */
  function handleWealthChoiceConfirm(event) {
    const { choice } = event.detail;
    window.GAS.log.d('[PCAPP] Wealth choice confirmed:', choice);
    
    // CRITICAL: Never reset gold roll once it's been rolled
    // Once rolled, the value is immutable for this character
    const hasAlreadyRolled = $goldRoll > 0;
    if (hasAlreadyRolled) {
      window.GAS.log.d('[PCAPP] Gold already rolled:', $goldRoll, '- preserving value (can only roll once)');
    }
    
    // Store the choice FIRST so that equipment tab setup uses the correct choice
    startingWealthChoice.set(choice);
    
    // Keep the wealth choice tab but make it readonly
    readOnlyTabs.update(ro => {
      if (!ro.includes("wealth-choice")) {
        return [...ro, "wealth-choice"];
      }
      return ro;
    });
    
    // Re-run equipment tab setup so the destination tab reflects the new choice and resets its state
    handleEquipmentSelection();
    
    // Trigger workflow FSM event
    const workflowFSM = getWorkflowFSM();
    workflowFSM.handle(WORKFLOW_EVENTS.WEALTH_CHOICE_MADE);
  }

  /**
   * Handle edit button click from Starting Wealth tab
   */
  function handleWealthChoiceEdit(event) {
    window.GAS.log.d('[PCAPP] Wealth choice edit requested');
    
    // Remove wealth-choice from readonly tabs
    readOnlyTabs.update(ro => {
      return ro.filter(tab => tab !== "wealth-choice");
    });
    
    // Remove downstream tabs that may no longer be appropriate (equipment/gold, shop, spells)
    tabs.update(t => {
      const filtered = t.filter(tab => tab.id !== 'equipment' && tab.id !== 'shop' && tab.id !== 'spells');
      window.GAS.log.d('[PCAPP] Removed equipment/gold/shop/spells tabs, remaining:', filtered);
      return filtered;
    });
    
    // Switch to wealth-choice tab
    activeTab.set('wealth-choice');
    
    // Transition state machine back to choosing_starting_wealth
    const workflowFSM = getWorkflowFSM();
    const currentState = workflowFSM.getCurrentState();
    window.GAS.log.d('[PCAPP] Current FSM state before reset:', currentState);
    
    // Reset the choice in the store
    startingWealthChoice.set(null);
    
    // Note: Don't reset goldRoll here - preserve it if already rolled (can only roll once)
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
        Tabs.gas-tabs( tabs="{filteredTabs}" bind:activeTab="{$activeTab}" sheet="PC" on:confirm!="{handleWealthChoiceConfirm}" on:edit!="{handleWealthChoiceEdit}")

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