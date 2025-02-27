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
    isMultiClass,
    pointBuy,
    abilityRolls,
    isStandardArrayValues,
    subClassesForClass,
    preAdvancementSelections,
    hasCharacterCreationChanges,
    changedCharacterCreationItems,
  } from "~/src/stores/index";
  import { progress } from "~/src/stores/progress";
  import {
    getLevelByDropType,
    itemHasAdvancementChoices,
    isAdvancementsForLevelInItem,
  } from "~/src/helpers/Utility";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";
  import { abilityGenerationMethod } from "~/src/stores/index";
  import { derived, writable } from "svelte/store";
  import { log } from "../../helpers/Utility";

  // Add this after your store imports
  const storeMap = {
    'race': race,
    'background': background,
    'characterClass': characterClass,
    'characterSubClass': characterSubClass
  };

  $: game.system.log.d("preAdvancementSelections", $preAdvancementSelections);
  $: game.system.log.d("hasCharacterCreationChanges", $hasCharacterCreationChanges);

  export let value = null;

  const actor = getContext("#doc");
  const app = getContext("#external").application;
  let actorName = $actor?.name || "";

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
    //- add the subClass to the dropItemRegistry
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
    }
    await updateActorAndEmbedItems();
  };

  const clickUpdateHandler = async () => {
    game.system.log.d(
      "[clickUpdateHandler] preAdvancementSelections",
      $preAdvancementSelections
    );
    
    if (!$hasCharacterCreationChanges) {
      game.system.log.d("[clickUpdateHandler] no changes, skipping update");
      return;
    }

    const confirmed = await Dialog.confirm({
      title: "Update",
      content:
        "You have advancments in progress, if you update the actor, any advancements related to the changes will be lost. Are you sure you want to update the actor?",
      yes: () => true,
      no: () => false,
      defaultYes: false,
    });

    if (!confirmed) {
      game.system.log.d("[clickUpdateHandler] update cancelled");
      return;
    }

    // Close any open advancement dialogs first
    const currentProcess = get(dropItemRegistry).currentProcess;
    if (currentProcess?.app) {
      game.system.log.d("[clickUpdateHandler] closing advancement for", currentProcess.id);
      currentProcess.app.close();
    }

    // Remove only the items we're about to update from the queue
    for (const item of $changedCharacterCreationItems) {
      dropItemRegistry.remove(item.type);
    }

    for (const item of $changedCharacterCreationItems) {
      game.system.log.d("[clickUpdateHandler] processing item", item);
      
      // Find the item on the actor that matches the type
      const actorItem = $actorInGame.items.find(i => i.type === item.type);
      game.system.log.d("[clickUpdateHandler] found actor item", actorItem);

      // Delete the item from the actor (not the compendium)
      if (actorItem) {
        game.system.log.d("[clickUpdateHandler] deleting actor item", actorItem);
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
          isMultiClass: item.type === "characterClass" ? $isMultiClass : undefined,
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
    console.log("QUEUE BUILD START:", {
      background: $background,
      race: $race,
      characterClass: $characterClass,
      characterSubClass: $characterSubClass,
    });

    $actorInGame = await Actor.create($actor.toObject());

    
    // race
    if ($race) {
      game.system.log.i("Adding race to character");
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
    }
    
    // subrace
    if ($subRace) {
      game.system.log.i("Adding subrace to character");
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
    }
    
    if ($background) {
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
    }

    if ($characterClass) {
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterClass",
        itemData: $characterClass,
        isLevelUp: $isLevelUp,
        isMultiClass: $isMultiClass,
        hasAdvancementChoices: itemHasAdvancementChoices($characterClass),
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(
          getLevelByDropType($actorInGame, "class"),
          $characterClass,
        ),
      });
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
    }

    console.log("PRE-QUEUE ADVANCE:", $dropItemRegistry);

    //- @why: start the queue, which will activate the advancement tab
    dropItemRegistry.advanceQueue(true);
  };

  const updateActorAndEmbedItems = async () => {
    await $actor.update({ name: actorName });
    $actorInGame = $actor;
    const data = {
      actor: $actorInGame,
      id: "characterClass",
      itemData: $characterClass,
      isLevelUp: $isLevelUp,
      isMultiClass: $isMultiClass,
    };
    if ($characterClass) {
      const characterClassData = $characterClass;
      dropItemRegistry.add(data);
    }
    dropItemRegistry.advanceQueue(true);
  };

  $: value = $actor?.name || "";
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value;
</script>

<template lang="pug">
div
  //- pre hasCharacterCreationChanges {$hasCharacterCreationChanges}
  //- pre !hasCharacterCreationChanges {!$hasCharacterCreationChanges}
  +if("$activeTab !== 'advancements'")  
    .flexrow.gap-10.pr-md.mt-sm
      .flex2
        .flexcol
          .flexrow.gap-10
            .flex0.right.mt-xs.no-wrap.ml-md
              label Character Name
            .flex2
              input.left(type="text" value="{value}" on:input="{handleNameInput}")
      +if("!$isLevelUp")
        .flex1
          ProgressBar(progress="{progress}")
          +if("$progress != '100'")
            +else()
              +if("!$isActorCreated")
                button.mt-xs(type="button" role="button" on:mousedown="{clickCreateHandler}") Create Character
              +if("$isActorCreated && $hasCharacterCreationChanges")
                button(type="button" role="button" on:mousedown="{clickUpdateHandler}") Update
        +else()
          button(disabled="{!$characterClass}" type="button" role="button" on:mousedown="{clickUpdateLevelUpHandler}" data-tooltip="{$characterClass ? '': 'First select a class to level up, or a multi-class to add'}") Update

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
</style>
