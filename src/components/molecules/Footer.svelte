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
    npcTabs,
    selectedNpcBase
  } from "~/src/stores/index";
  import { progress } from "~/src/stores/progress";
  import { npcSelectProgress } from "~/src/stores/npc";
  import { flattenedSelections } from "~/src/stores/equipmentSelections";
  import { flattenedStartingEquipment } from "~/src/stores/startingEquipment";
  import { goldChoices, totalGoldFromChoices, areGoldChoicesComplete } from "~/src/stores/goldChoices";
  import { shopCart, cartTotalCost, remainingGold, finalizePurchase } from '~/src/stores/equipmentShop';
  import { spellProgress, spellLimits, currentSpellCounts } from '~/src/stores/spellSelection';
  import { getLevelUpFSM, LEVELUP_EVENTS } from "~/src/helpers/LevelUpStateMachine";
  import { getWorkflowFSM, WORKFLOW_EVENTS } from "~/src/helpers/PC/WorkflowStateMachine";
  import { getNPCWorkflowFSM, NPC_WORKFLOW_EVENTS, npcWorkflowFSMContext } from "~/src/helpers/NPC/WorkflowStateMachine";
  
  import {
    getLevelByDropType,
    itemHasAdvancementChoices,
    isAdvancementsForLevelInItem,
    dropItemOnCharacter
  } from "~/src/helpers/Utility";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";
  import { abilityGenerationMethod } from "~/src/stores/index";
  import { itemsFromActor } from "~/src/stores/index";
  import { derived, writable } from "svelte/store";
  import { localize as t, getAndSetActorItems, updateSource } from "~/src/helpers/Utility";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";
  import { equipmentSelections } from "~/src/stores/equipmentSelections";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  

  // Import workflow functions
  import {
    createActorInGameAndEmbedItems as createActorWorkflow,
    updateActorLevelUpWorkflow,
    handleAddEquipment as addEquipmentWorkflow,
    handleFinalizePurchase as finalizePurchaseWorkflow,
    handleFinalizeSpells as finalizeSpellsWorkflow,
    checkActorInventory as checkInventory,
    handleCharacterUpdate as characterUpdateWorkflow,
    handleSkipSpellsLevelUp
  } from "~/src/lib/workflow";

  // Add a flag to track if equipment has been added during this session
  let hasAddedEquipmentThisSession = false;
  
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

  // Debug footer visibility
  $: {
    console.log('[FOOTER] Debug footer visibility:', {
      activeTab: $activeTab,
      isInFooterTabs: FOOTER_TABS.includes($activeTab),
      isNpcFlow,
      npcSelectProgress: $npcSelectProgress,
      shouldShowNpcFooter,
      shouldShow: FOOTER_TABS.includes($activeTab) || shouldShowNpcFooter,
      selectedNpcBase: $selectedNpcBase
    });
  }

  // Add state for processing purchase
  const isProcessingPurchase = writable(false);

  // Add state for processing spells
  const isProcessingSpells = writable(false);

  // Add state for processing feat spells
  const isProcessingFeatSpells = writable(false);

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
  let actorName = ""; // For NPC flow, default blank; PC flow still binds via value for name input
  
  // NPC flow helpers
  $: isNpcFlow = ['npc-select', 'npc-features', 'npc-create', 'npc-equipment-shop', 'magic-items', 'npc-biography'].includes($activeTab);
  $: npcProgress = $npcSelectProgress;
  $: npcNamePlaceholder = $selectedNpcBase?.name || '';
  $: shouldShowNpcFooter = isNpcFlow && $npcSelectProgress === 100;
  
  // Initialize actorName when selectedNpcBase changes
  $: if ($selectedNpcBase && !actorName) {
    actorName = $selectedNpcBase.name || '';
    console.log('[FOOTER] Initialized actorName with selected NPC:', actorName);
  }
  
  // Keep actorName in sync with the in-memory actor name
  $: if ($actor && $actor.name && $actor.name !== actorName) {
    actorName = $actor.name;
    console.log('[FOOTER] Synced actorName with actor name:', actorName);
  }

  async function goToNpcFeatures() {
    // Build in-memory NPC actor from selected base and embed its feature items
    try {
      console.log('[FOOTER] ====== GOING TO NPC FEATURES ======');
      console.log('[FOOTER] Selected NPC base:', $selectedNpcBase);
      console.log('[FOOTER] Current actorName:', actorName);
      console.log('[FOOTER] Current in-memory actor:', $actor);
      
      // build actor from selectedNpcBase
      console.log('[FOOTER] Calling getAndSetActorItems with:', { selectedNpcBase: $selectedNpcBase, actor: $actor, actorName });
      getAndSetActorItems($selectedNpcBase, $actor, actorName);
      
      console.log('[FOOTER] After getAndSetActorItems - actor name:', $actor?.name);
      console.log('[FOOTER] After getAndSetActorItems - actorName variable:', actorName);
      
      // Use the NPC state machine to handle progression
      const npcWorkflowFSM = getNPCWorkflowFSM();
      if (npcWorkflowFSM) {
        // Pass the context data when calling the event
        npcWorkflowFSM.handle(NPC_WORKFLOW_EVENTS.NPC_SELECTED, { 
          ...npcWorkflowFSMContext, 
          selectedNpcBase: $selectedNpcBase 
        });
      }
    } catch (err) {
      console.error('[FOOTER] ====== FAILED TO GO TO NPC FEATURES ======');
      console.error('[FOOTER] Error details:', err);
      console.error('[FOOTER] Error stack:', err.stack);
      window.GAS?.log?.e?.('[NPC] Failed to initialize in-memory actor', err);
    }
  }

  // Derived store to check if actor has items in inventory
  const hasInventoryItems = derived(actorInGame, ($actorInGame) => {
    if (!$actorInGame) return false;
    
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
  });

  const handleNameInput = (e) => {
    const newName = e.target.value;
    console.log('[FOOTER] handleNameInput called with:', newName);
    
    if ($isLevelUp) {
      //- @why: for existing actors, we need to update the actor object in the database
      actorName = newName;
      console.log('[FOOTER] Updated actorName for level up:', actorName);
    } else {
      //- @why: for new actors, we need to update the actor source object in memory,
      actorName = newName; // Update local variable first
      console.log('[FOOTER] Updated actorName for new actor:', actorName);
      
      if ($actor) {
        console.log('[FOOTER] Updating in-memory actor name to:', newName);
        updateSource($actor, { name: newName });
      } else {
        console.warn('[FOOTER] No actor available to update name');
      }
    }
  };
  const handleTokenNameInput = (e) => {
    if (!$actor.flags[MODULE_ID]) $actor.flags[MODULE_ID] = {};
    $actor.flags[MODULE_ID].tokenName = e.target.value;
  };
  //- Create Actor
  const clickCreateHandler = async () => {
    await createActorWorkflow({
      actor,
      stores: storeRefs,
      dropItemRegistry
    });
    $isActorCreated = true;
  };

  // Function to ensure module flags are saved before actor creation
  const ensureModuleFlagsSaved = async () => {
    try {
      // Check if the actor has any module flags that need to be saved
      if ($actor && $actor.flags && $actor.flags[MODULE_ID]) {
        console.log(`[${MODULE_ID}] Module flags found, ensuring they are saved:`, $actor.flags[MODULE_ID]);
        
        // Force a save of the current flags to ensure they are persisted
        await $actor.updateSource({
          [`flags.${MODULE_ID}`]: $actor.flags[MODULE_ID]
        });
        
        console.log(`[${MODULE_ID}] Module flags saved successfully`);
      } else {
        console.log(`[${MODULE_ID}] No module flags found, nothing to save`);
      }
    } catch (error) {
      console.error(`[${MODULE_ID}] Error saving module flags:`, error);
    }
  };

  //- Create NPC Actor
  const clickCreateNPCHandler = async () => {
    try {
      console.log('[FOOTER] ====== NPC CREATION STARTED ======');
      console.log('[FOOTER] Local actorName variable:', actorName);
      console.log('[FOOTER] In-memory actor object:', $actor);
      console.log('[FOOTER] In-memory actor name:', $actor?.name);
      console.log('[FOOTER] In-memory actor toObject():', $actor?.toObject());
      
      // Ensure module flags are saved before creating the actor
      await ensureModuleFlagsSaved();
      
      // Prepare the actor data with correct prototype token name
      const actorData = $actor.toObject();
      
      // Debug: Check if module flags are present
      console.log(`[${MODULE_ID}] Actor flags before toObject():`, $actor.flags);
      console.log(`[${MODULE_ID}] Actor data flags after toObject():`, actorData.flags);
      console.log(`[${MODULE_ID}] Module flags in actor data:`, actorData.flags?.[MODULE_ID]);
      
      // Ensure the prototype token name is set correctly
      if (actorData.prototypeToken) {
        actorData.prototypeToken.name = actorData.name;
        console.log('[FOOTER] Set prototypeToken.name to:', actorData.prototypeToken.name);
      } else {
        // Create prototypeToken if it doesn't exist
        actorData.prototypeToken = {
          name: actorData.name,
          actorLink: false,
          displayName: 20,
          displayBars: 20,
          bar1: { attribute: 'attributes.hp' },
          bar2: { attribute: null },
          disposition: -1,
          alpha: 1,
          height: 1,
          width: 1,
          lockRotation: true,
          rotation: 0,
          elevation: 0,
          light: { alpha: 0.5, angle: 0, bright: 0, coloration: 1, dim: 0, elevation: 0, intensity: 1, saturation: 0, shadows: 0, color: null, attenuation: 0.5, luminosity: 0.5, contrast: 0.25, saturation: 0.1, darkness: { min: 0, max: 1 } },
          detectionModes: [],
          flags: {}
        };
        console.log('[FOOTER] Created prototypeToken with name:', actorData.prototypeToken.name);
      }
      
      console.log('[FOOTER] Final actor data for creation:', actorData);
      
      // Create the NPC actor in the game
      console.log('[FOOTER] Calling Actor.create with:', actorData);
      const createdActor = await Actor.create(actorData);
      
      console.log('[FOOTER] Actor created successfully:', createdActor);
      console.log('[FOOTER] Created actor name:', createdActor.name);
      console.log('[FOOTER] Created actor ID:', createdActor.id);
      console.log('[FOOTER] Created actor prototypeToken name:', createdActor.prototypeToken?.name);
      
      // Set the actor in the game store
      actorInGame.set(createdActor);
      
      // Mark as created
      $isActorCreated = true;
      
      // Show success notification
      ui.notifications?.info(`NPC "${createdActor.name}" created successfully!`);
      
      // Close the application after a short delay
      setTimeout(() => {
        console.log('[FOOTER] Closing NPC creation application');
        Hooks.call("gas.close");
      }, 1500);
      
    } catch (error) {
      console.error('[FOOTER] ====== NPC CREATION FAILED ======');
      console.error('[FOOTER] Error details:', error);
      console.error('[FOOTER] Error stack:', error.stack);
      window.GAS?.log?.e?.('[FOOTER] Failed to create NPC actor:', error);
      ui.notifications?.error(`Failed to create NPC: ${error.message}`);
    }
  };

  //- Advance from Features to Creation tab
  const goToNpcCreation = async () => {
    try {
      // Simply set the active tab to npc-create
      activeTab.set('npc-create');
    } catch (err) {
      window.GAS?.log?.e?.('[FOOTER] Failed to advance to NPC creation tab', err);
    }
  };

  //- Advance from Creation to Equipment tab
  const goToNpcEquipment = async () => {
    try {
      // Simply set the active tab to npc-equipment-shop
      activeTab.set('npc-equipment-shop');
    } catch (err) {
      window.GAS?.log?.e?.('[FOOTER] Failed to advance to NPC equipment tab', err);
    }
  };

  //- Advance from Equipment to Magic Items tab
  const goToMagicItems = async () => {
    try {
      // Simply set the active tab to magic-items
      activeTab.set('magic-items');
    } catch (err) {
      window.GAS?.log?.e?.('[FOOTER] Failed to advance to NPC magic items tab', err);
    }
  };

  //- Advance from Magic Items to Biography tab
  const goToBiography = async () => {
    try {
      // Simply set the active tab to npc-biography
      activeTab.set('npc-biography');
    } catch (err) {
      window.GAS?.log?.e?.('[FOOTER] Failed to advance to NPC biography tab', err);
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

  $: value = $actor?.name || "";
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value;

  // Define valid tabs for footer visibility
  const FOOTER_TABS = ['race', 'class', 'background', 'abilities', 'equipment', 'level-up', 'shop', 'spells', 'magic-items'];
  const CHARACTER_CREATION_TABS = ['race', 'class', 'background', 'abilities'];

  // Handle adding equipment to the actor
  const handleAddEquipment = async () => {
    await addEquipmentWorkflow({
      stores: storeRefs,
      actorInGame,
      onEquipmentAdded: () => {
        hasAddedEquipmentThisSession = true;
        window.GAS.log.d('[FOOTER] Equipment added to actor');
      }
    });
  };

  // Derive whether equipment section is complete
  $: isEquipmentComplete = window.GAS.dnd5eVersion >= 4 
    ? ($progress === 100 && $areGoldChoicesComplete) 
    : ($progress === 100 && $goldRoll > 0);
  
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
  $: if ($actorInGame) {
    // If equipment has already been added this session, don't change the flag
    if (!hasAddedEquipmentThisSession) {
              if (checkInventory($actorInGame)) {
          // Actor already has inventory items
          window.GAS.log.d('[FOOTER] Actor already has inventory items');
        }
    }
  }

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

  onMount(() => {
    // Only apply experimental animations if enabled
    if (experimentalStylingEnabled) {
      const signs = document.querySelectorAll('.x-sign')
      const backgrounds = document.querySelectorAll('.x-background')
      const randomIn = (min, max) => (
        Math.floor(Math.random() * (max - min + 1) + min)
      )

      const mixupInterval = (el, val1, val2) => {
        const ms = randomIn(val1, val2)
        el.style.setProperty('--interval', `${ms}ms`)
      }

      // Store handler references for cleanup
      const signHandlers = [];
      signs.forEach(el => {
        mixupInterval(el, 2000, 3000)
        const handler = () => {
          mixupInterval(el, 2000, 3000)
        };
        el.addEventListener('webkitAnimationIteration', handler);
        signHandlers.push({ el, handler });
      })
      // backgrounds.forEach(el => {
      //   mixupInterval(el, 10000, 10001)
      //   el.addEventListener('webkitAnimationIteration', () => {
      //     mixupInterval(el, 10000, 10001)
      //   })
      // })

      randomize(); // Call randomize on mount

      // Cleanup listeners on destroy
      onDestroy(() => {
        signHandlers.forEach(({ el, handler }) => {
          el.removeEventListener('webkitAnimationIteration', handler);
        });
      });
    }
  });
</script>

<template lang="pug">
.footer-container
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
                    value="{value}" 
                    on:input="{handleNameInput}"
                    disabled="{$isActorCreated}"
                  )
      
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
              
        +if("CHARACTER_CREATION_TABS.includes($activeTab)")
          .progress-container
            +if("$readOnlyTabs.includes($activeTab)")
              ProgressBar(progress="{100}")
              +else()
                ProgressBar(progress="{progress}")
                +if("$progress === 100")
                  .button-container
                    +if("!$isActorCreated")
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

        // NPC flow footer rendering - ALWAYS SHOW
        +if("$activeTab === 'npc-select'")
          .progress-container
            .flexrow.gap-10
              .flex2
                .character-name-input-container
                  input.left.character-name-input(
                    type="text"
                    placeholder="{npcNamePlaceholder}"
                    value="{actorName}"
                    on:input="{handleNameInput}"
                  )
              .flex1
                ProgressBar(progress="{npcProgress}")
                .button-container
                  +if("npcProgress === 100")
                    button.mt-xs.wide(
                      type="button"
                      role="button"
                      on:mousedown="{goToNpcFeatures}"
                    )
                      span {t('Footer.Next')}
                      i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'npc-features'")
          .progress-container
            .flexrow.gap-10
              .flex2
                .character-name-input-container
                  input.left.character-name-input(
                    type="text"
                    placeholder="{npcNamePlaceholder}"
                    value="{actorName}"
                    on:input="{handleNameInput}"
                  )
              .flex1
                ProgressBar(progress="{npcProgress}")
                .button-container
                  button.mt-xs.wide(
                    type="button"
                    role="button"
                    on:mousedown="{goToNpcCreation}"
                  )
                    span {t('Footer.Next')}
                    i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'npc-create'")
          .progress-container
            .flexrow.gap-10
              .flex2
                .character-name-input-container
                  input.left.character-name-input(
                    type="text"
                    placeholder="{npcNamePlaceholder}"
                    value="{actorName}"
                    on:input="{handleNameInput}"
                  )
              .flex1
                ProgressBar(progress="{npcProgress}")
                .button-container
                  button.mt-xs.wide(
                    type="button"
                    role="button"
                    on:mousedown="{goToNpcEquipment}"
                  )
                    span {t('Footer.Next')}
                    i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'npc-equipment-shop'")
          .progress-container
            .flexrow.gap-10
              .flex2
                .character-name-input-container
                  input.left.character-name-input(
                    type="text"
                    placeholder="{npcNamePlaceholder}"
                    value="{actorName}"
                    on:input="{handleNameInput}"
                  )
              .flex1
                ProgressBar(progress="{npcProgress}")
                .button-container
                  button.mt-xs.wide(
                    type="button"
                    role="button"
                    on:mousedown="{goToMagicItems}"
                  )
                    span {t('Footer.Next')}
                    i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'magic-items'")
          .progress-container
            .flexrow.gap-10
              .flex2
                .character-name-input-container
                  input.left.character-name-input(
                    type="text"
                    placeholder="{npcNamePlaceholder}"
                    value="{actorName}"
                    on:input="{handleNameInput}"
                  )
              .flex1
                ProgressBar(progress="{npcProgress}")
                .button-container
                  button.mt-xs.wide(
                    type="button"
                    role="button"
                    on:mousedown="{goToBiography}"
                  )
                    span {t('Footer.Next')}
                    i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'npc-biography'")
          .progress-container
            .flexrow.gap-10
              .flex2
                .character-name-input-container
                  input.left.character-name-input(
                    type="text"
                    placeholder="{npcNamePlaceholder}"
                    value="{actorName}"
                    on:input="{handleNameInput}"
                  )
              .flex1
                ProgressBar(progress="{npcProgress}")
                .button-container
                  button.mt-xs.wide(
                    type="button"
                    role="button"
                    on:mousedown="{clickCreateNPCHandler}"
                  )
                    span {t('Footer.CreateNPC')}
                    i.right.ml-md(class="fas fa-check")

</template>

<style lang="sass">
.test-footer
  background: #ff0000
  color: white
  padding: 2rem
  margin: 1rem
  border: 5px solid #ff0000
  border-radius: 10px
  font-size: 20px
  font-weight: bold
  text-align: center

  p
    margin: 0.5rem 0

.footer-container
  display: block
  width: 100%
  padding: 1rem
  background: rgba(0, 0, 0, 0.1)
  border-top: 1px solid rgba(255, 255, 255, 0.1)
  margin-top: auto

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
