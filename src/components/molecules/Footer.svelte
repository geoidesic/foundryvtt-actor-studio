<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { get } from 'svelte/store';
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
    subClassesForClass
  } from "~/src/helpers/store";
  import { prepareItemForDrop, getLevelByDropType, itemHasAdvancementChoices, isAdvancementsForLevelInItem } from "~/src/helpers/Utility";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";
  import { abilityGenerationMethod } from "~/src/helpers/store";
  import { derived, writable } from "svelte/store";
  import { log } from "../../helpers/Utility";

  const stores = [
    race,
    characterClass,
    characterSubClass,
    background,
    abilityGenerationMethod,
    pointBuy,
    abilityRolls,
    isStandardArrayValues
  ];

    // Sample helper function to process abilityGenerationMethod
    function isAbilityGenerationMethodReady(method) {
    if (!method) {
      return false;
    }
    
    switch (method) {
      case 2:
        // Check if points are allocated correctly
        game.system.log.d("pointBuy", $pointBuy);
        return $pointBuy.scoreTotal === $pointBuy.pointBuyLimit;
      case 3:
          // Check if all abilities are assigned
        game.system.log.d("abilityRolls", $abilityRolls);
        return Object.keys($abilityRolls).length === 6;
      case 4:
        // Check if all rolls are assigned
        return $isStandardArrayValues
      default:
        return true;
    }
  }

  // Derive the progress value from the store states
  const progress = derived(stores, ($stores) => {
    const [race, characterClass, characterSubClass, background, abilityGenerationMethod, pointBuy, abilityRolls, isStandardArrayValues] = $stores;
    //- @why: some classes don't have subclasses until later levels
    const length = $subClassesForClass.length > 0 ? 5 : 4;
    const total = $stores.slice(0, 5).length; // Only count the main five stores for total
    const completed = $stores.slice(0, 5).filter((value, index) => {
      if (index === 4) { // Index of abilityGenerationMethod
        return isAbilityGenerationMethodReady(abilityGenerationMethod);
      }
      return !!value;
    }).length;
    return (completed / total) * 100;
  });

  export let value = null;

  const actor = getContext("#doc");
  const app = getContext("#external").application;
  let actorName = $actor?.name || "";

  const handleNameInput = (e) => {
    if($isLevelUp) {
      //- @why: for existing actors, we need to update the actor object in the database
      actorName = e.target.value;
    } else {
      //- @why: for new actors, we need to update the actor source object in memory, 
      $actor.updateSource({name: e.target.value});
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

  const clickUpdateHandler = async () => {
    // await actor.update(actorObject);
    
    await updateActorAndEmbedItems()
    // drop class on actor and catch advancements
  };

  const createActorInGameAndEmbedItems = async () => {
    console.log('QUEUE BUILD START:', {
        background: $background,
        race: $race,
        characterClass: $characterClass,
        characterSubClass: $characterSubClass
    });

    const test = $actor.toObject();
    test.name = $actor.name;
    $actorInGame = await Actor.create($actor.toObject());

    // Before each dropItemRegistry.add call
    if ($background) {
        console.log('PRE-QUEUE ADD BACKGROUND:', {
            item: $background,
            hasSystem: !!$background.system,
            queueData: {
                actor: $actorInGame,
                id: "background",
                itemData: $background,
                isLevelUp: $isLevelUp,
            }
        });
        dropItemRegistry.add({
            actor: $actorInGame,
            id: "background",
            itemData: $background,
            isLevelUp: $isLevelUp,
            hasAdvancementChoices: itemHasAdvancementChoices($background),
            hasAdvancementsForLevel: isAdvancementsForLevelInItem(getLevelByDropType($actorInGame, $background), $background)
        });
    }


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
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(getLevelByDropType($actorInGame, $race), $race)
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
        hasAdvancementsForLevel: isAdvancementsForLevelInItem(getLevelByDropType($actorInGame, $subRace), $subRace)
      });
    }


    // Similar for race, class, and subclass...
    if ($characterClass) {
        console.log('PRE-QUEUE ADD CLASS:', {
            item: $characterClass,
            hasSystem: !!$characterClass.system,
            queueData: {
                actor: $actorInGame,
                id: "characterClass",
                itemData: $characterClass,
                isLevelUp: $isLevelUp,
            }
        });
        dropItemRegistry.add({
            actor: $actorInGame,
            id: "characterClass",
            itemData: $characterClass,
            isLevelUp: $isLevelUp,
            isMultiClass: $isMultiClass,
            hasAdvancementChoices: itemHasAdvancementChoices($characterClass),
            hasAdvancementsForLevel: isAdvancementsForLevelInItem(getLevelByDropType($actorInGame, "class"), $characterClass)
        });
    }

    if ($characterSubClass) {
        console.log('PRE-QUEUE ADD SUBCLASS:', {
            item: $characterSubClass,
            hasSystem: !!$characterSubClass.system,
            queueData: {
                actor: $actorInGame,
                id: "characterSubClass",
                itemData: $characterSubClass,
                isLevelUp: $isLevelUp,
            }
        });
        dropItemRegistry.add({
            actor: $actorInGame,
            id: "characterSubClass",
            itemData: $characterSubClass,
            isLevelUp: $isLevelUp,
            hasAdvancementChoices: itemHasAdvancementChoices($characterSubClass),
            hasAdvancementsForLevel: isAdvancementsForLevelInItem(getLevelByDropType($actorInGame, "subclass"), $characterSubClass)
        });
    }

    console.log('PRE-QUEUE ADVANCE:', $dropItemRegistry);

    //- @why: start the queue, which will activate the advancement tab
    dropItemRegistry.advanceQueue(true);
  };

  const updateActorAndEmbedItems = async () => {
    await $actor.update({name: actorName});
    $actorInGame = $actor;
    // game.system.log.d("isMultiClass", $isMultiClass);
    // game.system.log.d("characterClass", $characterClass);
    // game.system.log.d("characterClass uuid", $characterClass.uuid);
    const data = {
        actor: $actorInGame,
        id: "characterClass",
        itemData: $characterClass,
        isLevelUp: $isLevelUp,
        isMultiClass: $isMultiClass,
      };
    const item = prepareItemForDrop(data)
    // game.system.log.d("item", item);
    // return;
    if ($characterClass) {
      const characterClassData = $characterClass;
      dropItemRegistry.add(data);
    }
    dropItemRegistry.advanceQueue(true);

    // For Race selection
    console.log('RACE SELECTION:', {
        selectedRace: $race,
        raceProperties: Object.keys($race || {}),
        raceSystem: $race?.system,
        raceType: typeof $race
    });

    // For Background selection
    console.log('BACKGROUND SELECTION:', {
        selectedBackground: $background,
        backgroundProperties: Object.keys($background || {}),
        backgroundSystem: $background?.system,
        backgroundType: typeof $background
    });

    // For Class selection
    console.log('CLASS SELECTION:', {
        selectedClass: $characterClass,
        classProperties: Object.keys($characterClass || {}),
        classSystem: $characterClass?.system,
        classType: typeof $characterClass
    });

    // For Subclass selection
    console.log('SUBCLASS SELECTION:', {
        selectedSubclass: $characterSubClass,
        subclassProperties: Object.keys($characterSubClass || {}),
        subclassSystem: $characterSubClass?.system,
        subclassType: typeof $characterSubClass
    });
  };



  $: value = $actor?.name || "";
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value;


  
</script>

<template lang="pug">
div
  +if("$activeTab !== 'advancements'")  
    .flexrow.gap-10.pr-md.mt-sm
      .flex2
        .flexcol
          .flexrow.gap-10
            .flex0.right.mt-xs.no-wrap.ml-md
              label Character Name
            .flex2
              input.left(type="text" value="{value}" on:input="{handleNameInput}")
          //- .flexrow.gap-10
          //-   .flex1.right.mt-xs
          //-     label Token Name
          //-   .flex2
          //-     input.left(type="text" value="{tokenValue}" on:input="{handleTokenNameInput}")
      +if("!$isLevelUp")
        //- button.mt-xs(type="button" role="button" on:mousedown="{clickCreateHandler}") Create Character
        .flex1
          ProgressBar(progress="{progress}")
          +if("$progress != '100'")
            +else()
              +if("!$isActorCreated")
                button.mt-xs(type="button" role="button" on:mousedown="{clickCreateHandler}") Create Character
              +if("$isActorCreated")
                button(type="button" role="button" on:mousedown="{clickUpdateHandler}") Update
        +else()
          button(disabled="{!$characterClass}" type="button" role="button" on:mousedown="{clickUpdateHandler}" data-tooltip="{$characterClass ? '': 'First select a class to level up, or a multi-class to add'}") Update
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
