<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { get } from "svelte/store";
  import { MODULE_ID } from "~/src/helpers/constants";
  import {
    race,
    abilities,
    characterClass,
    characterSubClass,
    background,
    spells,
    subRace,
    isActorCreated,
    isLevelUp,
    activeTab,
    dropItemRegistry,
    actorInGame,
    isNewMultiClass,
    abilityRolls,
    isStandardArrayValues,
    subClassesForClass,
    preAdvancementSelections,
    hasCharacterCreationChanges,
    changedCharacterCreationItems,
    level,
    tabs,
    classUuidForLevelUp,
    subClassUuidForLevelUp,
    levelUpClassObject,
    levelUpSubClassObject,
    levelUpClassGetsSubclassThisLevel,
    isNewMultiClassSelected,
    readOnlyTabs,
    tabDisabled
  } from "~/src/stores/index";
  import { progress } from "~/src/stores/progress";
  import { flattenedSelections } from "~/src/stores/equipmentSelections";
  import { flattenedStartingEquipment } from "~/src/stores/startingEquipment";
  import { goldChoices, totalGoldFromChoices, areGoldChoicesComplete } from "~/src/stores/goldChoices";
  import { shopCart, cartTotalCost, remainingGold, finalizePurchase } from '~/src/stores/equipmentShop';
  import { spellProgress, spellLimits, currentSpellCounts } from '~/src/stores/spellSelection';
  import { isGenerating } from '~/src/stores/biography';
  import { biographyContent, characterDetails } from '~/src/stores/biography';
  import { updateSource } from '~/src/helpers/Utility';
  import { getLevelUpFSM, LEVELUP_EVENTS } from "~/src/helpers/LevelUpStateMachine";
  import { getWorkflowFSM, WORKFLOW_EVENTS, workflowFSMContext } from "~/src/helpers/WorkflowStateMachine";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";
  import LLM from "~/src/plugins/llm";
  import { abilityGenerationMethod } from "~/src/stores/index";
  import { derived, writable } from "svelte/store";

  import { localize as t } from "~/src/helpers/Utility";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";
  import { equipmentSelections } from "~/src/stores/equipmentSelections";
  import { goldRoll, startingWealthChoice } from "~/src/stores/storeDefinitions";
  

  // Import workflow functions
  import {
    createActorInGameAndEmbedItems as createActorWorkflow,
    updateActorAndEmbedItems as updateActorWorkflow,
    updateActorLevelUpWorkflow,
    handleAddEquipment as addEquipmentWorkflow,
    handleFinalizePurchase as finalizePurchaseWorkflow,
    handleFinalizeSpells as finalizeSpellsWorkflow,
    checkActorInventory as checkInventory,
    handleCharacterUpdate as characterUpdateWorkflow,
    handleSkipSpellsLevelUp
  } from "~/src/lib/workflow";

  // Derived store for LLM button visibility
  const showLLMButton = derived([race, isGenerating], ([$race, $isGenerating]) => {
    if($isGenerating) return false;
    const settingEnabled = game?.settings?.get ? game.settings.get(MODULE_ID, 'EnableLLMNameGeneration') : false;
    // Hide the button if the license tracker is enabled but no license code is present.
    const licenseTrackerEnabled = game?.settings?.get ? game.settings.get(MODULE_ID, 'EnableLicenseTracker') : false;
    const licenseCode = game?.settings?.get ? game.settings.get(MODULE_ID, 'AardvarkLicenseCode') : '';
    const licenseReady = !licenseTrackerEnabled || (licenseTrackerEnabled && !!licenseCode);
    return !!$race && settingEnabled && licenseReady;
  });
  
  // Debug logging for button visibility
  // $: {
  //   if ($activeTab === 'equipment') {
  //     window.GAS.log.d('[FOOTER] Equipment button visibility check:', {
  //       isEquipmentComplete,
  //       equipmentReadonly: $readOnlyTabs.includes('equipment'),
  //       shouldShowButton: isEquipmentComplete && !$readOnlyTabs.includes('equipment')
  //     });
  //   }
  // }

  // Add state for processing purchase
  const isProcessingPurchase = writable(false);

  // Add state for processing spells
  const isProcessingSpells = writable(false);

  // Add state for processing feat spells
  const isProcessingFeatSpells = writable(false);

  // Add state for tracking if equipment has been added this session
  const hasAddedEquipmentThisSession = writable(false);

  // Store references for workflow functions
  const storeRefs = {
    race,
    subRace,
    background,
    characterClass,
    characterSubClass,
    isLevelUp,
    isNewMultiClass,
    preAdvancementSelections,
    actorInGame,
    classUuidForLevelUp,
    subClassUuidForLevelUp,
    levelUpClassObject,
    levelUpSubClassObject,
    flattenedSelections,
    tabs,
    activeTab,
    readOnlyTabs,
    totalGoldFromChoices,
    goldRoll,
    cartTotalCost,
    remainingGold,
    finalizePurchase,
    hasCharacterCreationChanges,
    changedCharacterCreationItems
  };

  // Derived store for level-up progress
  const levelUpProgress = derived(
    [classUuidForLevelUp, levelUpClassGetsSubclassThisLevel, subClassUuidForLevelUp],
    ([$classUuidForLevelUp, $levelUpClassGetsSubclassThisLevel, $subClassUuidForLevelUp]) => {

      window.GAS.log.d('levelUpProgress', $classUuidForLevelUp, $levelUpClassGetsSubclassThisLevel, $subClassUuidForLevelUp);
      // If a new multiclass is selected, show 100% progress
      if ($classUuidForLevelUp && $levelUpClassGetsSubclassThisLevel && !$subClassUuidForLevelUp) return 50;
      if ($classUuidForLevelUp && $levelUpClassGetsSubclassThisLevel && $subClassUuidForLevelUp) return 100;
      if ($classUuidForLevelUp && !$levelUpClassGetsSubclassThisLevel) return 100;
      
      return 0
    }
  );

  export let value = null;

  const actor = getContext("#doc");
  const app = getContext("#external").application;
  let actorName = $actor?.name || "";
  const browserLanguage = navigator.language || 'en';

  // Initialize biography content with actor name if available
  onMount(() => {
    if ($actor?.name && !$biographyContent.name) {
      biographyContent.update(content => ({ ...content, name: $actor.name }));
    }
  });

  // Sync actor name when biography content changes
  $: if ($biographyContent.name && $actor && $biographyContent.name !== $actor.name) {
    $actor.updateSource({ name: $biographyContent.name });
  }

  // Derived store to check if actor has items in inventory
  const hasInventoryItems = derived(actorInGame, ($actorInGame) => {
    try {
      if (!$actorInGame || !$actorInGame.items) return false;
      
      // Check if the actor has any items
      // In Foundry VTT, items is a Collection that has methods like filter and size
      const inventoryTypes = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
      
      // First check if items collection exists and has any items
      if (!$actorInGame.items || $actorInGame.items.size === 0) {
        // window.GAS.log.d('[FOOTER] No items found on actor');
        return false;
      }
      
      // Use the Foundry Collection's filter method
      const inventoryItems = $actorInGame.items.filter(item => inventoryTypes.includes(item.type));
      const hasItems = inventoryItems.size > 0;
      
      // window.GAS.log.d('[FOOTER] hasInventoryItems check:', {
      //   actorId: $actorInGame.id,
      //   totalItems: $actorInGame.items.size,
      //   inventoryItems: inventoryItems,
      //   inventoryItemCount: inventoryItems.size,
      //   hasItems: hasItems
      // });
      
      return hasItems;
    } catch (error) {
      // If there's any error accessing the actor, return false
      console.warn('[FOOTER] Error checking inventory items:', error);
      return false;
    }
  });

  // Temporary simple store for hasInventoryItems
  // const hasInventoryItems = writable(false);

  const handleTokenNameInput = (e) => {
    if (!$actor.flags[MODULE_ID]) $actor.flags[MODULE_ID] = {};
    $actor.flags[MODULE_ID].tokenName = e.target.value;
  };
  //- Create Actor
  const clickCreateHandler = async () => {
    // Initialize workflow state machine for character creation
    const fsm = getWorkflowFSM();
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    
    // Check if biography tab is enabled (new setting). Fall back to LLM name generation for backward compatibility.
    const enableBiography = game?.settings?.get ? game.settings.get(MODULE_ID, 'EnableBiographyTab') : undefined;
    const enableLLM = game?.settings?.get ? game.settings.get(MODULE_ID, 'EnableLLMNameGeneration') : false;
    const shouldShowBiography = (typeof enableBiography !== 'undefined') ? !!enableBiography : !!enableLLM;

    if (shouldShowBiography) {
      // Biography is enabled - defer actor creation and go to biography tab
      window.GAS.log.d('[FOOTER] Biography enabled - deferring actor creation and switching to biography tab');
      
      // Add biography tab if not already present
      const currentTabs = get(tabs);
      if (!currentTabs.find(t => t.id === "biography")) {
        tabs.update(t => [...t, { label: "Biography", id: "biography", component: "Biography" }]);
      }
      
      // Switch to biography tab
      activeTab.set("biography");
      
      // Don't set isActorCreated = true yet - actor creation is deferred
      return;
    }
    
    // Biography not enabled - create actor immediately as before
    await createActorWorkflow({
      actor,
      stores: storeRefs,
      dropItemRegistry
    });
    $isActorCreated = true;

    // Signal to the workflow FSM that the actor has been created so it can progress to advancements
    try {
      const workflowFSM = getWorkflowFSM();
      window.GAS.log.d('[FOOTER] Signalling CHARACTER_CREATED to FSM');
      workflowFSM.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    } catch (e) {
      window.GAS.log.e('[FOOTER] Error signalling CHARACTER_CREATED:', e);
    }
  };

  const clickUpdateLevelUpHandler = async () => {
    window.GAS.log.d('[FOOTER] clickUpdateLevelUpHandler', $classUuidForLevelUp);
    
    await updateActorLevelUpWorkflow({
      actor,
      actorName,
      stores: storeRefs,
      dropItemRegistry
    });
  };

  const clickUpdateHandler = async () => {
    await characterUpdateWorkflow({
      stores: storeRefs,
      dropItemRegistry
    });
  };

  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || $biographyContent.name;

  // Define valid tabs for footer visibility
  const FOOTER_TABS = ['race', 'class', 'background', 'abilities', 'equipment', 'level-up', 'shop', 'spells', 'biography'];
  const CHARACTER_CREATION_TABS = ['race', 'class', 'background', 'abilities', 'biography'];

  // Handle adding equipment to the actor
  const handleAddEquipment = async () => {
    await addEquipmentWorkflow({
      stores: storeRefs,
      actorInGame,
      onEquipmentAdded: () => {
        hasAddedEquipmentThisSession.set(true);
        window.GAS.log.d('[FOOTER] Equipment added to actor');
      }
    });
  };

  // Derive whether equipment section is complete
  $: isEquipmentComplete = (() => {
    if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024") {
      return $progress === 100 && $areGoldChoicesComplete;
    }
    
    // For 2014 rules
    if (window.GAS.dnd5eRules === "2014") {
      // If they chose gold, need progress 100 and goldRoll > 0
      // If they chose equipment, need progress 100 only (gold not rolled in this case)
      if ($startingWealthChoice === 'equipment') {
        return $progress === 100;
      }
      // Gold choice or no choice yet
      return $progress === 100 && $goldRoll > 0;
    }
    
    // For v3 (pre-2024)
    return $progress === 100 && $goldRoll > 0;
  })();
  
  // Debug log for button visibility condition
  $: {
    if ($activeTab === 'equipment') {
      // window.GAS.log.d('[FOOTER] Button visibility check:', {
      //   isEquipmentComplete,
      //   hasInventoryItems: $hasInventoryItems,
      //   equipmentCompleted: $completedTabs.equipment,
      //   shouldShowButton: isEquipmentComplete && !$completedTabs.equipment
      // });
    }
  }

  // Check actor inventory when actorInGame changes and set completion state
  // Temporarily disabled to avoid temporal dead zone issues
  // $: if (isMounted && $actorInGame) {
  //   // If equipment has already been added this session, don't change the flag
  //   if (!$hasAddedEquipmentThisSession) {
  //             if (checkInventory($actorInGame)) {
  //         // Actor already has inventory items
  //         window.GAS.log.d('[FOOTER] Actor already has inventory items');
  //       }
  //   }
  // }

  // Handle finalizing purchases in the shop
  async function handleFinalizePurchase() {
    // Prevent multiple clicks
    if (get(isProcessingPurchase)) return;
    
    await finalizePurchaseWorkflow({
      stores: storeRefs,
      setProcessing: (value) => isProcessingPurchase.set(value)
    });
  }

  // Handle finalizing spell selection
  async function handleFinalizeSpells() {
    // Prevent multiple clicks
    if (get(isProcessingSpells)) return;
    
    await finalizeSpellsWorkflow({
      stores: storeRefs,
      setProcessing: (value) => isProcessingSpells.set(value)
    });
  }

  // Handle skipping spells in level-up mode
  async function handleSkipSpells() {
    await handleSkipSpellsLevelUp({
      stores: storeRefs
    });
  }

  // Handle feat spell completion
  async function handleCompleteFeatSpells() {
    isProcessingFeatSpells.set(true);
    try {
      const actor = get(actorInGame);
      const isLevelUpWorkflow = get(isLevelUp);
      
      if (isLevelUpWorkflow) {
        const levelUpFSM = getLevelUpFSM();
        levelUpFSM.handle(LEVELUP_EVENTS.FEAT_SPELLS_COMPLETE);
      } else {
        const workflowFSM = getWorkflowFSM();
        workflowFSM.handle(WORKFLOW_EVENTS.FEAT_SPELLS_COMPLETE);
      }
    } catch (err) {
      window.GAS.log.e('[FOOTER] Error completing feat spell selection:', err);
      ui.notifications?.error(err.message);
    } finally {
      isProcessingFeatSpells.set(false);
    }
  }

  // Handle skipping feat spells
  async function handleSkipFeatSpells() {
    const isLevelUpWorkflow = get(isLevelUp);
    
    if (isLevelUpWorkflow) {
      const levelUpFSM = getLevelUpFSM();
      levelUpFSM.handle(LEVELUP_EVENTS.SKIP_FEAT_SPELLS);
    } else {
      const workflowFSM = getWorkflowFSM();
      workflowFSM.handle(WORKFLOW_EVENTS.SKIP_FEAT_SPELLS);
    }
  }

  // Handle biography completion
  async function handleCompleteBiography() {
    try {
      // If actor hasn't been created yet (deferred creation for biography), create it now
      let currentActorInGame;
      try {
        currentActorInGame = get(actorInGame);
      } catch (e) {
        currentActorInGame = null;
      }
      if (!currentActorInGame) {
        window.GAS.log.d('[FOOTER] Creating deferred actor before completing biography');
        await createActorWorkflow({
          actor,
          stores: storeRefs,
          dropItemRegistry
        });
        $isActorCreated = true;
        // Get the actor again after creation
        try {
          currentActorInGame = get(actorInGame);
        } catch (e) {
          currentActorInGame = null;
        }
      }
      
      // Apply biography content to the created actor
      let $biographyContent;
      let $characterDetails;
      try {
        $biographyContent = get(biographyContent);
        $characterDetails = get(characterDetails);
      } catch (e) {
        $biographyContent = {};
        $characterDetails = {};
      }
      if (currentActorInGame && (Object.values($biographyContent).some(val => val && val.trim()) || Object.values($characterDetails).some(val => val && val.trim()))) {
        window.GAS.log.d('[FOOTER] Applying biography content to actor');
        const updates = {};
        
        // Apply name to actor name
        if ($biographyContent.name && $biographyContent.name.trim()) {
          updates.name = $biographyContent.name.trim();
        }
        
        // Apply biography fields to actor system.details
        if ($biographyContent.ideals && $biographyContent.ideals.trim()) {
          updates['system.details.ideal'] = $biographyContent.ideals.trim();
        }
        if ($biographyContent.flaws && $biographyContent.flaws.trim()) {
          updates['system.details.flaw'] = $biographyContent.flaws.trim();
        }
        if ($biographyContent.bonds && $biographyContent.bonds.trim()) {
          updates['system.details.bond'] = $biographyContent.bonds.trim();
        }
        if ($biographyContent.personalityTraits && $biographyContent.personalityTraits.trim()) {
          updates['system.details.trait'] = $biographyContent.personalityTraits.trim();
        }
        if ($biographyContent.appearance && $biographyContent.appearance.trim()) {
          updates['system.details.appearance'] = $biographyContent.appearance.trim();
        }
        if ($biographyContent.biography && $biographyContent.biography.trim()) {
          updates['system.details.biography'] = { value: $biographyContent.biography.trim() };
        }
        
        // Apply character details from characterDetails store
        if ($characterDetails.height && $characterDetails.height.trim()) {
          updates['system.details.height'] = $characterDetails.height.trim();
        }
        if ($characterDetails.weight && $characterDetails.weight.trim()) {
          updates['system.details.weight'] = $characterDetails.weight.trim();
        }
        if ($characterDetails.age && $characterDetails.age.trim()) {
          updates['system.details.age'] = $characterDetails.age.trim();
        }
        if ($characterDetails.eyes && $characterDetails.eyes.trim()) {
          updates['system.details.eyes'] = $characterDetails.eyes.trim();
        }
        if ($characterDetails.hair && $characterDetails.hair.trim()) {
          updates['system.details.hair'] = $characterDetails.hair.trim();
        }
        if ($characterDetails.skin && $characterDetails.skin.trim()) {
          updates['system.details.skin'] = $characterDetails.skin.trim();
        }
        if ($characterDetails.gender && $characterDetails.gender.trim()) {
          updates['system.details.gender'] = $characterDetails.gender.trim();
        }
        if ($characterDetails.faith && $characterDetails.faith.trim()) {
          updates['system.details.faith'] = $characterDetails.faith.trim();
        }
        if ($characterDetails.alignment && $characterDetails.alignment.trim()) {
          updates['system.details.alignment'] = $characterDetails.alignment.trim();
        }
        
        if (Object.keys(updates).length > 0) {
          await updateSource(currentActorInGame, updates);
          window.GAS.log.d('[FOOTER] Biography content applied successfully');
        }
      }
      
      // Mark previous tabs as read-only when biography is completed
      readOnlyTabs.update(tabs => {
        const previousTabs = ['abilities', 'race', 'background', 'class'];
        return [...new Set([...tabs, ...previousTabs])];
      });
      
      const workflowFSM = getWorkflowFSM();
      // Guard: ensure FSM is in an appropriate state before firing biography_complete
      try {
        const currentState = workflowFSM.getCurrentState && workflowFSM.getCurrentState();
        if (currentState === 'idle') {
          window.GAS.log.w('[FOOTER] FSM is in idle when completing biography; attempting to restart workflow');
          // Kick off the workflow safely
          workflowFSM.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
          // If actor was just created, signal CHARACTER_CREATED so FSM can progress to biography/processing
          if (currentActorInGame) {
            workflowFSM.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
          }
        }
      } catch (fsmErr) {
        window.GAS.log.e('[FOOTER] Error checking/advancing FSM before biography_complete:', fsmErr);
      }

      // Finally, signal biography completion
      try {
        workflowFSM.handle(WORKFLOW_EVENTS.BIOGRAPHY_COMPLETE);
      } catch (e) {
        // If the FSM still rejects the event, log it but avoid throwing (UI already handled)
        window.GAS.log.e('[FOOTER] Error dispatching BIOGRAPHY_COMPLETE event:', e);
        ui.notifications?.error(e.message || 'Failed to complete biography workflow');
      }
    } catch (err) {
      window.GAS.log.e('[FOOTER] Error completing biography:', err);
      ui.notifications?.error(err.message);
    }
  }

  // Handle biography generation
  async function handleGenerateBiography() {
    readOnlyTabs.set(['biography']);

    const { generateBiography } = await import('~/src/stores/biography');
    await generateBiography($actor);
    readOnlyTabs.set([]);

  }

  // Function to generate a random color
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Array of font families
  const fontFamilies = [
    'Gruppo',
    'Bad Script',
    'Kumar One Outline',
    'League Script',
    'Monoton',
    'Sriracha',
    'Yellowtail'
  ];

  let selectedFontFamily;
  let inputClass;

  // Check if experimental styling is enabled
  $: experimentalStylingEnabled = game.settings.get(MODULE_ID, 'experimentalCharacterNameStyling');
  
  // Clean up experimental styles when disabled
  $: if (!experimentalStylingEnabled) {
    // Reset CSS custom properties
    document.documentElement.style.removeProperty('--random-font-family');
    document.documentElement.style.removeProperty('--background-color1');
    document.documentElement.style.removeProperty('--background-color2');
    document.documentElement.style.removeProperty('--sign-color1');
    document.documentElement.style.removeProperty('--sign-color2');
    inputClass = '';
  }

  // Function to randomize font and colors (only if experimental styling is enabled)
  function randomize() {
    if (!experimentalStylingEnabled) return;
    
    // Randomly select a font family
    selectedFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
    document.documentElement.style.setProperty('--random-font-family', selectedFontFamily);

    // Get random colors for the background and sign
    const backgroundColor1 = getRandomColor();
    const backgroundColor2 = getRandomColor();
    const signColor1 = getRandomColor();
    const signColor2 = getRandomColor();

    // Set the colors in the style
    document.documentElement.style.setProperty('--background-color1', backgroundColor1);
    document.documentElement.style.setProperty('--background-color2', backgroundColor2);
    document.documentElement.style.setProperty('--sign-color1', signColor1);
    document.documentElement.style.setProperty('--sign-color2', signColor2);

    // Set the input padding based on the selected font family
    inputClass = (selectedFontFamily === 'Kumar One Outline' || selectedFontFamily === 'League Script') 
      ? 'lowered' 
      : '';
  }

  // Store handler references for cleanup (must be at top level)
  let signHandlers = [];

  onMount(() => {
    // Only apply experimental animations if enabled
    if (experimentalStylingEnabled) {
      const signs = document.querySelectorAll('.x-sign')
      const randomIn = (min, max) => (
        Math.floor(Math.random() * (max - min + 1) + min)
      )

      const mixupInterval = (el, val1, val2) => {
        const ms = randomIn(val1, val2)
        el.style.setProperty('--interval', `${ms}ms`)
      }

      // Store handler references for cleanup
      signHandlers = [];
      signs.forEach(el => {
        mixupInterval(el, 2000, 3000)
        const handler = () => {
          mixupInterval(el, 2000, 3000)
        };
        el.addEventListener('webkitAnimationIteration', handler);
        signHandlers.push({ el, handler });
      })

      randomize(); // Call randomize on mount
    }
  });

  // Cleanup listeners on destroy - MUST be at top level
  onDestroy(() => {
    signHandlers.forEach(({ el, handler }) => {
      el.removeEventListener('webkitAnimationIteration', handler);
    });
  });

  const generateName = async (race) => {
    try {
      const name = await LLM.generateName(race + ' lang: ' + browserLanguage + ' avoiding patterns or common starting letters. Ensure the name is different with each request.');
      actorName = name;
      // Update biography content and actor
      biographyContent.update(content => ({ ...content, name: name }));
      await updateSource($actor, { name: name });
    } catch (error) {
      console.error('Failed to generate name:', error);
      ui.notifications.error('Failed to generate character name');
    }
  };
</script>

<template lang="pug">
.footer-container
  +if("FOOTER_TABS.includes($activeTab)")
    .flexrow.gap-10.pr-md.mt-sm
      //- Character name section (not available in level-up tab)
      +if("CHARACTER_CREATION_TABS.includes($activeTab) && $activeTab !== 'level-up'")
        .flex2
          .flexcol
            .flexrow.gap-10
              .flex0.right.mt-xs.no-wrap.ml-md
                label.character-name-label(
                  on:click="{randomize}" 
                  class:experimental-label="{experimentalStylingEnabled}"
                ) {t('Footer.CharacterName')}
              .flex2
                .character-name-input-container(
                  class:x-background="{experimentalStylingEnabled}"
                  class="{inputClass}"
                )
                  input.left.character-name-input(
                    class:x-sign="{experimentalStylingEnabled}"
                    type="text" 
                    bind:value="{$biographyContent.name}"
                    disabled="{$isLevelUp || $tabDisabled}"
                  )
                  +if("$showLLMButton")
                    .flex.pointer(on:click="{generateName($race.name)}")
                      img(src="modules/foundryvtt-actor-studio/assets/ChatGPT_logo.svg" alt="Generate name via ChatGPT" style="height: 100%; max-height: 30px; border: none; width: auto;")
      
      //- Progress and buttons section
      .flex1
        +if("$isLevelUp && $activeTab === 'level-up'")
          .progress-container
            ProgressBar(progress="{levelUpProgress}")
            +if("$levelUpProgress === 100 && !$readOnlyTabs.includes('level-up')")
              .button-container.mt-xs
                button(
                  disabled="{!$classUuidForLevelUp}"
                  type="button"
                  role="button"
                  on:mousedown="{clickUpdateLevelUpHandler}"
                  data-tooltip="{$classUuidForLevelUp ? '' : 'First select a class to level up, or a multi-class to add'}"
                )
                  span {t('Footer.AddLevel')}
                  i.right.ml-md(class="fas fa-chevron-right")
        
        +if("$activeTab === 'equipment'")
          .progress-container
            +if("$readOnlyTabs.includes('equipment')")
              ProgressBar(progress="{100}")
              +else()
                ProgressBar(progress="{progress}")
                +if("isEquipmentComplete")
                  .button-container
                    button.mt-xs(
                      type="button"
                      role="button"
                      on:mousedown="{handleAddEquipment}"
                    )
                      span {t('Footer.AddEquipment')}
                      i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'shop'")
          .progress-container
            +if("$readOnlyTabs.includes('shop')")
              ProgressBar(progress="{100}")
              +else()
                .button-container
                  button.mt-xs(
                    type="button"
                    role="button"
                    on:mousedown="{handleFinalizePurchase}"
                    disabled="{$isProcessingPurchase}" 
                  )
                    span {t('Footer.FinalizePurchase')}
                    i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'spells'")
          .progress-container
            +if("$readOnlyTabs.includes('spells')")
              ProgressBar(progress="{100}")
              +else()
                ProgressBar(progress="{$spellProgress.progressPercentage}")
                +if("$spellProgress.progressPercentage === 100")
                  .button-container
                    button.mt-xs(
                      type="button"
                      role="button"
                      on:mousedown="{handleFinalizeSpells}"
                      disabled="{$isProcessingSpells}" 
                    )
                      span {t('Footer.FinalizeSpells')}
                      i.right.ml-md(class="fas fa-chevron-right")
                  +elseif("$isLevelUp")
                    // Show skip button when spells are not complete in level-up mode
                    .button-container
                      button.mt-xs.secondary(
                        type="button"
                        role="button"
                        on:mousedown="{handleSkipSpells}"
                        data-tooltip="{t('Footer.SkipSpells')}"
                      )
                        span {t('Footer.SkipSpells')}
                        i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'feat-spells'")
          .progress-container
            .button-container
              button.mt-xs(
                type="button"
                role="button"
                on:mousedown="{handleCompleteFeatSpells}"
                disabled="{$isProcessingFeatSpells}"
              )
                span {t('Complete')}
                i.right.ml-md(class="fas fa-chevron-right")
              +if("$isLevelUp")
                button.mt-xs.secondary(
                  type="button"
                  role="button"
                  on:mousedown="{handleSkipFeatSpells}"
                  data-tooltip="{t('Skip')}"
                )
                  span {t('Skip')}
                  i.right.ml-md(class="fas fa-chevron-right")
              
        +if("$activeTab === 'biography'")
          .progress-container
            .button-container
              button.mt-xs.secondary(
                type="button"
                role="button"
                on:mousedown="{handleGenerateBiography}"
                disabled="{$isGenerating}"
              )
                span {$isGenerating ? 'Generating...' : 'Generate Biography'}
                +if("$isGenerating")
                  i.right.fa-solid.fa-spinner.fa-spin.spin
                  +else
                    i.right.ml-md(class="fas fa-magic")
              button.mt-xs(
                type="button"
                role="button"
                on:mousedown="{handleCompleteBiography}"
                disabled="{$isGenerating}"
              )
                span Continue
                +if("$isGenerating")
                  +else
                    i.right.ml-md(class="fas fa-chevron-right")

              
        +if("CHARACTER_CREATION_TABS.includes($activeTab)")
          .progress-container
            +if("$readOnlyTabs.includes($activeTab)")
              +if("$isGenerating")
                +else
                  ProgressBar(progress="{100}")
              +else()
                ProgressBar(progress="{progress}")
                +if("$progress === 100")
                  .button-container
                    +if("!$isActorCreated && $activeTab !== 'biography'")
                      button.mt-xs.wide(
                        type="button"
                        role="button"
                        on:mousedown="{clickCreateHandler}"
                      )
                        span {t('Footer.CreateCharacter')}
                        i.right.ml-md(class="fas fa-chevron-right")
                      +elseif("$hasCharacterCreationChanges")
                        button(
                          type="button"
                          role="button"
                          on:mousedown="{clickUpdateHandler}"
                        )
                          span {t('Footer.UpdateCharacter')}
                          i.right.ml-md(class="fas fa-chevron-right")

</template>

<style lang="sass">
.button-container
  button
    white-space: nowrap
    width: 100%
.gap-10
  gap: 10px
  justify-content: space-between
  align-items: center
label
  margin: 10px 0 0 0
.spin
  animation: spin 1s ease-in-out infinite

button[disabled]
  cursor: not-allowed
  background-color: #ccc
  color: #666
  border: 1px solid #ccc
  &:hover
    background-color: #ccc
    color: #666
.hint
  font-size: 0.8em
  color: var(--color-text-dark-secondary)
  text-align: center
  margin-top: 0.5rem
.character-name-input-container
  height: 51px
  padding: 1rem 1rem 1rem 1rem
  font-size: xx-large
  font-family: var(--dnd5e-font-modesto)
  border: 1px solid #ccc
  border-radius: 5px
  display: flex
  align-items: center
  justify-content: flex-start
  
  // Default non-experimental styling
  background: rgba(1, 1, 1, 0.1)
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2)

.footer-container .character-name-input-container input[type="text"].character-name-input
  border: none !important
  background: none !important
  height: auto !important
  line-height: normal !important
  padding: 0 !important
  margin: 0 !important
  color: inherit !important
  font-family: inherit !important
  font-size: 2rem
  
  &:focus
    outline: none
    box-shadow: none
  
  &:disabled
    color: var(--color-text-dark-secondary)
    cursor: not-allowed
    opacity: 0.6
  
  // Experimental styling (when x-sign class is applied)
  &.x-sign
    text-shadow: 0 0 10px var(--sign-color1), 0 0 20px var(--sign-color2)
    will-change: filter, color
    filter: saturate(30%)
    animation: flicker steps(100) var(--interval) 1s infinite
    color: white
    font-family: var(--random-font-family)
.character-name-label
  cursor: pointer
  font-size: 1.2rem
  font-weight: 600
  color: var(--color-text-dark-secondary)
  vertical-align: top
  line-height: 0.6rem
  white-space: break-spaces
  
  &.experimental-label
    color: var(--color-highlight)

.x-background
  --interval: 13s
  background: linear-gradient(to right, var(--background-color1), var(--background-color2)) !important

.x-sign
  --interval: 1s
  display: block

.lowered
  padding: 1.5rem 1rem 1rem 1rem


@keyframes flicker
  50%
    color: white
    filter: saturate(200%) hue-rotate(20deg)
</style>
