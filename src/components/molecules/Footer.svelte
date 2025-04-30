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

  // Add a local store to track if equipment has been added
  const equipmentAdded = writable(false);
  
  // Add a flag to track if equipment has been added during this session
  let hasAddedEquipmentThisSession = false;

  // Add state for processing purchase
  const isProcessingPurchase = writable(false);

  // Add this after your store imports
  const storeMap = {
    'race': race,
    'background': background,
    'characterClass': characterClass,
    'characterSubClass': characterSubClass
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
    await createActorInGameAndEmbedItems();
    $isActorCreated = true;
  };

  const clickUpdateLevelUpHandler = async () => {
    window.GAS.log.d('[FOOTER] clickUpdateLevelUpHandler', $classUuidForLevelUp);

    await updateActorAndEmbedItems();
  };

  const clickUpdateHandler = async () => {
    
    if (!$hasCharacterCreationChanges) {
      return;
    }

    const confirmed = await Dialog.confirm({
      title: "Update",
      content:
        "You have advancements in progress, if you update the actor, any advancements related to the changes will be lost. Are you sure you want to update the actor?",
      yes: () => true,
      no: () => false,
      defaultYes: false,
    });

    if (!confirmed) {
      return;
    }

    // Close any open advancement dialogs first
    const currentProcess = get(dropItemRegistry).currentProcess;
    if (currentProcess?.app) {
      currentProcess.app.close();
    }

    // Remove only the items we're about to update from the queue
    for (const item of $changedCharacterCreationItems) {
      dropItemRegistry.remove(item.type);
    }

    for (const item of $changedCharacterCreationItems) {
      
      // Find the item on the actor that matches the type
      const actorItem = $actorInGame.items.find(i => i.type === item.type);

      // Delete the item from the actor (not the compendium)
      if (actorItem) {
        await actorItem.delete();
      }

      // Get the new item from the store
      const newStoreItem = get(storeMap[item.type]);
      if (newStoreItem) {
        // Add the new item to dropItemRegistry using splice to maintain order
        dropItemRegistry.splice({
          actor: $actorInGame,
          id: item.type,
          itemData: newStoreItem,
          isLevelUp: $isLevelUp,
          isNewMultiClass: item.type === "characterClass" ? $isNewMultiClass : undefined,
          hasAdvancementChoices: itemHasAdvancementChoices(newStoreItem),
          hasAdvancementsForLevel: isAdvancementsForLevelInItem(
            getLevelByDropType($actorInGame, item.type === "characterClass" ? "class" : item.type),
            newStoreItem
          ),
        });
      }
    }

    // Start processing the queue once all items are added
    dropItemRegistry.advanceQueue(true);
  };

  const createActorInGameAndEmbedItems = async () => {

    // Create the actor first
    $actorInGame = await Actor.create($actor.toObject());
    // window.GAS.log.d('[FOOTER] createActorInGameAndEmbedItems created actor', $actorInGame);

    // race
    if ($race && !$isLevelUp) {
      const raceData = $race;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "race",
        itemData: raceData,
        isLevelUp: $isLevelUp,
        hasAdvancementChoices: itemHasAdvancementChoices($race),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, $race),
          $race,
        ),
      });
      $preAdvancementSelections.race = $race;
    }
    
    // subrace
    if ($subRace && !$isLevelUp) {
      const subRaceData = $subRace;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "subRace",
        itemData: subRaceData,
        isLevelUp: $isLevelUp,
        hasAdvancementChoices: itemHasAdvancementChoices($subRace),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, $subRace),
          $subRace,
        ),
        });
      $preAdvancementSelections.subRace = $subRace;
    }
    
    if ($background && !$isLevelUp) {
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "background",
        itemData: $background,
        isLevelUp: $isLevelUp,
        hasAdvancementChoices: itemHasAdvancementChoices($background),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, $background),
          $background,
        ),
      });
      $preAdvancementSelections.background = $background;
    }

    if ($characterClass) {
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterClass",
        itemData: $characterClass,
        isLevelUp: $isLevelUp,
        isNewMultiClass: $isNewMultiClass,
        hasAdvancementChoices: itemHasAdvancementChoices($characterClass),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, "class"),
          $characterClass,
        ),
      });
      $preAdvancementSelections.class = $characterClass;
    }

    if ($characterSubClass) {
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterSubClass",
        itemData: $characterSubClass,
        isLevelUp: $isLevelUp,
        hasAdvancementChoices: itemHasAdvancementChoices($characterSubClass),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, "subclass"),
          $characterSubClass,
        ),
      });
      $preAdvancementSelections.subclass = $characterSubClass;
    }

    // window.GAS.log.d('[FOOTER] createActorInGameAndEmbedItems advancing queue with dropItemRegistry', $dropItemRegistry);

    await dropItemRegistry.advanceQueue(true);

  };

  const updateActorAndEmbedItems = async () => {
    window.GAS.log.d('[FOOTER] updateActorAndEmbedItems', $classUuidForLevelUp);

    await $actor.update({ name: actorName });

    $actorInGame = $actor;
    
    // Add the class level update to the queue
    if ($classUuidForLevelUp) {
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterClass",
        itemData: $levelUpClassObject,
        isLevelUp: $isLevelUp,
        isNewMultiClass: $isNewMultiClass,
      });
    }
    
    // Add the subclass to the queue if it exists
    if ($subClassUuidForLevelUp) {
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterSubClass",
        itemData: $levelUpSubClassObject,
        isLevelUp: $isLevelUp,
        hasAdvancementChoices: itemHasAdvancementChoices($levelUpSubClassObject),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, "subclass"),
          $levelUpSubClassObject,
        ),
      });
    }

    window.GAS.log.d('[FOOTER] updateActorAndEmbedItems advancing queue with dropItemRegistry', $dropItemRegistry);
    // Process the queue
    dropItemRegistry.advanceQueue(true);
  };

  $: value = $actor?.name || "";
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value;

  // Define valid tabs for footer visibility
  const FOOTER_TABS = ['race', 'class', 'background', 'abilities', 'equipment', 'level-up', 'shop'];
  const CHARACTER_CREATION_TABS = ['race', 'class', 'background', 'abilities'];

  // Handle adding equipment to the actor
  const handleAddEquipment = async () => {
    // Add selected equipment from flattenedSelections
    if ($actorInGame) {
      // Add all items that have a count > 0
      for (const [key, data] of Object.entries($flattenedSelections)) {
        if (data.count > 0) {
          const item = await fromUuid(data.key);
          if (item) {
            window.GAS.log.d('FOOTER | Pre-modification item:', {
              uuid: data.key,
              intendedQuantity: data.count,
              currentQuantity: item.system.quantity,
              item
            });

            // Create a copy of the item data
            const itemData = foundry.utils.deepClone(item);

            itemData.updateSource({ 
              "system.quantity": data.count
            });

            await dropItemOnCharacter($actorInGame, itemData);
          }
        }
      }

      // Check if equipment purchase is enabled
      const enableEquipmentPurchase = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
      if (enableEquipmentPurchase) {
        // Add Shop tab after equipment is added
        if (!$tabs.find(x => x.id === "shop")) {
          window.GAS.log.d('[FOOTER] Adding shop tab');
          tabs.update(t => [...t, { label: "Shop", id: "shop", component: "ShopTab" }]);
          
          // Switch to the Shop tab
          activeTab.set("shop");
          
          // Make the Equipment tab readonly, just like the earlier tabs became readonly when "Create Character" was clicked
          readOnlyTabs.update(current => [...current, "equipment"]);
          
          // Set available gold in shop store based on DnD5e version
          let goldValue;
          
          // Use the appropriate gold source based on DnD5e version
          if (window.GAS.dnd5eVersion === 4) {
            // For 5e v4, get gold from gold choices
            goldValue = get(totalGoldFromChoices);
            window.GAS.log.d('[FOOTER] Using totalGoldFromChoices for v4:', goldValue);
          } else {
            // For 5e v3, use goldRoll
            goldValue = $goldRoll;
            window.GAS.log.d('[FOOTER] Using goldRoll for v3:', goldValue);
          }
          
          // Convert gold to copper (1 gp = 100 cp)
          const goldValueInCopper = goldValue * 100;
          window.GAS.log.d('[FOOTER] Setting available gold for shop', goldValueInCopper);
          
          // Ensure we're updating both the local store and the global reference
          // This ensures proper synchronization between components
          if (window.GAS.availableGold) {
            window.GAS.availableGold.set(goldValueInCopper);
          }
          
          // Don't close the application yet, let the user shop first
          return;
        }
      } else {
        Hooks.call("gas.close");
      }
    }
    
    // Mark equipment as added
    equipmentAdded.set(true);
    hasAddedEquipmentThisSession = true;
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

  // Helper function to check actor inventory and update equipmentAdded
  function checkActorInventory(actor) {
    if (actor && actor.items && actor.items.size > 0) {
      const inventoryTypes = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
      const hasInventory = actor.items.some(item => inventoryTypes.includes(item.type));
      
      if (hasInventory) {
        // window.GAS.log.d('[FOOTER] Actor has inventory items, setting equipmentAdded to true');
        equipmentAdded.set(true);
      }
    }
  }
  
  // Check actor inventory when actorInGame changes
  $: if ($actorInGame) {
    // If equipment has already been added this session, don't change the flag
    if (!hasAddedEquipmentThisSession) {
      checkActorInventory($actorInGame);
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
    isProcessingPurchase.set(true);

    if (!$actorInGame) {
      ui.notifications.error("No active character found");
      isProcessingPurchase.set(false); // Reset on early exit
      return;
    }

    if ($cartTotalCost === 0) {
      ui.notifications.warn("Cart is empty");
      isProcessingPurchase.set(false); // Reset on early exit
      return;
    }

    if ($remainingGold < 0) {
      ui.notifications.error("Not enough gold for purchase");
      isProcessingPurchase.set(false); // Reset on early exit
      return;
    }

    try {
      const success = await finalizePurchase($actorInGame);
      
      if (success) {
        ui.notifications.info("Purchase completed successfully");
        // Close the Actor Studio window after successful purchase
        // No need to reset isProcessingPurchase here, as the tab becomes readonly
        setTimeout(() => {
          Hooks.call("gas.close");
        }, 1500);
      } else {
        ui.notifications.error("Failed to complete purchase");
        isProcessingPurchase.set(false); // Reset on failure
      }
    } catch (error) {
      console.error("Error during finalize purchase handling:", error);
      ui.notifications.error("An error occurred during purchase.");
      isProcessingPurchase.set(false); // Reset on error
    }
  }
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
                label {localize('Footer.CharacterName')}
              .flex2
                input.left(type="text" value="{value}" on:input="{handleNameInput}")
      
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
                  +else
                    +if("$hasCharacterCreationChanges")
                      button(
                        type="button"
                        role="button"
                        on:mousedown="{clickUpdateHandler}"
                      )
                        span {localize('Footer.UpdateCharacter')}
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
</style>
