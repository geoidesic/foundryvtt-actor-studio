/**
 * Character creation and management workflows
 * Contains non-reactive logic that can be shared across components
 */
import { get } from "svelte/store";
import { MODULE_ID } from "~/src/helpers/constants";
import { workflowStateMachine, WORKFLOW_EVENTS } from "~/src/helpers/WorkflowStateMachine";
import {
  getLevelByDropType,
  itemHasAdvancementChoices,
  isAdvancementsForLevelInItem,
  dropItemOnCharacter
} from "~/src/helpers/Utility";
import { destroyAdvancementManagers } from "~/src/helpers/AdvancementManager";
import { goldRoll } from '../stores/storeDefinitions';
import { totalGoldFromChoices } from '../stores/goldChoices';
import { tabs, activeTab, readOnlyTabs } from '../stores/index.js';

/**
 * Handles creating container contents for a container item
 * @param {Object} sourceItem - The original container item from UUID
 * @param {Object} createdContainerItem - The created container item on the actor
 * @param {Object} actor - The target actor
 * @returns {Promise<void>}
 */
export async function handleContainerContents(sourceItem, createdContainerItem, actor) {
  if (sourceItem.type !== 'container') return;
  
  try {
    // Access contents from system.contents
    const contents = await sourceItem.system.contents;
    
    if (contents && contents.size > 0) {
      window.GAS.log.d('[CONTAINER] Processing container contents for:', sourceItem.name, 'Contents count:', contents.size);
      
      // Create each contained item separately with system.container pointing to the main item
      for (const containedItem of contents) {
        try {
          const containedData = game.items.fromCompendium(containedItem);
          if (containedData) {
            // Set the container property to point to the main container
            containedData.system.container = createdContainerItem.id;
            await Item.create(containedData, { parent: actor });
            window.GAS.log.d('[CONTAINER] Created contained item:', containedItem.name, 'in container:', createdContainerItem.id);
          }
        } catch (error) {
          console.error('Error creating contained item:', containedItem.name, error);
        }
      }
    } else {
      window.GAS.log.d('[CONTAINER] Container has no contents or contents is empty');
    }
  } catch (error) {
    console.error('Error processing container contents for:', sourceItem.name, error);
  }
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
    actorInGame,
    tabs,
    activeTab
  } = stores;

  // Initialize the workflow state machine for character creation
  workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);

  // Create Actor
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
  
  // If advancement is disabled, destroy any open advancement managers
  if (game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
    window.GAS.log.d('[WORKFLOW] Advancement disabled - destroying advancement managers');
    destroyAdvancementManagers();
  }
  
  // Initialize the workflow state machine for character creation
  window.GAS.log.d('[WORKFLOW] About to call workflowStateMachine.transition with CHARACTER_CREATED');
  window.GAS.log.d('[WORKFLOW] Created actor:', createdActor);
  window.GAS.log.d('[WORKFLOW] Created actor classes:', createdActor.classes);
  
  // Check current state - only call CHARACTER_CREATED if we're still in creating_character state
  // The AdvancementManager may have already moved the workflow forward
  const currentState = workflowStateMachine.getState();
  window.GAS.log.d('[WORKFLOW] Current workflow state before CHARACTER_CREATED:', currentState);
  
  if (currentState === 'creating_character') {
    window.GAS.log.d('[WORKFLOW] Calling CHARACTER_CREATED transition');
    workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, {
      actor: createdActor
    });
  } else {
    window.GAS.log.d('[WORKFLOW] Skipping CHARACTER_CREATED transition - workflow already advanced to:', currentState);
  }
  
  window.GAS.log.d('[WORKFLOW] Called workflowStateMachine.transition - returning created actor');
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
  
  // If advancement is disabled, destroy any open advancement managers
  if (game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
    window.GAS.log.d('[WORKFLOW] Advancement disabled - destroying advancement managers');
    destroyAdvancementManagers();
  }
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
    totalGoldFromChoices,
    goldRoll
  } = stores;

  const $actorInGame = get(actorInGame);
  const $flattenedSelections = get(flattenedSelections);
  
  if ($actorInGame) {
    // Count occurrences of each item by UUID
    const itemCounts = new Map();
    
    // Count how many times each item appears in selections
    for (const selection of $flattenedSelections) {
      if (selection.key) {
        const count = itemCounts.get(selection.key) || 0;
        itemCounts.set(selection.key, count + 1);
      }
    }

    // Process each unique item with its total quantity
    for (const [uuid, quantity] of itemCounts.entries()) {
      // Use fromDropData to create a properly formatted item for dropping
      const item = await fromUuid(uuid)
      if (item) {
        // Create a copy of the item data and set the quantity
        const data = game.items.fromCompendium(item);
        data.system.quantity = quantity;
        const createdItem = await Item.create(data, { parent: $actorInGame });
        
        // Handle containers - contents may be a Promise that resolves to a Collection
        await handleContainerContents(item, createdItem, $actorInGame);
        
        window.GAS.log.d('[WORKFLOW] Successfully created item:', item.name, 'with quantity:', quantity);
      }
    }

    // Check if equipment purchase is enabled
    const enableEquipmentPurchase = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
    if (!enableEquipmentPurchase) {
      // Shop is disabled, add gold directly to actor
      let goldValue;
      
      // Use the appropriate gold source based on DnD5e version
      if (window.GAS.dnd5eVersion >= 4) {
        goldValue = get(totalGoldFromChoices);
        window.GAS.log.d('[WORKFLOW] Adding totalGoldFromChoices to actor for v4:', goldValue);
      } else {
        goldValue = get(goldRoll);
        window.GAS.log.d('[WORKFLOW] Adding goldRoll to actor for v3:', goldValue);
      }
      
      // Add gold to actor if there's any gold to add
      if (goldValue > 0) {
        try {
          await $actorInGame.update({ "system.currency.gp": (($actorInGame.system.currency.gp || 0) + goldValue) });
          window.GAS.log.d('[WORKFLOW] Successfully added', goldValue, 'gold to actor');
        } catch (error) {
          console.error('Error adding gold to actor:', error);
        }
      }
    }
  }
  
  // Use state machine to transition to next step
  workflowStateMachine.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, {
    actor: $actorInGame
  });
  
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
    workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
      error: "No active character found"
    });
    if (setProcessing) setProcessing(false);
    return;
  }

  if ($cartTotalCost === 0) {
    const confirmed = await Dialog.confirm({
      title: "Empty Cart",
      content: "Your cart is empty. Do you want to continue without purchasing any equipment?",
      yes: () => true,
      no: () => false,
      defaultYes: true,
    });

    if (!confirmed) {
      if (setProcessing) setProcessing(false);
      return;
    }
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
    console.error("Error during finalize purchase:", error);
    ui.notifications.error("An error occurred during purchase.");
    workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
      error: error.message
    });
    if (setProcessing) setProcessing(false);
    return;
  }
    
  try {
    if (success) {
      ui.notifications.info("Purchase completed successfully");
      workflowStateMachine.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, {
        actor: $actorInGame
      });
    } else {
      ui.notifications.error("Failed to complete purchase");
      workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
        error: "Failed to complete purchase"
      });
    }
  } catch (error) {
    console.error("Error handling finalize purchase result:", error);
    ui.notifications.error("An error occurred while processing the purchase result.");
    workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
      error: error.message
    });
  }
  
  if (setProcessing) setProcessing(false);
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

/**
 * Checks if an actor is a spellcaster by examining their classes and spellcasting capabilities
 * @param {Object} actor - The actor document to check
 * @returns {boolean} True if the actor is a spellcaster, false otherwise
 */
export function checkIfSpellcaster(actor) {
  window.GAS.log.d('[WORKFLOW] Checking if actor is a spellcaster:', actor?.id);
  if (!actor) {
    window.GAS.log.w('[WORKFLOW] No actor found');
    return false;
  }
  
  const classes = actor.classes || {};
  if (!Object.keys(classes).length) {
    window.GAS.log.w('[WORKFLOW] No classes found on actor');
    return false;
  }
  
  // Iterate through each class and check if any have spellcasting progression !== "none"
  const isSpellcaster = Object.values(classes).some(cls => {
    const progression = cls.system?.spellcasting?.progression;
    window.GAS.log.d('[WORKFLOW] Checking class:', cls.name, 'progression:', progression);
    return progression && progression !== "none";
  });

  window.GAS.log.d('[WORKFLOW] Actor is spellcaster:', isSpellcaster);
  return isSpellcaster;
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
    actorInGame
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
        
        // Use state machine to transition to next step
        workflowStateMachine.transition(WORKFLOW_EVENTS.SPELLS_COMPLETE, {
          actor: $actorInGame
        });
      } else {
        ui.notifications.error("Failed to add spells");
        workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
          error: "Failed to add spells"
        });
      }
    } else {
      ui.notifications.error("Spell selection system not available");
      workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
        error: "Spell selection system not available"
      });
    }
  } catch (error) {
    console.error("Error during spell finalization:", error);
    ui.notifications.error("An error occurred while adding spells");
    workflowStateMachine.transition(WORKFLOW_EVENTS.ERROR, {
      error: error.message
    });
  }
  
  if (setProcessing) setProcessing(false);
}
