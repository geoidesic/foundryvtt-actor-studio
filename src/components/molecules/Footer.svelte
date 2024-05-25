<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { race, characterClass, characterSubClass, background, spells, subRace } from "~/src/helpers/store";
    import { addItemToCharacter, log } from "~/src/helpers/Utility";

  export let value = null;

  const actor = getContext("#doc");
  const app = getContext('#external').application;

  $: actorObject = $actor.toObject();
  $: value = $actor?.name || '';
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value ;

  const handleNameInput = (e) => {
    $actor.name = e.target.value;
    log.d($actor)
  }
  const handleTokenNameInput = (e) => {
    log.d(e.target.value);
    if(!$actor.flags[MODULE_ID]) $actor.flags[MODULE_ID] = {};
    $actor.flags[MODULE_ID].tokenName = e.target.value;
    log.d($actor)
  }

  const clickHandler = async () => {
    await createActorInGameAndEmbedItems();
  }


  /**
 * So the only viable strategy is to keep the race additions in storage 
 * and then only add them after the Actor is added to the game
 */
const createActorInGameAndEmbedItems = async () => {
	const actorInGame = await Actor.create(actorObject);

  // background
  if($background) {
    log.i('Adding background to character')
    const backgroundData = $background.toObject()
    await addItemToCharacter(actorInGame, backgroundData)
    setTimeout(() => {
      tick();
    }, 300);
  }
  
  // spells
  // if($spells) {
  //   log.i('Adding spells to character')
  //   log.i('Adding spells to character')
  //   const spellsData = $spells.toObject()
  //   await addItemToCharacter(actorInGame, spellsData)
  //   setTimeout(() => {
  //     tick();
  //   }, 300);
  // }

  // // race
  // if($race) {
  //     log.i('Adding race to character')
  //     const raceData = $race.toObject()
  //     await addItemToCharacter(actorInGame, raceData)
  //     setTimeout(() => {
  //       tick();
  //     }, 300);
  // }
  
  // // subrace
  // if($subRace) {
  //   log.i('Adding subrace to character')
  //   const subRaceData = $subRace.toObject()
  //   await addItemToCharacter(actorInGame, subRaceData)
  //   setTimeout(() => {
  //     tick();
  //   }, 300);
  // }
  
  // // character class
  // if($characterClass) {
  //   log.i('Adding class to character')
  //   const characterClassData = $characterClass.toObject()
  //   await addItemToCharacter(actorInGame, characterClassData)
  //   setTimeout(() => {
  //     tick();
  //   }, 300);
  // }
  
  // // character subclass
  // if($characterSubClass) {
  //   log.i('Adding subclass to character')
  //   const characterSubClassData = $characterSubClass.toObject()
  //   await addItemToCharacter(actorInGame, characterSubClassData)
  //   setTimeout(() => {
  //     tick();
  //   }, 300);
  // }

  // app.close();
}

</script>

<template lang="pug">
  .flexrow.gap-10
    .flex2
      .flexcol
        .flexrow.gap-10
          .flex1.right.mt-xs
            label Character Name
          .flex2
            input.left(type="text" value="{value}" on:input="{handleNameInput}")
        .flexrow.gap-10
          .flex1.right.mt-xs
            label Token Name
          .flex2
            input.left(type="text" value="{tokenValue}" on:input="{handleTokenNameInput}")
    .flex1
      button(type="button" role="button" on:mousedown="{clickHandler}") Create
</template>


<style lang="sass">
.gap-10
  gap: 10px
label
  margin: 10px 0 0 0
</style>