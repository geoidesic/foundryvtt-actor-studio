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
 * Checks if an actor is a spellcaster by examining their classes and spellcasting capabilities
 * @param {Object} actor - The actor document to check
 * @returns {boolean} True if the actor is a spellcaster, false otherwise
 */
function checkIfSpellcaster(actor) {
  window.GAS.log.t('[WORKFLOW] Checking if actor is a spellcaster:', actor?.id);
  if (!actor) {
    window.GAS.log.w('[WORKFLOW] No actor found');
    return false;
  }
  
  const actorData = actor.system || actor.data?.data;
  if (!actorData) {
    window.GAS.log.w('[WORKFLOW] No actor data found');
    return false;
  }
  
  window.GAS.log.t('[WORKFLOW] Actor data found:', actorData);
  
  // Method 1: Check if the actor has spell slots in their system data
  if (actorData.spells && Object.keys(actorData.spells).length > 0) {
    window.GAS.log.t('[WORKFLOW] Actor has spell slots in system.spells');
    return true;
  }
  
  // Method 2: Check if actor has spellcasting progression
  if (actorData.spellcasting && Object.keys(actorData.spellcasting).length > 0) {
    window.GAS.log.t('[WORKFLOW] Actor has spellcasting progression');
    return true;
  }
  
  // Method 3: Check class items for spellcasting advancement
  if (actor.items) {
    const classItems = actor.items.filter(item => item.type === 'class');
    window.GAS.log.t('[WORKFLOW] Found class items:', classItems.length);
    
    for (const classItem of classItems) {
      const classData = classItem.system || classItem.data?.data;
      if (!classData) continue;
      
      // Check if class has spellcasting advancement
      if (classData.advancement) {
        const hasSpellcasting = classData.advancement.some(advancement => 
          advancement.type === 'Spellcasting' || 
          advancement.type === 'SpellSlots'
        );
        
        if (hasSpellcasting) {
          window.GAS.log.t(`[WORKFLOW] Class ${classItem.name} has spellcasting advancement`);
          return true;
        }
      }
      
      // Check for spell progression in class data
      if (classData.spellcasting && classData.spellcasting.progression !== 'none') {
        window.GAS.log.t(`[WORKFLOW] Class ${classItem.name} has spellcasting progression:`, classData.spellcasting.progression);
        return true;
      }
    }
  }
  
  // Method 4: Check if actor has any spell items
  if (actor.items) {
    const spellItems = actor.items.filter(item => item.type === 'spell');
    if (spellItems.length > 0) {
      window.GAS.log.t('[WORKFLOW] Actor has spell items:', spellItems.length);
      return true;
    }
  }
  
  // Method 5: Check known spellcasting classes by name
  const knownSpellcasters = [
    'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
    'artificer', 'eldritch knight', 'arcane trickster'
  ];
  
  if (actorData.classes && Object.keys(actorData.classes).length > 0) {
    for (const [classId, classData] of Object.entries(actorData.classes)) {
      const className = classId.toLowerCase();
      if (knownSpellcasters.some(spellcaster => className.includes(spellcaster))) {
        window.GAS.log.t(`[WORKFLOW] Recognized spellcasting class: ${classId}`);
        return true;
      }
    }
  }
  
  window.GAS.log.t('[WORKFLOW] No spellcasting detected for actor');
  return false;
}

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

  window.GAS.log.t('[WORKFLOW] updateActorAndEmbedItems', get(classUuidForLevelUp));

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

  window.GAS.log.t('[WORKFLOW] updateActorAndEmbedItems advancing queue');
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
          window.GAS.log.t('WORKFLOW | Pre-modification item:', {
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
    
    // Handle equipment purchase if enabled
    if (enableEquipmentPurchase && !get(tabs).find(x => x.id === "shop")) {
      window.GAS.log.t('[WORKFLOW] Adding shop tab');
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
        window.GAS.log.t('[WORKFLOW] Using totalGoldFromChoices for v4:', goldValue);
      } else {
        goldValue = get(goldRoll);
        window.GAS.log.t('[WORKFLOW] Using goldRoll for v3:', goldValue);
      }
      
      // Convert gold to copper (1 gp = 100 cp)
      const goldValueInCopper = goldValue * 100;
      window.GAS.log.t('[WORKFLOW] Setting available gold for shop', goldValueInCopper);
      
      // Ensure we're updating both the local store and the global reference
      if (window.GAS.availableGold) {
        window.GAS.availableGold.set(goldValueInCopper);
      }
      
      // Don't close the application yet, let the user shop first
      return;
    }
    window.GAS.log.t('[WORKFLOW] Equipment purchase not enabled or shop tab already exists');
    // Check if character is a spellcaster and add Spells tab if needed
    const isSpellcaster = checkIfSpellcaster($actorInGame);
    if (isSpellcaster && !get(tabs).find(x => x.id === "spells")) {
      window.GAS.log.t('[WORKFLOW] Adding spells tab for spellcaster');
      tabs.update(t => [...t, { label: "Spells", id: "spells", component: "Spells" }]);
      
      // Switch to the Spells tab
      activeTab.set("spells");
      
      // Initialize spell selection with the actor
      if (window.GAS.initializeSpellSelection) {
        window.GAS.initializeSpellSelection($actorInGame);
      }
      
      // Don't close the application yet, let the user select spells first
      return;
    }
    
    // If we reach here, no additional steps are needed - close the application
    // Hooks.call("gas.close");
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

  window.GAS.log.t('[WORKFLOW] finalizePurchase', finalizePurchase);
  try {
    var success = await finalizePurchase($actorInGame);
    window.GAS.log.t('[WORKFLOW] Purchase finalized successfully:', success);
  } catch (error) {
    setProcessing(true);
    console.trace();
    console.error("Error during finalize purchase:", error);
    ui.notifications.error("An error occurred during purchase.");
  }
    
  try {
    if (success) {
      ui.notifications.info("Purchase completed successfully");
      
      // Check if character is a spellcaster and add Spells tab if needed
      const isSpellcaster = checkIfSpellcaster($actorInGame);
      if (isSpellcaster && !get(stores.tabs).find(x => x.id === "spells")) {
        window.GAS.log.t('[WORKFLOW] Adding spells tab after successful purchase');
        stores.tabs.update(t => [...t, { label: "Spells", id: "spells", component: "Spells" }]);
        
        // Switch to the Spells tab
        stores.activeTab.set("spells");
        
        // Initialize spell selection with the actor
        if (window.GAS.initializeSpellSelection) {
          window.GAS.initializeSpellSelection($actorInGame);
        }
        
        if (setProcessing) setProcessing(false);
        // Don't close the application yet, let the user select spells first
        return;
      }
      
      // If not a spellcaster or spells tab already exists, close the application
      setTimeout(() => {
        // Hooks.call("gas.close");
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
 * Handles finalizing spell selection
 * @param {Object} params - Parameters object
 * @param {Object} params.stores - Store references
 * @param {Function} params.setProcessing - Function to set processing state
 * @returns {Promise<void>}
 */
export async function handleFinalizeSpells({
  stores,
  setProcessing
}) {
  const {
    actorInGame,
    tabs,
    activeTab
  } = stores;

  const $actorInGame = get(actorInGame);

  // Prevent multiple clicks
  if (setProcessing) {
    setProcessing(true);
  }

  if (!$actorInGame) {
    ui.notifications.error("No active character found");
    if (setProcessing) setProcessing(false);
    return;
  }

  try {
    // Get the spell selection store
    if (window.GAS.finalizeSpellSelection) {
      const success = await window.GAS.finalizeSpellSelection($actorInGame);
      
      if (success) {
        ui.notifications.info("Spells added successfully");
        
        // Check if character is also using equipment purchase (has shop enabled)
        const enableEquipmentPurchase = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
        
        if (enableEquipmentPurchase && !get(tabs).find(x => x.id === "shop")) {
          // Add Shop tab after spells are finalized
          window.GAS.log.t('[WORKFLOW] Adding shop tab after spell selection');
          tabs.update(t => [...t, { label: "Shop", id: "shop", component: "ShopTab" }]);
          
          // Switch to the Shop tab
          activeTab.set("shop");
          
          // Set available gold in shop store based on DnD5e version
          const { totalGoldFromChoices, goldRoll } = stores;
          let goldValue;
          
          if (window.GAS.dnd5eVersion >= 4) {
            goldValue = get(totalGoldFromChoices);
          } else {
            goldValue = get(goldRoll);
          }
          
          // Convert gold to copper (1 gp = 100 cp)
          const goldValueInCopper = goldValue * 100;
          
          if (window.GAS.availableGold) {
            window.GAS.availableGold.set(goldValueInCopper);
          }
          
          if (setProcessing) setProcessing(false);
          return;
        } else {
          // No shop, close the application
          setTimeout(() => {
            // Hooks.call("gas.close");
          }, 1500);
        }
      } else {
        ui.notifications.error("Failed to add spells");
        if (setProcessing) setProcessing(false);
      }
    } else {
      ui.notifications.error("Spell selection system not available");
      if (setProcessing) setProcessing(false);
    }
  } catch (error) {
    console.error("Error during spell finalization:", error);
    ui.notifications.error("An error occurred while adding spells");
    if (setProcessing) setProcessing(false);
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
