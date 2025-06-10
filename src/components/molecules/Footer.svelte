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
    readOnlyTabs // Added missing import
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
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
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

  // Add a local store to track if equipment has been added
  const equipmentAdded = writable(false);
  
  // Add a flag to track if equipment has been added during this session
  let hasAddedEquipmentThisSession = false;

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
        equipmentAdded.set(true);
        hasAddedEquipmentThisSession = true;
      }
    });
  };

  // Derive whether equipment section is complete
  $: isEquipmentComplete = window.GAS.dnd5eVersion === 4 
    ? ($progress === 100 && $areGoldChoicesComplete) 
    : ($progress === 100 && $goldRoll > 0);
  
  // Debug log for button visibility condition
  $: {
    if ($activeTab === 'equipment') {
      // window.GAS.log.d('[FOOTER] Button visibility check:', {
      //   isEquipmentComplete,
      //   hasInventoryItems: $hasInventoryItems,
      //   equipmentAdded: $equipmentAdded,
      //   shouldShowButton: isEquipmentComplete && !$equipmentAdded
      // });
    }
  }

  // Check actor inventory when actorInGame changes
  $: if ($actorInGame) {
    // If equipment has already been added this session, don't change the flag
    if (!hasAddedEquipmentThisSession) {
      if (checkInventory($actorInGame)) {
        equipmentAdded.set(true);
      }
    }
  }
  
  // Reset equipmentAdded when tab changes to equipment
  $: if ($activeTab === 'equipment') {
    // If equipment has been added this session, keep the button hidden
    if (hasAddedEquipmentThisSession) {
      equipmentAdded.set(true);
    } 
    // Otherwise, check if the actor has inventory items
    else if (!$hasInventoryItems) {
      equipmentAdded.set(false);
    } else {
      equipmentAdded.set(true);
    }
    
    // window.GAS.log.d('[FOOTER] Tab changed to equipment:', {
    //   hasAddedEquipmentThisSession,
    //   hasInventoryItems: $hasInventoryItems,
    //   equipmentAdded: $equipmentAdded
    // });
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

  onMount(() => {
    const signs = document.querySelectorAll('.x-sign')
    const randomIn = (min, max) => (
      Math.floor(Math.random() * (max - min + 1) + min)
    )

    const mixupInterval = el => {
      const ms = randomIn(2000, 3000)
      el.style.setProperty('--interval', `${ms}ms`)
    }

    signs.forEach(el => {
      mixupInterval(el)
      el.addEventListener('webkitAnimationIteration', () => {
        mixupInterval(el)
      })
    })
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
                label.character-name-label {localize('Footer.CharacterName')}
              .flex2
                input.left.x-sign.character-name-input(type="text" value="{value}" on:input="{handleNameInput}")
      
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
            +if("isEquipmentComplete && !$equipmentAdded")
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
.character-name-input
  height: 51px
  padding: 1rem
  background: rgba(1, 1, 1, 0.1)
  font-size: xx-large
  font-family: var(--dnd5e-font-modesto)
.character-name-label
  font-size: 1.2rem
  font-weight: 600
  color: var(--color-text-dark-secondary)
  vertical-align: top
  line-height: 0.6rem
  white-space: break-spaces
  color: var(--color-highlight)

.x-sign
  --interval: 1s
  display: block
  text-shadow: 0 0 10px var(--color1), 0 0 20px var(--color2), 0 0 40px var(--color3), 0 0 80px var(--color4)
  will-change: filter, color
  filter: saturate(60%)
  animation: flicker steps(100) var(--interval) 1s infinite
  color: azure
  --color1: azure
  --color2: aqua
  --color3: dodgerblue
  --color4: blue

  color: lightyellow
  --color1: gold
  --color2: firebrick
  --color3: pink
  --color4: red
  font-family: 'Bad Script', Yellowtail

@keyframes flicker
  50%
    color: white
    filter: saturate(100%) hue-rotate(30deg)
</style>
