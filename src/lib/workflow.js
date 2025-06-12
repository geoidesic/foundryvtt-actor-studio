/**
 * Character creation and management workflows
 * Contains non-reactive logic that can be shared across components
 */

import { get } from "svelte/store";
import { MODULE_ID } from "~/src/helpers/constants";
import {
  getLevelByDropType,
  itemHasAdvancementChoices,
  isAdvancementsForLevelInItem,
  dropItemOnCharacter
} from "~/src/helpers/Utility";

/**
 * Creates a new actor in the game world and embeds all selected items
 * @param {Object} params - Parameters object
 * @param {Object} params.actor - The actor document to create
 * @param {Object} params.stores - Store references
 * @param {Object} params.dropItemRegistry - Drop item registry for queuing items
 * @returns {Promise<Object>} The created actor
 */
export async function createActorInGameAndEmbedItems({
  actor,
  stores,
  dropItemRegistry
}) {
  const {
    race,
    subRace,
    background,
    characterClass,
    characterSubClass,
    isLevelUp,
    preAdvancementSelections,
    actorInGame
  } = stores;

  // Create the actor first
  const createdActor = await Actor.create(get(actor).toObject());
  actorInGame.set(createdActor);

  const $race = get(race);
  const $subRace = get(subRace);
  const $background = get(background);
  const $characterClass = get(characterClass);
  const $characterSubClass = get(characterSubClass);
  const $isLevelUp = get(isLevelUp);
  const $preAdvancementSelections = get(preAdvancementSelections);

  // Add race
  if ($race && !$isLevelUp) {
    dropItemRegistry.add({
      actor: createdActor,
      id: "race",
      itemData: $race,
      isLevelUp: $isLevelUp,
      hasAdvancementChoices: itemHasAdvancementChoices($race),
      hasAdvancementsForLevel: isAdvancementsForLevelInItem(
        getLevelByDropType(createdActor, $race),
        $race,
      ),
    });
    preAdvancementSelections.update(prev => ({ ...prev, race: $race }));
  }
  
  // Add subrace
  if ($subRace && !$isLevelUp) {
    dropItemRegistry.add({
      actor: createdActor,
      id: "subRace",
      itemData: $subRace,
      isLevelUp: $isLevelUp,
      hasAdvancementChoices: itemHasAdvancementChoices($subRace),
      hasAdvancementsForLevel: isAdvancementsForLevelInItem(
        getLevelByDropType(createdActor, $subRace),
        $subRace,
      ),
    });
    preAdvancementSelections.update(prev => ({ ...prev, subRace: $subRace }));
  }
  
  // Add background
  if ($background && !$isLevelUp) {
    dropItemRegistry.add({
      actor: createdActor,
      id: "background",
      itemData: $background,
      isLevelUp: $isLevelUp,
      hasAdvancementChoices: itemHasAdvancementChoices($background),
      hasAdvancementsForLevel: isAdvancementsForLevelInItem(
        getLevelByDropType(createdActor, $background),
        $background,
      ),
    });
    preAdvancementSelections.update(prev => ({ ...prev, background: $background }));
  }

  // Add character class
  if ($characterClass) {
    dropItemRegistry.add({
      actor: createdActor,
      id: "characterClass",
      itemData: $characterClass,
      isLevelUp: $isLevelUp,
      isNewMultiClass: get(stores.isNewMultiClass),
      hasAdvancementChoices: itemHasAdvancementChoices($characterClass),
      hasAdvancementsForLevel: isAdvancementsForLevelInItem(
        getLevelByDropType(createdActor, "class"),
        $characterClass,
      ),
    });
    preAdvancementSelections.update(prev => ({ ...prev, class: $characterClass }));
  }

  // Add character subclass
  if ($characterSubClass) {
    dropItemRegistry.add({
      actor: createdActor,
      id: "characterSubClass",
      itemData: $characterSubClass,
      isLevelUp: $isLevelUp,
      hasAdvancementChoices: itemHasAdvancementChoices($characterSubClass),
      hasAdvancementsForLevel: isAdvancementsForLevelInItem(
        getLevelByDropType(createdActor, "subclass"),
        $characterSubClass,
      ),
    });
    preAdvancementSelections.update(prev => ({ ...prev, subclass: $characterSubClass }));
  }

  await dropItemRegistry.advanceQueue(true);
  return createdActor;
}

/**
 * Updates an existing actor for level up and embeds new items
 * @param {Object} params - Parameters object
 * @param {Object} params.actor - The actor document to update
 * @param {string} params.actorName - New name for the actor
 * @param {Object} params.stores - Store references
 * @param {Object} params.dropItemRegistry - Drop item registry for queuing items
 * @returns {Promise<void>}
 */
export async function updateActorAndEmbedItems({
  actor,
  actorName,
  stores,
  dropItemRegistry
}) {
  const {
    classUuidForLevelUp,
    levelUpClassObject,
    subClassUuidForLevelUp,
    levelUpSubClassObject,
    isLevelUp,
    isNewMultiClass,
    actorInGame
  } = stores;

  window.GAS.log.d('[WORKFLOW] updateActorAndEmbedItems', get(classUuidForLevelUp));

  await get(actor).update({ name: actorName });
  actorInGame.set(get(actor));
  
  const $classUuidForLevelUp = get(classUuidForLevelUp);
  const $subClassUuidForLevelUp = get(subClassUuidForLevelUp);
  const $levelUpClassObject = get(levelUpClassObject);
  const $levelUpSubClassObject = get(levelUpSubClassObject);
  const $isLevelUp = get(isLevelUp);
  const $isNewMultiClass = get(isNewMultiClass);
  
  // Add the class level update to the queue
  if ($classUuidForLevelUp) {
    dropItemRegistry.add({
      actor: get(actor),
      id: "characterClass",
      itemData: $levelUpClassObject,
      isLevelUp: $isLevelUp,
      isNewMultiClass: $isNewMultiClass,
    });
  }
  
  // Add the subclass to the queue if it exists
  if ($subClassUuidForLevelUp) {
    dropItemRegistry.add({
      actor: get(actor),
      id: "characterSubClass",
      itemData: $levelUpSubClassObject,
      isLevelUp: $isLevelUp,
      hasAdvancementChoices: itemHasAdvancementChoices($levelUpSubClassObject),
      hasAdvancementsForLevel: isAdvancementsForLevelInItem(
        getLevelByDropType(get(actor), "subclass"),
        $levelUpSubClassObject,
      ),
    });
  }

  window.GAS.log.d('[WORKFLOW] updateActorAndEmbedItems advancing queue');
  dropItemRegistry.advanceQueue(true);
}

/**
 * Handles adding equipment to the actor
 * @param {Object} params - Parameters object  
 * @param {Object} params.stores - Store references
 * @param {Object} params.actorInGame - The actor to add equipment to
 * @param {Function} params.onEquipmentAdded - Callback when equipment is added
 * @returns {Promise<void>}
 */
export async function handleAddEquipment({
  stores,
  actorInGame,
  onEquipmentAdded
}) {
  const {
    flattenedSelections,
    tabs,
    activeTab,
    readOnlyTabs,
    totalGoldFromChoices,
    goldRoll
  } = stores;

  const $actorInGame = get(actorInGame);
  const $flattenedSelections = get(flattenedSelections);
  
  if ($actorInGame) {
    // Add all items that have a count > 0
    for (const [key, data] of Object.entries($flattenedSelections)) {
      if (data.count > 0) {
        const item = await fromUuid(data.key);
        if (item) {
          window.GAS.log.d('WORKFLOW | Pre-modification item:', {
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
      if (!get(tabs).find(x => x.id === "shop")) {
        window.GAS.log.d('[WORKFLOW] Adding shop tab');
        tabs.update(t => [...t, { label: "Shop", id: "shop", component: "ShopTab" }]);
        
        // Switch to the Shop tab
        activeTab.set("shop");
        
        // Make the Equipment tab readonly
        readOnlyTabs.update(current => [...current, "equipment"]);
        
        // Set available gold in shop store based on DnD5e version
        let goldValue;
        
        // Use the appropriate gold source based on DnD5e version
        if (window.GAS.dnd5eVersion >= 4) {
          goldValue = get(totalGoldFromChoices);
          window.GAS.log.d('[WORKFLOW] Using totalGoldFromChoices for v4:', goldValue);
        } else {
          goldValue = get(goldRoll);
          window.GAS.log.d('[WORKFLOW] Using goldRoll for v3:', goldValue);
        }
        
        // Convert gold to copper (1 gp = 100 cp)
        const goldValueInCopper = goldValue * 100;
        window.GAS.log.d('[WORKFLOW] Setting available gold for shop', goldValueInCopper);
        
        // Ensure we're updating both the local store and the global reference
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
  
  // Call the callback to mark equipment as added
  if (onEquipmentAdded) {
    onEquipmentAdded();
  }
}

/**
 * Handles finalizing purchases in the shop
 * @param {Object} params - Parameters object
 * @param {Object} params.stores - Store references
 * @param {Function} params.setProcessing - Function to set processing state
 * @returns {Promise<void>}
 */
export async function handleFinalizePurchase({
  stores,
  setProcessing
}) {
  const {
    actorInGame,
    cartTotalCost,
    remainingGold,
    finalizePurchase
  } = stores;

  const $actorInGame = get(actorInGame);
  const $cartTotalCost = get(cartTotalCost);
  const $remainingGold = get(remainingGold);

  // Prevent multiple clicks
  if (setProcessing) {
    setProcessing(true);
  }


  if (!$actorInGame) {
    ui.notifications.error("No active character found");
    if (setProcessing) setProcessing(false);
    return;
  }

  if ($cartTotalCost === 0) {
    ui.notifications.warn("Cart is empty");
    if (setProcessing) setProcessing(false);
    return;
  }

  if ($remainingGold < 0) {
    ui.notifications.error("Not enough gold for purchase");
    if (setProcessing) setProcessing(false);
    return;
  }

  window.GAS.log.d('[WORKFLOW] finalizePurchase', finalizePurchase);
  try {
    var success = await finalizePurchase($actorInGame);
    window.GAS.log.d('[WORKFLOW] Purchase finalized successfully:', success);
  } catch (error) {
    setProcessing(true);
    console.trace();
    console.error("Error during finalize purchase:", error);
    ui.notifications.error("An error occurred during purchase.");
  }
    
  try {
    if (success) {
      ui.notifications.info("Purchase completed successfully");
      // Close the Actor Studio window after successful purchase
      setTimeout(() => {
        Hooks.call("gas.close");
      }, 1500);
    } else {
      ui.notifications.error("Failed to complete purchase");
      if (setProcessing) setProcessing(false);
    }
  } catch (error) {
    setProcessing(true);
    console.trace();
    console.error("Error handling finalize purchase result:", error);
    ui.notifications.error("An error occurred while processing the purchase result.");
  }
}

/**
 * Checks if an actor has inventory items and returns the result
 * @param {Object} actor - The actor to check
 * @returns {boolean} True if actor has inventory items
 */
export function checkActorInventory(actor) {
  if (actor && actor.items && actor.items.size > 0) {
    const inventoryTypes = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
    return actor.items.some(item => inventoryTypes.includes(item.type));
  }
  return false;
}

/**
 * Handles the character update workflow with confirmation dialog
 * @param {Object} params - Parameters object
 * @param {Object} params.stores - Store references  
 * @param {Object} params.dropItemRegistry - Drop item registry
 * @returns {Promise<void>}
 */
export async function handleCharacterUpdate({
  stores,
  dropItemRegistry
}) {
  const {
    hasCharacterCreationChanges,
    changedCharacterCreationItems,
    actorInGame,
    isLevelUp,
    isNewMultiClass
  } = stores;

  const $hasCharacterCreationChanges = get(hasCharacterCreationChanges);
  const $changedCharacterCreationItems = get(changedCharacterCreationItems);
  const $actorInGame = get(actorInGame);
  const $isLevelUp = get(isLevelUp);
  const $isNewMultiClass = get(isNewMultiClass);
  
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

  // Store map for getting updated items
  const storeMap = {
    'race': stores.race,
    'background': stores.background,
    'characterClass': stores.characterClass,
    'characterSubClass': stores.characterSubClass
  };

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
}
