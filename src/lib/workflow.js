/**
 * Character creation and management workflows
 * Contains non-reactive logic that can be shared across components
 */
import { get } from "svelte/store";
import { MODULE_ID } from "~/src/helpers/constants";
import { getWorkflowFSM, workflowFSMContext, WORKFLOW_EVENTS } from "~/src/helpers/WorkflowStateMachine";
import { getLevelUpFSM, levelUpFSMContext, LEVELUP_EVENTS } from '~/src/helpers/LevelUpStateMachine';
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
import { finalizeSpellSelection } from '../stores/spellSelection.js';
import { spellProgress } from '../stores/spellSelection.js';
import { selectedSpells } from '../stores/spellSelection.js';

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

// Instantiate the Finity-based workflow FSM
// const workflowFSM = createWorkflowStateMachine();

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
  const fsm = getWorkflowFSM();
  fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);

  // Create Actor
  const createdActor = await Actor.create(get(actor).toObject());
  actorInGame.set(createdActor);
  
  // Set the actor in the workflow FSM context
  workflowFSMContext.actor = createdActor;

  // Simple sheet override during drop processing:
  // 1) Record the current sheet class
  // 2) Switch to dnd5e.CharacterActorSheet so drops use core dnd5e handlers
  // 3) Restoration occurs after the queue completes in WorkflowStateMachine
  try {
    const originalSheet = createdActor.getFlag('core', 'sheetClass') ?? '';
    await createdActor.setFlag(MODULE_ID, 'originalSheetClass', originalSheet);
    await createdActor.setFlag('core', 'sheetClass', 'dnd5e.CharacterActorSheet');
  } catch (e) {
    // Non-fatal: if we can't set the flag, proceed normally
    window.GAS?.log?.w?.('[WORKFLOW] Failed to set temporary sheetClass; continuing', e);
  }

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

  fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
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
/**
 * Legacy function for updating actors (DEPRECATED for LevelUp - use updateActorLevelUpWorkflow instead)
 * This function is kept for backward compatibility but should not be used for level-up scenarios
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

  window.GAS.log.d('[WORKFLOW] updateActorAndEmbedItems (LEGACY)', get(classUuidForLevelUp));
  window.GAS.log.w('[WORKFLOW] WARNING: updateActorAndEmbedItems is deprecated for level-up. Use updateActorLevelUpWorkflow instead.');

  await get(actor).update({ name: actorName });
  actorInGame.set(get(actor));
  
  // Set the actor in the workflow FSM context
  workflowFSMContext.actor = get(actor);
  
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
  await dropItemRegistry.advanceQueue(true);
  
  // REMOVED: Don't fire QUEUE_PROCESSED event here as it conflicts with LevelUp workflow
  // The character creation workflow should handle its own state transitions
  
  // If advancement is disabled, destroy any open advancement managers
  if (game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
    window.GAS.log.d('[WORKFLOW] Advancement disabled - destroying advancement managers');
    destroyAdvancementManagers();
  }
}

/**
 * LevelUp workflow function that uses the dedicated LevelUp state machine
 * This replaces the old updateActorAndEmbedItems function for level-up scenarios
 */
export async function updateActorLevelUpWorkflow({
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

  window.GAS.log.d('[LEVELUP WORKFLOW] Starting level-up workflow', get(classUuidForLevelUp));

  try {
    // Update actor name
    await get(actor).update({ name: actorName });
    actorInGame.set(get(actor));
    
    // Set the actor in the LevelUp FSM context
    levelUpFSMContext.actor = get(actor);
    
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
        hasAdvancementChoices: itemHasAdvancementChoices($levelUpClassObject),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType(get(actor), "class"),
          $levelUpClassObject,
        ),
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

    // Start the LevelUp state machine workflow
    // First ensure we're in the correct state - reset if needed
    const levelUpFSM = getLevelUpFSM();
    const currentState = levelUpFSM.getCurrentState();
    window.GAS.log.d('[LEVELUP WORKFLOW] Current FSM state before starting:', currentState);
    
    // Reset FSM to idle if it's in a terminal state (completed or error)
    if (currentState === 'completed' || currentState === 'error') {
      window.GAS.log.d('[LEVELUP WORKFLOW] Resetting FSM from terminal state:', currentState);
      levelUpFSM.handle(LEVELUP_EVENTS.RESET);
    }
    
    // Start the level-up workflow: idle -> selecting_class_level -> processing_advancements
    let finalState = levelUpFSM.getCurrentState();
    if (finalState === 'idle') {
      window.GAS.log.d('[LEVELUP WORKFLOW] Starting level-up from idle state');
      levelUpFSM.handle(LEVELUP_EVENTS.START_LEVEL_UP);
      levelUpFSM.handle(LEVELUP_EVENTS.CLASS_LEVEL_SELECTED);
    } else {
      window.GAS.log.w('[LEVELUP WORKFLOW] FSM not in idle state after reset:', finalState);
      // If the FSM is in any non-idle state (including processing_advancements),
      // reset it to a known idle state before starting the level-up flow. This
      // prevents sending the `class_level_selected` event into a state that
      // doesn't handle it (e.g. processing_advancements) which caused an
      // unhandled event error.
      try {
        levelUpFSM.handle(LEVELUP_EVENTS.RESET);
        finalState = levelUpFSM.getCurrentState();
        window.GAS.log.d('[LEVELUP WORKFLOW] FSM state after RESET:', finalState);
      } catch (err) {
        window.GAS.log.e('[LEVELUP WORKFLOW] Error resetting LevelUp FSM:', err);
      }

      // Now attempt to start the flow from idle
      if (finalState === 'idle') {
        levelUpFSM.handle(LEVELUP_EVENTS.START_LEVEL_UP);
        levelUpFSM.handle(LEVELUP_EVENTS.CLASS_LEVEL_SELECTED);
      } else {
        window.GAS.log.e('[LEVELUP WORKFLOW] Unable to reset LevelUp FSM to idle. Current state:', finalState);
      }
    }
    
    window.GAS.log.d('[LEVELUP WORKFLOW] LevelUp workflow initiated');
    
  } catch (error) {
    window.GAS.log.e('[LEVELUP WORKFLOW] Error in level-up workflow:', error);
    const levelUpFSM = getLevelUpFSM();
    const currentState = levelUpFSM.getCurrentState();
    
    // Only send error event if not already in terminal state
    if (currentState !== 'error' && currentState !== 'completed') {
      levelUpFSM.handle(LEVELUP_EVENTS.ERROR, { error: error.message });
    } else {
      window.GAS.log.d('[LEVELUP WORKFLOW] FSM in terminal state, skipping error event');
    }
    throw error;
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
      const fromUuid = foundry.utils?.fromUuid || globalThis.fromUuid;
      const item = await fromUuid(uuid)
      if (item) {
        // Create a copy of the item data and set the quantity
        const data = game.items.fromCompendium(item);
        data.system.quantity = quantity;
        let createdItem;
        if (window.GAS.dnd5eVersion >= 5) {
          createdItem = await Item.create(data, { parent: $actorInGame });
        } else {
          // For v4.x and below, use dropItemOnCharacter to ensure advancements fire
          const preIds = new Set($actorInGame.items.map(i => i.id));
          await dropItemOnCharacter($actorInGame, data);
          // Poll for the new item to appear on the actor
          createdItem = await new Promise((resolve) => {
            const maxAttempts = 20;
            let attempts = 0;
            const interval = setInterval(() => {
              const newItems = $actorInGame.items.filter(i => !preIds.has(i.id) && i.name === data.name && i.type === data.type);
              if (newItems.length > 0) {
                clearInterval(interval);
                resolve(newItems[0]);
              } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
                window.GAS.log.w('[WORKFLOW] Timed out waiting for dropped item to appear on actor:', data.name);
                resolve(null);
              }
            }, 100);
          });
        }
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
  const fsm = getWorkflowFSM();
  
  window.GAS.log.d('[WORKFLOW] handleAddEquipment - Current FSM state:', fsm.getCurrentState());
  
  // Ensure the context has the current actor
  const contextWithActor = {
    ...workflowFSMContext,
    actor: $actorInGame
  };
  
  // Use the helper function to determine the correct equipment completion event
  const { getEquipmentCompletionEvent } = await import('~/src/helpers/WorkflowStateMachine.js');
  const completionEvent = getEquipmentCompletionEvent(contextWithActor, false);
  
  window.GAS.log.d('[WORKFLOW] handleAddEquipment - Triggering event:', completionEvent, 'with context:', contextWithActor);
  
  fsm.handle(completionEvent, contextWithActor);
  
  // Call the callback to mark equipment as added
  if (onEquipmentAdded) {
    onEquipmentAdded();
  }
}

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
    getWorkflowFSM().handle(WORKFLOW_EVENTS.ERROR);
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
    getWorkflowFSM().handle(WORKFLOW_EVENTS.ERROR);
    if (setProcessing) setProcessing(false);
    return;
  }
  try {
    if (success) {
      ui.notifications.info("Purchase completed successfully");
      getWorkflowFSM().handle(WORKFLOW_EVENTS.SHOPPING_COMPLETE);
    } else {
      ui.notifications.error("Failed to complete purchase");
      getWorkflowFSM().handle(WORKFLOW_EVENTS.ERROR, { ...workflowFSMContext, error: "Failed to complete purchase" });
    }
  } catch (error) {
    console.error("Error handling finalize purchase result:", error);
    ui.notifications.error("An error occurred while processing the purchase result.");
    getWorkflowFSM().handle(WORKFLOW_EVENTS.ERROR, { ...workflowFSMContext, error: error.message });
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
  await dropItemRegistry.advanceQueue(true);
  // After the queue is advanced, trigger the state machine event for post-queue processing
  const fsm = getWorkflowFSM();
  fsm.handle(WORKFLOW_EVENTS.QUEUE_PROCESSED);
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
    actorInGame,
    isLevelUp
  } = stores;

  const $actorInGame = get(actorInGame);
  const $isLevelUp = get(isLevelUp);
  const progress = get(spellProgress);

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
    // Guard: if selection isn't complete, do not advance or error the FSM
    if (!progress?.isComplete) {
      ui.notifications.warn("Please complete your spell selection before finalizing");
      if (setProcessing) setProcessing(false);
      return;
    }

    // If no updates are needed (e.g., level-up gained no new spells), just complete the workflow
    if (progress?.noUpdatesNeeded || ((progress?.limits?.cantrips || 0) + (progress?.limits?.spells || 0)) === 0) {
      // NEW: If the user actually selected spells, we still need to create them.
      let selectionCount = 0;
      try {
        const sel = get(selectedSpells);
        selectionCount = sel && typeof sel.size === 'number' ? sel.size : 0;
      } catch {}

      if (selectionCount > 0) {
        // Proceed with finalization to add the selected spells
        const success = await finalizeSpellSelection($actorInGame);
        if (success) {
          ui.notifications.info("Spells added successfully");
          if ($isLevelUp) {
            const levelUpFSM = getLevelUpFSM();
            const currentState = levelUpFSM.getCurrentState();
            window.GAS.log.d('[LEVELUP WORKFLOW] Current state before spells_complete:', currentState);
            window.GAS.log.d('[LEVELUP WORKFLOW] Event to handle:', LEVELUP_EVENTS.SPELLS_COMPLETE);
            if (currentState !== 'completed') {
              levelUpFSM.handle(LEVELUP_EVENTS.SPELLS_COMPLETE);
            } else {
              window.GAS.log.d('[LEVELUP WORKFLOW] FSM already in completed state, skipping spells_complete event');
            }
          } else {
            const fsm = getWorkflowFSM();
            const currentState = fsm.getCurrentState();
            window.GAS.log.d('[WORKFLOW] Current state before spells_complete:', currentState);
            window.GAS.log.d('[WORKFLOW] Event to handle:', WORKFLOW_EVENTS.SPELLS_COMPLETE);
            fsm.handle(WORKFLOW_EVENTS.SPELLS_COMPLETE);
          }
          if (setProcessing) setProcessing(false);
          return;
        } else {
          // finalizeSpellSelection already warned the user (e.g., no spells selected)
          if (setProcessing) setProcessing(false);
          return;
        }
      }

      // Make the spells tab readonly
      readOnlyTabs.update(tabs => tabs.includes('spells') ? tabs : [...tabs, 'spells']);

      // Advance the appropriate FSM without attempting to add spells
      if ($isLevelUp) {
        const levelUpFSM = getLevelUpFSM();
        const currentState = levelUpFSM.getCurrentState();
        window.GAS.log.d('[LEVELUP WORKFLOW] FinalizeSpells: no updates needed. Current state:', currentState);
        if (currentState !== 'completed') levelUpFSM.handle(LEVELUP_EVENTS.SPELLS_COMPLETE);
      } else {
        const fsm = getWorkflowFSM();
        window.GAS.log.d('[WORKFLOW] FinalizeSpells: no updates needed. Current state:', fsm.getCurrentState());
        fsm.handle(WORKFLOW_EVENTS.SPELLS_COMPLETE);
      }
      ui.notifications.info("Spell selection complete");
      if (setProcessing) setProcessing(false);
      return;
    }

    // Use the imported spell finalization function
    const success = await finalizeSpellSelection($actorInGame);
    
    if (success) {
      ui.notifications.info("Spells added successfully");
      
      // Use the correct FSM based on level-up mode
      if ($isLevelUp) {
        // Level-up mode: use LevelUp FSM
        const levelUpFSM = getLevelUpFSM();
        const currentState = levelUpFSM.getCurrentState();
        window.GAS.log.d('[LEVELUP WORKFLOW] Current state before spells_complete:', currentState);
        window.GAS.log.d('[LEVELUP WORKFLOW] Event to handle:', LEVELUP_EVENTS.SPELLS_COMPLETE);
        
        // Only send the event if we're not already in completed state
        if (currentState !== 'completed') {
          levelUpFSM.handle(LEVELUP_EVENTS.SPELLS_COMPLETE);
        } else {
          window.GAS.log.d('[LEVELUP WORKFLOW] FSM already in completed state, skipping spells_complete event');
        }
      } else {
        // Character creation mode: use main workflow FSM
        const fsm = getWorkflowFSM();
        const currentState = fsm.getCurrentState();
        window.GAS.log.d('[WORKFLOW] Current state before spells_complete:', currentState);
        window.GAS.log.d('[WORKFLOW] Event to handle:', WORKFLOW_EVENTS.SPELLS_COMPLETE);
        
        fsm.handle(WORKFLOW_EVENTS.SPELLS_COMPLETE);
      }
    } else {
      // Do not push the FSM into an error state for validation failures like "No spells selected".
      // finalizeSpellSelection already surfaced a user-facing message when appropriate.
      if (setProcessing) setProcessing(false);
      return;
    }
  } catch (error) {
    console.error("Error during spell finalization:", error);
    ui.notifications.error("An error occurred while adding spells");
    
    // Use the correct FSM for error handling
    if ($isLevelUp) {
      const levelUpFSM = getLevelUpFSM();
      const currentState = levelUpFSM.getCurrentState();
      if (currentState !== 'error' && currentState !== 'completed') {
        levelUpFSM.handle(LEVELUP_EVENTS.ERROR);
      } else {
        window.GAS.log.d('[LEVELUP WORKFLOW] FSM in terminal state, skipping error event');
      }
    } else {
      const currentState = getWorkflowFSM().getCurrentState();
      if (currentState !== 'error') {
        getWorkflowFSM().handle(WORKFLOW_EVENTS.ERROR);
      }
    }
  }
  
  if (setProcessing) setProcessing(false);
}

/**
 * Handles spell selection completion in LevelUp workflow
 */
export async function handleSpellsCompleteLevelUp() {
  window.GAS.log.d('[LEVELUP WORKFLOW] Handling spells completion');
  
  try {
    const levelUpFSM = getLevelUpFSM();
    levelUpFSM.handle(LEVELUP_EVENTS.SPELLS_COMPLETE);
    
    window.GAS.log.d('[LEVELUP WORKFLOW] Spells completion handled successfully');
    return true;
    
  } catch (error) {
    window.GAS.log.e('[LEVELUP WORKFLOW] Error handling spells completion:', error);
    const levelUpFSM = getLevelUpFSM();
    levelUpFSM.handle(LEVELUP_EVENTS.ERROR, { error: error.message });
    return false;
  }
}

/**
 * Handles skipping spell selection in LevelUp workflow
 */
export async function handleSkipSpellsLevelUp() {
  window.GAS.log.d('[LEVELUP WORKFLOW] Handling skip spells');
  
  try {
    const levelUpFSM = getLevelUpFSM();
    levelUpFSM.handle(LEVELUP_EVENTS.SKIP_SPELLS);
    
    window.GAS.log.d('[LEVELUP WORKFLOW] Skip spells handled successfully');
    return true;
    
  } catch (error) {
    window.GAS.log.e('[LEVELUP WORKFLOW] Error handling skip spells:', error);
    const levelUpFSM = getLevelUpFSM();
    levelUpFSM.handle(LEVELUP_EVENTS.ERROR, { error: error.message });
    return false;
  }
}

/**
 * Handles what to do when advancements are complete (was handleEmptyQueue/closeOrEquip)
 * Decides which workflow state to transition to next, based on settings and actor
 * @param {object} context - Finity workflow context (should include actor)
 * @returns {string} The next state name for the FSM
 */
export async function handleAdvancementCompletion(context) {
  const { actor } = context;
  const enableEquipment = game.settings.get(MODULE_ID, 'enableEquipmentSelection');
  const enableShop = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
  const enableSpells = game.settings.get(MODULE_ID, 'enableSpellSelection');

  // Helper to check if actor is a spellcaster
  function isSpellcaster(actor) {
    if (!actor) return false;
    const classes = actor.classes || {};
    return Object.values(classes).some(cls => {
      const progression = cls.system?.spellcasting?.progression;
      return progression && progression !== 'none';
    });
  }

  const spellcaster = isSpellcaster(actor);
  console.log('[GAS][handleAdvancementCompletion] enableEquipment:', enableEquipment, 'enableShop:', enableShop, 'enableSpells:', enableSpells, 'isSpellcaster:', spellcaster, 'actor:', actor?.name, actor);

  if (!enableEquipment && !enableShop && !enableSpells) {
    console.log('[GAS][handleAdvancementCompletion] All features disabled, returning completed');
    return 'completed';
  }
  if (enableEquipment) {
    console.log('[GAS][handleAdvancementCompletion] Equipment enabled, returning selecting_equipment');
    return 'selecting_equipment';
  }
  if (enableShop) {
    console.log('[GAS][handleAdvancementCompletion] Shop enabled, returning shopping');
    return 'shopping';
  }
  if (enableSpells && spellcaster) {
    console.log('[GAS][handleAdvancementCompletion] Spells enabled and actor is spellcaster, returning selecting_spells');
    return 'selecting_spells';
  }
  console.log('[GAS][handleAdvancementCompletion] Fallback, returning completed');
  return 'completed';
}


