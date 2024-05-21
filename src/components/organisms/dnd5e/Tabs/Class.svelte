<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
import { getContext, onDestroy, onMount } from "svelte";

let active = null, value = null, placeHolder = "Races";
let pack = game.packs.get('dnd5e.races');
let folders = getPackFolders(pack, 1);
let folderIds = folders.map(x => x._id);
let allRaceItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
let raceDefinitions = allRaceItems.filter(x => folderIds.includes(x.folder));
let race; 

const actor = getContext("#doc");


$: actorObject = $actor.toObject();
$: options = raceDefinitions;

log.d('actor', actor);
log.d('$actor', $actor);

const selectHandler = async (option) => {
    race = await fromUuid(option)
    active = option; 
    log.d('race', race);
}

const clickHandler = async () => {
    await createActorInGameAndEmbedItems();
}



/**
 * So the only viable strategy is to keep the race additions in storage 
 * and then only add them after the Actor is added to the game
 */
const createActorInGameAndEmbedItems = async () => {
    const itemData = race.toObject()
    log.d('itemData', itemData)
    const actorInGame = await Actor.create(actorObject);
    log.d('actorInGame' , actorInGame)
    const result = await addItemToCharacter(actorInGame, itemData)
    log.d('result', result);
}

log.d('folders', folders);
log.d('folderIds', folderIds);
log.d('allRaceItems', allRaceItems);
log.d('raceDefinitions', raceDefinitions);

</script>

<template lang="pug">
div.tab-content
  .flexrow
    .flex1.border-right
      +if("value")
        button(label="Submit" on:click!="{clickHandler}") Next
      IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="asdlfkj" bind:value )
    .flex3
</template>

<style lang="scss" scoped>
.tab-content {
    --tjs-app-overflow: visible;
  padding: 20px; // Add padding to the tab content
  border: 2px solid transparent; // Start with a transparent border
  border-radius: 10px; // Add some rounded corners
  background-color: #f9f9f9; // Add a light background color
  position: relative; // Enable absolute positioning for decorations

  // Add decorative elements
  &:before,
  &:after {
    content: "";
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    z-index: -1;
    border: 2px solid #8b0000; // Choose a dark red color for the border
    border-radius: 15px; // Adjust the radius for a more wicked look
  }

  &:before {
    transform: rotate(-3deg); // Rotate the border element for a dynamic effect
  }

  &:after {
    transform: rotate(3deg); // Rotate the border element for a dynamic effect
  }
  .border-right {
    border-right: 4px solid brown;
  }
}
</style>