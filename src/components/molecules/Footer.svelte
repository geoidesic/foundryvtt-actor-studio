<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
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
    isStandardArrayValues
  } from "~/src/helpers/store";
  // import { prepareItemForDrop } from "~/src/helpers/Utility";
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
    log.d("method", method);
    if (!method) {
      return false;
    }
    
    switch (method) {
      case 2:
        // Check if points are allocated correctly
        log.d("pointBuy", $pointBuy);
        return $pointBuy.scoreTotal === $pointBuy.pointBuyLimit;
      case 3:
          // Check if all abilities are assigned
        log.d("abilityRolls", $abilityRolls);
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
    const total = $stores.slice(0, 5).length; // Only count the main five stores for total
    const completed = $stores.slice(0, 5).filter((value, index) => {
      if (index === 4) { // Index of abilityGenerationMethod
        return isAbilityGenerationMethodReady(abilityGenerationMethod, pointBuy, abilityRolls, isStandardArrayValues);
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

  const updateActorAndEmbedItems = async () => {
    await $actor.update({name: actorName});
    $actorInGame = $actor;
    // log.d("isMultiClass", $isMultiClass);
    // log.d("characterClass", $characterClass);
    // log.d("characterClass uuid", $characterClass.uuid);
    const data = {
        actor: $actorInGame,
        id: "characterClass",
        itemData: $characterClass,
        isLevelUp: $isLevelUp,
        isMultiClass: $isMultiClass,
      };
    // const item = prepareItemForDrop(data)
    // log.d("item", item);
    // return;
    if ($characterClass) {
      const characterClassData = $characterClass;
      dropItemRegistry.add(data);
    }
    dropItemRegistry.advanceQueue(true);
  }


  /**
   * So the only viable strategy is to keep the race additions in storage
   * and then only add them after the Actor is added to the game
   */
  const createActorInGameAndEmbedItems = async () => {

    //@todo WIP: fix this
    const test = $actor.toObject();
    test.name = $actor.name // this works but it's a hack
    $actorInGame = await Actor.create($actor.toObject());

    // // set flags
    // const abilityFlags = {
    //   abilityGenerationMethod: $abilityGenerationMethod,
    // };
    // $actorInGame.setFlag(MODULE_ID, "abilities", abilityFlags);

    // background
    if ($background) {
      log.i("Adding background to character");
      const backgroundData = $background;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "background",
        itemData: backgroundData,
        isLevelUp: $isLevelUp,
      });
    }

    // race
    if ($race) {
      log.i("Adding race to character");
      const raceData = $race;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "race",
        itemData: raceData,
        isLevelUp: $isLevelUp,
      });
    }

    // subrace
    if ($subRace) {
      log.i("Adding subrace to character");
      const subRaceData = $subRace;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "subRace",
        itemData: subRaceData,
        isLevelUp: $isLevelUp,
      });
    }

    // character class
    if ($characterClass) {
      log.i("Adding class to character", $characterClass);
      const characterClassData = $characterClass;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterClass",
        itemData: characterClassData,
        isLevelUp: $isLevelUp,
      });
    }

    // character subclass
    if ($characterSubClass) {
      log.i("Adding subclass to character");
      const characterSubClassData = $characterSubClass;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterSubClass",
        itemData: characterSubClassData,
        isLevelUp: $isLevelUp,
      });
    }

    // spells
    if ($spells) {
      log.i("Adding spells to character");
      const spellsData = $spells;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "spells",
        itemData: spellsData,
        isLevelUp: $isLevelUp,
      });
    }

    log.d('dropItemRegistry', $dropItemRegistry)

    dropItemRegistry.advanceQueue(true);
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
