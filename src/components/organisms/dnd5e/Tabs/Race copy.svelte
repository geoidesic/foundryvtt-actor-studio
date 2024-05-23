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

</style>