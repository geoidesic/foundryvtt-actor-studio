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
    activeTab,
    dropItemRegistry,
    actorInGame,
  } from "~/src/helpers/store";
  import { log } from "~/src/helpers/Utility";
  import ProgressBar from "~/src/components/molecules/ProgressBar.svelte";

  import { derived, writable } from "svelte/store";

  const stores = [
    race,
    characterClass,
    characterSubClass,
    background,
  ];

  // Derive the progress value from the store states
  const progress = derived(stores, ($stores) => {
    const total = $stores.length;
    const completed = $stores.filter((value) => value).length;
    return (completed / total) * 100;
  });

  $: log.d('progress', $progress)


  export let value = null;

  const actor = getContext("#doc");
  const app = getContext("#external").application;

  $: value = $actor?.name || "";
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value;

  const handleNameInput = (e) => {
    $actor.updateSource({name: e.target.value});
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
  };


  /**
   * So the only viable strategy is to keep the race additions in storage
   * and then only add them after the Actor is added to the game
   */
  const createActorInGameAndEmbedItems = async () => {

    //@todo WIP: fix this
    const test = $actor.toObject();
    test.name = $actor.name // this works but it's a hack
    $actorInGame = await Actor.create($actor.toObject());

    // background
    if ($background) {
      log.i("Adding background to character");
      const backgroundData = $background;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "background",
        itemData: backgroundData,
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
      });
    }

    // character class
    if ($characterClass) {
      log.i("Adding class to character");
      const characterClassData = $characterClass;
      dropItemRegistry.add({
        actor: $actorInGame,
        id: "characterClass",
        itemData: characterClassData,
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
      });
    }

    log.d('dropItemRegistry', $dropItemRegistry)

    dropItemRegistry.advanceQueue(true);
  };
</script>

<template lang="pug">
div
  +if("$activeTab !== 'advancements'")  
    .flexrow.gap-10.pr-md.mt-sm
      .flex2
        .flexcol
          .flexrow.gap-10
            .flex1.right.mt-xs
              label Character Name
            .flex2
              input.left(type="text" value="{value}" on:input="{handleNameInput}")
          //- .flexrow.gap-10
          //-   .flex1.right.mt-xs
          //-     label Token Name
          //-   .flex2
          //-     input.left(type="text" value="{tokenValue}" on:input="{handleTokenNameInput}")
      .flex1
        ProgressBar(progress="{progress}")
        +if("$progress != '100'")
          +else()
            +if("!$isActorCreated")
              button.mt-xs(type="button" role="button" on:mousedown="{clickCreateHandler}") Create Character
            +if("$isActorCreated")
              button(type="button" role="button" on:mousedown="{clickUpdateHandler}") Update
</template>

<style lang="sass">
.gap-10
  gap: 10px
  justify-content: space-between
  align-items: center
label
  margin: 10px 0 0 0
button
</style>
