<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter } from "~/src/helpers/Utility.js";
import { log } from "~/src/helpers/Utility";
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
$: console.log(options);

log('actor', actor);
log('$actor', $actor);

const selectHandler = async (option) => {
	race = await fromUuid(option)
	active = option; 
	log('race', race);
}

const clickHandler = async () => {
	const itemData = race.toObject()
	log('itemData', itemData)
	const actorInGame = await Actor.create(actorObject);
	log('actorInGame' , actorInGame)
	const result = await addItemToCharacter(actorInGame, itemData)
	log('result', result);
}

console.log('folders', folders);
console.log('folderIds', folderIds);
console.log('allRaceItems', allRaceItems);
console.log('raceDefinitions', raceDefinitions);

</script>

<template lang="pug">
div.tab-content
	h1 Race
	+if("value")
		button(label="Submit" on:click!="{clickHandler}") Next
	IconSelect({options} {active} {placeHolder} handler="{selectHandler}" id="asdlfkj" bind:value )
</template>

<style lang="scss" scoped>
.tab-content {
	--tjs-app-overflow: visible;
}
</style>