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
    isStandardArrayValues,
    subClassesForClass,
    abilityGenerationMethod // Make sure this is imported correctly
  } from "~/src/helpers/store";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";
  import OpenAI from "~/src/plugins/open-ai";
  import { derived } from "svelte/store";
  import { log } from "../../helpers/Utility";


  // Reactive variable for actor name
  let actorName = "";

  const browserLanguage = navigator.language || 'en';

  const generateName = async (race) => {
    const name = await OpenAI.generateName(race+ ' lang: ' + browserLanguage + ' avoiding patterns or common starting letters. Ensure the name is different with each request.');
    actorName = name;
  };

  const stores = [
    race,
    characterClass,
    characterSubClass,
    background,
    abilityGenerationMethod, // Include the abilityGenerationMethod here
    pointBuy,
    abilityRolls,
    isStandardArrayValues
  ];

  // Helper function to check if ability generation method is ready
  function isAbilityGenerationMethodReady(method) {
    if (!method) return false;
    
    switch (method) {
      case 2:
        game.system.log.d("pointBuy", $pointBuy);
        return $pointBuy.scoreTotal === $pointBuy.pointBuyLimit;
      case 3:
        game.system.log.d("abilityRolls", $abilityRolls);
        return Object.keys($abilityRolls).length === 6;
      case 4:
        return $isStandardArrayValues;
      default:
        return true;
    }
  }

  // Derive the progress value from the store states
  const progress = derived(stores, ($stores) => {
    const [race, characterClass, characterSubClass, background, abilityGenerationMethod, pointBuy, abilityRolls, isStandardArrayValues] = $stores;
    const length = $subClassesForClass.length > 0 ? 5 : 4;
    const total = $stores.slice(0, 5).length;
    const completed = $stores.slice(0, 5).filter((value, index) => {
      if (index === 4) { // Index of abilityGenerationMethod
        return isAbilityGenerationMethodReady(abilityGenerationMethod, pointBuy, abilityRolls, isStandardArrayValues);
      }
      return !!value;
    }).length;
    return (completed / total) * 100;
  });

  const actor = getContext("#doc");
  const app = getContext("#external").application;


  const handleNameInput = (e) => {
    actorName = e.target.value; // Update reactive variable

    if ($isLevelUp) {
      // Update existing actor object in the database
      $actor.update({ name: actorName });
    } else {
      // Update new actor source object in memory
      $actor.updateSource({ name: actorName });
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
    await updateActorAndEmbedItems();
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

  const createActorInGameAndEmbedItems = async () => {
    const test = $actor.toObject();
    test.name = $actor.name;
    $actorInGame = await Actor.create($actor.toObject());

    if ($background) {
      const backgroundData = $background;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "background",
        itemData: backgroundData,
        isLevelUp: $isLevelUp,
      });
    }

    if ($race) {
      const raceData = $race;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "race",
        itemData: raceData,
        isLevelUp: $isLevelUp,
      });
    }

    if ($subRace) {
      const subRaceData = $subRace;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "subRace",
        itemData: subRaceData,
        isLevelUp: $isLevelUp,
      });
    }

    if ($characterClass) {
      const characterClassData = $characterClass;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterClass",
        itemData: characterClassData,
        isLevelUp: $isLevelUp,
      });
    }

    if ($characterSubClass) {
      const characterSubClassData = $characterSubClass;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterSubClass",
        itemData: characterSubClassData,
        isLevelUp: $isLevelUp,
      });
    }

    if ($spells) {
      const spellsData = $spells;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "spells",
        itemData: spellsData,
        isLevelUp: $isLevelUp,
      });
    }

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
              input.left(type="text" bind:value="{actorName}" on:input="{handleNameInput}")
            +if("$race")
              .flex.pointer(on:click="{generateName($race.name)}")
                img(src="modules/foundryvtt-actor-studio/assets/ChatGPT_logo.svg" alt="Generate name via ChatGPT" style="height: 100%; max-height: 30px; border: none; width: auto;")

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
