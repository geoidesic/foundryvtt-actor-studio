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
    readOnlyTabs
  } from "~/src/stores/index";
  import { progress } from "~/src/stores/progress";
  import { flattenedSelections } from "~/src/stores/equipmentSelections";
  import { flattenedStartingEquipment } from "~/src/stores/startingEquipment";
  import { goldChoices, totalGoldFromChoices, areGoldChoicesComplete } from "~/src/stores/goldChoices";
  import { shopCart, cartTotalCost, remainingGold, finalizePurchase } from '~/src/stores/equipmentShop';
  
  import {
    getLevelByDropType,
    itemHasAdvancementChoices,
    isAdvancementsForLevelInItem,
    dropItemOnCharacter
  } from "~/src/helpers/Utility";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";
  import { abilityGenerationMethod } from "~/src/stores/index";
  import { derived, writable } from "svelte/store";
  import { localize } from "~/src/helpers/Utility";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";
  import { equipmentSelections } from "~/src/stores/equipmentSelections";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  
  // Import workflow functions
  import {
    createActorInGameAndEmbedItems as createActorWorkflow,
    updateActorAndEmbedItems as updateActorWorkflow,
    handleAddEquipment as addEquipmentWorkflow,
    handleFinalizePurchase as finalizePurchaseWorkflow,
    checkActorInventory as checkInventory,
    handleCharacterUpdate as characterUpdateWorkflow
  } from "~/src/lib/workflow";

  // Add a flag to track if equipment has been added during this session
  let hasAddedEquipmentThisSession = false;
  
  // Debug logging for button visibility
  $: {
    if ($activeTab === 'equipment') {
      window.GAS.log.d('[FOOTER] Equipment button visibility check:', {
        isEquipmentComplete,
        equipmentReadonly: $readOnlyTabs.includes('equipment'),
        shouldShowButton: isEquipmentComplete && !$readOnlyTabs.includes('equipment')
      });
    }
  }

  // Add state for processing purchase
  const isProcessingPurchase = writable(false);

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
    if ($isLevelUp) {
      //- @why: for existing actors, we need to update the actor object in the database
      actorName = e.target.value;
    } else {
      //- @why: for new actors, we need to update the actor source object in memory,
      $actor.updateSource({ name: e.target.value });
    }
  };
  const handleTokenNameInput = (e) => {
    if (!$actor.flags[MODULE_ID]) $actor.flags[MODULE_ID] = {};
    $actor.flags[MODULE_ID].tokenName = e.target.value;
  };

  const clickCreateHandler = async () => {
    await createActorWorkflow({
      actor,
      stores: storeRefs,
      dropItemRegistry
    });
    $isActorCreated = true;
  };

  const clickUpdateLevelUpHandler = async () => {
    window.GAS.log.d('[FOOTER] clickUpdateLevelUpHandler', $classUuidForLevelUp);
    
    await updateActorWorkflow({
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
  const FOOTER_TABS = ['race', 'class', 'background', 'abilities', 'equipment', 'level-up', 'shop'];
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

      signs.forEach(el => {
        mixupInterval(el, 2000, 3000)
        el.addEventListener('webkitAnimationIteration', () => {
          mixupInterval(el, 2000, 3000)
        })
      })
      // backgrounds.forEach(el => {
      //   mixupInterval(el, 10000, 10001)
      //   el.addEventListener('webkitAnimationIteration', () => {
      //     mixupInterval(el, 10000, 10001)
      //   })
      // })

      randomize(); // Call randomize on mount
    }
  });
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
                ) {localize('Footer.CharacterName')}
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
        +if("$isLevelUp")
          .progress-container
            ProgressBar(progress="{levelUpProgress}")
            +if("$levelUpProgress === 100")
              .button-container
                button(
                  disabled="{!$classUuidForLevelUp}"
                  type="button"
                  role="button"
                  on:mousedown="{clickUpdateLevelUpHandler}"
                  data-tooltip="{$classUuidForLevelUp ? '' : 'First select a class to level up, or a multi-class to add'}"
                )
                  span {localize('Footer.AddLevel')}
                  i.right.ml-md(class="fas fa-chevron-right")
        
        +if("$activeTab === 'equipment'")
          .progress-container
            ProgressBar(progress="{progress}")
            +if("isEquipmentComplete && !$readOnlyTabs.includes('equipment')")
              .button-container
                button.mt-xs(
                  type="button"
                  role="button"
                  on:mousedown="{handleAddEquipment}"
                )
                  span {localize('Footer.AddEquipment')}
                  i.right.ml-md(class="fas fa-chevron-right")

        +if("$activeTab === 'shop'")
          .progress-container
            .button-container
              button.mt-xs(
                type="button"
                role="button"
                on:mousedown="{handleFinalizePurchase}"
                disabled="{$isProcessingPurchase || $readOnlyTabs.includes('shop')}" 
              )
                span {localize('Footer.FinalizePurchase')}
                i.right.ml-md(class="fas fa-chevron-right")
              
        +if("CHARACTER_CREATION_TABS.includes($activeTab)")
          .progress-container
            ProgressBar(progress="{progress}")
            +if("$progress === 100")
              .button-container
                +if("!$isActorCreated")
                  button.mt-xs(
                    type="button"
                    role="button"
                    on:mousedown="{clickCreateHandler}"
                  )
                    span {localize('Footer.CreateCharacter')}
                    i.right.ml-md(class="fas fa-chevron-right")

                  +else
                    +if("$hasCharacterCreationChanges")
                      button(
                        type="button"
                        role="button"
                        on:mousedown="{clickUpdateHandler}"
                      )
                        span {localize('Footer.UpdateCharacter')}
                        i.right.ml-md(class="fas fa-chevron-right")

</template>

<style lang="sass">
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

.character-name-input
  border: none
  background: none
  height: auto
  line-height: normal
  padding: 0
  margin: 0
  color: inherit
  font-family: inherit
  
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
